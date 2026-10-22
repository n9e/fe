// Only this known parser error is replaced; HTTP/service/auth failures keep the shared handler.
export function isMissingQueryOperator(error: { message?: string; response?: { status: number }; status?: number }) {
  const status = error?.response?.status ?? error?.status;
  return (status == null || status === 200 || status === 400 || status === 422) && /\bexpected operator after field\b/i.test(error?.message || '');
}

export function createQueryErrorHandler<ErrorType extends { message?: string; response?: { status: number }; status?: number }>(
  fallback: (error: ErrorType) => unknown,
  showGuidance: () => void,
  friendlyMessage: string,
) {
  return (error: ErrorType) => {
    if (!isMissingQueryOperator(error)) return fallback(error);
    showGuidance();
    throw new Error(friendlyMessage);
  };
}
