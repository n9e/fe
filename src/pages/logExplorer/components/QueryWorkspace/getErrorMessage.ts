/**
 * Reads the message off a rejected request.
 *
 * A request marked with `silence: true` rejects with the response body itself, other requests with an `Error`,
 * so both shapes (and a plain string) are handled here before falling back to the caller's own copy.
 */
export default function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') return error || fallback;
  if (error instanceof Error) return error.message || fallback;
  if (error && typeof error === 'object' && 'message' in error) {
    const { message } = error as { message?: unknown };
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}
