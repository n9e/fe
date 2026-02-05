export interface OptionsType {
  logMode: 'origin' | 'table';
  lineBreak: 'true' | 'false';
  lines: 'true' | 'false';
  time: 'true' | 'false';
  organizeFields?: string[];
  jsonDisplaType?: 'tree' | 'string';
  jsonExpandLevel?: number | null;
  pageLoadMode?: 'pagination' | 'infiniteScroll'; // 默认 pagination
}

export interface OnValueFilterParams {
  key: string;
  value: string;
  assignmentOperator?: ':' | '=';
  operator: 'AND' | 'NOT' | 'EXISTS';
  indexName?: string;
}
