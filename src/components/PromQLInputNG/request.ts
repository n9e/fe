import type { SharedRequestCache } from '@/components/SharedRequestCache';

const SUCCESS_TTL_MS = 5 * 60 * 1000;
const ERROR_TTL_MS = 30 * 1000;

interface ResponseSnapshot {
  body: string;
  headers: [string, string][];
  status: number;
  statusText: string;
}

interface PromQLRequestDependencies {
  accessToken: string;
  cache?: SharedRequestCache;
  fetchFn?: typeof fetch;
}

export function isValidPromQLDatasourceValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function getResourceUrl(resource: RequestInfo) {
  return typeof resource === 'string' ? resource : resource.url;
}

function getCacheKey(resourceUrl: string) {
  const url = new URL(resourceUrl, 'http://localhost');
  const { pathname } = url;
  const match = pathname.match(/\/api\/[^/]+\/proxy\/([^/]+)\/api\/v1\/(metadata|label\/__name__\/values)$/);

  if (!match) return undefined;

  const [, dataSourceId, endpoint] = match;
  if (endpoint === 'metadata') return `promql:metadata:${dataSourceId}`;

  url.searchParams.delete('start');
  url.searchParams.delete('end');
  url.searchParams.sort();
  const selectorParams = url.searchParams.toString();

  return `promql:metric-names:${dataSourceId}${selectorParams ? `?${selectorParams}` : ''}`;
}

async function createResponseSnapshot(response: Response): Promise<ResponseSnapshot> {
  return {
    body: await response.text(),
    headers: Array.from(response.headers.entries()),
    status: response.status,
    statusText: response.statusText,
  };
}

function createResponse(snapshot: ResponseSnapshot) {
  return new Response(snapshot.body, {
    headers: snapshot.headers,
    status: snapshot.status,
    statusText: snapshot.statusText,
  });
}

export async function requestPromQL(resource: RequestInfo, options: RequestInit | undefined, dependencies: PromQLRequestDependencies): Promise<Response> {
  const params = options?.body?.toString();
  const search = params ? `?${params}` : '';
  const resourceUrl = `${getResourceUrl(resource)}${search}`;
  const fetchFn = dependencies.fetchFn ?? fetch;
  const load = () =>
    fetchFn(resourceUrl, {
      method: 'GET',
      headers: new Headers({
        Authorization: `Bearer ${dependencies.accessToken}`,
      }),
    });
  const cacheKey = getCacheKey(resourceUrl);

  if (!dependencies.cache || !cacheKey) {
    return load();
  }

  const snapshot = await dependencies.cache.getOrLoad(cacheKey, () => load().then(createResponseSnapshot), {
    ttlMs: SUCCESS_TTL_MS,
    getTtlMs: (value) => (value.status >= 200 && value.status < 300 ? SUCCESS_TTL_MS : ERROR_TTL_MS),
  });

  return createResponse(snapshot);
}
