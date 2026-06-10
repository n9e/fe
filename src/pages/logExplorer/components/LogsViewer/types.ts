export interface OptionsType {
  logMode: 'origin' | 'table' | 'clustering';
  lineBreak: 'true' | 'false';
  reverse: 'true' | 'false';
  lines: 'true' | 'false';
  time: 'true' | 'false';
  organizeFields?: string[];
  jsonDisplaType?: 'tree' | 'string';
  jsonExpandLevel?: number | null;
  pageLoadMode?: 'pagination' | 'infiniteScroll'; // 默认 pagination
  topNumber?: number; // 默认 5
}

export type FieldValueType = string | number | boolean | null;

export interface OnValueFilterParams {
  key: string;
  value: FieldValueType;
  assignmentOperator?: ':' | '=';
  operator: 'AND' | 'NOT' | 'EXISTS';
  indexName?: string;
}
