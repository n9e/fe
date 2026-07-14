import { useCallback, useEffect, useRef, useState } from 'react';

import { prepareOAuth, getOAuthStatus, OAuthStatus } from './services';

interface ConnectOptions {
  /** Resolves the server id, creating the server first if needed. */
  ensureServerId: () => Promise<number>;
  client_id?: string;
  client_secret?: string;
  scope?: string;
}

export type OAuthResult = 'success' | 'failure' | 'cancelled';

// Waits for the callback popup to postMessage its result back to us. We accept
// only messages coming from the exact popup window we opened (`e.source === popup`).
// That check is origin-independent — the callback page's origin varies across
// proxy/deploy setups, so we can't do a strict origin check, but the window-handle
// identity still guarantees the message came from our own OAuth popup and not any
// other page the user has open.
function waitForOAuthResult(popup: Window | null, registerAbort: (abort: () => void) => void): Promise<OAuthResult> {
  return new Promise((resolve) => {
    let done = false;
    let pollTimer: ReturnType<typeof setTimeout>;
    const finish = (result: OAuthResult) => {
      if (done) return;
      done = true;
      window.removeEventListener('message', handler);
      clearTimeout(timer);
      clearTimeout(pollTimer);
      resolve(result);
    };
    const handler = (e: MessageEvent) => {
      // Reject anything not sent by the popup we opened. If the popup was blocked
      // (null) we fall back to the source marker alone.
      if (popup && e.source !== popup) return;
      const d = e.data;
      if (d && d.source === 'n9e-mcp-oauth') {
        finish(d.status === 'success' ? 'success' : 'failure');
      }
    };
    // Closing the popup (user cancels the authorization) emits no postMessage.
    // Without this poll the promise would hang until the 5-min timeout, leaving
    // `connecting` stuck true and the connect button spinning forever. Detect the
    // closed window and settle as cancelled, but delay slightly so a success
    // callback that posts its result and then self-closes can still win the race.
    const poll = () => {
      pollTimer = setTimeout(() => {
        if (popup && popup.closed) {
          pollTimer = setTimeout(() => finish('cancelled'), 500);
        } else {
          poll();
        }
      }, 500);
    };
    poll();
    const timer = setTimeout(() => finish('cancelled'), 5 * 60 * 1000);
    window.addEventListener('message', handler);
    // Hand out an abort handle so cancel() can settle this wait immediately —
    // when the popup was blocked (null) the closed-popup poll can never fire
    // and the promise would otherwise hang until the 5-min timeout.
    registerAbort(() => finish('cancelled'));
  });
}

export default function useMcpOAuth(id?: number) {
  const [status, setStatus] = useState<OAuthStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  // Track the current popup so an external cancel (switching template, closing
  // the drawer) can tear down an in-flight authorization.
  const popupRef = useRef<Window | null>(null);
  // Abort handle of the in-flight waitForOAuthResult; lets cancel() settle the
  // wait right away instead of relying on the closed-popup poll.
  const abortWaitRef = useRef<(() => void) | null>(null);

  const refreshStatus = useCallback(
    (sid?: number) => {
      const target = sid ?? id;
      if (!target) {
        setStatus(null);
        return;
      }
      setStatusLoading(true);
      getOAuthStatus(target)
        .then(setStatus)
        .catch(() => setStatus(null))
        .finally(() => setStatusLoading(false));
    },
    [id],
  );

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const connect = useCallback(
    async (opts: ConnectOptions): Promise<{ serverId: number; result: OAuthResult }> => {
      setConnecting(true);
      // Open the popup synchronously (before any await) so browsers don't block it.
      let popup = window.open('', 'mcp-oauth', 'width=600,height=760');
      popupRef.current = popup;
      try {
        const serverId = await opts.ensureServerId();
        const res = await prepareOAuth({
          id: serverId,
          client_id: opts.client_id,
          client_secret: opts.client_secret,
          scope: opts.scope,
        });
        if (popup) {
          popup.location.href = res.authorize_url;
        } else {
          popup = window.open(res.authorize_url, 'mcp-oauth', 'width=600,height=760');
          popupRef.current = popup;
        }
        const result = await waitForOAuthResult(popup, (abort) => {
          abortWaitRef.current = abort;
        });
        if (result === 'success') {
          refreshStatus(serverId);
        }
        return { serverId, result };
      } catch (err) {
        if (popup) popup.close();
        throw err;
      } finally {
        abortWaitRef.current = null;
        popupRef.current = null;
        setConnecting(false);
      }
    },
    [refreshStatus],
  );

  // Abort an in-flight authorization: close a lingering popup and drop the
  // spinning state immediately. Call when switching template, resetting, or
  // closing the drawer so the connect button never gets stuck.
  const cancel = useCallback(() => {
    const popup = popupRef.current;
    if (popup && !popup.closed) popup.close();
    popupRef.current = null;
    // Settle the pending wait so connect() callers' finally blocks run now,
    // covering the blocked-popup case the closed-popup poll can't detect.
    abortWaitRef.current?.();
    abortWaitRef.current = null;
    setConnecting(false);
  }, []);

  return { status, statusLoading, connecting, refreshStatus, connect, cancel, setStatus };
}
