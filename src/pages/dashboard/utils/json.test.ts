import { getErrorMessage, isJsonObject, parseJson } from './json';

describe('JSON helpers', () => {
  test('recognizes JSON objects but rejects arrays and primitive values', () => {
    expect(isJsonObject({ key: ['value', 1, true, null] })).toBe(true);
    expect(isJsonObject([])).toBe(false);
    expect(isJsonObject('value')).toBe(false);
  });

  test('parses valid JSON and returns undefined for invalid input', () => {
    expect(parseJson('{"key":"value"}')).toEqual({ key: 'value' });
    expect(parseJson('{')).toBeUndefined();
  });
});

describe('getErrorMessage', () => {
  test('prefers proxy response data over an object-stringified Error message', () => {
    const error = Object.assign(new Error('[object Object]'), {
      data: { error: 'dial tcp 119.45.120.121:8481: i/o timeout' },
    });

    expect(getErrorMessage(error)).toBe('dial tcp 119.45.120.121:8481: i/o timeout');
  });

  test('reads response.data and joins array error details', () => {
    expect(getErrorMessage({ response: { data: [{ message: 'first failure' }, { error: 'second failure' }] } })).toBe('first failure; second failure');
  });

  test('keeps ordinary Error messages', () => {
    expect(getErrorMessage(new Error('request failed'))).toBe('request failed');
  });
});
