/**
 * Global guard against stale lazy-chunk loads after a deploy.
 *
 * On-prem deploys replace the whole asset directory, so a user who loaded the
 * previous index.html will 404 on any not-yet-visited lazy chunk. Recovery
 * (same policy as fc-foundation-app's ErrorBoundary):
 *   1st failure  -> silently reload once (new index.html references new chunks)
 *   failure again within 3 min -> show a plain-DOM "version updated" overlay
 *      with a manual refresh button (DOM, not React — works even if the React
 *      tree already crashed).
 *
 * Installed via side-effect import in BOTH builds: srm standalone (main.tsx)
 * and the n9e integrated build (imported from utilsForCombine, file copied by
 * integrate.js). Idempotent via a window flag.
 */

const IMPORT_MODULE_ERRORS: readonly string[] = [
  'dynamically imported module',
  'failed to load module script',
  'importing a module script failed',
  'error loading dynamically imported module',
  'failed to fetch dynamically imported module',
];

const REFRESH_TS_KEY = 'srm-chunk-refresh-time';
const REFRESH_WINDOW_MS = 3 * 60 * 1000;

// i18next itself may be part of what failed to load — decide language locally.
const isEN = localStorage.getItem('language') === 'en_US';
const TEXT = isEN
  ? { title: 'Version update', hint: 'New version available. Please refresh the page.', button: 'Refresh' }
  : { title: '版本更新', hint: '系统已发布新版本，请刷新页面后继续使用。', button: '刷新页面' };

export function isChunkLoadError(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return IMPORT_MODULE_ERRORS.some((err) => lower.includes(err));
}

/**
 * Handle a suspected chunk-load failure. Returns true when the error was a
 * chunk-load error and a recovery action (reload or overlay) was taken.
 */
export function handleChunkLoadError(message?: string): boolean {
  if (!isChunkLoadError(message)) return false;
  const last = localStorage.getItem(REFRESH_TS_KEY);
  const now = Date.now();
  if (!last || now - Number.parseInt(last, 10) > REFRESH_WINDOW_MS) {
    localStorage.setItem(REFRESH_TS_KEY, String(now));
    window.location.reload();
  } else {
    showRefreshOverlay();
  }
  return true;
}

function showRefreshOverlay(): void {
  if (document.getElementById('srm-chunk-guard-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'srm-chunk-guard-overlay';
  overlay.setAttribute(
    'style',
    'position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;font-family:Inter,"Noto Sans SC","Microsoft YaHei",sans-serif;',
  );
  const title = document.createElement('div');
  title.setAttribute('style', 'font-size:20px;font-weight:600;color:#262626;');
  title.textContent = TEXT.title;
  const hint = document.createElement('div');
  hint.setAttribute('style', 'margin-top:12px;font-size:14px;color:#8c8c8c;');
  hint.textContent = TEXT.hint;
  const button = document.createElement('button');
  button.setAttribute(
    'style',
    'margin-top:20px;padding:6px 24px;font-size:14px;color:#fff;background:#6C53B1;border:none;border-radius:8px;cursor:pointer;',
  );
  button.textContent = TEXT.button;
  button.onclick = () => window.location.reload();
  overlay.append(title, hint, button);
  document.body.appendChild(overlay);
}

declare global {
  interface Window {
    __srmChunkGuardInstalled?: boolean;
  }
}

export function installChunkGuard(): void {
  if (window.__srmChunkGuardInstalled) return;
  window.__srmChunkGuardInstalled = true;
  // React.lazy failures without an error boundary surface as uncaught render
  // errors; plain dynamic imports surface as unhandled rejections.
  window.addEventListener('error', (event) => {
    handleChunkLoadError(event?.error?.message || event?.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    handleChunkLoadError(event?.reason?.message || String(event?.reason || ''));
  });
}

installChunkGuard();
