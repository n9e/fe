import _ from 'lodash';
import { replaceFieldWithVariable, getOptionsList } from '../../VariableConfig/constant';
import { IRawTimeRange } from '@/components/TimeRangePicker';

const replaceLabelsVariables = (url, variables) => {
  // 匹配 ${} 中的变量名
  const pattern = /\${__field\.labels\.(.*?)}/g;
  return url.replace(pattern, (match, variable) => {
    // 获取变量的值
    const value = variables[variable.trim()];
    // 如果变量值存在，则替换；否则保留原字符串
    return value !== undefined ? value : match;
  });
};

const replaceValueVariables = (url, dataValue) => {
  return replaceData(/\${__field\.(value)}/g, url, dataValue);
};

const replaceNameVariables = (url, dataValue) => {
  return replaceData(/\${__field\.(name)}/g, url, dataValue);
};

const replaceData = (pattern: RegExp, url, dataValue) => {
  return url.replace(pattern, (match, _) => {
    const value = dataValue; // 获取变量的值
    return value !== undefined ? value : match;
  });
};

export const replaceExpressionDetail = (url, data) => {
  let resultUrl = url;
  resultUrl = data?.name ? replaceNameVariables(resultUrl, data.name) : resultUrl;
  resultUrl = data?.value ? replaceValueVariables(resultUrl, data.value) : resultUrl;
  resultUrl = data?.metric ? replaceLabelsVariables(resultUrl, data.metric) : resultUrl;
  return resultUrl;
};

/**
 *  获取下钻的最终URL
 * @param detailUrl 下钻链接模版
 * @param data 指标数据
 * @param dashboardMeta 大盘嘻嘻
 * @param time  时间范围
 * @returns 要跳转的下钻链接
 */
export const getDetailUrl = (
  detailUrl: string,
  data: any,
  dashboardMeta: {
    dashboardId: string;
    variableConfigWithOptions: any;
  },
  time: IRawTimeRange,
) => {
  if (!detailUrl) {
    return;
  }
  // 指标数据
  const formatUrl = data ? replaceExpressionDetail(detailUrl, data) : detailUrl;
  // 渲染下钻链接, 变量
  return replaceFieldWithVariable(formatUrl, dashboardMeta.dashboardId, getOptionsList(dashboardMeta, time));
};
