import { Circle, G, Text } from '@svgdotjs/svg.js';

import Charts, { Dimensions } from './utils/charts';
import { roundTo } from './utils/math';

export type Coords = { x: number, y: number };

class ScatterPlots extends Charts<Coords> {
    public dotSize: number;

    constructor(dimensions: Dimensions = { width: 800, height: 450 }) {
        super(dimensions);

        this.dotSize = 4;
        this.setGrid({
            width: this.width / 12,
            height: this.height / 12,
            // color: "#eee",
        });
    }

    private get minX() { return Math.min(...this.data.map(p => p.x)) }
    private get minY() { return Math.min(...this.data.map(p => p.y)) }
    private get maxX() { return Math.max(...this.data.map(p => p.x)) }
    private get maxY() { return Math.max(...this.data.map(p => p.y)) }

    private get zoom(): [number, number] {
        const xRange = Math.abs(this.maxX) + Math.abs(this.minX);
        const yRange = Math.abs(this.maxY) + Math.abs(this.minY);

        return [this.width / xRange, this.height / yRange];
    }

    private calcNewCoords(zoom: number[]) {
        const distance = Math.abs(this.maxY) + Math.abs(this.minY);

        return this.data.map(p => ({
            x: (Math.abs(this.minX) + p.x) * zoom[0],
            y: (distance - (Math.abs(this.minY) + p.y)) * zoom[1],
        }));
    }

    process() {
        // sort data
        const x = this.data.sort((a, b) => a.x - b.x);
        const y = this.data.sort((a, b) => a.y - b.y);

        const container = new G().addClass("scatter-plot");
        this.canvas.add(container);

        const { zoom } = this;

        // apply zoom
        this.calcNewCoords(zoom).forEach(e => container.add(
            new Circle().size(this.dotSize, this.dotSize).move(e.x, e.y).fill("red")
        ));

        // resize group
        const currentSize = container.bbox();
        const k = .9;

        const scaleX = this.width / currentSize.width * k;
        const scaleY = this.height / currentSize.height * k;
        const translateX = (this.width - currentSize.width) / 2;
        const translateY = (this.height - currentSize.height) / 2;

        container.transform({ scaleX, scaleY, translateX, translateY });

        // Add text
        const textContainer = this.canvas.group();

        const textSize = 12;
        const xText = new Text().font({ color: "#000", family: "Arial", size: textSize });
        const yText = xText.clone();
        const x0 = xText.clone();
        const y0 = xText.clone();

        // axis names
        xText.move(this.width - textSize * 1.5, this.height - textSize).tspan("x");
        yText.move(textSize, textSize * 1.5).tspan("y");

        // axis 0
        x0.move((this.width - textSize * 1.5) / 2, this.height - textSize)
          .tspan(roundTo(x[Math.floor(x.length / 2)].x, 5).toString());
        y0.move(textSize, (this.height - textSize * 1.5) / 2)
          .tspan(roundTo(y[Math.floor(y.length / 2)].y, 5).toString());

        textContainer.add(xText).add(yText).add(x0).add(y0);

        return this;
    }
}

export default ScatterPlots;
