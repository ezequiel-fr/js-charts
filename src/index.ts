import { createSVGWindow } from 'svgdom';
import { registerWindow } from '@svgdotjs/svg.js';

import { Coords, SVGMultiseries } from './svg/series';
import { RestOrArray } from './utils/charts';

type ChartType = 'html' | 'svg';

// context window (SVG)
if (typeof window === 'undefined') {
    const window = createSVGWindow();
    const document = window.document;

    registerWindow(window, document);
}

export const multiseriesFromData = (data: RestOrArray<Coords>, type: ChartType = 'svg') => (
    type === 'svg'
        ? new SVGMultiseries().setData(...data).process().toString()
        : ''
);

// default export
export { SVGMultiseries };
