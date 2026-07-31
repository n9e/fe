import _ from 'lodash';

import { Cate } from '@/components/AdvancedWrap/utils';

/**
 * 数据源「下一步动作」的单一事实源。
 * 消费方：保存结果页、详情抽屉、列表行内操作、探索器横幅 —— 四处共用，避免能力判断在各模块漂移。
 * 规则完全由 Cate 能力清单（type / dashboard / alertRule / graphPro / alertPro）驱动，不散落 if。
 */

export type NextActionKey = 'explore_metric' | 'explore_log' | 'create_dashboard' | 'create_alert' | 'import_dashboard_tpl' | 'import_alert_tpl';

export interface NextAction {
  key: NextActionKey;
  enabled: boolean;
  /** 展示但置灰的原因：pro_only 需企业版；type_unsupported 该类型不支持（不静默隐藏，避免用户以为产品没有） */
  disabledReason?: 'pro_only' | 'type_unsupported';
  /** 落地链接；无独立页面的动作（模板导入内联渲染）为空 */
  url?: string;
}

/**
 * 「从数据源引导过来」的标记。仪表盘/告警的创建入口都要先选业务组，
 * 引导侧给不出这个上下文，只能落到列表页；带上此标记让落地页出一条承接横幅，
 * 而不是把人丢在一个陌生列表前。消费方见 datasource/components/GuideLandingBanner。
 */
export const GUIDE_LANDING_FROM = 'ds_guide';

function withGuideContext(base: string, datasourceId: number): string {
  return `${base}?__from=${GUIDE_LANDING_FROM}&data_source_id=${datasourceId}`;
}

export function getExploreUrl(cate: Cate, datasourceId: number): string {
  const isLogging = _.includes(cate.type, 'logging');
  const base = isLogging ? '/log/explorer' : '/metric/explorer';
  return `${base}?data_source_name=${cate.value}&data_source_id=${datasourceId}`;
}

export function getNextActions(cate: Cate | undefined, datasourceId: number, isPlus: boolean): NextAction[] {
  if (!cate) return [];
  const proBlocked = cate.graphPro && !isPlus;
  const alertProBlocked = cate.alertPro && !isPlus;
  const hasMetric = _.includes(cate.type, 'metric');
  const hasLogging = _.includes(cate.type, 'logging');

  const actions: NextAction[] = [];

  if (hasMetric) {
    actions.push({
      key: 'explore_metric',
      enabled: !proBlocked,
      disabledReason: proBlocked ? 'pro_only' : undefined,
      url: proBlocked ? undefined : `/metric/explorer?data_source_name=${cate.value}&data_source_id=${datasourceId}`,
    });
  }
  if (hasLogging) {
    actions.push({
      key: 'explore_log',
      enabled: !proBlocked,
      disabledReason: proBlocked ? 'pro_only' : undefined,
      url: proBlocked ? undefined : `/log/explorer?data_source_name=${cate.value}&data_source_id=${datasourceId}`,
    });
  }

  // graphPro 同样卡建盘：仪表盘面板的数据源选择器过滤条件是
  // `dashboard === true && (graphPro ? IS_PLUS : true)`（dashboard/Editor/QueryEditor/components/DatasourceSelect），
  // 开源版放行 mysql/pgsql/ck 这类数据源只会把用户引到一个选不到该数据源的面板里
  const dashboardEnabled = cate.dashboard && !proBlocked;
  actions.push({
    key: 'create_dashboard',
    enabled: dashboardEnabled,
    disabledReason: !cate.dashboard ? 'type_unsupported' : proBlocked ? 'pro_only' : undefined,
    url: dashboardEnabled ? withGuideContext('/dashboards', datasourceId) : undefined,
  });

  actions.push({
    key: 'create_alert',
    enabled: cate.alertRule && !alertProBlocked,
    disabledReason: !cate.alertRule ? 'type_unsupported' : alertProBlocked ? 'pro_only' : undefined,
    url: cate.alertRule && !alertProBlocked ? withGuideContext('/alert-rules', datasourceId) : undefined,
  });

  // 模板匹配（哨兵指标法）仅 Prometheus 系数据源适用，见后端 /datasource/template-match
  const tplMatchable = cate.value === 'prometheus';
  actions.push({
    key: 'import_dashboard_tpl',
    enabled: tplMatchable && cate.dashboard,
    disabledReason: tplMatchable && cate.dashboard ? undefined : 'type_unsupported',
  });
  actions.push({
    key: 'import_alert_tpl',
    enabled: tplMatchable && cate.alertRule,
    disabledReason: tplMatchable && cate.alertRule ? undefined : 'type_unsupported',
  });

  return actions;
}

/** 首个可用的探索动作，供列表行内「探索」与结果页主按钮复用 */
export function getPrimaryExploreAction(cate: Cate | undefined, datasourceId: number, isPlus: boolean): NextAction | undefined {
  return _.find(getNextActions(cate, datasourceId, isPlus), (a) => a.enabled && (a.key === 'explore_metric' || a.key === 'explore_log'));
}
