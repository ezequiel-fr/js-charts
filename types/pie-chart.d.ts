import Charts, { Dimensions } from './utils/charts';
declare type Slices = {
    color?: string;
    label?: string;
    value: number;
};
declare class PieChart extends Charts<Slices> {
    constructor(dimensions?: Dimensions);
    process(): this;
}
export default PieChart;
