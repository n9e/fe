import getErrorMessage from './getErrorMessage';

it('reads the message from an Error, a silenced response body and a plain string', () => {
  expect(getErrorMessage(new Error('no valid aggregates found'), 'fallback')).toBe('no valid aggregates found');
  expect(getErrorMessage({ err: 'no valid aggregates found', message: 'no valid aggregates found', silence: true }, 'fallback')).toBe('no valid aggregates found');
  expect(getErrorMessage('no valid aggregates found', 'fallback')).toBe('no valid aggregates found');
  expect(getErrorMessage(new Error(''), 'fallback')).toBe('fallback');
  expect(getErrorMessage(undefined, 'fallback')).toBe('fallback');
});
