export interface OptionsType {
  logMode: 'origin' | 'table';
  lineBreak: 'true' | 'false';
  lines: 'true' | 'false';
  time: 'true' | 'false';
  organizeFields: string[];
  jsonDisplaType: 'tree' | 'string';
  jsonExpandLevel: number | null;
  pageLoadMode?: 'pagination' | 'infiniteScroll'; // 默认 pagination
}
