import { getPrometheusStatusUrl } from './prometheusStatusUrl';

const prometheus = {
  plugin_type: 'prometheus',
  settings: { 'prometheus.tsdb_type': 'Prometheus' },
} as const;

describe('getPrometheusStatusUrl', () => {
  it('时序库类型为 Prometheus 时，去掉尾斜杠并拼上 /status', () => {
    expect(
      getPrometheusStatusUrl({
        ...prometheus,
        http: { url: 'http://localhost:9090/' },
      }),
    ).toBe('http://localhost:9090/status');
  });

  it('保留 route prefix', () => {
    expect(
      getPrometheusStatusUrl({
        ...prometheus,
        http: { url: 'http://prom.example.com/prometheus/' },
      }),
    ).toBe('http://prom.example.com/prometheus/status');
  });

  it('去掉 query 和 hash', () => {
    expect(
      getPrometheusStatusUrl({
        ...prometheus,
        http: { url: 'https://prom.example.com:9090/prefix?foo=1#bar' },
      }),
    ).toBe('https://prom.example.com:9090/prefix/status');
  });

  it.each(['Thanos', 'VictoriaMetrics', 'M3', 'SLS', ''] as const)('时序库类型为 %s 时不返回地址', (tsdbType) => {
    expect(
      getPrometheusStatusUrl({
        plugin_type: 'prometheus',
        settings: { 'prometheus.tsdb_type': tsdbType },
        http: { url: 'http://localhost:9090/' },
      }),
    ).toBeUndefined();
  });

  it('未配置时序库类型时不返回地址', () => {
    expect(
      getPrometheusStatusUrl({
        plugin_type: 'prometheus',
        settings: {},
        http: { url: 'http://localhost:9090/' },
      }),
    ).toBeUndefined();
  });

  it('非 prometheus 插件不返回地址', () => {
    expect(
      getPrometheusStatusUrl({
        plugin_type: 'elasticsearch',
        settings: { 'prometheus.tsdb_type': 'Prometheus' },
        http: { url: 'http://localhost:9200/' },
      }),
    ).toBeUndefined();
  });

  it.each(['not a url', 'ftp://localhost:9090/', '   ', 9090] as const)('非法地址 %s 不返回', (url) => {
    expect(
      getPrometheusStatusUrl({
        ...prometheus,
        http: { url },
      }),
    ).toBeUndefined();
  });

  it('缺少 http.url 时不返回地址', () => {
    expect(getPrometheusStatusUrl(prometheus)).toBeUndefined();
  });
});
