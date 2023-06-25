import { Rect, StrokeData, Svg } from '@svgdotjs/svg.js';
export declare type RestOrArray<T> = T[] | [T[]];
export declare type Dimensions = {
    width: number;
    height: number;
};
export declare type Grid = Dimensions & {
    stroke?: StrokeData;
};
declare class Charts<Data = any> {
    private backgroundGroup;
    protected canvas: Svg;
    protected background: Rect;
    protected data: Data[];
    protected height: number;
    protected width: number;
    constructor(dimensions?: Dimensions);
    protected setGrid(grid: Grid): void;
    protected setBackground(): void;
    toString(): string;
    setData(...data: RestOrArray<Data>): this;
}
export default Charts;
