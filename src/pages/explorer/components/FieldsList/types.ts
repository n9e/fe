export interface Field {
  field: string;
  indexable: boolean;
  type: string;
  type2: string;
}

export interface StatsResult {
  topN: {
    value: any;
    percent: number;
    count: number;
  }[];
  stats: {
    min: number;
    max: number;
    avg: number;
    sum: number;
    unique_count: number;
  };
}
