import { createSVGWindow } from 'svgdom';
import { registerWindow } from '@svgdotjs/svg.js';

import scatterPlot from './scatter-plot';

const window = createSVGWindow();
const document = window.document;

registerWindow(window, document);

export const ScatterPlots = scatterPlot;

export default {
    ScatterPlots,
};
