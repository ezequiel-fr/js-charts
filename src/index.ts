import { createSVGWindow } from 'svgdom';
import { registerWindow } from '@svgdotjs/svg.js';

import * as BarCharts from './bar-charts';
import Histogram from './histogram';
import PieChart from './pie-chart';
import ScatterPlot from './scatter-plot';

const window = createSVGWindow();
const document = window.document;

registerWindow(window, document);

module.exports = {
    ...BarCharts,
    Histogram,
    PieChart,
    ScatterPlot,
};

module.exports.SingleBarChart = BarCharts.SingleBarChart;
module.exports.MultiseriesBarChart = BarCharts.MultiseriesBarChart;
module.exports.StackedBarChart = BarCharts.StackedBarChart;
module.exports.Histogram = Histogram;
module.exports.PieChart = PieChart;
module.exports.ScatterPlot = ScatterPlot;
