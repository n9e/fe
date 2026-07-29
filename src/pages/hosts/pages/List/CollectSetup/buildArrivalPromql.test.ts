import { buildArrivalPromql } from './buildArrivalPromql';

describe('buildArrivalPromql', () => {
  it('uses the exact metric with an empty matcher when no idents are selected', () => {
    expect(buildArrivalPromql({ metricPrefix: 'mysql', metric: 'mysql_up' })).toBe('count by (ident) (mysql_up{})');
  });

  it('falls back to the prefix regex without an ident matcher', () => {
    expect(buildArrivalPromql({ metricPrefix: 'zk' })).toBe('count by (ident) ({__name__=~"zk_.+"})');
  });

  it('double-escapes regex metacharacters so PromQL string unescaping yields a valid regex', () => {
    // FQDN ident：正则转义出的 \. 必须再翻倍，单层反斜杠会被 Prometheus 按未知转义序列拒绝
    expect(buildArrivalPromql({ metricPrefix: 'mysql', metric: 'mysql_up', idents: ['web01.prod.example.com'] })).toBe(
      'count by (ident) (mysql_up{ident=~"(web01\\\\.prod\\\\.example\\\\.com)"})',
    );
  });

  it('joins multiple idents with | and escapes double quotes', () => {
    expect(buildArrivalPromql({ metricPrefix: 'redis', metric: 'redis_up', idents: ['a"b', 'plain-host'] })).toBe(
      'count by (ident) (redis_up{ident=~"(a\\"b|plain-host)"})',
    );
  });

  it('appends the ident matcher to the prefix fallback query and drops empty idents', () => {
    expect(buildArrivalPromql({ metricPrefix: 'nginx', idents: ['host-1', ''] })).toBe('count by (ident) ({__name__=~"nginx_.+", ident=~"(host-1)"})');
  });
});
