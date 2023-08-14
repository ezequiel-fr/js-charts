import { G, Rect, StrokeData, Svg } from '@svgdotjs/svg.js';

/** Get or many values as array or array of array of values */
declare type RestOrArray<T> = T[] | [T[]];

/** Dimensions used by @link Charts */
declare type Dimensions = {
    width: number;
    height: number;
};

/** Standard coordinates (x, y) */
declare type Coords = {
    x: number;
    y: number;
}

/** Charts grid format */
declare type Grid = Dimensions & { stroke?: StrokeData };

/** Default class used by each child instances */
declare class Charts<Data = any> {
    /** The background container. */
    private backgroundGroup: G;

    /** The main element containing all others */
    protected canvas: Svg;
    /** The background element (color/pattern). */
    protected background: Rect;
    /** The data passed in input. */
    protected data: Data[];
    /** The width of the SVG frame */
    protected width: number;
    /** The height of the SVG frame */
    protected height: number;

    /**
     * Create a new chart instance.
     * @param dimensions the dimensions of the frame (optionnal).
     */
    constructor(dimensions?: Dimensions);

    /** Set a grid in background. */
    protected setGrid(grid: Grid): void;
    /** Init and place the background in the frame. */
    protected setBackground(): void;

    /** Process data to add all elements into the SVG canvas. */
    process(): this;
    /** Return the SVG frame as a string. */
    toString(): this;
    /** Set the data with an array of values, or many values. */
    setData(...data: RestOrArray<Data>): this;
}

/**
 * This is the default format of all bars charts. It's an array of number.
 * In case of a multiseries bar chart or a stacked bar chart, this correspond
 * to a group of values. Otherwise, the values are summed up between returning
 * just a value.
 */
declare type BarsDataSet = number[];

/** Snippet for each bars charts. */
declare class BarChart extends Charts<BarsDataSet> {}

/**
 * This is a slice, or a portion of a pie chart. Each values are passed as
 * a percentage of the pie (so, basically, it's all over 100). But, don't need
 * to worry! if the sum of the values are greater than 100, each values will be
 * discounted by 100. And if the it's less than 100, an "Undefined" slice will
 * be added to the pie chart.
 */
declare type Slices = {
    color?: string;
    label?: string;
    value: number;
};

/**
 * The `js-charts` module provide you some tool to create your own charts
 * easily and quicky, by just inputing the data in the type of chart that you
 * choose!
 */
declare module 'js-charts' {
    /** Provides you a single bar chart */
    export class SingleBarChart extends BarChart {}
    /** Provides you a stacked bar chart */
    export class StackedBarChart extends BarChart {}
    /** Provides you a multiseries bar chart */
    export class MultiseriesBarChart extends BarChart {}

    /** Provides you a way to create histograms */
    export class Histogram extends Charts<number> {
        step: number;
    }

    /** Provides you a pie chart */
    export class PieChart extends Charts<Slices> {}

    /** Provides you a scatter plot */
    export class ScatterPlots extends Charts<Coords> {
        public dotSize: number;

        private calcNewCoords;

        private get minX();
        private get minY();
        private get maxX();
        private get maxY();
    }

    // Snippets functions

    /** Single bar chart snippet */
    export function createSingleBarChart(data: RestOrArray<BarsDataSet>): string;
    /** Stacked bar chart snippet */
    export function createStackedBarChart(data: RestOrArray<BarsDataSet>): string;
    /** Multiseries bar chart snippet */
    export function createMultiseriesBarChart(data: RestOrArray<BarsDataSet>): string;
    /** Histogram snippet */
    export function createHistogram(data: RestOrArray<number>): string;
    /** Pie chart snippet */
    export function createPieChart(data: RestOrArray<Slices>): string;
    /** Scatter plots snippet */
    export function createScatterPlots(data: RestOrArray<Coords>): string;

    // Default export
    const jsCharts: {
        SingleBarChart: typeof SingleBarChart,
        StackedBarChart: typeof StackedBarChart,
        MultiseriesBarChart: typeof MultiseriesBarChart,
        Histogram: typeof Histogram,
        PieChart: typeof PieChart,
        ScatterPlots: typeof ScatterPlots,
        createSingleBarChart: typeof createSingleBarChart,
        createStackedBarChart: typeof createStackedBarChart,
        createMultiseriesBarChart: typeof createMultiseriesBarChart,
        createHistogram: typeof createHistogram,
        createPieChart: typeof createPieChart,
        createScatterPlots: typeof createScatterPlots,
    };

    export default jsCharts;
}
