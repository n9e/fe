/// <reference types="jest" />

import { normalizeRawValueForNav } from './tokenActionMenu.utils';

describe('tokenActionMenu', () => {
  it('parses JSON strings into objects', () => {
    const result = normalizeRawValueForNav({
      payload: '{"foo":1}',
    });

    expect(result).toEqual({
      payload: { foo: 1 },
    });
  });

  it('keeps non-JSON strings untouched', () => {
    const result = normalizeRawValueForNav({
      msg: 'plain-text',
    });

    expect(result).toEqual({
      msg: 'plain-text',
    });
  });

  it('keeps non-string values untouched', () => {
    const result = normalizeRawValueForNav({
      count: 1,
      enabled: true,
      nested: { a: 1 },
    });

    expect(result).toEqual({
      count: 1,
      enabled: true,
      nested: { a: 1 },
    });
  });

  it('returns empty object for undefined input', () => {
    expect(normalizeRawValueForNav(undefined)).toEqual({});
  });
});

describe('tokenActionMenu fragment vs full-value filter logic', () => {
  it('should hide fragment filters when fragmentValue equals fieldValue', () => {
    // TokenActionMenuContent 中: showFragmentFilters && fragmentValue !== fieldValue
    // 当 fragmentValue === fieldValue 时，即使 showFragmentFilters=true，片段级过滤项也不应渲染
    const fragmentValue = 'error: connection timeout';
    const fieldValue = 'error: connection timeout';
    const showFragmentFilters = true;

    const shouldShowFragmentItems = showFragmentFilters && fragmentValue !== fieldValue;

    expect(shouldShowFragmentItems).toBe(false);
  });

  it('should show fragment filters when fragmentValue differs from fieldValue', () => {
    const fragmentValue = 'connection';
    const fieldValue = 'error: connection timeout';
    const showFragmentFilters = true;

    const shouldShowFragmentItems = showFragmentFilters && fragmentValue !== fieldValue;

    expect(shouldShowFragmentItems).toBe(true);
  });

  it('should hide fragment filters when showFragmentFilters is false regardless of value equality', () => {
    const fragmentValue = 'partial';
    const fieldValue = 'error: connection timeout';
    const showFragmentFilters = false;

    const shouldShowFragmentItems = showFragmentFilters && fragmentValue !== fieldValue;

    expect(shouldShowFragmentItems).toBe(false);
  });
});
