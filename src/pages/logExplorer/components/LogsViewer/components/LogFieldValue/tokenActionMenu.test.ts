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
