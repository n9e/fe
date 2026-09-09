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
  name?: string;
  isInited?: boolean;
  formValues?: any;
  /** 新增页签标记：仅运行时存在（不持久化），激活时跳过自动查询 */
  isNewTab?: boolean;
}

export interface DefaultFormValuesControl {
  isInited?: boolean;
  setIsInited: () => void;
  defaultFormValues?: any;
  setDefaultFormValues?: (query: any) => void;
  /** P2 方案A：页签切走时快照当前表单值（含未执行的修改），供 LRU 换出后恢复 */
  onSnapshot?: (formValues: any) => void;
  /** 新增页签激活时不自动查询（只恢复查询条件）；刷新/切回等其余恢复场景自动查询 */
  isNewTab?: boolean;
}

export interface RenderCommonSettingsParams {
  getDefaultQueryValues?: (filterValues: Record<string, any>) => Record<string, any>;
  executeQuery: () => void;
  layout?: 'horizontal' | 'vertical';
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
  field: string;
  /**
   * 类型，const 代表固定字符串，pattern 代表正则部分
   */
  type: 'const' | 'pattern';
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
