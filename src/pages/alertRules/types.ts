export interface AlertRuleType<T> {
  id: number;
  group_id: number;
  name: string;
  disabled: AlertRuleStatus;
  append_tags: string[];
  rule_config: T;
  cate: string;
  datasource_ids: number[];
  prom_ql: string;
  prom_eval_interval: number;
  prom_for_duration: number;
  runbook_url: string;
  enable_status: boolean;
  enable_days_of_weekss: number[][];
  enable_stimes: number[];
  enable_etimes: number[];

  notify_channels: string[];
  notify_groups: string[];
  notify_recovered: number;
  recover_duration: number;
  notify_repeat_step: number;
  notify_max_number: number;
  callbacks: string[];
  annotations: any;
  prod: string;
  severities: number[];
}

export enum AlertRuleStatus {
  Enable = 0,
  UnEnable = 1,
}
