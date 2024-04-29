import { Circle, G, Polyline, Rect } from '@svgdotjs/svg.js';

import SVGCharts, { RestOrArray, SVGChartParams } from '../utils/charts';
import { AvailableColorKeys } from '../utils/colors';
import { deviation, roundTo } from '../utils/math';

export type Coords = { x: number, y: number };

export type SVGMultiseriesParams = SVGChartParams & {
    axisSoft?: 'auto' | { min?: number, max?: number };
    styleMode?: "line" | "points" | "both" | "bars";
    fillMode?: "none" | "solid" | "gradient" | "opacity" | "opacity-gradient";
};

interface Padding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export class SVGMultiseries extends SVGCharts<Coords> {
    protected axisSoft: { min?: number, max?: number };
    protected styleMode: Exclude<SVGMultiseriesParams['styleMode'], undefined>;
    protected fillMode: Exclude<SVGMultiseriesParams['fillMode'], undefined>;

    constructor(params: SVGMultiseriesParams = {}, data: RestOrArray<Coords> = []) {
        super({
            dimensions: { width: 800, height: 450 },
            fillMode: "none",
            ...params,
        });

        // set axis soft
        const soft = params.axisSoft || 'auto';
        this.axisSoft = soft === 'auto' ? {} : soft;

        // parse other params
        this.styleMode = params.styleMode || "both";
        this.fillMode = params.fillMode || "none";

        // set data if provided
        data.length && this.setData('serie1', ...data);
    }

    private createSerie([name, data]: [string, Coords[]], color: string, container: G, pad: Padding, grid = false) {
        // sort data by x
        data = data.sort((a, b) => a.x - b.x);

        const graph = new G().addClass(`graph-${name}`);
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

        // remove overflowing content using a clip-path
        const clip = this.canvas.clip().id(`clip-graph-${name}`);
        clip.add(new Rect().size(size.width, size.height).move(pad.left, pad.top));
        graph.clipWith(clip);

        // create new coords
        const coords = data.map(p => ({
            x: roundTo((p.x - data[0].x) * xScale, 2) + pad.left,
            y: roundTo((maxY - p.y) * yScale, 2) + pad.top,
        })).map(p => ({
            ...p,
            d: p.x >= pad.left
            && p.x <= size.width + pad.left
            && p.y >= pad.top
            && p.y <= size.height + pad.top,
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

            coords.forEach(p => p.d && graph.add(new Circle()
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
        // fill mode (disabled for bars)
        } else if (this.fillMode === "solid" || this.fillMode === "opacity" ) {
            container.add(graph.add(new Polyline()
                .plot([
                    `${coords[0].x},${size.height + pad.top}`,
                    ...coords.map(p => `${p.x},${p.y}`),
                    `${coords[coords.length - 1].x},${size.height + pad.top}`,
                    `${coords[0].x},${size.height + pad.top}`
                ].join(" "))
                .fill(color)
                .opacity(this.fillMode === "opacity" ? .3 : 1)
            ));
        } else if (this.fillMode === "gradient" || this.fillMode === "opacity-gradient") {
            const og = this.fillMode === "opacity-gradient";

            const gradient = this.canvas.defs().gradient('linear', add => {
                if (og) {
                    add.stop({ offset: 0, color, opacity: .6 });
                    add.stop({ offset: 1, color, opacity: 0 });
                } else {
                    add.stop({ offset: 0, color: '#0d0', opacity: .3 });
                    add.stop({ offset: .4, color: '#dd0', opacity: .3 });
                    add.stop({ offset: 1, color: '#d00', opacity: .3 });
                }

                add.rotate(90);
            });

            container.add(graph.add(new Polyline()
                .plot([
                    `${coords[0].x},${size.height + pad.top}`,
                    ...coords.map(p => `${p.x},${p.y}`),
                    `${coords[coords.length - 1].x},${size.height + pad.top}`,
                    `${coords[0].x},${size.height + pad.top}`
                ].join(" "))
                .fill(gradient)
            ));
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
        for (const serie of this.data.entries()) {
            const color = this.colors[`color${(i+++(colors-1))%colors+1}` as AvailableColorKeys];
            this.createSerie(serie, color, container, pad, serie[0] === 'serie1');
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
