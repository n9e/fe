export interface Field {
  field: string;
  indexable: boolean;
  type: string;
  type2?: string;
  delimiters?: string[];
}
export interface IndexDataItem {
  field: string;
  indexable: boolean;
  type: string;
  type2?: string;
}

export interface Query {
  datasourceCate: string;
  datasourceValue: number;
  [key: string]: any;
}

export interface LogExplorerTabItem {
  key: string;
  isInited?: boolean;
  formValues?: any;
}

export interface DefaultFormValuesControl {
  isInited?: boolean;
  setIsInited: () => void;
  defaultFormValues?: any;
  setDefaultFormValues?: (query: any) => void;
}

export interface RenderCommonSettingsParams {
  getDefaultQueryValues?: (filterValues: Record<string, any>) => Record<string, any>;
  executeQuery: () => void;
}
export type RenderCommonSettings = ({ getDefaultQueryValues, executeQuery }: RenderCommonSettingsParams) => React.ReactNode;

export interface ClusteringItem {
  count?: number;
  parts?: Part[];
  uuid?: string;
}

export interface Part {
  data: string;
  part_id: number;
  /**
   * 类型，const 代表固定字符串，pattern 代表正则部分
   */
  type: string;
}

export interface ClusterPattern {
  /**
   * 唯一值个数
   */
  count: number;
  /**
   * 字段存在的日志比例
   */
  percentage: number;
  top5: Top5[];
}

export interface Top5 {
  count: number;
  percentage: number;
  /**
   * 值
   */
  value: string;
}
