import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface TplPayloadBrief {
  uuid: number;
  name: string;
}

export interface TplDashboard {
  uuid: number;
  name: string;
  sentinels: string[];
}

export interface TplAlertGroup {
  /** 采集器变体标识，如 redis_by_categraf */
  cate: string;
  sentinels: string[];
  rules: TplPayloadBrief[];
}

export interface TplMatchedComponent {
  component_id: number;
  component: string;
  dashboards: TplDashboard[] | null;
  alert_groups: TplAlertGroup[] | null;
}

/** 后端按长度切批的 instant query 完成全部组件的哨兵探测，见 center/router/router_template_match.go */
const doTemplateMatch = (id: number): Promise<TplMatchedComponent[]> => {
  return request('/api/n9e/datasource/template-match', {
    method: RequestMethod.Post,
    data: { id },
    silence: true,
  }).then((res) => _.get(res, 'dat.matched') || []);
};

/**
 * 刚保存的数据源，后端 Prometheus 客户端有约 1 秒的重建窗口，
 * 此间接口返回「prometheus client not ready」。首次失败时自动重试一次，
 * 避免用户在保存结果页看不到组件卡片。
 */
export const postTemplateMatch = (id: number): Promise<TplMatchedComponent[]> => {
  return doTemplateMatch(id).catch(
    () =>
      new Promise<TplMatchedComponent[]>((resolve, reject) => {
        setTimeout(() => {
          doTemplateMatch(id).then(resolve, reject);
        }, 1800);
      }),
  );
};

/** 从 alert group cate（redis_by_categraf）里解析采集器变体名，仅用于展示 */
export function parseVariant(cate: string): string | undefined {
  const m = /_by_([a-z0-9]+)$/i.exec(cate);
  return m ? m[1] : undefined;
}
