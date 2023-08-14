export const roundTo = (x: number, digits = 3) => Math.round(x*10**digits) / 10**digits;

export const deviation = (data: number[]) => Math.max(...data) - Math.min(...data);
