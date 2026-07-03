import type { Page } from '@playwright/test';

export interface DatasourceQueryConfig {
  match_type: number;
  op: string;
  values?: number[];
}

export interface AlertRuleConfig {
  group_id: number;
  cate: string;
  datasource_ids: number[];
  datasource_queries: DatasourceQueryConfig[];
  name: string;
  note?: string;
  prod: string;
  algorithm?: string;
  algo_params?: unknown;
  delay: number;
  severity: number;
  severities: number[];
  disabled: number;
  prom_for_duration: number;
  prom_ql?: string;
  rule_config: Record<string, unknown>;
  event_relabel_config?: unknown;
  prom_eval_interval: number;
  enable_stime: string;
  enable_stimes: string[];
  enable_etime: string;
  enable_etimes: string[];
  enable_days_of_week: string[];
  enable_days_of_weeks: string[][];
  enable_in_bg: number;
  notify_recovered: number;
  notify_channels: string[];
  notify_groups_obj: unknown[];
  notify_groups: Array<number | string>;
  notify_repeat_step: number;
  notify_max_number: number;
  recover_duration: number;
  callbacks: unknown[];
  runbook_url: string;
  append_tags: unknown[];
  annotations: Record<string, unknown>;
  extra_config: Record<string, unknown>;
  cron_pattern: string;
  time_zone: string;
  notify_rule_ids: number[];
  pipeline_configs: Array<Record<string, unknown>>;
  notify_version: number;
  [key: string]: unknown;
}

export interface NormalizedDatasourceQuery {
  matchTypeName: string;
  opName: string;
  datasourceNames: string[];
}

export interface NormalizedQuery {
  ref?: string;
  indexPatternName?: string;
  promQl?: string;
  query?: string;
  sql?: string;
  severityName?: string;
  [key: string]: unknown;
}

export interface NormalizedRelabelConfig {
  action: string;
  regex: string;
  replacement: string;
  separator: string;
  sourceLabels: string[];
  targetLabel: string;
}

export interface NormalizedTimeRange {
  start: string;
  end: string;
  daysOfWeek: string[];
}

export interface NormalizedServiceCalConfig {
  serviceCalNames: string[];
  timeRange: { start: string; end: string };
}

export interface NormalizedAnnotation {
  key: string;
  value: string;
}

export interface NormalizedAlertRuleConfig {
  name: string;
  note?: string;
  groupName: string;
  cate: string;
  cateName: string;
  ruleVersionName?: string;
  queryHandlerKey: string;
  datasourceQueries: NormalizedDatasourceQuery[];
  queries: NormalizedQuery[];
  triggers: Array<Record<string, unknown>>;
  ruleConfig: Record<string, unknown>;
  promForDuration: number;
  cronPattern: string;
  effectiveIsDefault: boolean;
  notifyIsDefault: boolean;
  notifyRuleNames: string[];
  notifyGroupNames: string[];
  notifyChannelLabels: string[];

  // Pipeline / Event processing
  pipelineNames: string[];
  pipelineConfigs: Array<{ pipelineId: number; enable: boolean }>;
  eventRelabelConfigs: NormalizedRelabelConfig[];

  // Annotations & tags
  annotations: Record<string, string>;
  annotationEntries: NormalizedAnnotation[];
  appendTagStrings: string[];

  // Effective config
  timeZoneName?: string;
  enableInBg: boolean;
  effectiveTimeRanges: NormalizedTimeRange[];

  // Service calendar
  serviceCalNames: string[];
  serviceCalConfigs: NormalizedServiceCalConfig[];

  // Notify config
  notifyRecovered: boolean;
  recoverDuration: number;
  notifyRepeatStep: number;
  notifyMaxNumber: number;
}

import type { MidsceneFixtureMethods } from '../types';

export type AlertRuleConditionHandlerArgs = {
  page: Page;
  uiConfig: NormalizedAlertRuleConfig;
} & Partial<MidsceneFixtureMethods>;

export type AlertRuleConditionHandler = (args: AlertRuleConditionHandlerArgs) => Promise<void>;
