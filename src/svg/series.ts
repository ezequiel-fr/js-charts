import { Circle, G, Polyline, Rect, Text } from '@svgdotjs/svg.js';

import SVGCharts, { RestOrArray, SVGChartParams } from '../utils/charts';
import { deviation, roundTo } from '../utils/math';

export type Coords = { x: number, y: number };

export type SVGMultiseriesParams = SVGChartParams & {
    axisSoft?: 'auto' | 'fit' | { min?: number | "auto", max?: number | "auto" };
    styleMode?: "line" | "points" | "both" | "bars";
    fillMode?: "none" | "solid" | "gradient" | "opacity" | "opacity-gradient";
    lineStyle?: "solid" | "dotted" | "dashed-1" | "dashed-2" | "dashed-3";
    showCoords?: boolean;
    showValues?: boolean;
    showExtremes?: boolean;
};

interface Padding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export class SVGMultiseries extends SVGCharts<Coords[]> {
    protected axisSoft: { min?: number | "auto", max?: number | "auto" };

    protected styleMode: Exclude<SVGMultiseriesParams['styleMode'], undefined>;
    protected fillMode: Exclude<SVGMultiseriesParams['fillMode'], undefined>;
    protected lineStyle: Exclude<SVGMultiseriesParams['lineStyle'], undefined>;

    protected showCoords: boolean;
    protected showValues: boolean;
    protected showExtremes: boolean;

    private points: Coords[] = [];

    constructor(params: SVGMultiseriesParams = {}, ...data: RestOrArray<Coords[]>) {
        super({
            dimensions: { width: 800, height: 450 },
            ...params,
        });

        // set axis soft
        const soft = params.axisSoft || 'auto';

        if (typeof soft === 'object') {
            this.axisSoft = soft;
        } else if (soft === 'auto') {
            this.axisSoft = { min: "auto", max: "auto" };
        } else {
            this.axisSoft = {};
        }

        // parse other params
        this.styleMode = params.styleMode || "both";
        this.fillMode = params.fillMode || "none";
        this.lineStyle = params.lineStyle || "solid";
        this.showCoords = params.showCoords || false;
        this.showValues = params.showValues || false;
        this.showExtremes = params.showExtremes || false;

        // set data if provided
        data.length && this.setData('serie1', ...data);
    }

    private createSerie(
        [name, data]: [string, Coords[]],
        { minX, maxY }: { minX: number, maxY: number },
        { xScale, yScale }: { xScale: number, yScale: number },
        size: { width: number, height: number },
        color: string,
        container: G,
        pad: Padding,
    ) {
        // sort data by x
        data = data.sort((a, b) => a.x - b.x);

        const graph = new G().addClass(`graph-${name}`);
        container.add(graph);

        // remove overflowing content using a clip-path
        const clip = this.canvas.clip().id(`clip-graph-${name}`);
        clip.add(new Rect().size(size.width, size.height).move(pad.left, pad.top));
        graph.clipWith(clip);

        // create new coords
        const coords = data.map(p => ({
            x: roundTo((p.x - minX) * xScale, 2) + pad.left,
            y: roundTo((maxY - p.y) * yScale, 2) + pad.top,
        }));

        // create lines
        if (this.styleMode === "line" || this.styleMode === "both") {
            const points = coords.map(p => `${p.x},${p.y}`).join(" ");
            const line = new Polyline().plot(points).fill("none");

            line.stroke({ width: 2, color: color });

            this.lineStyle === "dotted" && line.stroke({ dasharray: '2,5' });
            this.lineStyle === "dashed-1" && line.stroke({ dasharray: '5,5' });
            this.lineStyle === "dashed-2" && line.stroke({ dasharray: '10,5' });
            this.lineStyle === "dashed-3" && line.stroke({ dasharray: '2,2,15,2,2,15' });

            container.add(graph.add(line));
        }

        // create points
        if (this.styleMode === "points" || this.styleMode === "both") {
            const dotSize = 6;

            coords.filter(p => (
                p.x >= pad.left && p.x <= size.width + pad.left
                && p.y >= pad.top && p.y <= size.height + pad.top
            )).forEach((p, i) => graph.add(new Circle()
                .size(dotSize, dotSize)
                .move(p.x - dotSize / 2, p.y - dotSize / 2)
                .fill(color),
            ));
        }

        // show coords
        this.showCoords && coords.forEach((p, i) => {
            // filter points to display to avoid double display (compare with this.points)
            if (this.points.some(({ x, y }) => x === data[i].x && y === data[i].y)) return;
            this.points.push({ x: data[i].x, y: data[i].y });

            // generate text
            const text = new Text()
                .text(`(${data[i].x}, ${data[i].y})`)
                .font({ size: 10, anchor: 'start', family: 'sans-serif' })
                .fill(this.colors.text);
            graph.add(text);

            const boxSize = text.bbox();

            /* get relative position from the curve before fixing (to get the right direction)
                * for this, should compare with the curve or other points */

            // get the position where the text should be
            let xFix = 0, yFix = 0;

            if (p.x + boxSize.width + 5 > size.width + pad.left) {
                xFix = size.width + pad.left - p.x - boxSize.width - 5;
            } else if (p.x - boxSize.width - 5 < pad.left) {
                xFix = pad.left - p.x + boxSize.width + 5;
            } else if (p.y - boxSize.height - 5 < pad.top) {
                yFix = pad.top - p.y + boxSize.height + 5;
            } else if (p.y + boxSize.height + 5 > size.height + pad.top) {
                yFix = size.height + pad.top - p.y - boxSize.height - 5;
            }

            text.move(p.x + xFix, p.y + yFix);
        });

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

        return data;
    }

    process() {
        // create container
        const container = new G().addClass("multiseries");
        this.canvas.add(container);

        const pad = {
            top: this.title ? 40 : 20,
            right: Number(this.showValues) * 10 + 20,
            bottom: this.labels[0].length ? 30 : 20,
            left: this.labels[1].length ? 40 : 20,
        };

        // get each minimum and maximum
        const mixedData = Array.from(this.data.values()).flat();

        const minX = Math.min(...mixedData.map(p => p.x));

        const minY = typeof this.axisSoft.min === 'number'
            ? this.axisSoft.min
            : Math.min(...mixedData.map(p => p.y));
        const maxY = typeof this.axisSoft.max === 'number'
            ? this.axisSoft.max
            : Math.max(...mixedData.map(p => p.y));

        const softMin = Number(this.axisSoft.min === 'auto') / 2;
        const softMax = Number(this.axisSoft.max === 'auto') / 2;

        // create scales
        const size = {
            width: this.width - pad.left - pad.right,
            height: this.height - pad.top - pad.bottom,
        };

        const xDiff = deviation(mixedData.map(p => p.x));
        const xScale = size.width / xDiff;
        const yScale = size.height / (maxY - minY + softMin + softMax);

        // calculate the coordinates of the lowest point
        const gridY = (maxY + softMin / 2 + softMax / 2 - minY) * yScale - size.height;

        // create text values group
        const textValues = new G().addClass('text-values');
        this.canvas.add(textValues);

        const yLabels = new Set<number>();
        const yEndLabels = new Set<number>();

        this.showExtremes && yLabels.add(minY).add(maxY);

        // create series
        let i = 1;

        for (const serie of this.data.entries()) {
            const color = this.getColor(i++);

            const data = this.createSerie(
                serie, { minX, maxY: maxY + softMin / 2 + softMax / 2 },
                { xScale, yScale }, size, color, container, pad,
            );

            // add extreme values if required (min and max on Y axis)
            if (this.showValues) {
                const addText = (val: Coords, right = false) => {
                    const text = new Text()
                        .text(val.y.toString())
                        .fill(color)
                        .font({ size: 12, anchor: 'middle', family: 'sans-serif' });
                    textValues.add(text);

                    text.move(
                        right ? pad.left + size.width + 8 : pad.left - text.bbox().width - 8,
                        roundTo((maxY - val.y) * yScale, 2) + pad.top + 12,
                    );
                };

                if (!yLabels.has(data[0].y)) addText(data[0]), yLabels.add(data[0].y);

                if (!yEndLabels.has(data[data.length - 1].y)) {
                    addText(data[data.length - 1], true);
                    yEndLabels.add(data[data.length - 1].y);
                }
            }
        }

        // set grid and axis
        const width = Math.max(roundTo(xScale * (this.styleMode === 'bars' ? 1.6 : 1)), 10);
        const height = Math.max(roundTo(yScale * (this.styleMode === 'bars' ? 1.6 : 1)), 10);

        this.setGrid({
            startX: pad.left,
            startY: pad.top,
            endX: size.width + pad.left,
            endY: size.height + pad.top,
            justifyY: gridY,
            width,
            height,
        });

        // add the title if needed
        this.title && textValues
            .text(this.title)
            .move(this.width / 2, 10)
            .fill(this.colors.text)
            .font({ size: 20, anchor: 'middle', family: 'sans-serif' });

        // create labels
        this.labels[0].length && textValues.add(new Text()
            .text(this.labels[0])
            .move(this.width / 2, this.height - pad.bottom)
            .fill(this.colors.text)
            .font({ size: 14, anchor: 'middle', family: 'sans-serif' })
        );
        this.labels[1].length && textValues.add(new Text()
            .text(this.labels[1])
            .move(8, this.height / 2)
            .fill(this.colors.text)
            .font({ size: 14, anchor: 'middle', family: 'sans-serif' })
            .rotate(-90, Number(!this.showValues) * 8, this.height / 2)
        );

        // add max and min values
        if (this.showExtremes) {
            const textMaxY = new Text().text(maxY.toString());
            const textMinY = new Text().text(minY.toString());
            const textMaxX = new Text().text((minX + xDiff).toString());
            const textMinX = new Text().text(minX.toString());

            [textMaxY, textMinY, textMaxX, textMinX].forEach(t => textValues.add(t
                .fill(this.colors.text)
                .font({ size: 12, anchor: 'middle', family: 'sans-serif' })
            ));

            // adjust the positions of each text from the axis (and ajust like grid justify)
            const boxMaxY = textMaxY.bbox();
            const boxMinY = textMinY.bbox();
            const boxMaxX = textMaxX.bbox();
            const boxMinX = textMinX.bbox();

            textMaxY.move(
                pad.left - boxMaxY.width - 8,
                gridY + yScale + pad.top - boxMaxY.height / 2,
            );
            textMinY.move(
                pad.left - boxMaxY.width - 8,
                gridY + size.height + pad.top - boxMinY.height / 2,
            );
            textMaxX.move(
                size.width + pad.left - boxMaxX.width / 2,
                size.height + pad.top + boxMaxX.height / 2 - 4,
            );
            textMinX.move(
                pad.left - boxMinX.width / 2,
                size.height + pad.top + boxMinX.height / 2 - 4,
            );
        }

        // resize group
        // code...

        return this;
    }
}
