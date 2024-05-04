# js-charts

A library to help you creating your own charts.

## Parameters
### Common
- `border`: Show the border of the chart. Default is `false`.
- `theme`: The theme of the chart. Default is `light`. The complete list of themes is available in
the [Themes](#themes) section.
- `title`: The title of the chart. By default any title is provided and shown.
- `labels`: The labels of the chart. Default is `['x', 'y']`.
- `showGrid`: Show the grid of the chart. Default is `true`.
- `showLabels`: Show the labels of the chart. Default is `true`.

### SVGMultiseries
- `axisSoft`: The axis soft. You can fill it with `auto` | `fit` or numerical | `auto` values as a
min-max object (`{min,max}`) Default is `auto`.
- `styleMode`: The style mode of the chart. Default is `both`. Values are `both` | `line` | `points` | `bars`.
- `fillMode`: The fill mode of the chart. Default is `none`. Values are `none` | `solid` |
`gradient` | `opacity` | `opacity-gradient`.
- `lineStyle`: The line style of the chart. Default is `solid`. Values are `solid` | `dotted` |
`dashed-1` | `dashed-2` | `dashed-3`.
- `showCoords`: Show the coordinates of the chart. Default is `false`.
- `showValues`: Show the values of the chart. Default is `false`.
- `showExtremes`: Show the extremes of the chart. Default is `false`.
- `dimensions`: The dimensions of the chart. Default is `{ width: 800, height: 450 }`.

### Themes
