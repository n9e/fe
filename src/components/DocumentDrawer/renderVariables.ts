/**
 * 替换文档里的 {{key}} 占位符。
 *
 * 刻意用 {{key}} 而不是 ${key}：categraf 文档的代码块里有大量合法的 shell
 * ${VAR} 写法，用后者会误伤。未提供值的占位符原样保留，便于发现漏传。
 */
export default function renderVariables(md: string, variables?: Record<string, string | undefined>): string {
  if (!md || !variables) return md;
  return md.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (matched, key: string) => {
    const value = variables[key];
    return value === undefined || value === null ? matched : String(value);
  });
}
