import { Text } from '@svgdotjs/svg.js';

import Charts, { Dimensions } from './utils/charts';
import { deviation, roundTo } from './utils/math';

class Histogram extends Charts<number> {
    public step: number;

    constructor(dimensions: Dimensions = { width: 500, height: 400 }) {
        super(dimensions);

        this.step = 10;
    }

    process() {
        // graph container
        const container = this.canvas.group().addClass('plots');
        const labels = this.canvas.group().addClass('labels');

        // sort data
        this.data = this.data.sort((a, b) => a - b);

        // get column count then sort data by step
        const columnCount = Math.ceil(deviation(this.data) / this.step);
        const sortedData: number[] = Array.from(new Uint8Array(columnCount));
        const minimum = Math.min(...this.data);
        const roundedMinimum = roundTo(minimum, -Math.log10(this.step));

        let currentStep = 0;

        this.data.forEach(e => {
            if (e < minimum + (currentStep + 1) * this.step) {
                sortedData[currentStep] += 1;
            } else currentStep += 1;
        });

        const colSize = roundTo((this.width - 80) / columnCount);
        const upperStep = roundTo((this.height - 80) / Math.max(...sortedData));

        // set a custom grid
        container.rect().size(
            this.width - 80,
            this.height - 80,
        ).move(50, 40).fill(
            this.canvas.defs().pattern(colSize, upperStep, add => add
                .path(`M${colSize} 0 L0 0 0 ${upperStep}`)
                .fill('none')
                .stroke({ color: '#222', width: .5 })
            ).move(50, 40)
        );

        // set plots
        sortedData.forEach((e, k) => container
            .rect(colSize, roundTo(e * upperStep))
            .move(k * colSize + 50, (Math.max(...sortedData) - e) * upperStep + 40)
            .fill("#55f")
            .stroke({
                color: "#222",
                width: 1,
            })
        );

        // x labels
        for (let i = 0; i <= columnCount; i++) {
            const text = new Text().font({
                color: '#000',
                family: 'Arial',
                size: 12,
            }).move(i * colSize + 42, this.height - 24);

            text.tspan(String(i * this.step + roundedMinimum));
            labels.add(text);
        }

        // y labels
        for (let i = 0; i <= Math.max(...sortedData); i++) {
            const text = new Text().font({
                anchor: 'middle',
                color: '#000',
                family: 'Arial',
                size: 12,
            }).move(32, (this.height - 36) - (i * upperStep));

            text.tspan(String(i));
            labels.add(text);
        }

        return this;
    }
}

export default Histogram;
