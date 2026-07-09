import { useCallback, useEffect, useState } from 'react';

import { prepareOAuth, getOAuthStatus, OAuthStatus } from './services';

interface ConnectOptions {
  /** Resolves the server id, creating the server first if needed. */
  ensureServerId: () => Promise<number>;
  client_id?: string;
  client_secret?: string;
  scope?: string;
}

// Waits for the callback popup to postMessage its result back to us. We accept
// only messages coming from the exact popup window we opened (`e.source === popup`).
// That check is origin-independent — the callback page's origin varies across
// proxy/deploy setups, so we can't do a strict origin check, but the window-handle
// identity still guarantees the message came from our own OAuth popup and not any
// other page the user has open.
function waitForOAuthResult(popup: Window | null): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      window.removeEventListener('message', handler);
      clearTimeout(timer);
      resolve(ok);
    };
    const handler = (e: MessageEvent) => {
      // Reject anything not sent by the popup we opened. If the popup was blocked
      // (null) we fall back to the source marker alone.
      if (popup && e.source !== popup) return;
      const d = e.data;
      if (d && d.source === 'n9e-mcp-oauth') {
        finish(d.status === 'success');
      }
    };
    const timer = setTimeout(() => finish(false), 5 * 60 * 1000);
    window.addEventListener('message', handler);
  });
}

export default function useMcpOAuth(id?: number) {
  const [status, setStatus] = useState<OAuthStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

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
    async (opts: ConnectOptions): Promise<{ serverId: number; ok: boolean }> => {
      setConnecting(true);
      // Open the popup synchronously (before any await) so browsers don't block it.
      let popup = window.open('', 'mcp-oauth', 'width=600,height=760');
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
        }
        const ok = await waitForOAuthResult(popup);
        if (ok) {
          refreshStatus(serverId);
        }
        return { serverId, ok };
      } catch (err) {
        if (popup) popup.close();
        throw err;
      } finally {
        setConnecting(false);
      }
    },
    [refreshStatus],
  );

  return { status, statusLoading, connecting, refreshStatus, connect, setStatus };
}
