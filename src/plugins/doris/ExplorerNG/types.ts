import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';
import { Field as BaseField } from '@/pages/logExplorer/types';

export type HandleValueFilterParams = (params: OnValueFilterParams) => void;

export interface FilterConfig {
  field?: string;
  operator?: string; // 可能没有对应字段类型的操作符
  value?: string | number | Array<string | number>;
}

export interface AggregateConfig {
  func?: string;
  field?: string;
  percentile?: number; // for PERCENTILE
  precision?: number; // for PERCENTILE, EXIST_RATIO
  n?: number; // top n
  alias?: string;
}

export interface OrderByConfig {
  field?: string;
  direction?: 'asc' | 'desc';
}

export interface Field extends BaseField {
  normalized_type?: string;
  index?: {
    index_name: string;
    index_type: 'NGRAM_BF' | 'INVERTED'; // NGRAM_BF 代表字段上有 NGram BloomFilter 索引; INVERTED 代表字段上有倒排索引
    properties: {
      parser: string; // 不为空则表示有分词
      support_phrase: boolean; // true 代表支持 MATCH_PHRASE_xxx 系列
    };
  };
}

export interface FieldSampleParams {
  cate: string;
  datasource_id: number;
  database: string;
  table: string;
  time_field: string;
  query?: string;
  default_field?: string;
  filters: FilterConfig[];
  from: number;
  to: number;
  limit: number;
}
