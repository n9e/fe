import _ from 'lodash';
import semver from 'semver';

import type { JsonObject, JsonValue } from '@/pages/dashboard/types';
import { isJsonObject } from '@/pages/dashboard/utils/json';

type LegacyDatasource = JsonObject & {
  cate: string;
  id?: number | string;
};

type LegacyQuery = JsonObject & {
  mode?: string;
  syntax?: string;
  filter_language?: string;
  values?: Array<JsonObject & { func?: string }>;
};

type LegacyTarget = JsonObject & {
  refId?: string;
  kind?: 'query' | 'expression';
  __mode__?: '__expr__' | '__query__';
  datasource?: LegacyDatasource;
  expression?: string;
  expr?: string;
  query?: LegacyQuery;
  resultType?: 'time_series' | 'logs';
  maxDataPoints?: number;
  time?: JsonValue;
};

type LegacyStandardOptions = JsonObject & {
  util?: string;
  unit?: string;
  max?: number;
};

type LegacyOptions = JsonObject & {
  standardOptions?: LegacyStandardOptions;
  thresholds?: JsonValue;
};

type LegacyCustom = JsonObject & {
  maxValue?: number;
  baseColor?: string;
  stack?: string;
};

type LegacyOverride = JsonObject & {
  properties?: JsonObject & {
    rightYAxisDisplay?: string;
    standardOptions?: LegacyStandardOptions;
  };
};

export type LegacyPanel = JsonObject & {
  id?: string;
  version?: string;
  type?: string;
  datasourceCate?: string;
  datasourceValue?: string | number;
  targets?: LegacyTarget[];
  panels?: LegacyPanel[];
  custom?: LegacyCustom;
  options?: LegacyOptions;
  overrides?: LegacyOverride[];
  maxDataPoints?: number;
  queryOptionsTime?: JsonValue;
};

export type LegacyDashboard = JsonObject & {
  version?: string;
  panels: LegacyPanel[];
};

const getTargetRefId = (index: number) => {
  let value = index;
  let refId = '';
  do {
    refId = String.fromCharCode(65 + (value % 26)) + refId;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);
  return refId;
};

const isExpressionTarget = (target: LegacyTarget) => target.kind === 'expression' || target.__mode__ === '__expr__';

const inferTargetResultType = (target: LegacyTarget): 'time_series' | 'logs' => {
  const mode = target.query?.mode?.toLowerCase();
  const valueFunctions = target.query?.values?.map((value) => value.func);
  if (mode === 'raw' || mode === 'logs' || valueFunctions?.includes('rawData')) {
    return 'logs';
  }
  return target.resultType ?? 'time_series';
};

const asLegacyTarget = (value: JsonValue): LegacyTarget | undefined => (isJsonObject(value) ? value : undefined);

const asLegacyPanel = (value: JsonValue): LegacyPanel | undefined => {
  if (!isJsonObject(value)) {
    return undefined;
  }
  const targets = Array.isArray(value.targets) ? value.targets.map(asLegacyTarget).filter((target): target is LegacyTarget => target !== undefined) : undefined;
  const panels = Array.isArray(value.panels) ? value.panels.map(asLegacyPanel).filter((panel): panel is LegacyPanel => panel !== undefined) : undefined;
  return { ...value, ...(targets ? { targets } : {}), ...(panels ? { panels } : {}) };
};

export const decodeLegacyDashboard = (value: unknown): LegacyDashboard | undefined => {
  if (!isJsonObject(value) || !Array.isArray(value.panels)) {
    return undefined;
  }
  const panels = value.panels.map(asLegacyPanel).filter((panel): panel is LegacyPanel => panel !== undefined);
  return { ...value, panels };
};

const migratePanelToV4 = (panel: LegacyPanel): LegacyPanel => {
  const panelCopy = _.cloneDeep(panel);
  if (Array.isArray(panelCopy.panels)) {
    panelCopy.panels = panelCopy.panels.map(migratePanelToV4);
  }

  const targets = panelCopy.targets ?? [];
  const needsTargetMigration = targets.some((target) => !target.kind || (isExpressionTarget(target) && target.kind !== 'expression') || target.__mode__ === '__expr__');
  const isMixedDatasource = panelCopy.datasourceCate === 'mixed' || panelCopy.datasourceValue === 'mixed';
  const hasLegacyDatasource = !isMixedDatasource && (panelCopy.datasourceCate !== undefined || panelCopy.datasourceValue !== undefined);
  const hasTargetDatasource = targets.some((target) => !isExpressionTarget(target) && target.datasource);
  if (semver.gte(semver.coerce(panelCopy.version) || '0.0.0', '4.0.0') && !needsTargetMigration && !hasLegacyDatasource && !hasTargetDatasource) {
    return panelCopy;
  }

  panelCopy.targets = targets.map((target, index) => {
    const targetCopy = _.cloneDeep(target);
    targetCopy.refId = targetCopy.refId || getTargetRefId(index);
    if (isExpressionTarget(targetCopy)) {
      targetCopy.kind = 'expression';
      targetCopy.expression = targetCopy.expression ?? targetCopy.expr ?? '';
      delete targetCopy.expr;
    } else {
      targetCopy.kind = 'query';
      if (!hasLegacyDatasource) {
        targetCopy.datasource = targetCopy.datasource ?? { cate: 'prometheus' };
      }
      const datasourceCate = targetCopy.datasource?.cate ?? panelCopy.datasourceCate;
      if ((datasourceCate === 'elasticsearch' || datasourceCate === 'opensearch') && targetCopy.query) {
        targetCopy.query.filter_language = targetCopy.query.filter_language ?? (targetCopy.query.syntax === 'kuery' || targetCopy.query.syntax === 'kql' ? 'kql' : 'lucene');
        delete targetCopy.query.syntax;
      }
      targetCopy.resultType = inferTargetResultType(targetCopy);
    }
    delete targetCopy.__mode__;
    return targetCopy;
  });

  const datasourceTargets = panelCopy.targets.filter((target) => target.kind === 'query' && target.datasource);
  const datasourceKeys = _.uniq(datasourceTargets.map((target) => `${target.datasource?.cate}:${target.datasource?.id}`));
  if (isMixedDatasource) {
    panelCopy.datasourceCate = 'mixed';
    panelCopy.datasourceValue = 'mixed';
  } else if (hasLegacyDatasource || datasourceKeys.length <= 1) {
    const datasource = datasourceTargets[0]?.datasource;
    panelCopy.datasourceCate = panelCopy.datasourceCate ?? datasource?.cate ?? 'prometheus';
    panelCopy.datasourceValue = panelCopy.datasourceValue ?? datasource?.id;
    datasourceTargets.forEach((target) => delete target.datasource);
  } else {
    panelCopy.datasourceCate = 'mixed';
    panelCopy.datasourceValue = 'mixed';
  }
  panelCopy.version = '4.0.0';
  return panelCopy;
};

const migratePanelToV32 = (panel: LegacyPanel) => {
  if (panel.targets?.length) {
    const target = panel.targets[0];
    if (target?.maxDataPoints !== undefined) {
      panel.maxDataPoints = target.maxDataPoints;
      delete target.maxDataPoints;
    }
    if (target?.time !== undefined) {
      panel.queryOptionsTime = target.time;
      delete target.time;
    }
  }
  panel.version = '3.2.0';
};

const migratePanelToV33 = (panel: LegacyPanel) => {
  const standardOptions = panel.options?.standardOptions;
  if (standardOptions?.util) {
    standardOptions.unit = standardOptions.util;
    delete standardOptions.util;
  }
  if (panel.custom?.stack === 'noraml') {
    panel.custom.stack = 'normal';
  }
  panel.overrides = panel.overrides?.map((item) => {
    const itemCopy = _.cloneDeep(item);
    if (itemCopy.properties?.rightYAxisDisplay === 'noraml') {
      itemCopy.properties.rightYAxisDisplay = 'normal';
    }
    const overrideStandardOptions = itemCopy.properties?.standardOptions;
    if (overrideStandardOptions?.util) {
      overrideStandardOptions.unit = overrideStandardOptions.util;
      delete overrideStandardOptions.util;
    }
    return itemCopy;
  });
  panel.version = '3.3.0';
};

export default function dashboardMigrator(data: unknown): LegacyDashboard {
  // 内嵌 Grafana 链接大盘没有 panels，且不参与数据源迁移；保留其完整配置。
  if (isJsonObject(data) && data.mode === 'iframe') {
    return _.cloneDeep(data) as LegacyDashboard;
  }
  const dashboard = decodeLegacyDashboard(data);
  if (!dashboard) {
    return { panels: [] };
  }
  const panels = dashboard.panels.map((panel) => {
    const panelCopy = _.cloneDeep(panel);
    if (panel.version === '3.0.0' && panel.type === 'barGauge') {
      const custom = panelCopy.custom;
      const options = panelCopy.options;
      if (custom?.maxValue !== undefined && options) {
        options.standardOptions = { ...options.standardOptions, max: custom.maxValue };
        delete custom.maxValue;
      }
      if (custom?.baseColor !== undefined && options && !options.thresholds) {
        options.thresholds = { mode: 'absolute', steps: [{ color: custom.baseColor, type: 'base', value: null }] };
        delete custom.baseColor;
      }
    }
    if (semver.lt(semver.coerce(panelCopy.version) || '0.0.0', '3.2.0')) {
      migratePanelToV32(panelCopy);
    }
    if (semver.lt(semver.coerce(panelCopy.version) || '0.0.0', '3.3.0')) {
      migratePanelToV33(panelCopy);
    }
    if (semver.lt(semver.coerce(panelCopy.version) || '0.0.0', '3.4.0')) {
      panelCopy.panels?.forEach((subPanel) => {
        migratePanelToV32(subPanel);
        migratePanelToV33(subPanel);
        subPanel.version = '3.4.0';
      });
      panelCopy.version = '3.4.0';
    }
    return migratePanelToV4(panelCopy);
  });
  return { ...dashboard, version: '4.0.0', panels };
}
