import Charts, { Dimensions } from './utils/charts';
declare type DataSet = number[];
declare class BarChart extends Charts<DataSet> {
    constructor(dimensions?: Dimensions);
}
export declare class SingleBarChart extends BarChart {
    process(): this;
}
export declare class StackedBarChart extends BarChart {
    process(): this;
}
export declare class MultiseriesBarChart extends BarChart {
    constructor(dimensions?: Dimensions);
    process(): this;
}
export {};
