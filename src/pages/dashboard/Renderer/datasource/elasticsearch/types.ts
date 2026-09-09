export interface ElasticsearchQuery {
  index: string;
  filter: string;
  filter_language?: 'lucene' | 'kql';
  syntax?: 'lucene' | 'kuery'; // 旧直连查询兼容；统一 query-batch 请求会转换为 filter_language
  date_field: string;
  interval?: string; // TODO: 是否可以为空？
  values: {
    func: string;
    field: string;
  }[];
  group_by: {
    cate: string;
    field?: string;
    min_doc_count?: number;
    size?: number;
    order?: string;
    order_by?: string;
  }[];
  start: number;
  end: number;
  limit?: number;
}
