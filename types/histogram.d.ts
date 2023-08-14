import Charts, { Dimensions } from './utils/charts';
declare class Histogram extends Charts<number> {
    step: number;
    constructor(dimensions?: Dimensions);
    process(): this;
}
export default Histogram;
