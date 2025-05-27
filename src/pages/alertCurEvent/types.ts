import { IRawTimeRange } from '@/components/TimeRangePicker';

export interface FilterType {
  my_groups: 'true' | 'false'; // 兼容 Segmented 组件
  range?: IRawTimeRange;
  datasource_ids?: number[];
  bgid?: number;
  severity?: number[];
  query?: string;
  is_recovered?: number;
  rule_prods?: string[];
  aggr_rule_id?: number;
  event_ids?: number[];
}

export interface AggrRuleType {
  id: number;
  name: string;
  rule: string;
  cate: number;
  create_at: number;
  create_by: number;
  update_at: number;
}

export interface CardType {
  severity: number;
  title: string;
  total: number;
  event_ids: number[];
}
