import { Text } from '@svgdotjs/svg.js';

import Charts, { Dimensions } from './utils/charts';
import { roundTo, sum } from './utils/math';

export type DataSet = number[];

class BarChart extends Charts<DataSet> {
    constructor(dimensions: Dimensions = { width: 500, height: 400 }) {
        super(dimensions);
    }
}

export class SingleBarChart extends BarChart {
    process() {
        const container = this.canvas.group().addClass('plot-container');
        const labels = this.canvas.group().addClass('labels');

        const colWidth = (this.width - 70) / this.data.length;
        const max = Math.max(...this.data.map(sum));

        // add plots and labels
        this.data.forEach((e, k) => {
            const sumVal = sum(e);
            const height = sumVal / max * (this.height - 80);

            // plots
            container
                .rect(colWidth - 10, height)
                .move(60 + k * colWidth, this.height - height - 40)
                .fill('#55f')
                .stroke({
                    color: "#222",
                    width: 1,
                });

            // labels
            const label = new Text().font({
                color: '#444',
                family: 'Arial',
                size: 12,
            }).move(88 + k * colWidth, this.height - height - 45);

            label.tspan(String(sumVal));
            labels.add(label);
        });

        // x-axis
        container.line(0, 0, 0, this.height - 60).move(40, 30).stroke({
            color: '#000',
            width: 1,
        });

        // y-axis
        container.line(0, 0, this.width - 40, 0).move(30, this.height - 40).stroke({
            color: '#000',
            width: 1,
        });

        return this;
    }
}

export class StackedBarChart extends BarChart {
    process() {
        const container = this.canvas.group().addClass('plot-container');
        const labels = this.canvas.group().addClass('labels');

        const colWidth = (this.width - 65) / this.data.length - 15;
        const maxHeight = Math.max(...this.data.map(sum));

        this.data.forEach((a, b) => {
            let totalHeight = 0;

            a.forEach((c, d) => {
                const height = c / maxHeight * (this.height - 80);
                totalHeight += height;

                container
                    .rect(colWidth, height)
                    .move(60 + b * (colWidth + 15), this.height - totalHeight - 40)
                    .fill(`#${roundTo(255 / (d + 1), 0).toString(16).repeat(2)}ff`)
                    .stroke({ color: "#222", width: 1 });
            });
        });

        return this;
    }
}

export class MultiseriesBarChart extends BarChart {
    constructor(dimensions: Dimensions = { width: 650, height: 400 }) {
        super(dimensions);
    }

    process() {
        const container = this.canvas.group().addClass('plot-container');
        const labels = this.canvas.group().addClass('labels');

        const rawData = this.data.flat();
        const maxHeight = Math.max(...rawData);
        const colWidth = (this.width - 10 * this.data.length - 70) / rawData.length - 4;

        // add plots
        let gap = 0;

        this.data.forEach((a, b) => a.forEach((c, d) => {
            const height = c / maxHeight * (this.height - 100);
            const count = b * 4 + d;

            const color = `#${roundTo(255 / (d + 1), 0).toString(16).repeat(2)}ff`;

            // set new gap
            (b !== 0 && d === 0) && (gap += 10);

            container
                .rect(colWidth, height)
                .move(60 + count * (colWidth + 4) + gap, this.height - height - 40)
                .fill(color)
                .stroke({ color: "#4443", width: 1 });
        }));

        // add a "total" curve
        const sums = this.data.map(sum);
        const maxPlot = Math.max(...sums);

        const plot = this.data.map((e, k) => "L"
            + roundTo(e.length * (.5 + k) * (colWidth + 4) + 4 * k + 58).toString()
            + " " + roundTo(this.height - sums[k] / maxPlot * (this.height - 80)).toString()
        );

        container
            .path()
            .stroke({color: "#000", width: 1})
            .fill('none')
            .plot(`${plot[0].replace('L', 'M')} ${plot.join(' ')}`);

        return this;
    }
}
