import { createSVGWindow } from 'svgdom';
import { registerWindow } from '@svgdotjs/svg.js';

import * as BarCharts from './bar-charts';
import Histogram from './histogram';
import PieChart, { Slices } from './pie-chart';
import ScatterPlot, { Coords } from './scatter-plot';

import { RestOrArray } from './utils/charts';

// context window
const window = createSVGWindow();
const document = window.document;

registerWindow(window, document);

// creators
function createSingleBarChart(data: RestOrArray<BarCharts.DataSet>) {
    return new BarCharts.SingleBarChart().setData(...data).process().toString();
}

function createStackedBarChart(data: RestOrArray<BarCharts.DataSet>) {
    return new BarCharts.StackedBarChart().setData(...data).process().toString();
}

function createMultiseriesBarChart(data: RestOrArray<BarCharts.DataSet>) {
    return new BarCharts.MultiseriesBarChart().setData(...data).process().toString();
}

function createHistogram(data: RestOrArray<number>) {
    return new Histogram().setData(...data).process().toString();
}

function createPieChart(data: RestOrArray<Slices>) {
    return new PieChart().setData(...data).process().toString();
}

function createScatterPlots(data: RestOrArray<Coords>) {
    return new ScatterPlot().setData(...data).process().toString();
}

// exports
module.exports = {
    ...BarCharts,
    Histogram,
    PieChart,
    ScatterPlot,
    createSingleBarChart,
    createStackedBarChart,
    createMultiseriesBarChart,
    createHistogram,
    createPieChart,
    createScatterPlots,
};

module.exports.SingleBarChart = BarCharts.SingleBarChart;
module.exports.MultiseriesBarChart = BarCharts.MultiseriesBarChart;
module.exports.StackedBarChart = BarCharts.StackedBarChart;
module.exports.Histogram = Histogram;
module.exports.PieChart = PieChart;
module.exports.ScatterPlot = ScatterPlot;

module.exports.createSingleBarChart = createSingleBarChart;
module.exports.createStackedBarChart = createStackedBarChart;
module.exports.createMultiseriesBarChart = createMultiseriesBarChart;
module.exports.createHistogram = createHistogram;
module.exports.createPieChart = createPieChart;
module.exports.createScatterPlots = createScatterPlots;
