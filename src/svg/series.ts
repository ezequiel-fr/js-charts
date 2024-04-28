import { Circle, G, Text } from '@svgdotjs/svg.js';

import SVGCharts, { RestOrArray, SVGChartParams } from '../utils/charts';
import { roundTo } from '../utils/math';

export type Coords = { x: number, y: number };

type SVGMultiseriesParams = SVGChartParams & {};

export class SVGMultiseries extends SVGCharts<Coords> {
    constructor(params: SVGMultiseriesParams = {}, data: RestOrArray<Coords> = []) {
        super({
            dimensions: { width: 800, height: 450 },
            ...params,
        });

        // set data if provided
        data.length && this.setData(...data);

        // set grid
        this.setGrid({
            width: this.width / 12,
            height: this.height / 12,
        });
    }

    process() {
        return this;
    }
}
