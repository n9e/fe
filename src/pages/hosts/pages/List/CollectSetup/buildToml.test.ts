import { CATALOG, CollectComponent } from './catalog';
import { buildToml, CollectFormValues } from './buildToml';

const mysql = CATALOG.find((c) => c.name === 'mysql') as CollectComponent;
const mongodb = CATALOG.find((c) => c.name === 'mongodb') as CollectComponent;
const kafka = CATALOG.find((c) => c.name === 'kafka') as CollectComponent;
const nginx = CATALOG.find((c) => c.name === 'nginx') as CollectComponent;

describe('buildToml', () => {
  it('renders instance fields in schema order and skips empties', () => {
    const values = {
      interval: 30,
      instances: [{ address: '127.0.0.1:3306', username: 'root', password: '', extra_status_metrics: true }],
    } satisfies CollectFormValues;
    expect(buildToml(mysql, values)).toBe(
      [
        '# managed by nightingale collect wizard (input.mysql)',
        'interval = 30',
        '',
        '[[instances]]',
        'address = "127.0.0.1:3306"',
        'username = "root"',
        'extra_status_metrics = true',
        '',
      ].join('\n'),
    );
  });

  it('merges labels.* fields into one inline labels table at the end', () => {
    const values = {
      instances: [{ address: '10.0.0.1:3306', 'labels.instance': 'prod-3306' }],
    } satisfies CollectFormValues;
    expect(buildToml(mysql, values)).toContain('labels = { instance="prod-3306" }');
    expect(buildToml(mysql, values)).not.toContain('labels.instance =');
  });

  it('appends instanceStatics after form fields', () => {
    const values = {
      instances: [{ mongodb_uri: 'mongodb://127.0.0.1:27017', 'labels.instance': 'mongo-01' }],
    } satisfies CollectFormValues;
    const out = buildToml(mongodb, values);
    expect(out).toContain('collect_all = true');
    expect(out).toContain('compatible_mode = true');
    // labels 永远在实例末尾，statics 之后
    expect(out.indexOf('collect_all = true')).toBeLessThan(out.indexOf('labels = {'));
  });

  it('renders string arrays and drops blank entries', () => {
    const values = {
      instances: [{ urls: ['http://127.0.0.1/nginx_status', '  ', 'http://10.1.1.1/status'] }],
    } satisfies CollectFormValues;
    expect(buildToml(nginx, values)).toContain('urls = ["http://127.0.0.1/nginx_status", "http://10.1.1.1/status"]');
  });

  it('omits false booleans without declared default but keeps true', () => {
    const out = buildToml(kafka, { instances: [{ kafka_uris: ['127.0.0.1:9092'], use_sasl: false }] });
    expect(out).not.toContain('use_sasl');
    const outSasl = buildToml(kafka, { instances: [{ kafka_uris: ['127.0.0.1:9092'], use_sasl: true, sasl_username: 'u' }] });
    expect(outSasl).toContain('use_sasl = true');
    expect(outSasl).toContain('sasl_username = "u"');
  });

  it('escapes quotes, backslashes and control characters in strings', () => {
    const out = buildToml(mysql, { instances: [{ address: '127.0.0.1:3306', password: 'a"b\\c\nd' }] });
    expect(out).toContain('password = "a\\"b\\\\c\\nd"');
  });

  it('is idempotent and does not mutate its input', () => {
    const values = {
      interval: 15,
      instances: [{ address: '127.0.0.1:6379', password: 'p' }],
    } satisfies CollectFormValues;
    const redis = CATALOG.find((c) => c.name === 'redis') as CollectComponent;
    const snapshot = JSON.parse(JSON.stringify(values));
    const first = buildToml(redis, values);
    const second = buildToml(redis, values);
    expect(first).toBe(second);
    expect(values).toEqual(snapshot);
  });
});

describe('catalog invariants', () => {
  it('has unique plugin names', () => {
    const names = CATALOG.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('atLeastOne only references declared fields', () => {
    CATALOG.forEach((c) => {
      (c.atLeastOne ?? []).forEach((key) => {
        expect((c.fields ?? []).map((f) => f.key)).toContain(key);
      });
    });
  });

  it('verifyMetric implies verifiable component and is a plain metric name', () => {
    CATALOG.forEach((c) => {
      if (c.verifyMetric !== undefined) {
        // 声明了精确验证指标的组件必须是可验证的（metricPrefix 不为 null）
        expect(c.metricPrefix).not.toBeNull();
        // 精确名会被拼进 PromQL，约束为合法指标名字符
        expect(c.verifyMetric).toMatch(/^[a-zA-Z_:][a-zA-Z0-9_:]*$/);
      }
    });
  });
});
