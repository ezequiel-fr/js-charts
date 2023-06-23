import { Rect, SVG, Svg } from '@svgdotjs/svg.js';

export type RestOrArray<T> = T[] | [T[]];
export type Dimensions = { width: number, height: number };

class Charts<Data = any> {
    private background: Rect;

    protected canvas: Svg;
    protected data: Data[];
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
        this.background = new Rect();
        this.canvas.add(this.background);
        this.setBackground();
    }

    protected setBackground() {
        this.background.fill("#eee");
        this.background.size(this.width, this.height);
        this.background.stroke({ color: "#555", width: 2 });
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
