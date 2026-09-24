import { formatString } from './formatString';

/**
 * `__` 前缀是保留命名空间：内置变量（$__interval）与后端/链接渲染展开的占位符
 * （$__timeFilter(ts)、$__time_format__、$__series_name 等）都落在这里。
 * 未解析出的保留名不参与变量校验，保持原有的原样透传行为。
 */
const RESERVED_NAME_PREFIX = '__';

export function extractDependencies(str: string, validVars?: Set<string>): string[] {
  // 正则表达式匹配$变量名格式
  // 匹配规则：
  // - 支持 $var 格式：$ 符号后跟一个或多个字母、数字、下划线
  // - 支持 ${var} 格式：$ 符号后跟大括号，内部为一个或多个字母、数字、下划线
  // - 支持 [[var]]，与变量插值支持的语法一致
  const regex = /\$\{([a-zA-Z0-9_]+)\}|\$([a-zA-Z0-9_]+)|\[\[([a-zA-Z0-9_]+)\]\]/g;
  let match;
  const dependencies = new Set<string>();

  while ((match = regex.exec(str)) !== null) {
    // 三个捕获组分别对应 ${var}、$var 和 [[var]]
    const varName = match[1] || match[2] || match[3];
    if (varName) {
      if (validVars && !validVars.has(varName)) {
        continue;
      }
      dependencies.add(varName);
    }
  }

  return Array.from(dependencies);
}

/** Finds absent references without inspecting substituted values or treating reserved backend placeholders as variables. */
export function getMissingVariableReferences(value: unknown, availableNames: Set<string>): string[] {
  const placeholders = Object.fromEntries(Array.from(availableNames, (name) => [name, '']));
  const missing = new Set<string>();
  const visit = (item: unknown) => {
    if (typeof item === 'string') {
      // Follow the same prefix matching as interpolation (for example $host_suffix).
      extractDependencies(formatString(item, placeholders)).forEach((name) => {
        if (!name.startsWith(RESERVED_NAME_PREFIX)) missing.add(name);
      });
    } else if (Array.isArray(item)) {
      item.forEach(visit);
    } else if (item && typeof item === 'object') {
      Object.values(item).forEach(visit);
    }
  };
  visit(value);
  return Array.from(missing);
}
