import i18next from 'i18next';

import { IS_PLUS, AccessTokenKey } from '@/utils/constant';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { basePrefix } from '@/App';

import { Item, Stats } from './types';

export type { Item, Stats };

export function getList(params: {
  query?: string;
  gids?: string;
  limit: number;
  p: number;
  hosts?: string;
  auth_level?: string; // 逗号分隔的授权等级，如 '1,2,3'
  downtime?: number;
  agent_versions?: string;
}): Promise<{ list: Item[]; total: number }> {
  const url = IS_PLUS ? '/api/n9e-plus/targets' : '/api/n9e/targets';
  return request(url, {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}

export function getStats(params: { gids?: string }): Promise<Stats> {
  return request('/api/n9e/targets/stats', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}

export const putAiTaskConfigs = function (data: {
  idents: string[];
  auth_level: number; // 0、1、2、3
}): Promise<{
  [host: string]: string;
}> {
  return request('/api/n9e-plus/ai-task-configs', {
    method: RequestMethod.Put,
    data,
  }).then((res) => res.dat ?? []);
};

export interface CategrafInstallMeta {
  /** 服务端是否内置了 categraf 安装包 */
  bundled: boolean;
  version: string;
  arches: string[];
  /** agent 接口是否开启了 basic auth（仅布尔，不含凭据） */
  basic_auth: boolean;
  /** 服务端按本次请求推导出的自身地址 */
  base_url: string;
  script_url: string;
  /** 服务端是否支持采集配置脚本（collect.sh），决定「配置采集」入口是否出现 */
  collect: boolean;
  /**
   * 机器指标最终落到哪些数据源：服务端拿 pushgw 的 writer 地址与数据源配置做匹配得出。
   * 写入路径才是「数据在哪」的直接答案，比前端拿 engine_name/cluster_name 反推可靠。
   * 但 URL 匹配本身是模糊的（writer 带 /api/v1/write、容器内外域名不同），所以它只是
   * 默认值而非唯一真相 —— 验证步骤会把数据源选择器暴露给用户，猜错也能一键切换。
   * 老服务端不返回该字段，取空数组由调用方降级。
   */
  metric_datasource_ids: number[];
}

// 一个 SPA 会话内只探测一次，确定性结果（含「不支持」的 null）复用到底；
// 网络层失败不缓存，留给下次挂载重试，避免一次瞬断让入口整个会话消失
let categrafMetaPromise: Promise<CategrafInstallMeta | null> | undefined;

/**
 * 探测后端是否支持 categraf 一键安装，不支持时返回 null 由调用方降级。
 *
 * 刻意不走 @/utils/request：老后端没有这个路由，会交给 SPA 兜底返回 200 + text/html，
 * 而 request 的响应拦截器对 200 无条件 .json()，抛出的原生 SyntaxError 上没有 silence
 * 字段，errorHandler 会照样弹 notification.error —— 调用方传 silence: true 也拦不住。
 * 那会让每个老后端用户一打开机器列表页就看到一个红色报错。
 */
export function getCategrafInstallMeta(): Promise<CategrafInstallMeta | null> {
  if (IS_PLUS) return Promise.resolve(null); // 企业版有自己的采集器接入体系
  if (!categrafMetaPromise) {
    categrafMetaPromise = fetch(`${basePrefix}/api/n9e/agents/categraf/meta`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem(AccessTokenKey) || ''}`,
        'X-Language': i18next.language,
      },
    })
      .then(async (res) => {
        if (!res.ok) return null;
        // SPA 兜底返回的是 HTML，content-type 与首字符两道判断
        if (!(res.headers.get('content-type') || '').includes('json')) return null;
        const text = await res.text();
        if (/^\s*</.test(text)) return null;
        const dat = JSON.parse(text)?.dat;
        if (!dat || typeof dat.version !== 'string') return null;
        return {
          bundled: !!dat.bundled,
          version: dat.version,
          arches: Array.isArray(dat.arches) ? dat.arches : [],
          basic_auth: !!dat.basic_auth,
          base_url: dat.base_url || '',
          script_url: dat.script_url || '',
          collect: !!dat.collect,
          // 老服务端没有该字段；数组元素也逐个过一遍类型，避免脏数据混进数据源 id
          metric_datasource_ids: Array.isArray(dat.metric_datasource_ids) ? dat.metric_datasource_ids.filter((id) => typeof id === 'number') : [],
        } as CategrafInstallMeta;
      })
      .catch(() => {
        // 按「不支持」降级：这个探测决定安装入口是否出现，失败时不缓存，下次进入再探一次
        categrafMetaPromise = undefined;
        return null;
      }); // 这个 promise 永不 reject
  }
  return categrafMetaPromise;
}

/**
 * 一键安装弹窗里的轮询探测。
 * 刻意不带 gids：新装的机器默认未归组，若沿用列表当前选中的业务组会永远探测不到。
 * 后端在 gids 为空时会给非 admin 用户自动补上「未归组」，所以普通用户同样可见。
 */
export function probeTargets(params?: { gids?: string; limit?: number }): Promise<{ total: number; list: Item[] } | null> {
  const url = IS_PLUS ? '/api/n9e-plus/targets' : '/api/n9e/targets';
  return request(url, {
    method: RequestMethod.Get,
    params: { p: 1, limit: params?.limit ?? 1, gids: params?.gids },
    silence: true, // silence 会把原始 error 抛回来，所以下面必须自己 catch
  })
    .then((res) => ({ total: res?.dat?.total ?? 0, list: (res?.dat?.list ?? []) as Item[] }))
    .catch(() => {
      return null;
    });
}
