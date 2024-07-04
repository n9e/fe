export interface ElasticsearchQuery {
  index: string;
  filter: string;
  syntax?: string; // lucene | kuery
  date_field: string;
  interval?: string; // TODO: 是否可以为空？
  values: {
    func: string;
    field: string;
  }[];
  group_by: {
    cate: string;
    field?: string;
    min_value?: number;
    size?: number;
    order?: string;
    orderBy?: string;
  }[];
  start: number;
  end: number;
  limit?: number;
}
