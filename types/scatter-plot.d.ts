import Charts, { Dimensions } from './utils/charts';
declare type Coords = {
    x: number;
    y: number;
};
declare class ScatterPlots extends Charts<Coords> {
    dotSize: number;
    constructor(dimensions?: Dimensions);
    private get minX();
    private get minY();
    private get maxX();
    private get maxY();
    private get zoom();
    private calcNewCoords;
    process(): this;
}
export default ScatterPlots;
