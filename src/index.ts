import { createSVGWindow } from 'svgdom';
import { registerWindow } from '@svgdotjs/svg.js';

import PieChart from './pie-chart';
import ScatterPlot from './scatter-plot';

const window = createSVGWindow();
const document = window.document;

registerWindow(window, document);

module.exports = {
    PieChart,
    ScatterPlot,
};

module.exports.PieChart = PieChart;
module.exports.ScatterPlot = ScatterPlot;
