import { Circle } from '@svgdotjs/svg.js';

import SVGCharts, { SVGChartParams } from '../utils/charts';
import { getStroke } from '../utils/colors';
import { degToRad, roundTo } from '../utils/math';

export type SVGGaugeParams = SVGChartParams & {
    value: number;
    max: number;
    min?: number;
    step?: number;
    unit?: string;
    style?: 'full' | 'half' | 'half-rounded';
    randomFill?: boolean;
    showValue?: boolean;
    showMinMax?: boolean;
    showUnit?: boolean;
};

export type SVGPieChartParams = SVGChartParams & {
    data: { value: number, label?: string }[];
    showLabels?: boolean;
    showValues?: boolean;
    showLegend?: boolean;
};

const arc = (
    startAngle: number,
    endAngle: number,
    radius = 200,
    cx = 150, cy = 150,
    deg = true,
) => {
    const startAngleRad = deg ? degToRad(startAngle - 90) : startAngle - Math.PI / 2,
          endAngleRad = deg ? degToRad(endAngle - 90) : endAngle - Math.PI / 2;

    const startX = roundTo(cx + radius * Math.cos(startAngleRad)),
          startY = roundTo(cy + radius * Math.sin(startAngleRad)),
          endX = roundTo(cx + radius * Math.cos(endAngleRad)),
          endY = roundTo(cy + radius * Math.sin(endAngleRad));

    return { r: radius, startX, startY, endX, endY};
};

export class SVGGauge extends SVGCharts<undefined> {
    protected value: number;
    protected max: number;
    protected min: number = 0;
    protected step: number = 1;
    protected unit: string = '';
    protected style: Exclude<SVGGaugeParams['style'], undefined>;

    protected randomFill: boolean;
    protected showValue: boolean;
    protected showMinMax: boolean;
    protected showUnit: boolean;

    constructor(params: SVGGaugeParams) {
        super({
            dimensions: { width: 300, height: 300 },
            ...params
        });

        // set params
        this.value = params.value;
        this.max = params.max;
        params.min && (this.min = params.min);
        params.step && (this.step = params.step);
        params.unit && (this.unit = params.unit);

        this.style = params.style ?? 'full';

        this.randomFill = params.randomFill ?? false;
        this.showValue = params.showValue ?? true;
        this.showMinMax = params.showMinMax ?? false;
        this.showUnit = params.showUnit ?? true;
    }

    process() {
        // create gauge
        const gaugeGroup = this.canvas.group().addClass('gauge');
        const labels = this.canvas.group().addClass('labels');

        // get gauge properties
        const radius = this.width * 7/15;
        const thickness = this.width * 5/30;
        const halfWidth = this.width / 2;

        // get value to use and scale it (between 0 and 1)
        const value = Math.round(this.value > this.max
            ? this.max
            : (this.value < this.min
                ? this.min
                : this.value
            ) / this.step
        ) * this.step;
        const scale = (value - this.min) / (this.max - this.min);

        // choose the fill color
        const color = this.getColor(this.randomFill
            ? void 0
            : [1, .9, .72, 0].findIndex(l => scale >= l) || 0
        );
        const strokeColor = this.colors.stroke || getStroke(this.colors.background, 'contrast');

        // unit text
        const unit = this.showUnit ? this.unit : '';

        if (this.style === 'half' || this.style === 'half-rounded') {
            const rounded = this.style === 'half-rounded';
            const a = 110 - Number(rounded) * 10;

            // draw gauge
            const arc1 = arc(-a, a, radius - thickness, halfWidth, halfWidth);
            const arc2 = arc(a, -a, radius, halfWidth, halfWidth);
            const path = [
                `M${arc1.startX},${arc1.startY}`,
                `A${arc1.r},${arc1.r} 0 1,1 ${arc1.endX},${arc1.endY}`,
                `A${thickness/2},${thickness/2} -70 1,0 ${arc2.startX},${arc2.startY}`,
                `A${arc2.r},${arc2.r} 0 1,0 ${arc2.endX},${arc2.endY}`,
                `A${thickness/2},${thickness/2} 20 1,0 ${arc1.startX},${arc1.startY}Z`,
            ];

            if (!rounded) path[2] = `L${arc2.startX},${arc2.startY}`, path[4] = "Z";

            gaugeGroup.path(path.join(' ')).fill('none')
                .stroke({ width: 1, color: strokeColor });
            gaugeGroup.clipWith(this.canvas.clip().add(this.canvas.path(path.join(''))));

            // fill in the gauge
            const angleMax = degToRad(2*a) + (rounded ? thickness : 0) / radius;
            const angle = scale * angleMax

            const p = arc(
                - angleMax / 2 - (rounded ? degToRad(a/49) : 0),
                angle - angleMax / 2 + ((rounded && scale > .5) ? degToRad(a/49) : 0),
                radius,
                halfWidth, halfWidth,
                false,
            );

            const fillPath = [
                `M${halfWidth},${halfWidth}`,
                `L${p.startX},${p.startY}`,
                `A${p.r},${p.r} 0 ${Number(angle > Math.PI)},1 ${p.endX},${p.endY}Z`,
            ].join(' ');

            gaugeGroup.path(fillPath).fill(color);

            // min/max values
            if (this.showMinMax) {
                const min = labels.text(`${this.min}${unit}`)
                    .fill(this.colors.text)
                    .font({ size: this.width / 20, anchor: 'middle', family: 'sans-serif' });

                const max = labels.text(`${this.max}${unit}`)
                    .fill(this.colors.text)
                    .font({ size: this.width / 20, anchor: 'middle', family: 'sans-serif' });

                const minBox = min.bbox();
                const maxBox = max.bbox();

                const angleMin = (1.5 - a/180)*Math.PI;
                const angleMax = (a/180-.5)*Math.PI;
                const height = Math.max(minBox.height, maxBox.height) / (rounded ? .75 : 2);

                min.move(
                    halfWidth + (radius - thickness / 2) * Math.cos(angleMin) - minBox.width / 2,
                    halfWidth + (radius - thickness / 2) * Math.sin(angleMin) + height,
                );
                max.move(
                    halfWidth + (radius - thickness / 2) * Math.cos(angleMax) - maxBox.width / 2,
                    halfWidth + (radius - thickness / 2) * Math.sin(angleMax) + height,
                );
            }
        } else {
            // draw gauge
            const innerCircle = new Circle({ r: radius - thickness, cx: halfWidth, cy: halfWidth })
                .stroke({ width: 1, color: strokeColor })
                .fill(this.colors.background);

            const outerCircle = new Circle({ r: radius, cx: halfWidth, cy: halfWidth })
                .stroke({ width: 1, color: strokeColor })
                .fill('none');

            // draw value
            const angle = 360 * scale;
            const c = arc(angle, 360, radius, halfWidth, halfWidth);

            const path = [
                `M${halfWidth},${halfWidth}`,
                `L${c.startX},${c.startY}`,
                `A${c.r},${c.r} 0 ${Number(angle > 180)},0 ${c.endX},${c.endY}Z`,
            ].join(' ');

            // fill in the gauge
            gaugeGroup.add(outerCircle);
            gaugeGroup.path(path).fill(color);
            gaugeGroup.add(innerCircle);

            // min/max labels above the value
            if (this.showMinMax) {
                const min = labels.text(`Min: ${this.min}${unit}`)
                    .fill({ color: this.colors.text, opacity: .667 })
                    .font({ size: this.width / 20, anchor: 'middle', family: 'sans-serif' });

                const max = labels.text(`Max: ${this.max}${unit}`)
                    .fill({ color: this.colors.text, opacity: .667 })
                    .font({ size: this.width / 20, anchor: 'middle', family: 'sans-serif' });

                const minBox = min.bbox();
                const maxBox = max.bbox();

                const height = Math.max(minBox.height, maxBox.height);

                min.move(
                    halfWidth - minBox.width / 2,
                    halfWidth- Number(!this.showValue) * height,
                );
                max.move(
                    halfWidth - maxBox.width / 2,
                    halfWidth + Number(this.showValue) * height,
                );
            }
        }

        // add text
        if (this.showValue) {
            const label = labels
                .text(`${value}${unit}`)
                .fill(this.colors.text)
                .font({ size: this.width / 10, anchor: 'middle', family: 'sans-serif' });

            const labelBox = label.bbox();
            const gap = labelBox.height * (this.showMinMax && this.style === 'full' ? 1 : .5);

            label.move(
                halfWidth - labelBox.width * .45,
                halfWidth - gap,
            );
        }

        // resize canvas
        const finalHeight = Math.max(gaugeGroup.bbox().y2, labels.bbox().y2) * 16/15;
        this.canvas.size(this.width, finalHeight);

        return this;
    }
}

export class SVGPieChart extends SVGCharts<undefined> {
    protected _data: SVGPieChartParams['data'] = [];

    protected showLabels: boolean;
    protected showValues: boolean;

    constructor(params: SVGPieChartParams) {
        super({
            dimensions: { width: 400, height: 400 },
            ...params
        });

        // set params
        this._data = params.data;

        this.showLabels = params.showLabels ?? true;
        this.showValues = params.showValues ?? true;
    }

    process() {
        // create pie chart
        const pieGroup = this.canvas.group().addClass('pie-chart');
        const labels = this.canvas.group().addClass('chart-legend');

        // sort data
        this._data = this._data.sort((a, b) => b.value - a.value);

        // sort data handling values with same label
        const combinedData: Record<string, { value: number, label: string }> = {};

        this._data.forEach(e => {
            const label = e.label || "Unkown";

            if (!combinedData[label]) {
                combinedData[label] = { value: e.value, label };
                if (label !== "Unkown") combinedData[label] = { ...combinedData[label], label };
            } else {
                combinedData[label].value += e.value;
            }
        });

        this._data = Object.values(combinedData);

        // handle last slice if not 100%
        const total = this._data.map(e => e.value).reduce((a, b) => a + b);

        if (total < 100) this._data.push({
            label: "Undefined",
            value: 100 - total,
        });
        else if (total > 100) this._data = this._data.map(e => ({
            ...e, value: e.value / total * 100,
        }));

        // draw pie chart
        const radius = this.width / 3;
        const cx = this.width / 2;
        const cy = this.height / 2;

        let count = 0;
        this._data.forEach((e, k) => {
            const params: [number, number] = [count * 3.6, (count += e.value) * 3.6];
            const color = this.getColor(k);

            const arcValues = arc(...params, radius, cx, cy);
            const path = `M${cx},${cy} L${arcValues.startX},${arcValues.startY} ` +
                         `A${arcValues.r},${arcValues.r} 0 ` +
                         `${params[1] - params[0] > 180 ? 1 : 0},1 ` +
                         `${arcValues.endX},${arcValues.endY}Z`;

            const slice = this.canvas.path(path).fill(color);

            pieGroup.add(slice);

            // add labels
            if (this.showLabels) {
                const label = labels.text(e.label || 'Unkown')
                    .fill(this.colors.text)
                    .font({ size: this.width / 20, anchor: 'middle', family: 'sans-serif' });

                const box = label.bbox();
                const angle = (params[0] + params[1]) / 2 - 90;

                label.move(
                    cx + (radius + 10) * Math.cos(degToRad(angle)) - box.width / 2,
                    cy + (radius + 10) * Math.sin(degToRad(angle)) - box.height / 2,
                );
            }

            // add values
            if (this.showValues) {
                const value = labels.text(`${e.value}%`)
                    .fill(this.colors.text)
                    .font({ size: this.width / 20, anchor: 'middle', family: 'sans-serif' });

                const box = value.bbox();
                const angle = (params[0] + params[1]) / 2 - 90;

                value.move(
                    cx + (radius - 10) * Math.cos(degToRad(angle)) - box.width / 2,
                    cy + (radius - 10) * Math.sin(degToRad(angle)) - box.height / 2,
                );
            }
        });

        return this;
    }
}
