import { G, Rect, SVG, StrokeData, Svg } from '@svgdotjs/svg.js';

export type RestOrArray<T> = T[] | [T[]];

export type Dimensions = { width: number, height: number };
export type Grid = Dimensions & { stroke?: StrokeData };

class Charts<Data = any> {
    private backgroundGroup: G;

    protected canvas: Svg;
    protected background: Rect;
    protected data: Data[];
    // protected grid;
    protected height: number;
    protected width: number;

    constructor(dimensions: Dimensions = { width: 200, height: 200 }) {
        this.data = [];

        this.width = dimensions.width;
        this.height = dimensions.height;

        // SVGElement
        this.canvas = SVG();
        this.canvas.size(this.width, this.height);

        // set grey background (default)
        this.backgroundGroup = this.canvas.group().addClass("background");
        this.background = new Rect();
        this.backgroundGroup.add(this.background);
        this.setBackground();
    }

    protected setGrid(grid: Grid) {
        const { stroke } = grid;
        const dims: [number, number] = [grid.width, grid.height];

        const container = new Rect().size("100%", "100%");
        const pattern = this.canvas.defs().pattern(...dims, add => {
            add.path(`M${dims[0]} 0 L0 0 0 ${dims[1]}`)
                .fill("none").stroke(stroke || { color: "#000", width: .5 });
        });

        container.fill(pattern);
        this.backgroundGroup.add(container);
    }

    protected setBackground() {
        this.background.fill("#eee");
        this.background.size("100%", "100%");
        this.background.stroke({ color: "#555", width: 2 });
    }

    process() {
        return this;
    }

    toString(): string {
        return this.canvas.svg()
    }

    setData(...data: RestOrArray<Data>) {
        this.data = data.flat() as Data[];
        return this;
    }
}

export default Charts;
