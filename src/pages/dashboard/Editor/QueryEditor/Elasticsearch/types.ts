export interface ElasticsearchSelectOption {
  value: string;
}

export interface ElasticsearchIndexPattern {
  id: number | string;
  name: string;
  time_field?: string;
}

export interface ElasticsearchValueDefinition {
  ref: string;
  func: string;
  field?: string;
}
