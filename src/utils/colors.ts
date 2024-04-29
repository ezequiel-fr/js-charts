export const Themes = {
    light: {
        background: '#f7f7f7',
        color1: '#36f',
        color2: '#ff333f',
        color3: '#007521',
        color4: '#ff9533',
        color5: '#8f5fe0',
        color6: '#39de54',
        color7: '#fc0',
        color8: '#75758b',
        color9: '#00bfb4',
        stroke: null,
    },
    dark: {
        background: '#333',
        color1: '#36f',
        color2: '#ff333f',
        color3: '#007521',
        color4: '#ff9533',
        color5: '#8f5fe0',
        color6: '#39de54',
        color7: '#fc0',
        color8: '#75758b',
        color9: '#00bfb4',
        stroke: null,
    },
    white: {
        background: '#f7f7f7',
        color1: '#333',
        color2: '#666',
        color3: '#999',
        color4: '#ccc',
        stroke: null,
    },
    black: {
        background: '#333',
        color1: '#f7f7f7',
        color2: '#ccc',
        color3: '#999',
        color4: '#666',
        stroke: null,
    },
    solarized: {
        background: '#fdf6e3',
        color1: '#657b83',
        color2: '#839496',
        color3: '#586e75',
        color4: '#073642',
        stroke: null,
    },
    monokai: {
        background: '#272822',
        color1: '#e6db74',
        color2: '#66d9ef',
        color3: '#ae81ff',
        color4: '#f92672',
        color5: '#fd971f',
        color6: '#a6e22e',
        color7: '#f8f8f2',
        color8: '#75715e',
        stroke: null,
    },
    nord: {
        background: '#2e3440',
        color1: '#e5e9f0',
        color2: '#8fbcbb',
        color3: '#5e81ac',
        color4: '#bf616a',
        color5: '#d08770',
        color6: '#ebcb8b',
        color7: '#a3be8c',
        stroke: null,
    },
    gruvbox: {
        background: '#282828',
        color1: '#ebdbb2',
        color2: '#a89984',
        color3: '#665c54',
        color4: '#464341',
        stroke: null,
    },
    onedark: {
        background: '#282c34',
        color1: '#abb2bf',
        color2: '#98c379',
        color3: '#e5c07b',
        color4: '#e06c75',
        color5: '#61afef',
        color6: '#c678dd',
        stroke: null,
    },
    github: {
        background: '#f6f8fa',
        color1: '#24292e',
        color2: '#6a737d',
        color3: '#959da5',
        color4: '#0366d6',
        color5: '#28a745',
        color6: '#d73a49',
        color7: '#6f42c1',
        color8: '#e83e8c',
        color9: '#b08800',
        stroke: null,
    },
    dracula: {
        background: '#282a36',
        color1: '#f8f8f2',
        color2: '#6272a4',
        color3: '#44475a',
        color4: '#383a59',
        stroke: null,
    },
    ayu: {
        background: '#1c1e26',
        color1: '#abb2bf',
        color2: '#818c99',
        color3: '#5c6773',
        color4: '#3b4252',
        stroke: null,
    },
    synthwave: {
        background: '#2b213a',
        color1: '#f92aad',
        color2: '#f8d847',
        color3: '#45f0df',
        color4: '#c7f0db',
        stroke: null,
    },
    outrun: {
        background: '#000',
        color1: '#ffcc00',
        color2: '#ff00cc',
        color3: '#ff0066',
        stroke: null,
    },
    ocean: {
        background: '#2b3b4d',
        color1: '#c0c5ce',
        color2: '#a6accd',
        color3: '#828997',
        stroke: null,
    },
    chocolate: {
        background: '#2b1b17',
        color1: '#d3af86',
        color2: '#504339',
        color3: '#b8afad',
        color4: '#665c54',
        stroke: null,
    },
    violet: {
        background: '#1e1e3f',
        color1: '#a9b1d6',
        color2: '#9a86fd',
        color3: '#9ccfd8',
        color4: '#b877db',
        stroke: null,
    },
    atom: {
        background: '#161719',
        color1: '#abb2bf',
        color2: '#e06c75',
        color3: '#98c379',
        color4: '#c678dd',
        stroke: null,
    },
    tomorrow: {
        background: '#fff',
        color1: '#4d4d4c',
        color2: '#8e908c',
        color3: '#c82829',
        color4: '#f5871f',
        stroke: null,
    },
    twilight: {
        background: '#141414',
        color1: '#f7f7f7',
        color2: '#c3c3c3',
        color3: '#969896',
        color4: '#818181',
        stroke: null,
    },
    blood: {
        background: '#2b0404',
        color1: '#f92aad',
        color2: '#ffcc00',
        color3: '#ff0066',
        color4: '#ffcc00',
        stroke: null,
    },
    moon: {
        background: '#0f111a',
        color1: '#c9c9c9',
        color2: '#939293',
        color3: '#676a6d',
        color4: '#515253',
        stroke: null,
    },
    none: {
        background: '#000',
        stroke: null,
    },
    darkParty: {
        background: '#282a36',
        color1: '#ff5555',
        color2: '#50fa7b',
        color3: '#f1fa8c',
        color4: '#bd93f9',
        color5: '#ff79c6',
        color6: '#8be9fd',
        color7: '#ffb86c',
        color8: '#6272a4',
        color9: '#ff5555',
        stroke: null,
    },
} as const;

export type AvailableThemes = keyof typeof Themes;
export type AvailableColorKeys = `color${number}`;

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
