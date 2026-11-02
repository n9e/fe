import _ from 'lodash';

import type { IPanel, IValueMapping } from '../../types';

const colorVariables = {
  'red-11': '--fc-red-11',
  'red-10': '--fc-red-10',
  'red-9': '--fc-red-9',
  'red-8': '--fc-red-8',
  'red-7': '--fc-red-7',
  'orange-11': '--fc-orange-11',
  'orange-10': '--fc-orange-10',
  'orange-9': '--fc-orange-9',
  'orange-8': '--fc-orange-8',
  'orange-7': '--fc-orange-7',
  'yellow-11': '--fc-yellow-11',
  'yellow-10': '--fc-yellow-10',
  'yellow-9': '--fc-yellow-9',
  'yellow-8': '--fc-yellow-8',
  'yellow-7': '--fc-yellow-7',
  'green-11': '--fc-green-11',
  'green-10': '--fc-green-10',
  'green-9': '--fc-green-9',
  'green-8': '--fc-green-8',
  'green-7': '--fc-green-7',
  'blue-11': '--fc-blue-11',
  'blue-10': '--fc-blue-10',
  'blue-9': '--fc-blue-9',
  'blue-8': '--fc-blue-8',
  'blue-7': '--fc-blue-7',
  'purple-11': '--fc-violet-11',
  'purple-10': '--fc-violet-10',
  'purple-9': '--fc-violet-9',
  'purple-8': '--fc-violet-8',
  'purple-7': '--fc-violet-7',
  text: '--fc-text-1',
} as const;

const builtinColors = new Set([...Object.keys(colorVariables), 'transparent']);
const resolvedColorCache = new Map<string, string>();

export function isBuiltinColor(value: unknown): value is string {
  return typeof value === 'string' && builtinColors.has(value);
}

/** Return a CSS value that stays connected to the active theme. */
export function getBuiltinColorCssValue(value?: string) {
  if (value === 'transparent') {
    return 'transparent';
  }

  if (value && Object.prototype.hasOwnProperty.call(colorVariables, value)) {
    return `var(${colorVariables[value as keyof typeof colorVariables]})`;
  }

  return value || 'transparent';
}

/** Resolve a theme token to a color string supported by canvas, d3, and color parsers. */
export function resolveColor(value: string, darkMode: boolean) {
  if (!isBuiltinColor(value) || value === 'transparent') {
    return value;
  }

  const cacheKey = `${darkMode ? 'dark' : 'light'}:${value}`;
  const cachedValue = resolvedColorCache.get(cacheKey);
  if (cachedValue) {
    return cachedValue;
  }

  if (typeof document === 'undefined' || !document.documentElement) {
    return getBuiltinColorCssValue(value);
  }

  const probe = document.createElement('span');
  probe.className = darkMode ? 'theme-dark' : '';
  probe.style.color = getBuiltinColorCssValue(value);
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  document.documentElement.appendChild(probe);

  const resolvedValue = window.getComputedStyle(probe).color;
  probe.remove();

  const result = resolvedValue && !resolvedValue.startsWith('var(') ? resolvedValue : getBuiltinColorCssValue(value);
  resolvedColorCache.set(cacheKey, result);
  return result;
}

type ColorEntry = { color: string };
type ValueMappingColorEntry = Pick<IValueMapping, 'result'>;

function resolveThresholdColors(steps: ColorEntry[] | undefined, darkMode: boolean) {
  steps?.forEach((step) => {
    step.color = resolveColor(step.color, darkMode);
  });
}

function resolveValueMappingColors(mappings: ValueMappingColorEntry[] | undefined, darkMode: boolean) {
  mappings?.forEach((mapping) => {
    if (mapping.result) {
      mapping.result.color = resolveColor(mapping.result.color, darkMode);
    }
  });
}

/** Clone panel configuration and resolve threshold, x-axis threshold, and value-mapping tokens before renderer use. */
export function resolvePanelColors<T extends IPanel>(values: T, darkMode: boolean): T {
  const resolvedValues = _.cloneDeep(values);

  resolveThresholdColors(resolvedValues.options?.thresholds?.steps, darkMode);
  resolveThresholdColors(resolvedValues.options?.xThresholds?.steps, darkMode);
  resolveValueMappingColors(resolvedValues.options?.valueMappings, darkMode);

  resolvedValues.overrides?.forEach((override) => {
    if (!override || typeof override !== 'object') {
      return;
    }

    const rawProperties = override.properties;
    if (!rawProperties || typeof rawProperties !== 'object' || Array.isArray(rawProperties)) {
      // Dashboard configs come from the API and can predate the current schema.
      // Normalize malformed overrides on the cloned config so one panel cannot blank the dashboard.
      override.properties = {};
      return;
    }

    const properties = rawProperties as {
      thresholds?: { steps?: ColorEntry[] };
      valueMappings?: ValueMappingColorEntry[];
    };

    resolveThresholdColors(properties.thresholds?.steps, darkMode);
    resolveValueMappingColors(properties.valueMappings, darkMode);
  });

  return resolvedValues;
}
