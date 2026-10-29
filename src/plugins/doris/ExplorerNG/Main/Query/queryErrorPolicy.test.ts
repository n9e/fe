import { createQueryErrorHandler, isMissingQueryOperator } from './queryErrorPolicy';

describe('Doris Query parser error guidance', () => {
  const parserMessage = 'expected operator after field';
  it.each([200, 400, 422])('handles the known parser error with status %s', (status) => {
    expect(isMissingQueryOperator({ message: parserMessage, response: { status } })).toBe(true);
  });
  it.each([401, 403, 500, 503])('keeps status %s in the shared error path even if it contains the parser text', (status) => {
    expect(isMissingQueryOperator({ message: parserMessage, response: { status } })).toBe(false);
  });
  it('replaces the parser error with guidance and rejects the request', () => {
    const show = jest.fn();
    const fallback = jest.fn();
    const handle = createQueryErrorHandler(fallback, show, 'Use field:value or set a default field.');
    expect(() => handle({ message: parserMessage })).toThrow('Use field:value or set a default field.');
    expect(show).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
  });
  it.each(['Network request failed', 'no data', 'permission denied', 'unknown column', 'syntax error near SELECT'])('preserves unrelated error: %s', (message) => {
    const show = jest.fn();
    const error = { message };
    const fallback = jest.fn(() => {
      throw error;
    });
    expect(() => createQueryErrorHandler(fallback, show, 'guidance')(error)).toThrow();
    expect(fallback).toHaveBeenCalledWith(error);
    expect(show).not.toHaveBeenCalled();
  });
});
