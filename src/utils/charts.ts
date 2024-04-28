import { G, Rect, SVG, StrokeData, Svg } from '@svgdotjs/svg.js';

import { AvailableThemes, getStroke, Themes, toValidHex } from './colors';

export type RestOrArray<T> = T[] | [T[]];
export type Dimensions = { width: number, height: number };

export interface Grid extends Dimensions {
    startX?: number;
    startY?: number;
    endX?: number;
    endY?: number;
    stroke?: StrokeData;
}

type ChartColors = {
    theme?: AvailableThemes,
} | {
    background: string;
    color: string;
    stroke: string | null;
};

export type SVGChartParams = ChartColors & {
    border?: boolean;
    dimensions?: Dimensions;
    showGrid?: boolean;
}

class SVGChart<Data = any> {
    // params
    protected colors;
    protected height: number;
    protected width: number;
    protected border: boolean;
    protected showGrid: boolean;

    // data
    protected data: Data[] = [];

    // SVG elements
    protected canvas: Svg;
    protected background = new Rect();
    protected backgroundGroup: G;

    constructor(params: SVGChartParams = {}) {
        // set default params and merge with user params
        const defaults = {
            dimensions: { width: 200, height: 200 },
            theme: 'light',
            background: 'null',
            color: 'null',
            stroke: null,
            border: false,
            showGrid: true,
            ...params
        };

        // parse params
        this.colors =  defaults.theme in Themes ? Themes[defaults.theme as AvailableThemes] : {
            background: toValidHex(defaults.background, Themes.light.background) as string,
            color: toValidHex(defaults.color, Themes.light.color), // @ts-ignore
            stroke: defaults.stroke ? toValidHex(defaults.stroke, null) : null,
        };
        this.height = defaults.dimensions.height;
        this.width = defaults.dimensions.width;
        this.border = defaults.border;
        this.showGrid = defaults.showGrid;

        // init SVG canvas
        this.canvas = SVG();
        this.canvas.size(defaults.dimensions.width, defaults.dimensions.height);

        this.backgroundGroup = this.canvas.group().addClass("background");
        this.backgroundGroup.add(this.background);
        this.setBackground();
    }

    protected setBackground() {
        // set background
        this.background.fill(this.colors.background);
        this.background.size("100%", "100%");

        // set border
        if (this.border) this.background.stroke({
            color: this.colors.stroke || this.colors.color,
            width: 2,
        });
    }

    protected setGrid(grid: Grid) {
        if (!this.showGrid) return;

        const { stroke } = grid;
        const strokeColor = this.colors.stroke || getStroke(this.colors.background, 'contrast');

        // using x and y to offset the grid
        const container = new Rect().size(
            (this.canvas.width() as number) - (grid.startX || 0) - (grid.endX || 0),
            (this.canvas.height() as number) - (grid.startY || 0) - (grid.endY || 0),
        ).move(grid.startX || 0, grid.startY || 0);

        const pattern = this.canvas.defs().pattern(grid.width, grid.height, add => {
            add.path(`M${grid.width} 0 L0 0 0 ${grid.height}`).fill('none').stroke({
                color: strokeColor,
                width: .5,
                ...stroke
            });
        });

        // the pattern should start at bottom left corner
        pattern.move(
            grid.startX || 0,
            grid.height - (grid.endY || 0),
        );

        // fill the container with the pattern and add it to the background group
        container.fill(pattern);
        this.backgroundGroup.add(container);
    }

    setData(...data: RestOrArray<Data>) {
        this.data = data.flat() as Data[];
        return this;
    }

    toString() {
        return this.canvas.svg()
            .replace(/\n|\r|\t/g, '')
            .replace(/\s{2,}/g, '')
            .replace(/>\s+/g, '>')
            .replace(/\s+\/>/g, '/>');
    }
}

export default SVGChart;
