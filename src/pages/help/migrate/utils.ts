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
import semver from 'semver';
import { updateDashboardConfigs } from '@/services/dashboardV2';
import { defaultCustomValuesMap } from '../../dashboard/Editor/config';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

function JSONParse(str) {
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error(e);
    }
  }
  return {};
}

function convertUnit(util) {
  if (util === 1000) {
    return 'bytesSI';
  }
  if (util === 1024) {
    return 'bytesIEC';
  }
  if (util === 'humantime') {
    return 'humantimeSeconds';
  }
  return undefined;
}

// 将多图表之前的面板结构转换成当前 v2 版本的结构
export function convertPanelV1ToV2(oldStructure) {
  let structure = _.cloneDeep(oldStructure);
  const yplotlines = _.compact([structure?.yplotline1, structure?.yplotline2]);
  const yplotlinesColors = ['yellow', 'red'];
  const links = structure.link ? [structure.link] : [];
  structure = {
    version: '3.0.0',
    name: structure.name,
    type: 'timeseries',
    layout: structure.layout,
    targets: _.map(structure.QL, (item, i) => {
      return {
        refId: alphabet[i],
        expr: item?.PromQL,
        legendFormat: item?.Legend,
      };
    }),
    options: {
      standardOptions: {
        util: convertUnit(structure?.highLevelConfig?.formatUnit),
      },
      legend: {
        displayMode: structure?.highLevelConfig?.legend ? 'list' : 'hidden',
      },
      tooltip: {
        mode: structure?.highLevelConfig?.shared ? 'all' : 'single',
        sort: structure?.highLevelConfig?.sharedSortDirection,
      },
      thresholds: {
        style: 'line',
        steps: _.map(yplotlines, (item, i) => {
          return {
            color: yplotlinesColors[i],
            value: item,
          };
        }),
      },
    },
    links: _.map(links, (item) => {
      return {
        title: '链接',
        url: item,
      };
    }),
    custom: defaultCustomValuesMap.timeseries,
  };
  return structure;
}

export function normalizePanel(structure) {
  let structureClone = _.cloneDeep(structure);
  // v2 开启启用语义化版本管理
  if (!semver.valid(structureClone.version)) {
    structureClone = convertPanelV1ToV2(structureClone);
  }
  return structureClone;
}

// 将旧的仪表盘结构转换为新的仪表盘结构
export function convertDashboardV1ToV2(oldStructure) {
  const oldConfigs = JSONParse(oldStructure.configs);
  const chartGroups = _.sortBy(oldStructure.chart_groups, ['weight']);
  const panels: any[] = [];
  let yMax = 0;
  let yMax2 = 0;
  _.forEach(chartGroups, (chartGroup) => {
    const uuid = uuidv4();
    panels.push({
      id: uuid,
      type: 'row',
      name: chartGroup.name,
      layout: { h: 1, w: 24, x: 0, y: yMax, i: uuid },
      collapsed: true,
    });
    yMax += 1;
    yMax2 += 1;
    const charts = chartGroup.charts;
    _.forEach(charts, (chart) => {
      const uuid = uuidv4();
      const chartConfigs = normalizePanel(JSONParse(chart.configs));
      const h = _.floor((chartConfigs.layout.h * 150) / 40); // 对老配置进行转换
      const y = yMax + chartConfigs.layout.y;
      panels.push({
        ...chartConfigs,
        id: uuid,
        layout: {
          ...chartConfigs.layout,
          i: uuid,
          y,
          h,
        },
      });
      yMax2 = Math.max(yMax2, y + h);
    });
    yMax = yMax2;
  });
  return {
    name: oldStructure.name,
    tags: _.isArray(oldStructure.tags) ? _.join(oldStructure.tags, ' ') : oldStructure.tags, // tags 从数组改成空格分隔
    configs: JSON.stringify({
      ...oldConfigs, // 原来的 configs 里面还包含 var 等其他字段在
      version: '3.0.0', // 新仪表盘添加版本信息
      panels,
    }),
  };
}

export function convertDashboardV2ToV3(board, { name, datasourceDefaultValue }) {
  const datasourceCate = 'prometheus';
  const varName = `\${${name}}`;
  const configs = typeof board.configs === 'string' ? JSON.parse(board.configs) : board.configs;
  configs.version = '3.0.0';
  configs.var = configs.var || [];
  configs.panels = configs.panels || [];
  configs.var = _.map(configs.var, (item) => {
    if (!item.type || item.type === 'query') {
      return {
        ...item,
        type: 'query',
        datasource: {
          cate: item.datasource?.cate || datasourceCate,
          value: item.datasource?.value || varName,
        },
      };
    }
    return item;
  });
  configs.var.unshift({
    name: name,
    type: 'datasource',
    definition: datasourceCate,
    defaultValue: datasourceDefaultValue,
  });
  configs.panels = _.map(configs.panels, (panel) => {
    if (panel.type !== 'row') {
      return {
        ...panel,
        datasourceCate: panel.datasourceCate || datasourceCate,
        datasourceValue: panel.datasourceValue || varName,
      };
    }
    return panel;
  });

  return updateDashboardConfigs(board.id, {
    configs: JSON.stringify(configs),
  });
}
