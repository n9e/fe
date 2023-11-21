// import * as d3 from 'd3';
// import * as d3ScaleChromatic from 'd3-scale-chromatic';
// import { HeatmapColorOptions } from './types';
// import { defaultPanelOptions } from './config';

export const colorSchemes = [
  { name: 'Blues', invert: 'dark' },
  { name: 'Greens', invert: 'dark' },
  { name: 'Greys', invert: 'dark' },
  { name: 'Oranges', invert: 'dark' },
  { name: 'Purples', invert: 'dark' },
  { name: 'Reds', invert: 'dark' },
];

// type Interpolator = (t: number) => string;

// const DEFAULT_SCHEME = colorSchemes.find((scheme) => scheme.name === 'Spectral');

// export function quantizeScheme(opts: HeatmapColorOptions): string[] {
//   const options = { ...defaultPanelOptions.color, ...opts };
//   const palette: string[] = [];
//   const steps = (options.steps ?? 128) - 1;
//   const scheme = colorSchemes.find((scheme) => scheme.name === options.scheme) ?? DEFAULT_SCHEME!;
//   const fnName = 'interpolate' + scheme.name;
//   const interpolate: Interpolator = (d3ScaleChromatic as any)[fnName];

//   for (let i = 0; i <= steps; i++) {
//     const rgbStr = interpolate(i / steps);
//     const rgb = rgbStr.indexOf('rgb') === 0 ? '#' + [...rgbStr.matchAll(/\d+/g)].map((v) => (+v[0]).toString(16).padStart(2, '0')).join('') : rgbStr;
//     palette.push(rgb);
//   }

//   if (opts.reverse) {
//     palette.reverse();
//   }

//   return palette;
// }
