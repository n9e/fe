import type React from 'react';
import { Field } from '../../types';

export type { Field };

export interface StatsResult {
  // Raw cardinality for decisions; stats values may be formatted for display.
  uniqueCount?: number;
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

export interface FieldActionOptions {
  index: Field;
  loading?: boolean;
  stats?: { [index: string]: number };
  getUniqueCount?: () => Promise<number>;
  statsScope?: object;
  setTopNVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
