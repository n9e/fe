export interface DataPoint {
  timestamp: number;
  value: number | null;
  [key: string]: null | string | number | boolean;
}

export type TableCellValue = string | number | boolean | null;

export interface TableFieldCalcs {
  min: number | null;
  max: number | null;
  avg: number | null;
  sum: number | null;
  last: number | null;
  variance: number | null;
  stdDev: number | null;
  count: number | null;
}

export interface TableFieldState {
  hide?: boolean;
  displayName?: string;
  calcs?: TableFieldCalcs;
}

export interface TableField {
  name: string;
  type: string;
  values: TableCellValue[];
  state: TableFieldState;
}

export interface TimeSeries {
  refId: string;
  name: string;
  labels: Record<string, string>;
  data: DataPoint[];
}

export interface TableData {
  refId: string;
  fields: TableField[];
}

export type QueryResult = TimeSeries | TableData;

// 转换接口
export interface Transformation {
  name: string;
  apply(input: QueryResult[]): QueryResult[];
}

export interface FilterOptions {
  fieldName?: string; // 字段名称（适用于表格数据）
  labelName?: string; // 标签名称（适用于时间序列数据）
  pattern: string | RegExp; // 过滤条件（字符串或正则表达式）
  include: boolean; // true: 包含匹配项, false: 排除匹配项
}
