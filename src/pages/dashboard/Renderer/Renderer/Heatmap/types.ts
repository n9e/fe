export interface HeatmapColorOptions {
  scheme: string;
  steps: number; // 2-128
  reverse: boolean;
  colorDomainAuto: boolean;
  min?: number;
  max?: number;
}
