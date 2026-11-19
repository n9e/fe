interface PrometheusStatusSource {
  plugin_type?: string;
  settings?: {
    'prometheus.tsdb_type'?: unknown;
  } | null;
  http?: {
    url?: unknown;
  } | null;
}

export function getPrometheusStatusUrl(record: PrometheusStatusSource): string | undefined {
  if (record.plugin_type !== 'prometheus') return undefined;
  if (record.settings?.['prometheus.tsdb_type'] !== 'Prometheus') return undefined;

  const httpUrl = record.http?.url;
  if (typeof httpUrl !== 'string') return undefined;

  const trimmed = httpUrl.trim();
  if (!trimmed) return undefined;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    const basePath = url.pathname.replace(/\/+$/, '');
    url.pathname = `${basePath}/status`;
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return undefined;
  }
}
