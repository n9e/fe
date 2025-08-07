export interface DataPoint {
  timestamp: number;
  value: number;
  [key: string]: null | string | number | boolean;
}

export interface TimeSeries {
  refId: string;
  name: string;
  labels: Record<string, string>;
  data: DataPoint[];
}

export interface TableData {
  refId: string;
  fields: {
    name: string;
    type: string; // 'string' | 'number' | 'time'
    values: (string | number | null)[];
    state: {
      hide?: boolean; // 是否隐藏该字段
      displayName?: string; // 显示名称
      calcs?: {
        min: number | null;
        max: number | null;
        avg: number | null;
        sum: number | null;
        last: number | null;
        variance: number | null;
        stdDev: number | null;
        count: number | null;
      };
    };
  }[];
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
