function normalizeAppBasePrefix(basePrefix: string): string {
  const normalized = basePrefix.trim().replace(/^\/+|\/+$/g, '');
  return normalized ? `/${normalized}` : '';
}

/** Add the deployment prefix to app-relative URLs, while leaving absolute URLs untouched. */
export function addAppBasePrefix(url: string, basePrefix: string): string {
  if (!url || /^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith('//')) return url;

  const prefix = normalizeAppBasePrefix(basePrefix);
  const path = url.startsWith('/') ? url : `/${url}`;
  if (!prefix || path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`) || path.startsWith(`${prefix}#`)) {
    return path;
  }
  return `${prefix}${path}`;
}

export function getAppBaseUrl(origin: string, basePrefix: string): string {
  return `${origin.replace(/\/+$/, '')}${normalizeAppBasePrefix(basePrefix)}`;
}
