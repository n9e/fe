/**
 * SQL 宏由后端展开，形式为 `$__macroName(...)`。
 *
 * 前端只识别该保留语法并透传给后端，避免将其误认为仪表盘变量依赖。
 */
const SQL_MACRO_PATTERN = /\$(__[a-zA-Z0-9_]+)\s*\(/g;

export default function collectSqlMacroNames(value: unknown): Set<string> {
  const macroNames = new Set<string>();

  const collect = (item: unknown) => {
    if (typeof item === 'string') {
      for (const match of item.matchAll(SQL_MACRO_PATTERN)) {
        macroNames.add(match[1]);
      }
      return;
    }
    if (Array.isArray(item)) {
      item.forEach(collect);
      return;
    }
    if (item && typeof item === 'object') {
      Object.values(item).forEach(collect);
    }
  };

  collect(value);
  return macroNames;
}
