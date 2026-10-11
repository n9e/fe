export type InterpolationValue = string | number | boolean | null | undefined;

export interface VariableInterpolationMetadata {
  defaultValue: InterpolationValue;
  values: string[];
  texts: string[];
  allValue?: string;
  isAll?: boolean;
}

export const VARIABLE_INTERPOLATION_METADATA = Symbol('variableInterpolationMetadata');

export type InterpolationData = Record<string, InterpolationValue> & {
  [VARIABLE_INTERPOLATION_METADATA]?: Record<string, VariableInterpolationMetadata>;
};

export interface FormatStringOptions {
  enableDorisSqlLike?: boolean;
}

const DORIS_SQL_FIELD_PATTERN = /^(?:`[^`]+`|[a-zA-Z_][a-zA-Z0-9_]*)(?:\.(?:`[^`]+`|[a-zA-Z_][a-zA-Z0-9_]*))*$/;
const DORIS_SQL_LIKE_FORMATS = new Set(['sql_like_or', 'sql_like_and']);

function hasOwn(data: InterpolationData, key: string) {
  return Object.prototype.hasOwnProperty.call(data, key);
}

function getInterpolation(data: InterpolationData, name: string): VariableInterpolationMetadata | undefined {
  const metadata = data[VARIABLE_INTERPOLATION_METADATA]?.[name];
  if (metadata) return metadata;
  if (!hasOwn(data, name)) return undefined;

  const value = data[name];
  const normalizedValue = value == null ? '' : String(value);
  return {
    defaultValue: value,
    values: [normalizedValue],
    texts: [normalizedValue],
  };
}

function escapeRegex(value: string) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

function escapeLucene(value: string) {
  return value.replace(/[+\-!(){}[\]^"~*?:\\/]|&&|\|\|/g, '\\$&');
}

function formatGlob(values: string[]) {
  if (values.length <= 1) return values[0] ?? '';
  return `{${values.join(',')}}`;
}

function encodeUrlValue(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function formatQueryParams(name: string, values: string[], prefix = '') {
  return values.map((value) => `${name}=${encodeUrlValue(`${prefix}${value}`)}`).join('&');
}

function formatVariable(name: string, format: string | undefined, args: string[], interpolation: VariableInterpolationMetadata) {
  if (!format) return String(interpolation.defaultValue ?? '');

  const normalizedFormat = format.toLowerCase();
  if (interpolation.isAll && interpolation.allValue && normalizedFormat !== 'text' && normalizedFormat !== 'percentencode') {
    return interpolation.allValue;
  }

  const { values, texts } = interpolation;
  switch (normalizedFormat) {
    case 'csv':
    case 'raw':
      return values.join(',');
    case 'distributed':
      return values.map((value, index) => (index === 0 ? value : `${name}=${value}`)).join(',');
    case 'doublequote':
      return values.map((value) => `"${value.replace(/"/g, '\\"')}"`).join(',');
    case 'glob':
      return formatGlob(values);
    case 'join':
      return values.join(args[0] ?? ',');
    case 'json':
      return JSON.stringify(values);
    case 'lucene':
      if (values.length <= 1) return values[0] ? `"${escapeLucene(values[0])}"` : '';
      return `(${values.map((value) => `"${escapeLucene(value)}"`).join(' OR ')})`;
    case 'percentencode':
      return encodeUrlValue(interpolation.isAll && interpolation.allValue ? interpolation.allValue : values.join(','));
    case 'pipe':
      return values.join('|');
    case 'queryparam':
      return formatQueryParams(`var-${name}`, values);
    case 'customqueryparam':
      return formatQueryParams(args[0] || `var-${name}`, values, args[1] || '');
    case 'regex':
      if (values.length <= 1) return values[0] ? escapeRegex(values[0]) : '';
      return `(${values.map(escapeRegex).join('|')})`;
    case 'singlequote':
      return values.map((value) => `'${value.replace(/'/g, "\\'")}'`).join(',');
    case 'sqlstring':
      return values.map((value) => `'${value.replace(/'/g, "''")}'`).join(',');
    case 'text':
      return interpolation.isAll ? 'All' : texts.join(' + ');
    default:
      return formatGlob(values);
  }
}

function formatDorisSqlLike(format: string, fieldName: string | undefined, interpolation: VariableInterpolationMetadata) {
  if (!fieldName || !DORIS_SQL_FIELD_PATTERN.test(fieldName)) return undefined;
  if (interpolation.isAll && interpolation.allValue) return interpolation.allValue;

  const separator = format === 'sql_like_or' ? ' OR ' : ' AND ';
  return interpolation.values.map((value) => `${fieldName} LIKE '${`%${value}%`.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`).join(separator);
}

function replaceVariableExpression(match: string, expression: string, data: InterpolationData, options: FormatStringOptions) {
  const [name, format, ...args] = expression.split(':');
  const interpolation = getInterpolation(data, name);
  if (!interpolation) return match;

  if (format && DORIS_SQL_LIKE_FORMATS.has(format)) {
    if (!options.enableDorisSqlLike) return match;
    return formatDorisSqlLike(format, args[0], interpolation) ?? match;
  }

  return formatVariable(name, format, args, interpolation);
}

/**
 * 支持 $variableName、${variableName}、${variableName:format} 及兼容的 [[variableName:format]]。
 * 无格式插值继续使用数据源相关的默认值；带格式插值使用变量原始 value/text 列表。
 */
export function formatString(str: string, data: InterpolationData, options: FormatStringOptions = {}): string {
  if (!str || typeof str !== 'string') return str;

  try {
    const processedDollarVariables = str.replace(/\$([a-zA-Z0-9_]+)/g, (match, varName) => {
      if (hasOwn(data, varName)) return `\${${varName}}`;

      for (let index = varName.length - 1; index > 0; index -= 1) {
        const shortName = varName.substring(0, index);
        if (hasOwn(data, shortName)) return `\${${shortName}}${varName.substring(index)}`;
      }
      return match;
    });

    const processedDoubleBrackets = processedDollarVariables.replace(/\[\[([^\]]+)\]\]/g, (match, expression) => {
      return replaceVariableExpression(match, expression, data, options);
    });

    return processedDoubleBrackets.replace(/\$\{([^}]+)\}/g, (match, expression) => {
      return replaceVariableExpression(match, expression, data, options);
    });
  } catch {
    return str;
  }
}

export function formatDatasource(value: string | number | undefined, data: InterpolationData): number | undefined {
  if (typeof value === 'number') return value;
  if (value === undefined) return undefined;

  const result = formatString(value, data);
  if (!result) {
    console.warn('数据源插值处理器解析失败');
    return;
  }
  if (isNaN(Number(result))) {
    console.warn(`数据源插值处理器解析失败，结果 ${result} 不是数据源 ID`);
  }
  return Number(result);
}
