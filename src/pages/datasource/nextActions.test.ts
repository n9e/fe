import { Cate } from '@/components/AdvancedWrap/utils';

import { getNextActions, getPrimaryExploreAction } from './nextActions';

const prometheus = {
  value: 'prometheus',
  label: 'Prometheus',
  type: ['metric', 'anomaly'],
  alertRule: true,
  dashboard: true,
  dashboardVariable: true,
  graphPro: false,
  alertPro: false,
} satisfies Cate;

const loki = {
  value: 'loki',
  label: 'Loki',
  type: ['logging'],
  alertRule: true,
  dashboard: false,
  dashboardVariable: false,
  graphPro: false,
  alertPro: false,
} satisfies Cate;

const ck = {
  value: 'ck',
  label: 'ClickHouse',
  type: ['metric', 'logging'],
  alertRule: true,
  dashboard: true,
  dashboardVariable: true,
  graphPro: true,
  alertPro: false,
} satisfies Cate;

const jaeger = {
  value: 'jaeger',
  label: 'Jaeger',
  type: ['tracing'],
  alertRule: false,
  dashboard: false,
  dashboardVariable: false,
  graphPro: false,
  alertPro: false,
} satisfies Cate;

function actionMap(cate: Cate, isPlus: boolean) {
  const out: Record<string, { enabled: boolean; disabledReason?: string; url?: string }> = {};
  getNextActions(cate, 42, isPlus).forEach((a) => {
    out[a.key] = { enabled: a.enabled, disabledReason: a.disabledReason, url: a.url };
  });
  return out;
}

describe('getNextActions', () => {
  it('prometheus 开源版：探索/大盘/告警/模板全可用', () => {
    const m = actionMap(prometheus, false);
    expect(m.explore_metric.enabled).toBe(true);
    expect(m.explore_metric.url).toBe('/metric/explorer?data_source_name=prometheus&data_source_id=42');
    expect(m.explore_log).toBeUndefined();
    expect(m.create_dashboard.enabled).toBe(true);
    expect(m.create_alert.enabled).toBe(true);
    expect(m.import_dashboard_tpl.enabled).toBe(true);
    expect(m.import_alert_tpl.enabled).toBe(true);
  });

  it('建盘/建告警落到列表页，须带上引导标记供承接横幅识别', () => {
    const m = actionMap(prometheus, false);
    expect(m.create_dashboard.url).toBe('/dashboards?__from=ds_guide&data_source_id=42');
    expect(m.create_alert.url).toBe('/alert-rules?__from=ds_guide&data_source_id=42');
  });

  it('loki：不支持大盘 → 置灰并标注 type_unsupported，不静默隐藏', () => {
    const m = actionMap(loki, false);
    expect(m.explore_log.enabled).toBe(true);
    expect(m.explore_log.url).toBe('/log/explorer?data_source_name=loki&data_source_id=42');
    expect(m.create_dashboard.enabled).toBe(false);
    expect(m.create_dashboard.disabledReason).toBe('type_unsupported');
    expect(m.create_alert.enabled).toBe(true);
    // 模板匹配仅 prometheus 系
    expect(m.import_dashboard_tpl.enabled).toBe(false);
    expect(m.import_alert_tpl.enabled).toBe(false);
  });

  it('ck 开源版：探索被 graphPro 拦截且标注 pro_only；Plus 版放开', () => {
    const oss = actionMap(ck, false);
    expect(oss.explore_metric.enabled).toBe(false);
    expect(oss.explore_metric.disabledReason).toBe('pro_only');
    expect(oss.explore_log.enabled).toBe(false);

    const plus = actionMap(ck, true);
    expect(plus.explore_metric.enabled).toBe(true);
    expect(plus.explore_log.enabled).toBe(true);
  });

  it('jaeger：全部动作不可用', () => {
    const m = actionMap(jaeger, false);
    expect(m.explore_metric).toBeUndefined();
    expect(m.explore_log).toBeUndefined();
    expect(m.create_dashboard.enabled).toBe(false);
    expect(m.create_alert.enabled).toBe(false);
    expect(m.import_dashboard_tpl.enabled).toBe(false);
  });

  it('cate 未识别时返回空，调用方展示兜底', () => {
    expect(getNextActions(undefined, 42, false)).toEqual([]);
  });
});

describe('getPrimaryExploreAction', () => {
  it('指标类型优先返回指标探索', () => {
    expect(getPrimaryExploreAction(prometheus, 42, false)?.key).toBe('explore_metric');
  });

  it('日志类型返回日志探索', () => {
    expect(getPrimaryExploreAction(loki, 42, false)?.key).toBe('explore_log');
  });

  it('探索被 pro 拦截时返回 undefined', () => {
    expect(getPrimaryExploreAction(ck, 42, false)).toBeUndefined();
  });
});
