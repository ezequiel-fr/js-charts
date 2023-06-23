import { Svg } from '@svgdotjs/svg.js';
export declare type RestOrArray<T> = T[] | [T[]];
export declare type Dimensions = {
    width: number;
    height: number;
};
declare class Charts<Data = any> {
    private background;
    protected canvas: Svg;
    protected data: Data[];
    protected height: number;
    protected width: number;
    constructor(dimensions?: Dimensions);
    protected setBackground(): void;
    toString(): string;
    setData(...data: RestOrArray<Data>): this;
}
export default Charts;
