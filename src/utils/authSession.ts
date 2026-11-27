/**
 * Session hooks. Distributions that bundle extra products replace this file to end those
 * products' sessions together with this one.
 */

/** Called before signing out, while the current session is still valid. */
export function beforeLogout(): Promise<void> {
  return Promise.resolve();
}
