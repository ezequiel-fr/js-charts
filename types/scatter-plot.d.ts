import Charts from './utils/charts';
declare type Coords = {
    x: number;
    y: number;
};
declare class ScatterPlots extends Charts<Coords> {
    constructor();
    private get minX();
    private get minY();
    private get maxX();
    private get maxY();
    private get zoom();
    private calculateZoom;
    process(): this;
}
export default ScatterPlots;
