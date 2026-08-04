import _ from 'lodash';

/**
 * 模板字段名不是随便取的：媒介的出站请求体里写死了它要读哪些字段
 * （钉钉的 body 是 {"markdown":{"title":"{{$tpl.title}}","text":"{{$tpl.content}}"}}）。
 * 字段名对不上时后端不会报错，只会把空字符串发出去——用户看到的是「通知发出来了但内容是空的」。
 *
 * 这里把「该媒介期望哪些字段」变成可推导的，用于新建时预生成正确 key 的起步内容，
 * 以及编辑时提示缺字段。
 */

/** keys 的来源：body 正则抽取 / 该类型固定 / 该类型不需要模板 */
export type TplKeysSource = 'body' | 'fixed' | 'none';

export interface ExpectedTplKeys {
  keys: string[];
  source: TplKeysSource;
}

/**
 * headers / parameters 有两种形态：接口态是 map，表单态是 {key,value}[]
 * （见 notificationChannels/utils/normalizeValues 的双向转换）。
 * 调用方两种都可能传进来，所以这里两种都接受、两种都能取到值。
 */
export type KeyValuePairs = Record<string, string> | { key?: string; value?: string }[];

export interface ChannelLike {
  request_type?: string;
  request_config?: {
    http_request_config?: {
      url?: string;
      headers?: KeyValuePairs;
      request?: {
        body?: string;
        parameters?: KeyValuePairs;
      };
    };
  };
}

/** 邮件类媒介的字段是固定的一对，不从 body 推导（smtp 压根没有 HTTP body） */
export const SMTP_TPL_KEYS = ['subject', 'content'];

// 同时兼容 {{$tpl.title}} 与 {{ $tpl.title }}
const TPL_REF_REGEXP = /\{\{-?\s*\$tpl\.([a-zA-Z0-9_]+)\s*-?\}\}/g;

/** 从单段文本里抽出所有 {{$tpl.X}} 引用的字段名，按出现顺序去重 */
export function extractTplKeysFromBody(body?: string): string[] {
  if (!body) return [];
  const keys: string[] = [];
  // 每次调用都新建正则，避免 /g 的 lastIndex 在多次调用间残留导致漏匹配
  const re = new RegExp(TPL_REF_REGEXP.source, 'g');
  let matched = re.exec(body);
  while (matched !== null) {
    if (!_.includes(keys, matched[1])) {
      keys.push(matched[1]);
    }
    matched = re.exec(body);
  }
  return keys;
}

/**
 * 收集 HTTP 媒介中所有可能出现 {{$tpl.X}} 的文本。
 *
 * 后端在 body、URL、每个 header、每个 query parameter 四处都注入了 {{$tpl := .tpl}}
 * （见 alert/sender/provider/http_common.go 的 parseRequestBody 与 replaceVariables），
 * 所以只扫 body 会漏掉把正文放在 header 里的媒介，起步内容就少生成字段。
 *
 * body 排在最前，保证 title/content 这类字段的顺序与用户直觉一致。
 */
function collectTplTexts(channel?: ChannelLike): string[] {
  const http = channel?.request_config?.http_request_config;
  if (!http) return [];
  return [http.request?.body, http.url, ...pairValues(http.headers), ...pairValues(http.request?.parameters)].filter(
    (text): text is string => typeof text === 'string',
  );
}

/** 取出 map / {key,value}[] 两种形态里的值 */
function pairValues(pairs?: KeyValuePairs): (string | undefined)[] {
  if (Array.isArray(pairs)) {
    return _.map(pairs, (pair) => pair?.value);
  }
  return _.values(pairs);
}

/**
 * 推导该媒介期望的模板字段。
 * 只做 body 正则是不够的：邮件（最常见的场景之一）没有 HTTP body，
 * flashduty/pagerduty 则根本不走模板。
 */
export function getExpectedTplKeys(channel?: ChannelLike): ExpectedTplKeys {
  const requestType = channel?.request_type;

  if (requestType === 'smtp') {
    return { keys: [...SMTP_TPL_KEYS], source: 'fixed' };
  }

  // 这两类直接用 event 字段构造 payload，后端跳过模板渲染
  if (requestType === 'flashduty' || requestType === 'pagerduty') {
    return { keys: [], source: 'none' };
  }

  // 脚本媒介的字段取决于脚本自己从 stdin 里读什么，无法推导
  if (requestType === 'script') {
    return { keys: [], source: 'body' };
  }

  return {
    keys: _.uniq(_.flatMap(collectTplTexts(channel), extractTplKeysFromBody)),
    source: 'body',
  };
}

/** 起步内容里用到的文案，外置以保持本模块为纯函数、便于测试 */
export interface StarterTexts {
  ruleName: string;
  severity: string;
  status: string;
  firing: string;
  recovered: string;
  tags: string;
  triggerValue: string;
  time: string;
  detail: string;
}

/** 除标题类字段外的通用正文，覆盖告警/恢复两种态 */
function buildBody(texts: StarterTexts): string {
  return [
    `${texts.status}: {{if $event.IsRecovered}}${texts.recovered}{{else}}${texts.firing}{{end}}`,
    `${texts.ruleName}: {{$event.RuleName}}`,
    `${texts.severity}: S{{$event.Severity}}`,
    `${texts.tags}: {{$event.TagsJSON}}`,
    `${texts.triggerValue}: {{$event.TriggerValue}}`,
    `${texts.time}: {{timestamp}}`,
    // 站点地址取的是渲染数据里的 domain 键（后端 RenderEvent 填的），不是模板变量。
    // 用 {{$.domain}} 而不是 {{.domain}}：$ 恒为根数据，放进 range/with 里也成立。
    `${texts.detail}: {{$.domain}}/alert-his-events/{{$event.Id}}`,
  ].join('\n');
}

/** 标题类字段只放一行摘要，避免把整段正文塞进标题 */
function buildTitle(texts: StarterTexts): string {
  return `[S{{$event.Severity}}] {{$event.RuleName}}`;
}

const TITLE_LIKE_KEYS = ['title', 'subject'];

/**
 * 按媒介期望的字段生成一份可直接用的起步模板内容。
 * 新建模板时落到空白编辑器、让用户从零手写 Go template 是最大的上手障碍。
 */
export function buildStarterContent(channel: ChannelLike | undefined, texts: StarterTexts): Record<string, string> {
  const { keys } = getExpectedTplKeys(channel);
  if (_.isEmpty(keys)) return {};

  return _.zipObject(
    keys,
    _.map(keys, (key) => (_.includes(TITLE_LIKE_KEYS, key) ? buildTitle(texts) : buildBody(texts))),
  );
}
