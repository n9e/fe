import i18next from 'i18next';
import _ from 'lodash';

import { getNotificationChannelTypes } from '@/pages/notificationChannels/constants';
import { getItems as getChannelItems, getSimplifiedItems as getSimplifiedChannelItems, postItems as postChannelItems, ChannelItem } from '@/pages/notificationChannels/services';
import { getItems as getTemplateItems } from '@/pages/notificationTemplates/services';

import { getItems as getRuleItems, postItems as postRuleItems } from '../../services';
import { NS } from '../../constants';

/** 本模块运行在 React 组件之外，文案统一走 i18next */
const tt = (key: string, options?: Record<string, unknown>): string => i18next.t(`rule_select.quick_create.${key}`, { ns: NS, ...options }) as string;

/**
 * 快捷创建自身的业务错误（识别失败/缺权限等），需要调用方 toast 展示；
 * 接口层错误由 utils/request 统一弹 notification，调用方不应重复提示。
 */
export class QuickCreateError extends Error {}

export type QuickCreateIdent = 'dingtalk' | 'wecom' | 'feishucard' | 'larkcard' | 'flashduty';

interface ImSpec {
  channelName: string; // 内置媒介名，创建媒介和生成规则名时使用
  paramKey: string; // 规则 notify_configs[].params 中承载 token 的键名
}

/** IM 渠道规格。token 存在通知规则的 params 里，媒介本身可复用内置项 */
const IM_SPEC: Record<Exclude<QuickCreateIdent, 'flashduty'>, ImSpec> = {
  dingtalk: { channelName: 'Dingtalk', paramKey: 'access_token' },
  wecom: { channelName: 'Wecom', paramKey: 'key' },
  feishucard: { channelName: 'Feishu Card', paramKey: 'access_token' },
  larkcard: { channelName: 'Lark Card', paramKey: 'token' },
};

export interface ParsedWebhook {
  ident: QuickCreateIdent;
  channelName: string;
  /** IM 渠道的 token，或 Flashduty 的 integration_key */
  token: string;
  /** IM 专用：token 在规则 params 中的键名 */
  paramKey?: string;
  /** Flashduty 专用：完整集成地址，落在媒介 request_config 上 */
  integrationUrl?: string;
}

function tokenSuffix(token: string) {
  return token.length >= 4 ? token.slice(-4) : token;
}

/** Flashduty 集成地址形态判断。兼容自建部署（仅路径特征）与官方云（flashcat.cloud 域名） */
function isFlashdutyUrlShape(parsed: URL): boolean {
  const host = parsed.host.toLowerCase();
  const path = parsed.pathname || '';
  const key = parsed.searchParams.get('integration_key') || '';
  return path.includes('/event/push/alert') || (host.includes('flashcat.cloud') && path.includes('/event/push')) || (Boolean(key) && host.includes('flashcat.cloud'));
}

/**
 * 识别粘贴的 Webhook / 集成地址。识别失败抛出带 i18n 文案的 Error。
 * Flashduty 判定必须在 IM 之前：自建 Flashduty 的域名不可枚举，只能靠路径特征。
 */
export function parseWebhookInput(rawUrl: string): ParsedWebhook {
  // 粘贴场景常带中英文尾部标点，先清理
  const url = rawUrl.trim().replace(/[，,；;。]+$/, '');
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new QuickCreateError(tt('invalid_url'));
  }

  if (isFlashdutyUrlShape(parsed)) {
    const key = parsed.searchParams.get('integration_key') || '';
    if (!key) throw new QuickCreateError(tt('missing_param', { key: 'integration_key' }));
    return { ident: 'flashduty', channelName: 'FlashDuty', token: key, integrationUrl: url };
  }

  const host = parsed.host.toLowerCase();
  const path = parsed.pathname || '';

  if (host.includes('oapi.dingtalk.com') && path.includes('/robot/send')) {
    const token = parsed.searchParams.get('access_token') || '';
    if (!token) throw new QuickCreateError(tt('missing_param', { key: 'access_token' }));
    return { ident: 'dingtalk', channelName: IM_SPEC.dingtalk.channelName, paramKey: IM_SPEC.dingtalk.paramKey, token };
  }
  if (host.includes('qyapi.weixin.qq.com') && path.includes('/webhook/send')) {
    const key = parsed.searchParams.get('key') || '';
    if (!key) throw new QuickCreateError(tt('missing_param', { key: 'key' }));
    return { ident: 'wecom', channelName: IM_SPEC.wecom.channelName, paramKey: IM_SPEC.wecom.paramKey, token: key };
  }
  // 飞书 / Lark 的 token 在 path 末段，不在 query
  if (host.includes('open.feishu.cn') && path.includes('/bot/v2/hook/')) {
    const token = path.replace(/\/+$/, '').split('/').pop() || '';
    if (!token) throw new QuickCreateError(tt('missing_param', { key: 'hook token' }));
    return { ident: 'feishucard', channelName: IM_SPEC.feishucard.channelName, paramKey: IM_SPEC.feishucard.paramKey, token };
  }
  if (host.includes('open.larksuite.com') && path.includes('/bot/v2/hook/')) {
    const token = path.replace(/\/+$/, '').split('/').pop() || '';
    if (!token) throw new QuickCreateError(tt('missing_param', { key: 'hook token' }));
    return { ident: 'larkcard', channelName: IM_SPEC.larkcard.channelName, paramKey: IM_SPEC.larkcard.paramKey, token };
  }

  throw new QuickCreateError(tt('unrecognized'));
}

export type ParseResult = { ok: true; parsed: ParsedWebhook } | { ok: false; error: string };

/** 不抛错版本，供输入联动的实时识别反馈使用 */
export function tryParseWebhookInput(rawUrl: string): ParseResult {
  try {
    return { ok: true, parsed: parseWebhookInput(rawUrl) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** 根据 URL 生成默认规则名（渠道名-token 尾 4 位）；无法识别返回 null，不打断输入 */
export function suggestQuickRuleName(rawUrl: string): string | null {
  const result = tryParseWebhookInput(rawUrl);
  if (!result.ok) return null;
  return `${result.parsed.channelName}-${tokenSuffix(result.parsed.token)}`;
}

export interface QuickCreateResult {
  ruleId: number;
  ruleName: string;
  reused: boolean;
}

export interface QuickCreateInput {
  parsed: ParsedWebhook;
  name: string;
  userGroupIds: number[];
  /** 是否有 /notification-channels 查看权限（Flashduty 媒介查重需要读 request_config） */
  canReadChannels: boolean;
  /** 是否有 /notification-channels/add 权限（larkcard 首建、Flashduty 新集成时需要建媒介） */
  canCreateChannels: boolean;
}

/** 创建接口返回 [id] 或 [{id}] 两种形态都出现过，双兼容 */
function extractId(dat: any): number | undefined {
  const first = Array.isArray(dat) ? dat[0] : dat;
  if (first == null) return undefined;
  const id = typeof first === 'object' ? Number(first.id) : Number(first);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

/** 媒介必须声明对应 paramKey，否则规则 params 传了也不会被消费，通知会静默失败 */
function declaresParamKey(channel: ChannelItem, paramKey: string) {
  return _.some(channel.param_config?.custom?.params, (p) => p?.key === paramKey);
}

function findRuleByToken(rules: any[], identOf: (channelId: number) => string | undefined, ident: string, token: string) {
  for (const rule of rules) {
    for (const cfg of rule?.notify_configs || []) {
      const cfgIdent = cfg?.channel_ident || identOf(Number(cfg?.channel_id));
      if (cfgIdent !== ident) continue;
      const params = cfg?.params || {};
      const candidates = [params.access_token, params.token, params.key];
      if (_.some(candidates, (c) => c != null && String(c) === token)) {
        return rule as { id: number; name: string };
      }
    }
  }
  return null;
}

async function ensureImChannel(ident: Exclude<QuickCreateIdent, 'flashduty'>, channels: ChannelItem[], canCreateChannels: boolean): Promise<number> {
  const spec = IM_SPEC[ident];
  const matched = _.filter(channels, (c) => c.ident === ident && c.enable !== false && declaresParamKey(c, spec.paramKey));
  // 优先内置同名媒介，其次任一可用媒介
  const channel = _.find(matched, (c) => _.trim(c.name) === spec.channelName) ?? matched[0];
  if (channel?.id != null) return Number(channel.id);

  if (!canCreateChannels) {
    throw new QuickCreateError(tt('create_channel_no_perm', { channel: spec.channelName }));
  }
  // getNotificationChannelTypes 的 default_values 即后端存储格式（headers/parameters 为 map），可直接提交
  const typeConfig = (getNotificationChannelTypes() as Record<string, { default_values?: object }>)[ident];
  if (!typeConfig?.default_values) {
    throw new QuickCreateError(tt('create_channel_failed', { channel: spec.channelName }));
  }
  const res = await postChannelItems([
    {
      name: spec.channelName,
      ident,
      enable: true,
      description: tt('channel_description'),
      ..._.cloneDeep(typeConfig.default_values),
    } as any,
  ]);
  const id = extractId(res?.dat);
  if (id) return id;
  // 返回体没带 id 时按 ident 反查兜底
  const latest = await getSimplifiedChannelItems();
  const created = _.find(latest, (c) => c.ident === ident && declaresParamKey(c, spec.paramKey));
  if (created?.id != null) return Number(created.id);
  throw new QuickCreateError(tt('create_channel_failed', { channel: spec.channelName }));
}

function flashdutyIntegrationUrlOf(channel: any): string {
  return String(channel?.request_config?.flashduty_request_config?.integration_url || '').trim();
}

async function createFlashdutyChannel(integrationUrl: string, integrationKey: string): Promise<number> {
  const channelName = `FlashDuty-${tokenSuffix(integrationKey)}`;
  const res = await postChannelItems([
    {
      name: channelName,
      ident: 'flashduty',
      enable: true,
      description: tt('channel_description'),
      request_type: 'flashduty',
      request_config: {
        // http 段为后端结构占位
        http_request_config: {
          url: '',
          method: '',
          headers: { 'Content-Type': 'application/json' },
          proxy: '',
          timeout: 10000,
          concurrency: 5,
          retry_times: 3,
          retry_interval: 100,
          request: { parameters: null, form: '', body: '' },
        },
        flashduty_request_config: {
          proxy: '',
          integration_url: integrationUrl,
          timeout: 5000,
          retry_times: 3,
          retry_sleep: 0,
        },
      },
    } as any,
  ]);
  const id = extractId(res?.dat);
  if (id) return id;
  const latest = await getSimplifiedChannelItems();
  const created = _.find(latest, (c) => _.trim(c.name) === channelName);
  if (created?.id != null) return Number(created.id);
  throw new QuickCreateError(tt('create_channel_failed', { channel: 'FlashDuty' }));
}

async function createRule(input: { name: string; userGroupIds: number[]; channelId: number; templateId?: number; params: Record<string, string> }): Promise<QuickCreateResult> {
  const { name, userGroupIds, channelId, templateId, params } = input;
  const payload: any = {
    name,
    description: tt('rule_description'),
    enable: true,
    user_group_ids: userGroupIds,
    notify_configs: [
      {
        channel_id: channelId,
        ...(templateId ? { template_id: templateId } : {}),
        params,
        severities: [1, 2, 3],
      },
    ],
  };
  const dat = await postRuleItems([payload]);
  let ruleId = extractId(dat);
  if (!ruleId) {
    const latest = await getRuleItems();
    ruleId = _.find(latest, { name })?.id;
  }
  if (!ruleId) throw new QuickCreateError(tt('create_rule_failed'));
  return { ruleId, ruleName: name, reused: false };
}

/**
 * 快捷创建主流程：查重（命中即复用）→ 复用/创建媒介 → 取默认模板 → 创建规则。
 * 九成场景（钉钉/企微/飞书卡片 + 内置媒介在位）只发生一次 POST /notify-rules。
 */
export async function quickCreateNotifyRule(input: QuickCreateInput): Promise<QuickCreateResult> {
  const { parsed, name, userGroupIds, canReadChannels, canCreateChannels } = input;

  const [rules, channels] = await Promise.all([getRuleItems(), getSimplifiedChannelItems()]);
  const identById = new Map<number, string>();
  _.forEach(channels, (c) => {
    if (c?.id != null) identById.set(Number(c.id), String(c.ident || ''));
  });

  if (parsed.ident === 'flashduty') {
    // Flashduty 的 key 固化在媒介 request_config 上，媒介级查重需要完整字段（受查看权限约束）
    let matchedChannelIds = new Set<number>();
    if (canReadChannels) {
      const fullChannels = await getChannelItems();
      _.forEach(fullChannels, (c: any) => {
        const isFlashduty =
          String(c?.request_type || '').toLowerCase() === 'flashduty' ||
          String(c?.ident || '')
            .toLowerCase()
            .includes('flashduty');
        if (isFlashduty && flashdutyIntegrationUrlOf(c).includes(parsed.token) && c?.id != null) {
          matchedChannelIds.add(Number(c.id));
        }
      });
      for (const rule of rules) {
        for (const cfg of (rule as any)?.notify_configs || []) {
          if (matchedChannelIds.has(Number(cfg?.channel_id))) {
            return { ruleId: Number((rule as any).id), ruleName: (rule as any).name, reused: true };
          }
        }
      }
    }
    let channelId = _.first(Array.from(matchedChannelIds));
    if (!channelId) {
      if (!canCreateChannels) {
        throw new QuickCreateError(tt('create_channel_no_perm', { channel: 'FlashDuty' }));
      }
      channelId = await createFlashdutyChannel(parsed.integrationUrl || '', parsed.token);
    }
    // Flashduty 通道不使用消息模板
    return createRule({ name, userGroupIds, channelId, params: {} });
  }

  const existing = findRuleByToken(rules as any[], (id) => identById.get(id), parsed.ident, parsed.token);
  if (existing) {
    return { ruleId: Number(existing.id), ruleName: existing.name, reused: true };
  }

  const channelId = await ensureImChannel(parsed.ident, channels, canCreateChannels);
  // 默认模板：取该媒介下第一条（后端已按语言过滤内置模板）；没有也不阻塞，template_id 非必填
  let templateId: number | undefined;
  try {
    const templates = await getTemplateItems(String(channelId));
    templateId = templates?.[0]?.id;
  } catch {
    templateId = undefined;
  }
  return createRule({ name, userGroupIds, channelId, templateId, params: { [parsed.paramKey as string]: parsed.token } });
}
