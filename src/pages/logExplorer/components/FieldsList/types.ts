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
  // Sources return different subsets, or no metrics on failure. Display values
  // can be formatted strings; stack validation uses uniqueCount above instead.
  stats?: Record<string, number | string>;
}

export interface FieldActionOptions {
  index: Field;
  loading?: boolean;
  stats?: StatsResult['stats'];
  getUniqueCount?: () => Promise<number>;
  statsScope?: object;
  setTopNVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
