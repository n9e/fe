import _ from 'lodash';

import { AggregateConfig } from '../../../types';

/**
 * 别名生成格式
 * 函数 单次使用 多次使用
 * COUNT cnt cnt_1, cnt_2
 * CPS cps cps_1, cps_2
 * SUM sum sum_1, sum_2
 * AVG avg avg_1, avg_2
 * MIN min min_1, min_2
 * MAX max max_1, max_2
 * UNIQUE_COUNT unique_count unique_count_1, unique_count_2
 * EXIST_RATIO exist_ratio exist_ratio_1, exist_ratio_2
 * PERCENTILE p{percentile} p${percentile}_1, p${percentile}_2
 * TOPN top${N} top${N}_1, top${N}_2
 */

/**
 * 根据聚合配置列表获取别名列表
 * 1. 如果用户配置了别名，则使用用户配置的别名
 * 2. 如果用户没有配置别名，则根据上面的 "别名生成格式" 生成别名
 */
export default function getAliasListByAggregates(aggregates: AggregateConfig[]): string[] {
  const aliasCountMap: Record<string, number> = {};
  return _.map(aggregates, (agg) => {
    let alias = '';
    if (agg.alias && agg.alias.trim() !== '') {
      alias = agg.alias.trim();
    } else {
      const func = agg.func;
      switch (func) {
        case 'COUNT':
          alias = 'cnt';
          break;
        case 'CPS':
          alias = 'cps';
          break;
        case 'SUM':
          alias = 'sum';
          break;
        case 'AVG':
          alias = 'avg';
          break;
        case 'MIN':
          alias = 'min';
          break;
        case 'MAX':
          alias = 'max';
          break;
        case 'UNIQUE_COUNT':
          alias = 'unique_count';
          break;
        case 'EXIST_RATIO':
          alias = 'exist_ratio';
          break;
        case 'PERCENTILE':
          alias = `p${agg.percentile}`;
          break;
        case 'TOPN':
          alias = `top${agg.n}`;
          break;
        default:
          alias = '';
      }
    }

    // 处理别名冲突
    if (aliasCountMap[alias] === undefined) {
      aliasCountMap[alias] = 0;
    } else {
      aliasCountMap[alias] += 1;
      alias = `${alias}_${aliasCountMap[alias]}`;
    }

    return alias;
  });
}
