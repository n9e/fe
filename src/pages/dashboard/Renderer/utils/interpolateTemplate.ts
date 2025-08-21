import _ from 'lodash';

import { IRawTimeRange } from '@/components/TimeRangePicker';

import { replaceFieldWithVariable, getOptionsList } from '../../VariableConfig/constant';

export default function interpolateTemplate(
  template: string,
  values: Record<string, any>,
  options: {
    dashboardMeta: {
      dashboardId: string;
      variableConfigWithOptions: any;
      graphTooltip: string;
      graphZoom: string;
    };
    time: IRawTimeRange;
  },
): string {
  if (!template) return '';

  const { dashboardMeta, time } = options;
  let interpolated = template;
  try {
    // 使用简单的字符串替换，支持带点的字段名
    interpolated = template;
    Object.keys(values).forEach((key) => {
      // 支持 ${key}、${ key}、${key }、${ key } 等格式的替换（考虑空格）
      const escapedKey = _.escapeRegExp(key);
      const placeholder = `\\$\\{\\s*${escapedKey}\\s*\\}`;
      interpolated = interpolated.replace(new RegExp(placeholder, 'g'), _.toString(values[key]));
    });
  } catch (error) {
    console.error('Error interpolating template:', error);
  }
  return replaceFieldWithVariable(interpolated, dashboardMeta.dashboardId, getOptionsList({ ...dashboardMeta, time }));
}
