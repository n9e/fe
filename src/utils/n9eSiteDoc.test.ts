import { getN9eSiteDocUrl, getN9eSiteEmbedSrc, isChineseLanguage } from './n9eSiteDoc';

const NV = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9';

describe('isChineseLanguage', () => {
  it('treats only zh_CN and zh_HK as Chinese', () => {
    expect(isChineseLanguage('zh_CN')).toBe(true);
    expect(isChineseLanguage('zh_HK')).toBe(true);
    expect(isChineseLanguage('en_US')).toBe(false);
    expect(isChineseLanguage('ja_JP')).toBe(false);
    expect(isChineseLanguage(undefined)).toBe(false);
  });
});

describe('getN9eSiteDocUrl', () => {
  it('maps flashcat.cloud docs with or without trailing slash and language suffix', () => {
    expect(getN9eSiteDocUrl(`${NV}/usage/alert-notify/event-pipelines/`)).toBe('https://n9e.github.io/docs/events/pipelines');
    expect(getN9eSiteDocUrl(`${NV}/usage/alert-notify/event-pipelines`)).toBe('https://n9e.github.io/docs/events/pipelines');
    expect(getN9eSiteDocUrl(`${NV}/usage/alert-notify/event-pipelines_en/`)).toBe('https://n9e.github.io/docs/events/pipelines');
  });

  it('keeps the mapped anchor and drops query/hash of the old url', () => {
    expect(getN9eSiteDocUrl('https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-sql-mode-in-ck-discover/?x=1#2-时间宏')).toBe(
      'https://n9e.github.io/docs/data/clickhouse-doris-iotdb#clickhouse',
    );
  });

  it('maps relative /docs/content paths', () => {
    expect(getN9eSiteDocUrl('/docs/content/flashcat/log/discover/loki-log-query/')).toBe('https://n9e.github.io/docs/data/loki-victorialogs#querying-logql-and-logsql');
  });

  it('maps notify channel docs by ident', () => {
    expect(getN9eSiteDocUrl(`${NV}/usage/alert-notify/notify-channel/dingtalk/`)).toBe('https://n9e.github.io/docs/notifications/dingtalk-feishu-wecom');
    expect(getN9eSiteDocUrl(`${NV}/usage/alert-notify/notify-channel/callback/`)).toBe('https://n9e.github.io/docs/notifications/callback');
    expect(getN9eSiteDocUrl(`${NV}/usage/alert-notify/notify-channel/unknown-ident/`)).toBeUndefined();
  });

  it('returns undefined for unmapped pages and other hosts', () => {
    expect(getN9eSiteDocUrl(`${NV}/usage/integrations/datasource/zabbix/`)).toBeUndefined();
    expect(getN9eSiteDocUrl('https://iotdb.apache.org/UserGuide/latest-Table/')).toBeUndefined();
    expect(getN9eSiteDocUrl('/n9e-docs/notification-channel/http-request')).toBeUndefined();
    expect(getN9eSiteDocUrl('')).toBeUndefined();
  });
});

describe('getN9eSiteEmbedSrc', () => {
  it('appends embed params before the hash', () => {
    expect(getN9eSiteEmbedSrc('https://n9e.github.io/docs/events/pipelines', true)).toBe('https://n9e.github.io/docs/events/pipelines?onlyContent&theme=dark');
    expect(getN9eSiteEmbedSrc('https://n9e.github.io/docs/security/sso#cas', false)).toBe('https://n9e.github.io/docs/security/sso?onlyContent&theme=light#cas');
  });
});
