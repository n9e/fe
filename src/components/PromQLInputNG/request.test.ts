import { createSharedRequestCache } from '@/components/SharedRequestCache';
import { requestPromQL } from './request';

function successResponse(metric: string) {
  return new Response(JSON.stringify({ status: 'success', data: { [metric]: { help: metric, type: 'gauge' } } }), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  });
}

function metricNamesResponse() {
  return new Response(JSON.stringify({ status: 'success', data: ['up'] }), { status: 200 });
}

describe('requestPromQL', () => {
  it('同一个数据源的 metadata 请求合并，且每个调用方都能独立读取响应体', async () => {
    const cache = createSharedRequestCache();
    let fetchCount = 0;
    const fetchFn: typeof fetch = async () => {
      fetchCount += 1;
      return successResponse('up');
    };
    const url = '/api/n9e/proxy/10282/api/v1/metadata?';

    const [first, second] = await Promise.all([
      requestPromQL(url, undefined, { accessToken: 'token', cache, fetchFn }),
      requestPromQL(url, undefined, { accessToken: 'token', cache, fetchFn }),
    ]);

    expect(fetchCount).toBe(1);
    expect(await first.json()).toEqual(await second.json());
  });

  it('同一个数据源的指标名请求忽略时间窗口差异', async () => {
    const cache = createSharedRequestCache();
    let fetchCount = 0;
    const fetchFn: typeof fetch = async () => {
      fetchCount += 1;
      return metricNamesResponse();
    };

    await Promise.all([
      requestPromQL('/api/n9e/proxy/10282/api/v1/label/__name__/values?start=1&end=2', undefined, { accessToken: '', cache, fetchFn }),
      requestPromQL('/api/n9e/proxy/10282/api/v1/label/__name__/values?start=3&end=4', undefined, { accessToken: '', cache, fetchFn }),
    ]);

    expect(fetchCount).toBe(1);
  });

  it('带和不带 match[] 的指标名请求不共用缓存', async () => {
    const cache = createSharedRequestCache();
    let fetchCount = 0;
    const fetchFn: typeof fetch = async () => {
      fetchCount += 1;
      return metricNamesResponse();
    };

    await Promise.all([
      requestPromQL('/api/n9e/proxy/10282/api/v1/label/__name__/values?start=1&end=2', undefined, { accessToken: '', cache, fetchFn }),
      requestPromQL('/api/n9e/proxy/10282/api/v1/label/__name__/values?start=1&end=2&match%5B%5D=%7Bjob%3D%22api%22%7D', undefined, {
        accessToken: '',
        cache,
        fetchFn,
      }),
    ]);

    expect(fetchCount).toBe(2);
  });

  it('n9e-plus 代理前缀同样命中缓存', async () => {
    const cache = createSharedRequestCache();
    let fetchCount = 0;
    const fetchFn: typeof fetch = async () => {
      fetchCount += 1;
      return successResponse('up');
    };

    await Promise.all([
      requestPromQL('/api/n9e-plus/proxy/10282/api/v1/metadata?', undefined, { accessToken: '', cache, fetchFn }),
      requestPromQL('/api/n9e-plus/proxy/10282/api/v1/metadata?', undefined, { accessToken: '', cache, fetchFn }),
    ]);

    expect(fetchCount).toBe(1);
  });

  it('不同数据源不会共用 PromQL 缓存', async () => {
    const cache = createSharedRequestCache();
    let fetchCount = 0;
    const fetchFn: typeof fetch = async (resource) => {
      fetchCount += 1;
      return successResponse(String(resource).includes('/10282/') ? 'first' : 'second');
    };

    await Promise.all([
      requestPromQL('/api/n9e/proxy/10282/api/v1/metadata?', undefined, { accessToken: '', cache, fetchFn }),
      requestPromQL('/api/n9e/proxy/20421/api/v1/metadata?', undefined, { accessToken: '', cache, fetchFn }),
    ]);

    expect(fetchCount).toBe(2);
  });

  it('HTTP 失败短暂缓存，避免故障期间重复打满同一个接口', async () => {
    const cache = createSharedRequestCache();
    let fetchCount = 0;
    const fetchFn: typeof fetch = async () => {
      fetchCount += 1;
      return new Response('bad gateway', { status: 502, statusText: 'Bad Gateway' });
    };
    const url = '/api/n9e/proxy/10282/api/v1/metadata?';

    const first = await requestPromQL(url, undefined, { accessToken: '', cache, fetchFn });
    const second = await requestPromQL(url, undefined, { accessToken: '', cache, fetchFn });

    expect(fetchCount).toBe(1);
    expect(first.status).toBe(502);
    expect(second.status).toBe(502);
    expect(await first.text()).toBe('bad gateway');
    expect(await second.text()).toBe('bad gateway');
  });

  it('没有 Provider 时直接请求，不做缓存', async () => {
    let fetchCount = 0;
    const fetchFn: typeof fetch = async () => {
      fetchCount += 1;
      return successResponse('up');
    };
    const url = '/api/n9e/proxy/10282/api/v1/metadata?';

    await requestPromQL(url, undefined, { accessToken: '', fetchFn });
    await requestPromQL(url, undefined, { accessToken: '', fetchFn });

    expect(fetchCount).toBe(2);
  });
});
