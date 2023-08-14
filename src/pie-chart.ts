import { G, Text } from '@svgdotjs/svg.js';

import Charts, { Dimensions } from './utils/charts';
import { roundTo } from './utils/math';

export type Slices = {
    color?: string;
    label?: string;
    value: number;
};

class PieChart extends Charts<Slices> {
    constructor(dimensions: Dimensions = { width: 500, height: 500 }) {
        super(dimensions);
    }

    process() {
        const fontSize = 12;

        // sort data
        this.data = this.data.sort((a, b) => b.value - a.value);

        // sort data handling values with same label
        const combinedData: Record<string, Slices> = {};

        this.data.forEach(e => {
            const label = e.label || "Unkown";

            if (!combinedData[label]) {
                combinedData[label] = { value: e.value, color: e.color };
                if (label !== "Unkown") combinedData[label] = { ...combinedData[label], label };
            } else {
                combinedData[label].value += e.value;
                combinedData[label].color = e.color;
            }
        });

        this.data = Object.values(combinedData);

        // handle last slice if not 100%
        const total = this.data.map(e => e.value).reduce((a, b) => a + b);

        if (total < 100) this.data.push({
            color: "#f00",
            label: "Undefined",
            value: 100 - total,
        });
        else if (total > 100) this.data = this.data.map(e => ({
            ...e, value: e.value / total * 100,
        }));

        // containers
        const container = new G().addClass('pie-chart');
        const textContainer = new G().addClass('chart-legend');

        textContainer
            .rect(498, 99)
            .addClass('background-content')
            .fill('#fff')
            .move(1, 400);

        this.canvas.add(container);
        this.canvas.add(textContainer);

        // return path for each slices
        const createSlice = (startAngle: number, endAngle: number, radius = 180) => {
            const cx = 250;
            const cy = 200;

            const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
            const endAngleRad = ((endAngle - 90) * Math.PI) / 180;

            const startX = roundTo(cx + radius * Math.cos(startAngleRad));
            const startY = roundTo(cy + radius * Math.sin(startAngleRad));
            const endX = roundTo(cx + radius * Math.cos(endAngleRad));
            const endY = roundTo(cy + radius * Math.sin(endAngleRad));

            return `M${cx},${cy} L${startX},${startY} A${radius},${radius} 0 `
                + `${endAngle - startAngle > 180 ? 1 : 0},1 ${endX},${endY} Z`;
        };

        const columns = Math.ceil(this.data.length / 4);
        const colSize = roundTo((this.width - columns * 10) / columns);
        let count = 0;

        this.data.forEach((e, k) => {
            const params: [number, number] = [count * 3.6, (count += e.value) * 3.6];
            const from = createSlice(...params);

            const color = `#${Math.round((255 / this.data.length) * k).toString(16).repeat(2)}ff`;
            const x = Math.floor(k/4) * colSize;
            const y = k%4 * 22.5;

            // slice
            container
                .path(from)
                .stroke({
                    color: '#4443',
                    width: 1,
                    linecap: 'round',
                    linejoin: 'round',
                })
                .fill(e.color || color);

            // legend
            const legend = textContainer.group();
            const caption = textContainer.circle(fontSize).fill(e.color || color).stroke({
                color: '#4443',
                width: 1,
            });
            const text = new Text().font({
                color: '#000',
                family: 'Arial',
                size: fontSize,
            });

            // add the or unkown if there's no label to provide
            text.tspan(e.label || "Unkown");

            // add to group and add positions
            caption.move(10 + x, 410 + y);
            text.move(14 + fontSize + x, 401.5 + fontSize / 2 + y);
            legend.add(caption);
            legend.add(text);
        });

        return this;
    }
}

export default PieChart;
