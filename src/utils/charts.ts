import { G, Rect, SVG, StrokeData, Svg } from '@svgdotjs/svg.js';

import { AvailableColorKeys, AvailableThemes, getStroke, Themes, toValidHex } from './colors';
import { roundTo } from './math';

export type RestOrArray<T> = T[] | [T[]];
export type Dimensions = { width: number, height: number };

export interface Grid extends Dimensions {
    startX?: number;
    startY?: number;
    justifyX?: number;
    justifyY?: number;
    endX?: number;
    endY?: number;
    stroke?: StrokeData;
}

type ChartColors = {
    theme?: AvailableThemes,
} | {
    background: string;
    colors: string[];
    text?: string;
    stroke?: string | null;
};

export type SVGChartParams = ChartColors & {
    border?: boolean;
    dimensions?: Dimensions;
    title?: string;
    labels?: [string, string | undefined];
    showGrid?: boolean;
    showLabels?: boolean;
    // showAxis?: boolean;
}

class SVGChart<Data = any> {
    // params
    protected colors: {
        background: string,
        stroke?: string | null,
        text: string,
    } & Record<`color${number}`, string>
    protected height: number;
    protected width: number;
    protected border: boolean;
    protected title?: string;
    protected labels: [string, string];
    protected showGrid: boolean;

    // data
    protected data: Map<string, Data[]> = new Map();

    // SVG elements
    protected canvas: Svg;
    protected background = new Rect();
    protected backgroundGroup: G;

    constructor(params: SVGChartParams = {}) {
        // set default params and merge with user params
        const defaults = {
            dimensions: { width: 200, height: 200 },
            background: 'null',
            text: 'null',
            colors: [],
            stroke: null,
            border: false,
            labels: ['x', 'y'],
            showGrid: true,
            showLabels: true,
            ...params
        };

        // parse color
        let colors = {} as typeof this.colors;

        // if theme is provided, use it
        if ('theme' in defaults && defaults.theme) { // @ts-ignore
            colors = Themes[defaults.theme in Themes ? defaults.theme : 'light'];
        } else {
            colors = 'background' in defaults
                && 'colors' in defaults
                && defaults.background !== 'null'
                && defaults.text !== 'null'
                ? Themes.none
                : Themes.light;
        }

        // if custom colors are provided, use them
        if ('background' in defaults)
            colors.background = toValidHex(defaults.background, colors.background);
        if ('colors' in defaults)
            for (let i = 0; i < defaults.colors.length; i++)
                colors[`color${i + 1}`] = toValidHex(defaults.colors[i]);
        if ('stroke' in defaults)
            colors.stroke = defaults.stroke ? toValidHex(defaults.stroke) : null;
        if ('text' in defaults)
            colors.text = toValidHex(defaults.text, colors.text);

        this.colors = { stroke: null, ...colors };

        // parse other params
        this.height = defaults.dimensions.height;
        this.width = defaults.dimensions.width;
        this.border = defaults.border;
        this.title = defaults.title;
        this.showGrid = defaults.showGrid;

        // set labels
        this.labels = defaults.showLabels
            ? [defaults.labels[0], defaults.labels[1] || ""]
            : ["", ""];

        // init SVG canvas
        this.canvas = SVG();
        this.canvas.size(defaults.dimensions.width, defaults.dimensions.height);

        this.backgroundGroup = this.canvas.group().addClass("background");
        this.backgroundGroup.add(this.background);
        this.setBackground();
    }

    public setCustomCanvas(c: Svg, bg: Rect, bgGroup: G) {
        this.canvas = c;
        this.background = bg;
        this.backgroundGroup = bgGroup;
    }

    protected getColor(i?: number) {
        const colors = Object.keys(this.colors).filter(k => k.startsWith('color')).length;
        const choice = i || Math.floor(Math.random() * colors);

        return this.colors[`color${(choice + colors - 1) % colors + 1}` as AvailableColorKeys];
    }

    protected setBackground() {
        // set background
        this.background.fill(this.colors.background);
        this.background.size("100%", "100%");

        // set border
        if (this.border) this.background.stroke({
            color: this.colors.stroke || this.colors.color1,
            width: 2,
        });
    }

    protected setGrid(grid: Grid) {
        if (!this.showGrid) return;

        const { stroke } = grid;
        const strokeColor = this.colors.stroke || getStroke(this.colors.background, 'contrast');

        // using x and y to offset the grid
        const container = new Rect().size(
            (grid.endX || 0) - (grid.startX || 0) + 1,
            (grid.endY || 0) - (grid.startY || 0) + 1,
        ).move(grid.startX || 0, grid.startY || 0);

        const pattern = this.canvas.defs().pattern(grid.width, grid.height, add => {
            add.path(`M${roundTo(grid.width)} 0 L0 0 0 ${roundTo(grid.height)}`)
               .fill('none')
               .stroke({ color: strokeColor, width: .5, ...stroke });
        });

        // the pattern should start at bottom left corner
        pattern.move(
            roundTo(((grid.startX || 0) + (grid.justifyX || 0)) % grid.width),
            roundTo(((grid.endY || 0) + (grid.justifyY || 0)) % grid.height),
        );

        // fill the container with the pattern and add it to the background group
        container.fill(pattern);
        this.backgroundGroup.add(container);
    }

    setData(serie: string, ...data: RestOrArray<Data>) {
        this.data.set(serie, data as Data[]);
        return this;
    }

    toString() {
        return this.canvas.svg();
    }
}

export default SVGChart;
