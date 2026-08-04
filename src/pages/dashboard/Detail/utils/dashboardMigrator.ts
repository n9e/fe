import _ from 'lodash';
import semver from 'semver';

import { getTargetRefId, inferTargetResultType, isExpressionTarget } from '@/pages/dashboard/Renderer/datasource/target';

const migratePanelToV4 = (panel: any): any => {
  const panelCopy = _.cloneDeep(panel);
  if (Array.isArray(panelCopy.panels)) {
    panelCopy.panels = panelCopy.panels.map(migratePanelToV4);
  }

  // 即使面板版本已是 v4，也要继续规范化遗留的表达式标识，避免编辑器同时处理两套数据结构。
  const needsTargetMigration = _.some(panelCopy.targets, (target: any) => !target.kind || (isExpressionTarget(target) && target.kind !== 'expression') || target.__mode__ === '__expr__');
  const isMixedDatasource = panelCopy.datasourceCate === 'mixed' || panelCopy.datasourceValue === 'mixed';
  // mixed 是 v4 编辑器的展示哨兵值，真实数据源仍位于 targets[].datasource，不能按旧面板级数据源迁移。
  const hasLegacyDatasource = !isMixedDatasource && (panelCopy.datasourceCate !== undefined || panelCopy.datasourceValue !== undefined);
  const hasTargetDatasource = _.some(panelCopy.targets, (target: any) => !isExpressionTarget(target) && target.datasource);
  if (semver.gte(semver.coerce(panelCopy.version) || '0.0.0', '4.0.0') && !needsTargetMigration && !hasLegacyDatasource && !hasTargetDatasource) {
    return panelCopy;
  }

  panelCopy.targets = _.map(panelCopy.targets, (target: any, index: number) => {
    const targetCopy = _.cloneDeep(target);
    targetCopy.refId = targetCopy.refId || getTargetRefId(index);
    if (isExpressionTarget(targetCopy)) {
      targetCopy.kind = 'expression';
      targetCopy.expression = targetCopy.expression ?? targetCopy.expr ?? '';
      delete targetCopy.expr;
    } else {
      targetCopy.kind = 'query';
      if (!hasLegacyDatasource) {
        targetCopy.datasource = targetCopy.datasource ?? {
          cate: 'prometheus',
          id: undefined,
        };
      }
      const datasourceCate = targetCopy.datasource?.cate ?? panelCopy.datasourceCate;
      if (_.includes(['elasticsearch', 'opensearch'], datasourceCate) && targetCopy.query) {
        targetCopy.query.filter_language =
          targetCopy.query.filter_language ?? (targetCopy.query.syntax === 'kuery' || targetCopy.query.syntax === 'kql' ? 'kql' : 'lucene');
        delete targetCopy.query.syntax;
      }
      targetCopy.resultType = inferTargetResultType(targetCopy);
    }
    delete targetCopy.__mode__;
    return targetCopy;
  });

  const datasourceTargets = _.filter(panelCopy.targets, (target: any) => target.kind === 'query' && target.datasource);
  const datasourceKeys = _.uniq(_.map(datasourceTargets, (target: any) => `${target.datasource.cate}:${target.datasource.id}`));
  if (isMixedDatasource) {
    // mixed 是面板级哨兵值。即使只有一个普通查询（其余 target 都是表达式），
    // 真实数据源也必须继续保留在 target 上，不能再上提并删除。
    panelCopy.datasourceCate = 'mixed';
    panelCopy.datasourceValue = 'mixed';
  } else if (hasLegacyDatasource || datasourceKeys.length <= 1) {
    const datasource = datasourceTargets[0]?.datasource;
    panelCopy.datasourceCate = panelCopy.datasourceCate ?? datasource?.cate ?? 'prometheus';
    panelCopy.datasourceValue = panelCopy.datasourceValue ?? datasource?.id;
    _.forEach(datasourceTargets, (target: any) => delete target.datasource);
  } else {
    panelCopy.datasourceCate = 'mixed';
    panelCopy.datasourceValue = 'mixed';
  }
  panelCopy.version = '4.0.0';
  return panelCopy;
};

export default function dashboardMigrator(data: any) {
  const panels = _.map(data.panels, (panel: any) => {
    const panelCopy = _.cloneDeep(panel);
    const { custom, options } = panelCopy;
    if (panel.version === '3.0.0') {
      if (panel.type === 'barGauge') {
        // 3.1.0 版本废弃 custom.maxValue 改用 options.standardOptions.max
        if (_.isNumber(custom.maxValue)) {
          _.set(options, ['standardOptions', 'max'], custom.maxValue);
          _.set(custom, ['maxValue'], undefined);
        }
        // 3.1.0 版本废弃 custom.baseColor 改用 options.standardOptions.thresholds
        // 多个保险判断，没有意义正常不会出现这个情况
        if (!options.thresholds) {
          _.set(options, ['thresholds'], {
            mode: 'absolute',
            steps: [
              {
                color: custom.baseColor ?? '#7EB26D',
                type: 'base',
                value: null,
              },
            ],
          });
          _.set(custom, ['baseColor'], undefined);
        }
      }
    }
    if (semver.lt(semver.coerce(panel.version) || '0.0.0', '3.2.0')) {
      // 取 targets[0].maxDataPoints 和 targets[0].time 改动 panel.maxDataPoints 和 panel.queryOptionsTime
      if (panelCopy.targets && panelCopy.targets.length > 0) {
        const target = panelCopy.targets[0];
        if (_.isNumber(target.maxDataPoints)) {
          panelCopy.maxDataPoints = target.maxDataPoints;
          target.maxDataPoints = undefined;
        }
        if (target.time) {
          panelCopy.queryOptionsTime = target.time;
          target.time = undefined;
        }
      }
      panelCopy.version = '3.2.0';
    }
    if (semver.lt(semver.coerce(panel.version) || '0.0.0', '3.3.0')) {
      if (panelCopy?.options?.standardOptions?.util) {
        panelCopy.options.standardOptions.unit = panelCopy.options.standardOptions?.util;
        delete panelCopy.options.standardOptions.util;
      }
      if (panelCopy?.custom?.stack === 'noraml') {
        panelCopy.custom.stack = 'normal';
      }
      panelCopy.overrides = _.map(panelCopy.overrides, (item) => {
        let itemCopy = _.cloneDeep(item);
        if (itemCopy?.properties?.rightYAxisDisplay === 'noraml') {
          _.set(itemCopy, ['properties', 'rightYAxisDisplay'], 'normal');
        }
        if (itemCopy?.properties?.standardOptions?.util) {
          _.set(itemCopy, ['properties', 'standardOptions', 'unit'], itemCopy.properties.standardOptions.util);
          _.set(itemCopy, ['properties', 'standardOptions', 'util'], undefined);
        }
        return itemCopy;
      });
      panelCopy.version = '3.3.0';
    }
    if (semver.lt(semver.coerce(panel.version) || '0.0.0', '3.4.0')) {
      // row panel 迁移子面板
      if (panelCopy.panels && panelCopy.panels.length > 0) {
        panelCopy.panels = panelCopy.panels.map((subPanel: any) => {
          let subPanelCopy = _.cloneDeep(subPanel);
          if (subPanelCopy.targets && subPanelCopy.targets.length > 0) {
            const subPanelTarget = subPanelCopy.targets[0];
            if (_.isNumber(subPanelTarget.maxDataPoints)) {
              subPanelCopy.maxDataPoints = subPanelTarget.maxDataPoints;
              subPanelTarget.maxDataPoints = undefined;
            }
            if (subPanelTarget.time) {
              subPanelCopy.queryOptionsTime = subPanelTarget.time;
              subPanelTarget.time = undefined;
            }
          }
          if (subPanelCopy?.options?.standardOptions?.util) {
            subPanelCopy.options.standardOptions.unit = subPanelCopy.options.standardOptions?.util;
            delete subPanelCopy.options.standardOptions.util;
          }
          if (subPanelCopy?.custom?.stack === 'noraml') {
            subPanelCopy.custom.stack = 'normal';
          }
          if (subPanelCopy.overrides && subPanelCopy.overrides.length > 0) {
            subPanelCopy.overrides = _.map(subPanelCopy.overrides, (item) => {
              let itemCopy = _.cloneDeep(item);
              if (itemCopy?.properties?.rightYAxisDisplay === 'noraml') {
                _.set(itemCopy, ['properties', 'rightYAxisDisplay'], 'normal');
              }
              if (itemCopy?.properties?.standardOptions?.util) {
                _.set(itemCopy, ['properties', 'standardOptions', 'unit'], itemCopy.properties.standardOptions.util);
                _.set(itemCopy, ['properties', 'standardOptions', 'util'], undefined);
              }
              return itemCopy;
            });
          }
          return subPanelCopy;
        });
      }
      panelCopy.version = '3.4.0';
    }
    return migratePanelToV4(panelCopy);
  });

  return {
    ...data,
    version: '4.0.0',
    panels,
  };
}
