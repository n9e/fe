import _ from 'lodash';
import semver from 'semver';

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
          return subPanelCopy;
        });
      }
      panelCopy.version = '3.4.0';
    }
    return panelCopy;
  });

  return {
    ...data,
    panels,
  };
}
