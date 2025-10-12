import { template } from 'lodash';

/**
 * 变量模板处理方法
 * 要支持以下格式
 * 1. $variableName
 * 2. ${variableName}
 * 3. [[variableName]]
 * @param str 需要处理的字符串
 * @param data 变量数据
 * @returns 处理后的字符串
 */
export function formatString(str: string, data: Record<string, any>): string {
  if (!str || typeof str !== 'string') {
    return str;
  }

  let processedStr = str;

  try {
    // 1. 处理 $variableName 格式 - 智能匹配变量边界
    processedStr = processedStr.replace(/\$([a-zA-Z0-9_]+)/g, (match, varName) => {
      // 如果变量存在，直接替换
      if (data.hasOwnProperty(varName)) {
        return `\${${varName}}`;
      }

      // 如果变量不存在，尝试匹配更短的变量名
      for (let i = varName.length - 1; i > 0; i--) {
        const shortVarName = varName.substring(0, i);
        if (data.hasOwnProperty(shortVarName)) {
          return `\${${shortVarName}}${varName.substring(i)}`;
        }
      }

      // 如果都没找到，保持原样
      return match;
    });

    // 2. 处理 [[variableName]] 格式 - 转换为 ${variableName}
    processedStr = processedStr.replace(/\[\[([a-zA-Z0-9_]+)\]\]/g, '${$1}');

    // 3. 使用 lodash template 处理 ${variableName} 格式
    const compiled = template(processedStr);
    return compiled(data);
  } catch (error) {
    // 如果处理失败，返回原字符串
    return str;
  }
}

export function formatDatasource(str: string, data: Record<string, any>): number | undefined {
  const result = formatString(str, data);
  if (!result) {
    console.error('数据源插值处理器解析失败');
    return;
  }
  if (isNaN(Number(result))) {
    console.error(`数据源插值处理器解析失败，结果 ${result} 不是数据源 ID`);
  }
  return Number(result);
}
