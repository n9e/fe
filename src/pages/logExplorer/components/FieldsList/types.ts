import { Field } from '../../types';

export type { Field };

export interface StatsResult {
  topNumber?: number;
  topN: {
    value: any;
    percent: number;
    count?: number;
  }[];
  stats?: {
    min: number;
    max: number;
    avg: number;
    sum: number;
    unique_count: number;
  };
}
