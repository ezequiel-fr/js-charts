import { Circle, G, Polyline } from '@svgdotjs/svg.js';

import SVGCharts, { RestOrArray, SVGChartParams } from '../utils/charts';
import { AvailableColorKeys } from '../utils/colors';
import { deviation, roundTo } from '../utils/math';

export type Coords = { x: number, y: number };

export type SVGMultiseriesParams = SVGChartParams & {
    axisSoft?: 'auto' | { min?: number, max?: number };
    styleMode?: "line" | "points" | "both" | "bars";
};

interface Padding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export class SVGMultiseries extends SVGCharts<Coords> {
    protected axisSoft: { min?: number, max?: number };
    protected styleMode: "line" | "points" | "both" | "bars";

    constructor(params: SVGMultiseriesParams = {}, data: RestOrArray<Coords> = []) {
        super({
            dimensions: { width: 800, height: 450 },
            ...params,
        });

        // set axis soft
        const soft = params.axisSoft || 'auto';
        this.axisSoft = soft === 'auto' ? {} : soft;

        // parse other params
        this.styleMode = params.styleMode || "both";

        // set data if provided
        data.length && this.setData('serie1', ...data);
    }

    private createSerie(data: Coords[], color: string, container: G, pad: Padding, grid = false) {
        // sort data by x
        data = data.sort((a, b) => a.x - b.x);

        const graph = new G().addClass("graph");
        container.add(graph);

        // create scales based on axisSoft
        const maxY = this.axisSoft.max || Math.max(...data.map(p => p.y));
        const minY = this.axisSoft.min || Math.min(...data.map(p => p.y));

        // create scales
        const size = {
            width: this.width - pad.left - pad.right,
            height: this.height - pad.top - pad.bottom,
        };
        const xScale = size.width / deviation(data.map(p => p.x));
        const yScale = size.height / (maxY - minY);

        // create new coords
        const coords = data.map(p => ({
            x: roundTo((p.x - data[0].x) * xScale, 2) + pad.left,
            y: roundTo((maxY - p.y) * yScale, 2) + pad.top,
        }));

        // create lines
        if (this.styleMode === "line" || this.styleMode === "both") {
            const points = coords.map(p => `${p.x},${p.y}`).join(" ");

            container.add(graph.add(new Polyline().plot(points).fill("none")
                .stroke({ width: 2, color: color })
            ));
        }

        // create points (test)
        if (this.styleMode === "points" || this.styleMode === "both") {
            const size = 6;

            coords.forEach(p => graph.add(new Circle()
                .size(size, size)
                .move(p.x - size / 2, p.y - size / 2)
                .fill(color)
            ));
        }

        // create bars
        if (this.styleMode === "bars") {
            const barWidth = Math.min(size.width / data.length, 30);

            coords.forEach((p, i) => {
                const height = (size.height - p.y + pad.top + 10) * (1 - 20 / size.height);

                graph.rect()
                    .stroke({ width: 2, color: color, linejoin: 'round' })
                    .size(barWidth - 2, roundTo(height, 2))
                    .move(
                        (i + .5) * (size.width / data.length) - (barWidth - 2) / 2 + pad.left,
                        size.height + pad.top - height,
                    )
                    .fill({ color: color, opacity: .55 })
            });
        }

        grid && this.setGrid({
            startX: pad.left,
            startY: pad.top,
            endX: size.width + pad.left,
            endY: size.height + pad.top,
            width: Math.max(roundTo(xScale * (this.styleMode === 'bars' ? 1.6 : 1)), 10),
            height: Math.max(roundTo(yScale * (this.styleMode === 'bars' ? 1.6 : 1)), 10),
        });

        return this;
    }

    process() {
        let i = 1;

        // create container
        const container = new G().addClass("multiseries");
        this.canvas.add(container);

        const pad = { top: 20, right: 20, bottom: 30, left: 40 };
        const colors = Object.keys(this.colors).filter(c => c.startsWith('color')).length;

        // create series
        for (const [_name, data] of this.data.entries()) {
            const color = this.colors[`color${(i+++(colors-1))%colors+1}` as AvailableColorKeys];
            this.createSerie(data, color, container, pad, _name === 'serie1');
        }

        // set grid and axis
        this.setGrid({
            // startX: pad.left,
            // startY: pad.top,
            // endX: size.width + pad.left,
            // endY: size.height + pad.top,
            // width: Math.max(roundTo(xScale * (this.styleMode === 'bars' ? 1.6 : 1)), 10),
            // height: Math.max(roundTo(yScale * (this.styleMode === 'bars' ? 1.6 : 1)), 10),
            width: this.width / 12,
            height: this.height / 12,
        });

        // create labels
        // code...

        // resize group
        // code...

        return this;
    }
}
