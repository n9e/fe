/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const getAlertRulePure = (id: number) => {
  return request(`/api/n9e/alert-rule/${id}/pure`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => res.dat);
};

export const rulesClone = (gid, data) => {
  return request(`/api/n9e/busi-group/${gid}/alert-rules/clone`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const rulesClones = (data) => {
  return request('/api/n9e/busi-groups/alert-rules/clones', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const alertRulesNotifyTryrun = (data) => {
  return request('/api/n9e/busi-group/alert-rules/notify-tryrun', {
    method: RequestMethod.Post,
    data,
  });
};

export const alertRulesEnableTryrun = (data) => {
  return request('/api/n9e/busi-group/alert-rules/enable-tryrun', {
    method: RequestMethod.Post,
    data,
  });
};

export const alertRuleTestFire = (bgid: number, data) => {
  return request(`/api/n9e/busi-group/${bgid}/alert-rule/test-fire`, {
    method: RequestMethod.Post,
    data,
  });
};

export const getTimezones = (): Promise<string[]> => {
  return request('/api/n9e/timezones', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export interface EvalSeriesSample {
  labels: Record<string, string>;
  points: [number, number][]; // [ts(秒), value]
}

export interface EvalQueryRecord {
  ref: string;
  query: string;
  duration_ms: number;
  error?: string;
  warnings?: string[];
  series_total: number;
  series?: EvalSeriesSample[];
  var_query?: boolean;
}

export interface EvalAnomalyBrief {
  key: string;
  value: number;
  severity: number;
  trigger_type?: string;
  recover?: boolean;
}

// 事件在一个裁决点的结论；同一 hash 同周期可能有多条，按顺序构成处理轨迹
export interface EvalEventTrail {
  hash: string;
  tags?: string;
  severity?: number;
  stage: string; // drop_by_pipeline/muted/muted_notify_only/muted_by_hook/pending/inhibited/fired/stalled/notify_muted/recovered/push_queue_failed
  detail?: string;
}

export interface EvalRecord {
  ts: number; // 毫秒
  rule_id: number;
  datasource_id: number;
  duration_ms: number;
  error?: string;
  queries?: EvalQueryRecord[];
  anomalies?: EvalAnomalyBrief[];
  events?: EvalEventTrail[];
  anomaly_total: number;
  recover_total: number;
  fired: number;
  muted: number;
  drop_by_pipeline: number;
  pending: number;
  inhibited: number;
  truncated?: boolean;
}

// 单个引擎节点查询失败信息（如 edge 节点不可达），可登录该节点本机访问 /v1/n9e/eval-records 查看
export interface EvalRecordsNodeErr {
  instance: string;
  datasource_id: number;
  error: string;
}

// 查询告警规则的评估执行记录（存储于告警引擎本地磁盘，默认保留 8 天）
export const getAlertRuleEvalRecords = (
  id: number,
  params: { from?: number; to?: number; before?: number; limit?: number; datasource_id?: number },
  // disabled_instances：未开启 evallog 的引擎节点，后端同时会在 errors 里给出可读原因，
  // 便于区分「该节点没开这个功能」与「该时间段确实没有记录」
): Promise<{ list: EvalRecord[]; instances?: string[]; errors?: EvalRecordsNodeErr[]; disabled_instances?: string[] }> => {
  return request(`/api/n9e/alert-rule/${id}/eval-records`, {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
};
