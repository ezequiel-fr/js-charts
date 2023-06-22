import { Svg } from '@svgdotjs/svg.js';
declare type RestOrArray<T> = T[] | [T[]];
declare class Charts<Data = any> {
    protected data: Data[];
    protected svg: Svg;
    constructor();
    toString(): string;
    setData(...data: RestOrArray<Data>): this;
}
export default Charts;
