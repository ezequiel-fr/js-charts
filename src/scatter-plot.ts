import { Circle, Rect } from '@svgdotjs/svg.js';

import Charts from './utils/charts';

type Coords = { x: number, y: number };

class ScatterPlots extends Charts<Coords> {
    constructor() {
        super();
    }

    private get minX() {
        return Math.min(...this.data.map(p => p.x));
    }

    private get minY() {
        return Math.min(...this.data.map(p => p.y));
    }

    private get maxX() {
        return Math.max(...this.data.map(p => p.x));
    }

    private get maxY() {
        return Math.max(...this.data.map(p => p.y));
    }

    private get zoom() {
        // const xRange = this.maxX - this.minX;
        // const yRange = this.maxY - this.minY;
        // return [maxX / (minX * 20), maxY / (minY * 20)];

        return [150, 2];
    }

    private calculateZoom(zoom: number[]) {
        return this.data.map(p => ({
            x: (Math.abs(this.minX) + p.x) * zoom[0],
            y: (Math.abs(this.minY) + p.y) * zoom[1],
        }));
    }

    process() {
        const { zoom } = this;

        // apply zoom
        this.calculateZoom(zoom).forEach(e => {
            this.svg.add(new Circle().size(3, 3).move(e.x, e.y).fill("red"));
        });

        return this;
    }
}

export default ScatterPlots;
