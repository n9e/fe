/// <reference types="jest" />

import { getHighlightSource, getTokenDisplayValue } from './tokenValue';

describe('tokenValue', () => {
  it('formats date value by pattern', () => {
    const result = getTokenDisplayValue({
      value: '2024-01-02',
      fieldValue: '2024-01-02',
      name: 'ts',
      fieldConfig: {
        arr: [
          {
            field: 'ts',
            formatMap: {
              type: 'date',
              params: {
                pattern: 'YYYY-MM-DD',
              },
            },
          },
        ],
      },
    });

    expect(result).toBe('2024-01-02');
  });

  it('formats url label template when url formatter is configured', () => {
    const result = getTokenDisplayValue({
      value: 'abc',
      fieldValue: 'https://example.com/x',
      name: 'link',
      fieldConfig: {
        arr: [
          {
            field: 'link',
            formatMap: {
              type: 'url',
              params: {
                urlTemplate: 'https://example.com/{{value}}',
                labelTemplate: 'open:{{value}}',
              },
            },
          },
        ],
      },
    });

    expect(result).toBe('open:https://example.com/x');
  });

  it('falls back to raw string conversion when no formatter exists', () => {
    const result = getTokenDisplayValue({
      value: 'plain-text',
      fieldValue: 'plain-text',
      name: 'msg',
    });

    expect(result).toBe('plain-text');
  });

  it('prefers exact nested highlight key', () => {
    const result = getHighlightSource('a.b', {
      'a.b': ['nested'],
      a: ['top-level'],
    });

    expect(result).toEqual(['nested']);
  });

  it('falls back to top-level highlight key for nested field', () => {
    const result = getHighlightSource('a.b', {
      a: ['top-level'],
    });

    expect(result).toEqual(['top-level']);
  });
});
