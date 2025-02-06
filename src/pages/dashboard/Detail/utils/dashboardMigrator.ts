import _ from 'lodash';

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
    return panelCopy;
  });

  return {
    ...data,
    panels,
  };
}
