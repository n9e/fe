export interface IVariable<QueryType = any> {
  name: string;
  label?: string;
  definition: string;
  fullDefinition?: string; // 转换变量后的完整表达式
  reg?: string;
  regex?: string; // v6 新增，用于 datasource 的正则过滤
  multi?: boolean;
  allOption?: boolean;
  allValue?: string;
  options?: {
    label: string;
    value: string;
  }[];
  type: 'query' | 'textbox' | 'custom' | 'constant' | 'datasource' | 'datasourceIdentifier' | 'hostIdent';
  defaultValue?: string | number; // textbox 和 datasource 的默认值
  datasource: {
    // v5.14.3 新增 datasource 储存数据源类型和名称
    // v6 必须有 datasource 字段
    cate: string;
    value?: number | string; // v6 之后改为用 datasourceId
  };
  config?: {
    // @deprecated 目前只有 ES 用到，后面改用标准的 query
    // v5.14.3 新增 config 字段，用于存储一些非常规的配置
    index: string; // elasticsearch 源的索引配置
    date_field: string; // elasticsearch 源的时间字段配置
  };
  value?: number | string | string[] | number; // 变量的值, 只有 datasource 的值是 number 类型
  hide?: boolean; // v6 新增，用于隐藏变量
  query?: QueryType; // v8 新增，用于规范各类数据的查询条件
}

export interface VariableExecutionMeta {
  name: string;
  dependencies: string[];
  executor: () => Promise<void>; // 执行函数，内部处理请求
  cleanup?: () => void; // 清理函数
}

// 依赖关系图
export interface DependencyGraph {
  [key: string]: string[]; // key: 变量名, value: 依赖它的变量列表
}
