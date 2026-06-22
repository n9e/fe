import { Modal } from 'antd';

import { showGitOperationError, isAbortError, confirmAbortOngoingRequest } from './gitErrorModal';

jest.mock('antd', () => ({
  Modal: {
    error: jest.fn(),
    confirm: jest.fn(),
  },
}));

describe('isAbortError', () => {
  it('returns true for an object with AbortError name', () => {
    expect(isAbortError({ name: 'AbortError' })).toBe(true);
  });

  it('returns true for an object with AbortError message', () => {
    expect(isAbortError({ message: 'AbortError' })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isAbortError(null)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isAbortError('some error')).toBe(false);
  });

  it('returns false for a non-AbortError object', () => {
    expect(isAbortError({ name: 'TypeError', message: 'bad type' })).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isAbortError(undefined)).toBe(false);
  });
});

describe('showGitOperationError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls Modal.error with the error message when error has a message', () => {
    showGitOperationError('Error Title', new Error('something went wrong'), 'Fallback');
    expect(Modal.error).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error Title',
        width: 560,
      }),
    );
  });

  it('calls Modal.error with the fallback message when error has no message', () => {
    showGitOperationError('Error Title', {}, 'Default fallback message');
    expect(Modal.error).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error Title',
        width: 560,
      }),
    );
  });

  it('extracts err from error.data when available (silence mode)', () => {
    const error = { data: { err: 'Repository not found' } };
    showGitOperationError('Error Title', error, 'Fallback');
    expect(Modal.error).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error Title',
        width: 560,
      }),
    );
    const callArg = (Modal.error as jest.Mock).mock.calls[0][0];
    expect(callArg.content.props.className).toBe('break-all whitespace-pre-wrap');
    expect(callArg.content.props.children).toBe('Repository not found');
  });

  it('falls back to error.message when error.data.err is absent', () => {
    const error = { data: { foo: 'bar' }, message: 'Network error' };
    showGitOperationError('Error Title', error, 'Fallback');
    expect(Modal.error).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error Title',
        width: 560,
      }),
    );
    const callArg = (Modal.error as jest.Mock).mock.calls[0][0];
    expect(callArg.content.props.className).toBe('break-all whitespace-pre-wrap');
    expect(callArg.content.props.children).toBe('Network error');
  });
});

describe('confirmAbortOngoingRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls Modal.confirm with the provided options', () => {
    const onAbort = jest.fn();
    const onClose = jest.fn();

    confirmAbortOngoingRequest({
      title: 'Abort Title',
      content: 'Abort Content',
      okText: 'Yes',
      cancelText: 'No',
      onAbort,
      onClose,
    });

    expect(Modal.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Abort Title',
        content: 'Abort Content',
        okText: 'Yes',
        cancelText: 'No',
        okButtonProps: { danger: true },
      }),
    );
  });
});
