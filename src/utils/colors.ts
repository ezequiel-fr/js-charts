export const Themes = {
    light: {
        background: '#eee',
        color: '#555',
        stroke: null,
    },
    dark: {
        background: '#333',
        color: '#ccc',
        stroke: null,
    },
} as const;

export type AvailableThemes = keyof typeof Themes;

/**
 * Convert a color to a valid hex color (#rrggbb).
 * 
 * @param color - The color to convert
 * @param replacement - The replacement color if the input is invalid
 * @returns The valid hex color
 */
export function toValidHex(color: string, replacement: string = '#000000') {
    // remove whitespace and hash
    color = color.trim();
    color = color.replace(/^#/, '');
    color = color.replace(
        /^([a-f\d])([a-f\d])([a-f\d])$/i,
        (_, r, g, b) => r + r + g + g + b + b,
    );

    // if the color is not a valid hex color, return the replacement color
    if (color.length !== 6) return replacement;
    // if the color is a valid hex color, return it with a hash
    return `#${color}`;
}

/**
 * Get the stroke color based on the background color
 * 
 * @param background - The background color
 * @returns The stroke color
 */
export function getStroke(background: string, mode: 'opposite' | 'contrast' = 'opposite') {
    // parse the background color into RGB
    // input like : #rgb or #rrggbb => rrggbb => [r, g, b]
    background = toValidHex(background);

    // convert hex to RGB
    const match = background.match(/[a-f\d]{2}/g) || ['00', '00', '00'];
    const rgb = match.map(hex => parseInt(hex, 16));

    let stroke: number[];

    if (mode === 'opposite') {
        // calculate the contrast ratio as a number between 0 and 255
        const contrast = rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114;
        // get the stroke color by calculating the opposite color
        const opposite = rgb.map(c => 255 - c);

        // adjust the stroke color based on the contrast ratio
        stroke = opposite.map(c => Math.round(c * (1 + contrast / 255)) % 256);
    } else {
        // calculate the brightness as a number between 0 and 255
        const brightness = rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114;

        // if the brightness is less than 128, return a color that is 20% brighter
        // otherwise, return a color that is 20% darker
        const weight = (brightness < 128 ? 1 : -1) * 58;
        stroke = rgb.map(c => Math.round(c + weight) % 256);
    }

    return `#${stroke.map(c => c.toString(16).padStart(2, '0')).join('')}`;
}
