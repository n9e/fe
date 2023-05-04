import _ from 'lodash';
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
  return replaceData(/\${__field\.(__value)}/g, url, dataValue);
};

const replaceNameVariables = (url, dataValue) => {
  return replaceData(/\${__field\.(__name)}/g, url, dataValue);
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
