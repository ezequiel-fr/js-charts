import { SVG, Svg } from '@svgdotjs/svg.js';

type RestOrArray<T> = T[] | [T[]];

class Charts<Data = any> {
    protected data: Data[];
    protected svg: Svg;

    constructor() {
        this.data = [];

        // SVGElement
        this.svg = SVG();
        this.svg.size(800, 450).fill("blue");
    }

    toString(): string {
        return this.svg.svg()
    }

    setData(...data: RestOrArray<Data>) {
        this.data = data.flat() as Data[];
        return this;
    }
}

export default Charts;
