import { IRawTimeRange } from '@/components/TimeRangePicker';

// CardDimension 是聚合卡片身份里的一个维度（与后端 models.CardDimension 对应）。
// type 为 field / tagkey / template，value 为取值结果（空值后端会归为 "Others"）。
export interface CardDimension {
  type: string;
  field: string;
  value: string;
}

// CardSelection 表示选中某张聚合卡片的"身份"：在某个聚合视图(view_id)下各维度的取值。
// 用它替代回传海量 event_id，避免请求 URL 超长被 nginx 返回 414。
export interface CardSelection {
  view_id: number;
  dimensions: CardDimension[];
}

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
  selections?: CardSelection[];
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
  dimensions: CardDimension[];
}
