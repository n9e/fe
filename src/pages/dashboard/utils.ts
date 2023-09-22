/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { IDashboard, IVariable } from './types';
import { defaultValues, calcsOptions } from './Editor/config';
import updateSchema from './updateSchema';

export function JSONParse(str) {
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error(e);
    }
  }
  return {};
}

export function getStepByTimeAndStep(time: IRawTimeRange, step: number | null) {
  if (step) return step;
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  return Math.max(Math.floor((end - start) / 240), 1);
}

const grafanaBuiltinColors = [
  { color: '#FFA6B0', name: 'super-light-red' },
  { color: '#FF7383', name: 'light-red' },
  { color: '#F2495C', name: 'red' },
  { color: '#E02F44', name: 'semi-dark-red' },
  { color: '#C4162A', name: 'dark-red' },
  { color: '#FFCB7D', name: 'super-light-orange' },
  { color: '#FFB357', name: 'light-orange' },
  { color: '#FF9830', name: 'orange' },
  { color: '#FF780A', name: 'semi-dark-orange' },
  { color: '#FA6400', name: 'dark-orange' },
  { color: '#FFF899', name: 'super-light-yellow' },
  { color: '#FFEE52', name: 'light-yellow' },
  { color: '#FADE2A', name: 'yellow' },
  { color: '#F2CC0C', name: 'semi-dark-yellow' },
  { color: '#E0B400', name: 'dark-yellow' },
  { color: '#C8F2C2', name: 'super-light-green' },
  { color: '#96D98D', name: 'light-green' },
  { color: '#73BF69', name: 'green' },
  { color: '#56A64B', name: 'semi-dark-green' },
  { color: '#37872D', name: 'dark-green' },
  { color: '#C0D8FF', name: 'super-light-blue' },
  { color: '#8AB8FF', name: 'light-blue' },
  { color: '#5794F2', name: 'blue' },
  { color: '#3274D9', name: 'semi-dark-blue' },
  { color: '#1F60C4', name: 'dark-blue' },
  { color: '#DEB6F2', name: 'super-light-purple' },
  { color: '#CA95E5', name: 'light-purple' },
  { color: '#B877D9', name: 'purple' },
  { color: '#A352CC', name: 'semi-dark-purple' },
  { color: '#8F3BB8', name: 'dark-purple' },
];

function normalizeCalc(calc: string) {
  if (calc === 'mean') {
    return 'avg';
  }
  if (calcsOptions[calc]) {
    return calc;
  }
  return 'lastNotNull';
}

function convertThresholdsGrafanaToN9E(config: any) {
  return {
    mode: config.thresholds?.mode, // mode 目前是不支持的
    style: config.custom?.thresholdsStyle?.mode || 'line', // 目前只有固定的 line 风格，但是这个只用于折线图
    steps: _.map(config.thresholds?.steps, (step, idx: number) => {
      return {
        ...step,
        color: _.find(grafanaBuiltinColors, { name: step.color })?.color || step.color, // grafana 的 color 是 name，需要转换成 hex
        type: step.value === null && idx === 0 ? 'base' : undefined, // 没有值并且是第一个，就是 base
      };
    }),
  };
}

function convertVariablesGrafanaToN9E(templates: any, __inputs: any[], data: any) {
  const vars = _.chain(templates.list)
    .filter((item) => {
      // 3.0.0 版本只支持 query / custom / textbox / constant 类型的变量
      return item.type === 'query' || item.type === 'custom' || item.type === 'textbox' || item.type === 'constant' || item.type === 'datasource' || item.type === 'interval';
    })
    .map((item) => {
      if (item.type === 'query') {
        const varObj: any = {
          type: 'query',
          name: item.name,
          definition: item.definition || _.get(item, 'query') || _.get(item, 'query.query'),
          allValue: item.allValue,
          allOption: item.includeAll,
          multi: item.multi,
          reg: item.regex,
        };
        const datasource = convertDatasourceGrafanaToN9E(item);
        varObj.datasource = {
          cate: datasource.datasourceCate,
          value: datasource.datasourceValue,
        };
        return varObj;
      } else if (item.type === 'custom') {
        return {
          type: 'custom',
          name: item.name,
          definition: item.query,
          allValue: item.allValue,
          allOption: item.includeAll,
          multi: item.multi,
        };
      } else if (item.type === 'constant') {
        return {
          type: 'constant',
          name: item.name,
          definition: item.query,
        };
      } else if (item.type === 'datasource') {
        return {
          type: 'datasource',
          name: item.name,
          definition: item.query,
        };
      } else if (item.type === 'interval') {
        return {
          type: 'custom',
          name: item.name,
          definition: '1s,5s,1m,5m,1h,6h,1d',
          allValue: item.allValue,
          allOption: item.includeAll,
          multi: item.multi,
        };
      }
      return {
        type: 'textbox',
        name: item.name,
        defaultValue: item.query,
      };
    })
    .value();
  _.forEach(__inputs, (item) => {
    if (item.type === 'datasource') {
      vars.unshift({
        type: 'datasource',
        name: item.name,
        definition: item.pluginId,
      });
    }
  });
  if (
    !_.some(vars, { type: 'datasource' }) &&
    _.some(data.panels, (panel) => {
      return _.toLower(panel?.datasource?.type) !== 'prometheus';
    })
  ) {
    vars.unshift({
      type: 'datasource',
      name: 'datasource',
      definition: 'prometheus',
    });
  }
  return vars;
}

function convertLinksGrafanaToN9E(links: any) {
  return _.chain(links)
    .filter((item) => {
      // 3.0.0 版本只支持 link 类型的链接设置
      return item.type === 'link';
    })
    .map((item) => {
      return {
        title: item.title,
        url: item.url,
        targetBlank: item.targetBlank, // TODO: 待验证
      };
    })
    .value();
}

function convertOptionsGrafanaToN9E(panel: any) {
  if (panel.type === 'graph') {
    // 旧版本的 Graph 不转换 options
    return defaultValues.options;
  }
  const { fieldConfig, options } = panel;
  const config = fieldConfig?.defaults;
  if (!config) return {};
  const unitMap = {
    percent: 'percent',
    percentunit: 'percentUnit',
    bytes: 'bytesIEC',
    bits: 'bytesIEC',
    decbytes: 'bytesSI',
    decbits: 'bitsSI',
    s: 'seconds',
    ms: 'milliseconds',
  };
  // 这里有 default 和 overrides 区别，目前 n9e 暂不支持 overrides
  return {
    valueMappings: config?.mappings,
    thresholds: convertThresholdsGrafanaToN9E(config),
    standardOptions: {
      util: unitMap[config.unit] ? unitMap[config.unit] : 'none',
      min: config.min,
      max: config.max,
      decimals: config.decimals,
    },
    legend: {
      displayMode: options?.legend?.displayMode === 'hidden' ? 'hidden' : 'list',
      placement: options?.legend?.placement,
    },
    tooltip: {
      mode: options?.tooltip === 'single' ? 'single' : 'multi',
    },
  };
}

function convertTimeseriesGrafanaToN9E(panel: any) {
  const lineInterpolation = _.get(panel, 'fieldConfig.defaults.custom.lineInterpolation');
  const fillOpacity = _.get(panel, 'fieldConfig.defaults.custom.fillOpacity');
  const stack = _.get(panel, 'fieldConfig.defaults.custom.stacking.mode');
  return {
    version: '3.0.0',
    drawStyle: panel.type === 'barchart' ? 'bars' : 'lines',
    lineInterpolation: lineInterpolation === 'smooth' ? 'smooth' : 'linear',
    fillOpacity: fillOpacity ? fillOpacity / 100 : 0.5,
    stack: stack === 'normal' ? 'normal' : 'off',
  };
}

function convertPieGrafanaToN9E(panel: any) {
  return {
    version: '3.0.0',
    calc: normalizeCalc(_.get(panel, 'options.reduceOptions.calcs[0]')),
    legengPosition: 'hidden',
  };
}

function convertStatGrafanaToN9E(panel: any) {
  return {
    version: '3.0.0',
    textMode: 'value',
    calc: normalizeCalc(_.get(panel, 'options.reduceOptions.calcs[0]')),
    colorMode: 'value',
  };
}

function convertGaugeGrafanaToN9E(panel: any) {
  return {
    version: '3.0.0',
    textMode: 'value',
    calc: normalizeCalc(_.get(panel, 'options.reduceOptions.calcs[0]')),
    colorMode: 'value',
  };
}

function convertBarGaugeGrafanaToN9E(panel: any) {
  return {
    version: '3.0.0',
    calc: normalizeCalc(_.get(panel, 'options.reduceOptions.calcs[0]')),
  };
}

function convertTextGrafanaToN9E(panel: any) {
  return {
    version: '3.0.0',
    content: _.get(panel, 'options.content'),
  };
}

function convertDatasourceGrafanaToN9E(panel: any) {
  const reg = /^\${[0-9a-zA-Z_]+}$/;
  if (_.toLower(panel?.datasource?.type) === 'prometheus') {
    return {
      datasourceCate: 'prometheus',
      datasourceValue: reg.test(panel.datasource.uid) ? panel.datasource.uid : '${datasource}',
    };
  }
  if (typeof panel.datasource === 'string' && reg.test(panel.datasource)) {
    return {
      datasourceCate: 'prometheus',
      datasourceValue: panel.datasource,
    };
  }
  return {
    datasourceCate: 'prometheus',
    datasourceValue: '${datasource}',
  };
}

function convertPanlesGrafanaToN9E(panels: any) {
  const chartsMap = {
    graph: {
      // 旧版本的时间序列折线图
      type: 'timeseries',
      fn: convertTimeseriesGrafanaToN9E,
    },
    timeseries: {
      type: 'timeseries',
      fn: convertTimeseriesGrafanaToN9E,
    },
    barchart: {
      type: 'timeseries',
      fn: convertTimeseriesGrafanaToN9E,
    },
    piechart: {
      type: 'pie',
      fn: convertPieGrafanaToN9E,
    },
    gauge: {
      type: 'gauge',
      fn: convertGaugeGrafanaToN9E,
    },
    singlestat: {
      type: 'gauge',
      fn: convertStatGrafanaToN9E,
    },
    stat: {
      type: 'stat',
      fn: convertStatGrafanaToN9E,
    },
    bargauge: {
      type: 'barGauge',
      fn: convertBarGaugeGrafanaToN9E,
    },
    text: {
      type: 'text',
      fn: convertTextGrafanaToN9E,
    },
  };
  return _.chain(panels)
    .filter((item) => {
      if (item.targets && item.type !== 'row') {
        return _.every(item.targets, (subItem) => {
          return !!subItem.expr;
        });
      }
      return true;
    })
    .map((item) => {
      const uid = uuidv4();
      if (item.type === 'row') {
        return {
          version: '3.0.0',
          id: uid,
          type: 'row',
          name: item.title,
          collapsed: !item.collapsed,
          layout: {
            ...item.gridPos,
            i: uid,
          },
          panels: convertPanlesGrafanaToN9E(item.panels),
        };
      }
      return {
        version: '3.0.0',
        id: uid,
        type: chartsMap[item.type] ? chartsMap[item.type].type : 'unknown',
        name: item.title,
        description: item.description,
        links: convertLinksGrafanaToN9E(item.links),
        layout: {
          ...item.gridPos,
          i: uid,
        },
        targets: _.chain(item.targets)
          .filter((item) => {
            // TODO: 目前只能丢掉被隐藏的 query
            return item.hide !== true;
          })
          .map((item) => {
            return {
              refId: item.refId,
              expr: item.expr,
              legend: item.legendFormat,
            };
          })
          .value(),
        options: convertOptionsGrafanaToN9E(item),
        custom: chartsMap[item.type] ? chartsMap[item.type].fn(item) : {},
        maxPerRow: item.maxPerRow || 4,
        repeat: item.repeat,
        ...convertDatasourceGrafanaToN9E(item),
      };
    })
    .value();
}

export function convertDashboardGrafanaToN9E(data) {
  data = updateSchema(data);
  const dashboard: {
    name: string;
    configs: IDashboard;
  } = {
    name: data.title,
    configs: {
      version: '3.0.0',
      links: convertLinksGrafanaToN9E(data.links),
      var: convertVariablesGrafanaToN9E(data.templating, data.__inputs, data) as IVariable[],
      panels: convertPanlesGrafanaToN9E(data.panels),
    },
  };
  return dashboard;
}

/**
 * 检测 Grafana Dashboard 版本
 * 0: 不支持 < v7 // 2023-08-29 启用 grafana update schema 功能后，不再禁止 < v7
 * 1: 兼容 >= v7 < v8
 * 2: 支持 >= v8
 */
export function checkGrafanaDashboardVersion(data) {
  // if (data.schemaVersion < 25) {
  //   return 0;
  // }
  if (data.schemaVersion < 30) {
    return 1;
  }
  return 2;
}
