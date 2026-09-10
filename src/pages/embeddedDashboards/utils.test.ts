import { adjustURL } from './utils';

describe('adjustURL', () => {
  it('保留无值 kiosk 参数，并过滤夜莺内部分页参数', () => {
    expect(
      adjustURL(
        'http://localhost:3001/d/ad9lw88/new-dashboard?from=now-6h&to=now&timezone=browser&kiosk',
        false,
        { windowSearch: '?page=1' },
      ),
    ).toBe('http://localhost:3001/d/ad9lw88/new-dashboard?from=now-6h&to=now&timezone=browser&kiosk&theme=light');
  });

  it('同步外层的业务参数，同时不覆盖 iframe 中的无值参数', () => {
    expect(adjustURL('https://grafana.example.com/d/foo?kiosk', true, { windowSearch: '?var-host=web-01&page=2' })).toBe(
      'https://grafana.example.com/d/foo?kiosk&var-host=web-01&theme=dark',
    );
  });

  it('保留 kiosk 的非空值', () => {
    expect(adjustURL('https://grafana.example.com/d/foo?kiosk=tv', false, { windowSearch: '' })).toBe('https://grafana.example.com/d/foo?kiosk=tv&theme=light');
  });

  it('将空值 kiosk 规范为只有参数名', () => {
    expect(adjustURL('https://grafana.example.com/d/foo?kiosk=', false, { windowSearch: '' })).toBe('https://grafana.example.com/d/foo?kiosk&theme=light');
  });

  it('保留相对时间，并将绝对时间转换为 Grafana 使用的毫秒时间戳', () => {
    expect(
      adjustURL('https://grafana.example.com/d/foo?from=now-1h&to=now', false, {
        range: { start: 'now-6h', end: '2026-09-03T12:00:00+08:00' },
        windowSearch: '',
      }),
    ).toBe('https://grafana.example.com/d/foo?from=now-6h&to=1788408000000&theme=light');
  });

  it('将夜莺秒级刷新间隔映射为 Grafana 的 refresh 时长参数', () => {
    expect(
      adjustURL('https://grafana.example.com/d/foo?refresh=1m', false, {
        refreshIntervalSeconds: 30,
        refreshLocalKey: 'dashboard-refresh',
        windowSearch: '',
      }),
    ).toBe('https://grafana.example.com/d/foo?refresh=30s&theme=light');
  });

  it('关闭夜莺自动刷新时移除 Grafana refresh 参数', () => {
    expect(
      adjustURL('https://grafana.example.com/d/foo?refresh=1m', false, {
        refreshLocalKey: 'dashboard-refresh',
        windowSearch: '',
      }),
    ).toBe('https://grafana.example.com/d/foo?theme=light');
  });
});
