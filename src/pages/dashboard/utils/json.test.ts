import { isJsonObject, parseJson } from './json';

describe('dashboard JSON helpers', () => {
  it('distinguishes JSON objects from arrays and null', () => {
    expect(isJsonObject({ nested: ['value'] })).toBe(true);
    expect(isJsonObject([])).toBe(false);
    expect(isJsonObject(null)).toBe(false);
  });

  it('returns undefined for invalid JSON', () => {
    expect(parseJson('{"valid":true}')).toEqual({ valid: true });
    expect(parseJson('{')).toBeUndefined();
  });
});
