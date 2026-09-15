/*
 * Grafana dashboard schema 迁移（重建自 grafana main public/app/features/dashboard/state/DashboardMigrator.ts）。
 *
 * - DASHBOARD_SCHEMA_VERSION = 42 是 grafana v1 dashboard API 的最终 schema 版本。
 * - 迁移按版本升序应用，仅当 oldVersion < version <= target 时执行。
 * - 纯函数：入参被 cloneDeep 保护，不污染原始引用；迁移后写回 schemaVersion = target。
 * - 返回迁移台账（applied / not-applicable / skipped），供导入结果报告展示。
 *
 * 离线适配说明（与 grafana 源码的差异）：
 * - grafana 把部分迁移委托给插件自动迁移（v2 graphite、v4 graph、v9 singlestat、v13 graph、
 *   v24 table 自动迁移、v33/v36 datasource service、v34 CloudWatch、v31 transformer、v35 面板插件）。
 *   离线环境没有插件注册表 / datasource service / transformer registry，这类迁移记录为 skipped；
 *   singlestat（v28）与 table 分类（v24）使用本仓库既有的确定性离线实现。
 */
import _ from 'lodash';

import type { GrafanaDashboard, GrafanaPanel, MigrationLedgerEntry, MigrateResult } from './types';

export const DASHBOARD_SCHEMA_VERSION = 42;

export const GRID_CELL_HEIGHT = 30;
export const GRID_CELL_VMARGIN = 8;
export const GRID_COLUMN_COUNT = 24;
export const DEFAULT_PANEL_SPAN = 4;
export const DEFAULT_ROW_HEIGHT = 250;
export const MIN_PANEL_HEIGHT = GRID_CELL_HEIGHT * 3;

const defaultColors = ['rgba(245, 54, 54, 0.9)', 'rgba(237, 129, 40, 0.89)', 'rgba(50, 172, 45, 0.97)'];

enum VariableHide {
  dontHide,
  hideLabel,
  hideVariable,
}
enum MappingType {
  ValueToText = 'value',
  RangeToText = 'range',
  SpecialValue = 'special',
}
enum SpecialValueMatch {
  True = 'true',
  False = 'false',
  Null = 'null',
  NaN = 'nan',
  NullAndNaN = 'null+nan',
  Empty = 'empty',
}

/** 递归遍历所有面板（含 row 子面板） */
function* walkPanels(dashboard: GrafanaDashboard): Generator<GrafanaPanel> {
  for (const panel of Array.isArray(dashboard.panels) ? dashboard.panels : []) {
    if (!_.isPlainObject(panel)) continue;
    yield panel;
    if (panel.type === 'row' && Array.isArray(panel.panels)) {
      yield* walkPanels({ panels: panel.panels } as GrafanaDashboard);
    }
  }
}

/** 规范化 templating.list，返回变量数组（空时初始化空数组） */
function variablesOf(dashboard: GrafanaDashboard): any[] {
  if (!_.isPlainObject(dashboard.templating)) {
    dashboard.templating = { list: [] };
  }
  const templating = dashboard.templating as { list: any[] };
  if (!Array.isArray(templating.list)) {
    templating.list = [];
  }
  return templating.list;
}

// ---------------------------------------------------------------------------
// 迁移定义
// ---------------------------------------------------------------------------

type DashboardMigration = (dashboard: GrafanaDashboard) => boolean;

interface Migration {
  version: number;
  /** 迁移函数，返回是否真正产生了修改（用于台账 applied/not-applicable） */
  migrate?: DashboardMigration;
  /** 存在该字段表示离线环境跳过，reason 为跳过原因 */
  skippedReason?: string;
}

const MIGRATIONS: Migration[] = [
  {
    version: 2,
    migrate(dashboard) {
      // grafana 中 graphite 面板由插件自动迁移，离线直接重命名以保留旧面板
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        if (panel.type === 'graphite') {
          panel.type = 'graph';
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    version: 3,
    migrate(dashboard) {
      // grafana 由 DashboardModel.ensurePanelsHaveUniqueIds 分配 id，离线按位置确定性补 id
      let changed = false;
      let index = 0;
      for (const panel of walkPanels(dashboard)) {
        if (panel.id === undefined || panel.id === null) {
          panel.id = index;
          changed = true;
        }
        index += 1;
      }
      return changed;
    },
  },
  { version: 4, skippedReason: 'graph 面板迁移依赖面板插件注册表，离线跳过（graph 形状在映射阶段处理）' },
  { version: 5, skippedReason: 'grafana 未定义该版本的迁移' },
  {
    version: 6,
    migrate(dashboard) {
      let changed = false;
      const annotations = _.find(dashboard.pulldowns, { type: 'annotations' });
      if (annotations) {
        dashboard.annotations = { list: annotations.annotations || [] };
        changed = true;
      }
      for (const variable of variablesOf(dashboard)) {
        if (variable.datasource === undefined) {
          variable.datasource = null;
          changed = true;
        }
        if (variable.type === 'filter') {
          variable.type = 'query';
          changed = true;
        }
        if (variable.type === undefined) {
          variable.type = 'query';
          changed = true;
        }
        if ('allFormat' in variable) {
          delete variable.allFormat;
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    version: 7,
    migrate(dashboard) {
      if (_.isArray(dashboard.nav) && dashboard.nav.length > 0) {
        dashboard.timepicker = dashboard.nav[0];
        return true;
      }
      return false;
    },
  },
  {
    version: 8,
    migrate(dashboard) {
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        for (const target of Array.isArray(panel.targets) ? panel.targets : []) {
          if (!_.isPlainObject(target)) continue;
          if (target.fields && target.tags && target.groupBy) {
            if (target.rawQuery) {
              delete target.fields;
              delete target.fill;
            } else {
              target.select = _.map(target.fields, (field: any) => {
                const parts: any[] = [];
                parts.push({ type: 'field', params: [field.name] });
                parts.push({ type: field.func, params: [] });
                if (field.mathExpr) parts.push({ type: 'math', params: [field.mathExpr] });
                if (field.asExpr) parts.push({ type: 'alias', params: [field.asExpr] });
                return parts;
              });
              delete target.fields;
              _.forEach(target.groupBy, (part: any) => {
                if (part.type === 'time' && part.interval) {
                  part.params = [part.interval];
                  delete part.interval;
                }
                if (part.type === 'tag' && part.key) {
                  part.params = [part.key];
                  delete part.key;
                }
              });
              if (target.fill) {
                target.groupBy.push({ type: 'fill', params: [target.fill] });
                delete target.fill;
              }
            }
            changed = true;
          }
        }
      }
      return changed;
    },
  },
  {
    version: 9,
    skippedReason: 'singlestat 面板迁移依赖面板插件注册表，离线跳过（singlestat 在 v28 有确定性离线实现）',
  },
  {
    version: 10,
    migrate(dashboard) {
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        if (panel.type !== 'table') continue;
        for (const style of _.isArray(panel.styles) ? panel.styles : []) {
          if (_.isArray(style.thresholds) && style.thresholds.length >= 3) {
            style.thresholds = style.thresholds.slice(1);
            changed = true;
          }
        }
      }
      return changed;
    },
  },
  { version: 11, skippedReason: 'grafana 未定义该版本的迁移' },
  {
    version: 12,
    migrate(dashboard) {
      let changed = false;
      for (const variable of variablesOf(dashboard)) {
        if ('refresh' in variable) {
          variable.refresh = variable.refresh ? 1 : 0;
          changed = true;
        }
        if ('hideVariable' in variable && variable.hideVariable) {
          variable.hide = 2;
          changed = true;
        } else if ('hideLabel' in variable && variable.hideLabel) {
          variable.hide = 1;
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    version: 13,
    skippedReason: 'graph 面板自动迁移（barchart/bargauge/histogram/timeseries）依赖面板插件注册表，离线跳过',
  },
  {
    version: 14,
    migrate(dashboard) {
      dashboard.graphTooltip = dashboard.sharedCrosshair ? 1 : 0;
      return true;
    },
  },
  { version: 15, skippedReason: 'grafana 未定义该版本的迁移' },
  {
    version: 16,
    migrate(dashboard) {
      return upgradeToGridLayout(dashboard);
    },
  },
  {
    version: 17,
    migrate(dashboard) {
      let changed = false;
      const factors = getFactors(GRID_COLUMN_COUNT);
      for (const panel of walkPanels(dashboard)) {
        if (panel.minSpan) {
          const max = GRID_COLUMN_COUNT / panel.minSpan;
          panel.maxPerRow = factors[_.findIndex(factors, (o) => o > max) - 1];
          delete panel.minSpan;
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    version: 18,
    migrate(dashboard) {
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        if (panel['options-gauge']) {
          panel.options = panel['options-gauge'];
          panel.options.valueOptions = {
            unit: panel.options.unit,
            stat: panel.options.stat,
            decimals: panel.options.decimals,
            prefix: panel.options.prefix,
            suffix: panel.options.suffix,
          };
          if (panel.options.thresholds) {
            panel.options.thresholds.reverse();
          }
          delete panel.options.options;
          delete panel.options.unit;
          delete panel.options.stat;
          delete panel.options.decimals;
          delete panel.options.prefix;
          delete panel.options.suffix;
          delete panel['options-gauge'];
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    version: 19,
    migrate(dashboard) {
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        if (_.isArray(panel.links)) {
          panel.links = panel.links.map(upgradePanelLink);
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    version: 20,
    migrate(dashboard) {
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        const updateLinks = (link: any) => {
          if (_.isString(link.url) && legacyVariableNamesRegex.test(link.url)) {
            link.url = updateVariablesSyntax(link.url);
            changed = true;
          }
          return link;
        };
        if (panel.options && _.isArray(panel.options.dataLinks)) {
          panel.options.dataLinks = panel.options.dataLinks.map(updateLinks);
        }
        if (panel.options && panel.options.fieldOptions && panel.options.fieldOptions.defaults) {
          if (_.isArray(panel.options.fieldOptions.defaults.links)) {
            panel.options.fieldOptions.defaults.links = panel.options.fieldOptions.defaults.links.map(updateLinks);
          }
          if (panel.options.fieldOptions.defaults.title) {
            panel.options.fieldOptions.defaults.title = updateVariablesSyntax(panel.options.fieldOptions.defaults.title);
          }
        }
      }
      return changed;
    },
  },
  {
    version: 21,
    migrate(dashboard) {
      let changed = false;
      const updateLinks = (link: any) => {
        if (_.isString(link.url) && _.includes(link.url, '__series.labels')) {
          link.url = link.url.replace(/__series\.labels/g, '__field.labels');
          changed = true;
        }
        return link;
      };
      for (const panel of walkPanels(dashboard)) {
        if (panel.options && _.isArray(panel.options.dataLinks)) {
          panel.options.dataLinks = panel.options.dataLinks.map(updateLinks);
        }
        if (panel.options && panel.options.fieldOptions && panel.options.fieldOptions.defaults) {
          if (_.isArray(panel.options.fieldOptions.defaults.links)) {
            panel.options.fieldOptions.defaults.links = panel.options.fieldOptions.defaults.links.map(updateLinks);
          }
        }
      }
      return changed;
    },
  },
  {
    version: 22,
    migrate(dashboard) {
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        if (panel.type !== 'table') continue;
        for (const style of _.isArray(panel.styles) ? panel.styles : []) {
          style.align = 'auto';
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    version: 23,
    migrate(dashboard) {
      let changed = false;
      for (const variable of variablesOf(dashboard)) {
        if (!isMulti(variable)) continue;
        const { multi, current } = variable;
        if (_.isEmpty(current)) continue;
        variable.current = alignCurrentWithMulti(current, multi);
        changed = true;
      }
      return changed;
    },
  },
  {
    version: 24,
    migrate(dashboard) {
      // 7.0：迁移旧 table 到 table-old（离线不做插件自动迁移）
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        const wasAngularTable = panel.type === 'table';
        if (wasAngularTable && !panel.styles) continue;
        const wasReactTable = panel.table === 'table2';
        if (!wasAngularTable || wasReactTable) continue;
        panel.type = 'table-old';
        changed = true;
      }
      return changed;
    },
  },
  { version: 25, skippedReason: 'grafana 未定义该版本的迁移（tags 在 v28 移除）' },
  {
    version: 26,
    migrate(dashboard) {
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        if (panel.type === 'text2') {
          panel.type = 'text';
          if (panel.options) {
            delete panel.options.angular;
          }
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    version: 27,
    migrate(dashboard) {
      let changed = false;
      // 移除重复面板残留（与 grafana removeRepeatedPanels 一致）
      const retained: GrafanaPanel[] = [];
      for (const panel of Array.isArray(dashboard.panels) ? dashboard.panels : []) {
        if (panel.repeatPanelId || panel.repeatByRow) {
          changed = true;
          continue;
        }
        if (panel.type === 'row' && Array.isArray(panel.panels)) {
          const before = panel.panels.length;
          panel.panels = panel.panels.filter((x) => !x.repeatPanelId);
          if (panel.panels.length !== before) changed = true;
        }
        retained.push(panel);
      }
      dashboard.panels = retained;
      // constant 变量迁移
      for (const variable of variablesOf(dashboard)) {
        if (!isConstant(variable)) continue;
        const newVariable: any = { ...variable };
        newVariable.current = { selected: true, text: newVariable.query ?? '', value: newVariable.query ?? '' };
        newVariable.options = [newVariable.current];
        if (newVariable.hide === VariableHide.dontHide || newVariable.hide === VariableHide.hideLabel) {
          newVariable.type = 'textbox';
        }
        Object.assign(variable, newVariable);
        changed = true;
      }
      return changed;
    },
  },
  {
    version: 28,
    migrate(dashboard) {
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        if (panel.type === 'singlestat') {
          migrateSinglestat(panel);
          changed = true;
        }
      }
      for (const variable of variablesOf(dashboard)) {
        for (const key of ['tags', 'tagsQuery', 'tagValuesQuery', 'useTags']) {
          if (key in variable) {
            delete variable[key];
            changed = true;
          }
        }
      }
      return changed;
    },
  },
  {
    version: 29,
    migrate(dashboard) {
      let changed = false;
      for (const variable of variablesOf(dashboard)) {
        if (variable.type !== 'query') continue;
        if (variable.refresh !== 1 && variable.refresh !== 2) {
          variable.refresh = 1;
          changed = true;
        }
        if (variable.options?.length) {
          variable.options = [];
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    version: 30,
    migrate(dashboard) {
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        if (upgradeValueMappingsForPanel(panel)) changed = true;
        if (migrateTooltipOptions(panel)) changed = true;
      }
      return changed;
    },
  },
  {
    version: 31,
    skippedReason: 'labelsToFields 后的 merge transformer 依赖 Grafana transformer registry，离线跳过',
  },
  { version: 32, skippedReason: 'grafana 未定义该版本的迁移（CloudWatch 迁移移到 v34）' },
  { version: 33, skippedReason: 'datasource 名称转 {uid,type} 引用依赖 datasource service，离线跳过' },
  { version: 34, skippedReason: 'CloudWatch 查询迁移依赖数据源插件，离线跳过' },
  { version: 35, skippedReason: 'x 轴可见性迁移依赖面板插件，离线跳过' },
  { version: 36, skippedReason: '默认数据源转引用依赖 datasource service，离线跳过' },
  {
    version: 37,
    migrate(dashboard) {
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        const legend = panel.options?.legend;
        if (legend && typeof legend === 'object') {
          if (legend.displayMode === 'hidden' || legend.showLegend === false) {
            legend.displayMode = 'list';
            legend.showLegend = false;
          } else {
            panel.options.legend = { ...legend, showLegend: true };
          }
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    version: 38,
    migrate(dashboard) {
      // table custom.displayMode → custom.cellOptions（含 overrides）
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        if (panel.type === 'table' && panel.fieldConfig !== undefined) {
          const defaults = panel.fieldConfig.defaults;
          if (defaults?.custom && defaults.custom.displayMode !== undefined) {
            defaults.custom.cellOptions = migrateTableDisplayModeToCellOptions(defaults.custom.displayMode);
            delete defaults.custom.displayMode;
            changed = true;
          }
          if (_.isArray(panel.fieldConfig.overrides)) {
            for (const override of panel.fieldConfig.overrides) {
              if (!_.isArray(override.properties)) continue;
              for (const property of override.properties) {
                if (property.id === 'custom.displayMode') {
                  property.id = 'custom.cellOptions';
                  property.value = migrateTableDisplayModeToCellOptions(property.value);
                  changed = true;
                }
              }
            }
          }
        }
      }
      return changed;
    },
  },
  {
    version: 39,
    migrate(dashboard) {
      // timeSeriesTable transformation：refIdToStat[refId] = stat → { stat }
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        for (const transformation of _.isArray(panel.transformations) ? panel.transformations : []) {
          if (!_.isPlainObject(transformation)) continue;
          const options = transformation.options;
          if (transformation.id === 'timeSeriesTable' && options !== undefined && options.refIdToStat !== undefined) {
            const tableTransformOptions: Record<string, { stat: unknown }> = {};
            for (const [refId, stat] of Object.entries(options.refIdToStat)) {
              tableTransformOptions[refId] = { stat };
            }
            transformation.options = tableTransformOptions;
            changed = true;
          }
        }
      }
      return changed;
    },
  },
  {
    version: 40,
    migrate(dashboard) {
      if (typeof dashboard.refresh !== 'string') {
        dashboard.refresh = '';
        return true;
      }
      return false;
    },
  },
  {
    version: 41,
    migrate(dashboard) {
      if (dashboard.timepicker && 'time_options' in dashboard.timepicker) {
        delete dashboard.timepicker.time_options;
        return true;
      }
      return false;
    },
  },
  {
    version: 42,
    migrate(dashboard) {
      // hideFrom.viz === true 时补 tooltip = true
      let changed = false;
      for (const panel of walkPanels(dashboard)) {
        const overrides = panel.fieldConfig?.overrides;
        if (!_.isArray(overrides)) continue;
        for (const override of overrides) {
          if (!_.isArray(override.properties)) continue;
          for (const property of override.properties) {
            if (property.id === 'custom.hideFrom' && property.value?.viz === true) {
              property.value.tooltip = true;
              changed = true;
            }
          }
        }
      }
      return changed;
    },
  },
];

/** 迁移入口：把 classic dashboard 迁移到指定 schema 版本（默认 42），返回迁移后的副本与台账。 */
export function migrateDashboardSchema(source: unknown, targetVersion: number = DASHBOARD_SCHEMA_VERSION): MigrateResult {
  const dashboard = _.cloneDeep(source) as GrafanaDashboard;
  const oldVersion = typeof dashboard?.schemaVersion === 'number' ? dashboard.schemaVersion : 0;
  const migrations: MigrationLedgerEntry[] = [];

  if (oldVersion >= targetVersion) {
    return { dashboard, migrations };
  }

  for (const migration of MIGRATIONS) {
    if (oldVersion >= migration.version || migration.version > targetVersion) continue;
    if (migration.skippedReason) {
      migrations.push({ version: migration.version, status: 'skipped', reason: migration.skippedReason });
      continue;
    }
    const changed = migration.migrate?.(dashboard) ?? false;
    migrations.push({
      version: migration.version,
      status: changed ? 'applied' : 'not-applicable',
      reason: changed ? defaultReason(migration.version) : '该版本无适用的数据，无需迁移',
    });
  }

  dashboard.schemaVersion = targetVersion;
  return { dashboard, migrations };
}

function defaultReason(version: number): string {
  const reasons: Record<number, string> = {
    2: 'graphite 面板重命名为 graph',
    3: '为缺失 id 的面板补充确定性 id',
    6: '规范化模板变量并迁移 pulldowns→annotations',
    7: 'nav[0] 迁移到 timepicker',
    8: '迁移旧 InfluxDB target 结构',
    10: '规范化 table thresholds',
    12: '规范化变量 refresh / hide',
    14: 'sharedCrosshair 迁移到 graphTooltip',
    16: 'rows 布局迁移为 grid 布局',
    17: 'minSpan 迁移为 maxPerRow',
    18: '迁移遗留 gauge options',
    19: '规范化面板链接 url',
    20: '更新内置变量语法（__series.name 等）',
    21: '__series.labels 更新为 __field.labels',
    22: 'table 样式设置 align=auto',
    23: '多值变量 current 对齐',
    24: '旧 table 迁移为 table-old',
    26: 'text2 迁移为 text',
    27: '移除重复面板残留并迁移 constant 变量',
    28: 'singlestat 离线迁移并移除变量遗留 tags',
    29: '规范化 query 变量的 refresh / options',
    30: '升级 valueMappings 与 tooltip 配置',
    37: '规范化 legend 显示配置',
    38: 'table custom.displayMode 迁移为 custom.cellOptions',
    39: '迁移 timeSeriesTable transformation 配置',
    40: 'dashboard refresh 规范化',
    41: '移除 timepicker.time_options',
    42: '补齐 hideFrom.tooltip',
  };
  return reasons[version] || '已应用该版本迁移';
}

// ---------------------------------------------------------------------------
// 迁移辅助函数
// ---------------------------------------------------------------------------

const legacyVariableNamesRegex = /(__series_name)|(\$__series_name)|(__value_time)|(__field_name)|(\$__field_name)/g;

function updateVariablesSyntax(text: string) {
  return String(text).replace(legacyVariableNamesRegex, (match, seriesName: string, seriesName1: string, valueTime: string, fieldName: string, fieldName1: string) => {
    if (seriesName) return '__series.name';
    if (seriesName1) return '${__series.name}';
    if (valueTime) return '__value.time';
    if (fieldName) return '__field.name';
    if (fieldName1) return '${__field.name}';
    return match;
  });
}

function upgradePanelLink(link: any) {
  let url = link.url;
  if (!url && link.dashboard) {
    url = `dashboard/db/${slugify(link.dashboard)}`;
  }
  if (!url && link.dashUri) {
    url = `dashboard/${link.dashUri}`;
  }
  if (!url) {
    url = '/';
  }
  if (link.keepTime) {
    url = appendQueryToUrl(url, '${__from}');
  }
  if (link.includeVars) {
    url = appendQueryToUrl(url, '${__all_variables}');
  }
  if (link.params) {
    url = appendQueryToUrl(url, link.params);
  }
  return {
    url,
    title: link.title,
    targetBlank: link.targetBlank,
  };
}

function slugify(value: string) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function appendQueryToUrl(url: string, param: string) {
  const separator = _.includes(url, '?') ? '&' : '?';
  return `${url}${separator}${param}`;
}

function isMulti(model: any): boolean {
  return 'multi' in model;
}

function isConstant(model: any): boolean {
  return model.type === 'constant';
}

function alignCurrentWithMulti(current: any, value: boolean) {
  if (!current) return current;
  if (value && !Array.isArray(current.value)) {
    return { ...current, value: convertToMulti(current.value), text: convertToMulti(current.text) };
  }
  if (!value && Array.isArray(current.value)) {
    return { ...current, value: convertToSingle(current.value), text: convertToSingle(current.text) };
  }
  return current;
}

function convertToSingle(value: string | string[]): string {
  if (!Array.isArray(value)) return value;
  if (value.length > 0) return value[0];
  return '';
}

function convertToMulti(value: string | string[]): string[] {
  if (Array.isArray(value)) return value;
  return [value];
}

function upgradeValueMappingsForPanel(panel: GrafanaPanel): boolean {
  const fieldConfig = panel.fieldConfig;
  if (!fieldConfig) return false;
  let changed = false;
  if (fieldConfig.defaults && fieldConfig.defaults.mappings) {
    fieldConfig.defaults.mappings = upgradeValueMappings(fieldConfig.defaults.mappings, fieldConfig.defaults.thresholds);
    changed = true;
  }
  if (Array.isArray(fieldConfig.overrides)) {
    for (const override of fieldConfig.overrides) {
      for (const prop of override.properties || []) {
        if (prop.id === 'mappings') {
          prop.value = upgradeValueMappings(prop.value);
          changed = true;
        }
      }
    }
  }
  return changed;
}

function upgradeValueMappings(oldMappings: any, thresholds?: any): any[] | undefined {
  if (!oldMappings) return undefined;
  const valueMaps: any = { type: MappingType.ValueToText, options: {} };
  const newMappings: any[] = [];

  for (const old of oldMappings) {
    if (old.type && old.options) {
      if (old.type === MappingType.ValueToText) {
        valueMaps.options = { ...valueMaps.options, ...old.options };
      } else {
        newMappings.push(old);
      }
      continue;
    }

    let color: string | undefined;
    const numeric = parseFloat(old.text);
    if (thresholds && !isNaN(numeric)) {
      const level = getActiveThreshold(numeric, thresholds.steps);
      if (level && level.color) color = level.color;
    }

    switch (old.type) {
      case 1: // ValueToText
        if (old.value != null) {
          if (old.value === 'null') {
            newMappings.push({ type: MappingType.SpecialValue, options: { match: SpecialValueMatch.Null, result: { text: old.text, color } } });
          } else {
            valueMaps.options[String(old.value)] = { text: old.text, color };
          }
        }
        break;
      case 2: // RangeToText
        newMappings.push({ type: MappingType.RangeToText, options: { from: +old.from, to: +old.to, result: { text: old.text, color } } });
        break;
    }
  }

  if (Object.keys(valueMaps.options).length > 0) {
    newMappings.unshift(valueMaps);
  }
  return newMappings;
}

function getActiveThreshold(value: number, thresholds: any[] | undefined): any {
  if (!thresholds || thresholds.length === 0) return { value: 0, color: 'gray' };
  let active = thresholds[0];
  for (const threshold of thresholds) {
    if (value >= threshold.value) {
      active = threshold;
    } else {
      break;
    }
  }
  return active;
}

function migrateTooltipOptions(panel: GrafanaPanel): boolean {
  if ((panel.type === 'timeseries' || panel.type === 'xychart') && panel.options?.tooltipOptions) {
    panel.options = { ...panel.options, tooltip: panel.options.tooltipOptions };
    delete panel.options.tooltipOptions;
    return true;
  }
  return false;
}

function migrateSinglestat(panel: GrafanaPanel) {
  panel.options = {
    colorMode: 'value',
    graphMode: 'none',
    justifyMode: 'auto',
    orientation: 'horizontal',
    reduceOptions: { calcs: ['lastNotNull'], fields: '', values: false },
    textMode: 'auto',
  };
  const thresholds = _.split(panel.thresholds, ',');
  if (_.compact(thresholds)?.length > 0) {
    panel.fieldConfig = {
      defaults: {
        color: { mode: 'thresholds' },
        thresholds: {
          mode: 'absolute',
          steps: _.concat(
            [{ color: panel.colors?.[0] || defaultColors[0], value: null as number | null }],
            _.map(thresholds, (threshold, idx) => ({
              color: panel.colors?.[idx + 1] || defaultColors[(idx + 1) % defaultColors.length],
              value: _.toNumber(threshold),
            })),
          ),
        },
        unit: panel.format,
      },
    };
  }
  panel.type = panel.gauge?.show ? 'gauge' : 'stat';
}

/** grafana migrateTableDisplayModeToCellOptions 的离线确定性实现 */
function migrateTableDisplayModeToCellOptions(displayMode: string): Record<string, unknown> {
  switch (displayMode) {
    case 'basic':
    case 'gradient-gauge':
    case 'lcd-gauge': {
      let mode = 'basic';
      if (displayMode === 'gradient-gauge') mode = 'gradient';
      else if (displayMode === 'lcd-gauge') mode = 'lcd';
      return { type: 'gauge', mode };
    }
    case 'color-background':
    case 'color-background-solid': {
      let mode = 'basic';
      if (displayMode === 'color-background') mode = 'gradient';
      return { type: 'color-background', mode };
    }
    default:
      return { type: displayMode };
  }
}

// ---------------------------------------------------------------------------
// v16：rows → grid 布局（离线实现）
// ---------------------------------------------------------------------------

class RowArea {
  area: number[];
  yPos: number;
  height: number;

  constructor(height: number, width = GRID_COLUMN_COUNT, rowYPos = 0) {
    this.area = new Array(width).fill(0);
    this.yPos = rowYPos;
    this.height = height;
  }

  reset() {
    this.area.fill(0);
  }

  addPanel(gridPos: any) {
    for (let i = gridPos.x; i < gridPos.x + gridPos.w; i++) {
      if (!this.area[i] || gridPos.y + gridPos.h - this.yPos > this.area[i]) {
        this.area[i] = gridPos.y + gridPos.h - this.yPos;
      }
    }
    return this.area;
  }

  getPanelPosition(panelHeight: number, panelWidth: number, callOnce = false): any {
    let startPlace: number | undefined;
    let endPlace: number | undefined;
    for (let i = this.area.length - 1; i >= 0; i--) {
      if (this.height - this.area[i] > 0) {
        if (endPlace === undefined) {
          endPlace = i;
        } else if (i < this.area.length - 1 && this.area[i] <= this.area[i + 1]) {
          startPlace = i;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (startPlace !== undefined && endPlace !== undefined && endPlace - startPlace >= panelWidth - 1) {
      const yPos = _.max(this.area.slice(startPlace));
      return { x: startPlace, y: yPos };
    }
    if (!callOnce) {
      this.yPos += this.height;
      this.reset();
      return this.getPanelPosition(panelHeight, panelWidth, true);
    }
    return null;
  }
}

function getGridHeight(height: number | string) {
  let h = height;
  if (typeof h === 'string') {
    h = parseInt(h.replace('px', ''), 10);
  }
  if (h < MIN_PANEL_HEIGHT) {
    h = MIN_PANEL_HEIGHT;
  }
  return Math.ceil(h / (GRID_CELL_HEIGHT + GRID_CELL_VMARGIN));
}

function getFactors(num: number): number[] {
  return Array.from(new Array(num + 1), (_, i) => i).filter((i) => num % i === 0);
}

function upgradeToGridLayout(dashboard: GrafanaDashboard): boolean {
  if (!_.isArray(dashboard.rows)) return false;
  const oldRows = dashboard.rows;
  dashboard.panels = dashboard.panels || [];
  delete dashboard.rows;
  let yPos = 0;
  const widthFactor = GRID_COLUMN_COUNT / 12;

  const maxPanelId = _.max(_.flattenDeep(_.map(oldRows, (row) => _.map(row.panels, 'id'))));
  let nextRowId = (maxPanelId ?? -1) + 1;

  // 只要有 row 折叠/显示标题/重复，就生成特殊 row 面板
  const showRows = _.some(oldRows, (row) => row.collapse || row.showTitle || row.repeat);

  for (const row of oldRows) {
    if (row.repeatIteration) continue;

    const height: any = row.height || DEFAULT_ROW_HEIGHT;
    const rowGridHeight = getGridHeight(height);

    const rowPanel: any = {};
    let rowPanelModel: any;

    if (showRows) {
      rowPanel.id = nextRowId;
      rowPanel.type = 'row';
      rowPanel.title = row.title;
      rowPanel.collapsed = row.collapse;
      rowPanel.repeat = row.repeat;
      rowPanel.panels = [];
      rowPanel.gridPos = { x: 0, y: yPos, w: GRID_COLUMN_COUNT, h: 1 };
      rowPanelModel = rowPanel;
      nextRowId++;
      yPos++;
    }

    const rowArea = new RowArea(rowGridHeight, GRID_COLUMN_COUNT, yPos);

    for (const panel of row.panels) {
      panel.span = panel.span || DEFAULT_PANEL_SPAN;
      if (panel.minSpan) {
        panel.minSpan = Math.min(GRID_COLUMN_COUNT, (GRID_COLUMN_COUNT / 12) * panel.minSpan);
      }
      const panelWidth = Math.floor(panel.span) * widthFactor;
      const panelHeight = panel.height ? getGridHeight(panel.height) : rowGridHeight;

      const panelPos = rowArea.getPanelPosition(panelHeight, panelWidth);
      yPos = rowArea.yPos;
      panel.gridPos = {
        x: panelPos.x,
        y: yPos + panelPos.y,
        w: panelWidth,
        h: panelHeight,
      };
      rowArea.addPanel(panel.gridPos);

      delete panel.span;

      if (rowPanelModel && row.collapsed) {
        rowPanelModel.panels?.push(panel);
      } else {
        dashboard.panels.push(panel);
      }
    }

    if (rowPanelModel) {
      dashboard.panels.push(rowPanelModel);
    }

    if (!(rowPanelModel && row.collapsed)) {
      yPos += rowGridHeight;
    }
  }
  return true;
}
