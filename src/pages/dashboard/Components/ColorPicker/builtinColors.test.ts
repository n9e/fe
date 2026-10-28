/** @jest-environment jsdom */

import type { IPanel } from '../../types';
import { getBuiltinColorCssValue, isBuiltinColor, resolveColor, resolvePanelColors } from './builtinColors';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('builtin dashboard colors', () => {
  it('recognizes color tokens and preserves legacy color values', () => {
    expect(isBuiltinColor('red-9')).toBe(true);
    expect(isBuiltinColor('text')).toBe(true);
    expect(isBuiltinColor('transparent')).toBe(true);
    expect(getBuiltinColorCssValue('blue-9')).toBe('var(--fc-blue-9)');
    expect(getBuiltinColorCssValue('transparent')).toBe('transparent');
    expect(getBuiltinColorCssValue('#ff0000')).toBe('#ff0000');
    expect(getBuiltinColorCssValue()).toBe('transparent');
    expect(isBuiltinColor('#ff0000')).toBe(false);
    expect(isBuiltinColor('rgba(0, 0, 0, 0.5)')).toBe(false);
    expect(isBuiltinColor(undefined)).toBe(false);
  });

  it('resolves theme colors, caches each theme, and removes its temporary probe', () => {
    const probes: Element[] = [];
    const getComputedStyle = jest.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      probes.push(element);
      const color = element.classList.contains('theme-dark') ? 'rgb(10, 20, 30)' : 'rgb(40, 50, 60)';
      return { color } as CSSStyleDeclaration;
    });

    expect(resolveColor('purple-7', false)).toBe('rgb(40, 50, 60)');
    expect(resolveColor('purple-7', true)).toBe('rgb(10, 20, 30)');
    expect(resolveColor('purple-7', true)).toBe('rgb(10, 20, 30)');
    expect(getComputedStyle).toHaveBeenCalledTimes(2);
    expect(probes.every((probe) => !probe.isConnected)).toBe(true);
    expect(resolveColor('transparent', true)).toBe('transparent');
    expect(resolveColor('#abcdef', true)).toBe('#abcdef');
  });

  it('keeps a CSS variable when the browser cannot resolve it to a concrete color', () => {
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({ color: 'var(--fc-violet-8)' } as CSSStyleDeclaration);

    expect(resolveColor('purple-8', false)).toBe('var(--fc-violet-8)');
  });

  it('resolves option and override colors without mutating input, and remains idempotent', () => {
    const values: IPanel = {
      id: 'panel',
      type: 'stat',
      name: 'Panel',
      description: '',
      layout: { h: 4, w: 12, x: 0, y: 0, i: 'panel' },
      targets: [],
      custom: {},
      options: {
        thresholds: { mode: 'absolute', steps: [{ color: 'green-9', value: null }] },
        xThresholds: { mode: 'absolute', steps: [{ color: 'purple-9', value: 5 }] },
        valueMappings: [{ type: 'special', match: { special: 1 }, result: { color: 'text', text: 'one' } }],
      },
      overrides: [
        {
          matcher: { value: 'series' },
          properties: {
            thresholds: { mode: 'absolute', steps: [{ color: 'blue-9', value: 10 }] },
            valueMappings: [{ type: 'special', match: { special: 2 }, result: { color: 'red-9', text: 'two' } }],
          },
        },
      ],
    };
    const getComputedStyle = jest.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const color = element.classList.contains('theme-dark') ? 'rgb(1, 2, 3)' : 'rgb(4, 5, 6)';
      return { color } as CSSStyleDeclaration;
    });

    const resolved = resolvePanelColors(values, true);
    const resolvedAgain = resolvePanelColors(resolved, true);

    expect(resolved.options.thresholds?.steps[0].color).toBe('rgb(1, 2, 3)');
    expect(resolved.options.xThresholds?.steps[0].color).toBe('rgb(1, 2, 3)');
    expect(resolved.options.valueMappings?.[0].result.color).toBe('rgb(1, 2, 3)');
    expect(resolved.overrides[0].properties.thresholds).toEqual({ mode: 'absolute', steps: [{ color: 'rgb(1, 2, 3)', value: 10 }] });
    expect((resolved.overrides[0].properties.valueMappings as Array<{ result: { color: string } }>)[0].result.color).toBe('rgb(1, 2, 3)');
    expect(resolvedAgain).toEqual(resolved);
    expect(resolved).not.toBe(values);
    expect(values.options.thresholds?.steps[0].color).toBe('green-9');
    expect(values.options.xThresholds?.steps[0].color).toBe('purple-9');
    expect(values.overrides[0].properties.thresholds).toEqual({ mode: 'absolute', steps: [{ color: 'blue-9', value: 10 }] });
  });

  it('skips malformed value mappings without a result in panel options and overrides', () => {
    const malformedMapping = { type: 'special', match: { special: 1 } };
    const values = {
      id: 'panel',
      type: 'stat',
      name: 'Panel',
      description: '',
      layout: { h: 4, w: 12, x: 0, y: 0, i: 'panel' },
      targets: [],
      custom: {},
      options: { valueMappings: [malformedMapping] },
      overrides: [{ matcher: { value: 'series' }, properties: { valueMappings: [malformedMapping] } }],
    } as unknown as IPanel;

    expect(() => resolvePanelColors(values, false)).not.toThrow();
    const resolved = resolvePanelColors(values, false);
    expect(resolved.options.valueMappings?.[0]).toEqual(malformedMapping);
    expect(resolved.overrides[0].properties.valueMappings).toEqual([malformedMapping]);
  });
});
