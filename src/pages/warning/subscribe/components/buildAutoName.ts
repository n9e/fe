import _ from 'lodash';

export interface FilterTagItem {
  key?: string;
  func?: string;
  value?: string | string[];
}

export interface AutoNameInput {
  /** 订阅的告警规则名称 */
  ruleNames?: string[];
  /** 订阅业务组条件 */
  busiGroups?: FilterTagItem[];
  /** 订阅事件标签条件 */
  tags?: FilterTagItem[];
  /** 数据源类型展示名，如 Host / Prometheus */
  cateLabel?: string;
  /** 订阅事件等级 */
  severities?: number[];
  /** 订阅事件持续时长超过（秒），大于 0 视为告警升级场景 */
  forDuration?: number;
  /** 接收方名称：新版为通知规则名，旧版为接收组名 */
  receiverNames?: string[];
}

export interface AutoNameTexts {
  /** 各段之间的连接符 */
  joiner: string;
  /** 同一段内多个名称之间的连接符 */
  separator: string;
  /** 无任何筛选条件时的主体名 */
  all: string;
  /** 配置了持续时长时追加的标识 */
  escalation: string;
}

/** 最多取几个名称参与命名，避免名称过长 */
const MAX_NAMES = 2;

function toValues(value?: string | string[]) {
  if (_.isArray(value)) return _.compact(value);
  return _.compact([value]);
}

function joinNames(names: string[], separator: string) {
  return _.take(_.compact(names), MAX_NAMES).join(separator);
}

/** 取订阅的主体：优先级 告警规则 > 业务组 > 事件标签 > 数据源类型，都没有则返回空 */
function buildSubject(input: AutoNameInput, texts: AutoNameTexts) {
  const ruleNames = joinNames(input.ruleNames ?? [], texts.separator);
  if (ruleNames) return ruleNames;

  const busiGroupValues = _.flatMap(input.busiGroups, (item) => toValues(item?.value));
  const busiGroupNames = joinNames(busiGroupValues, texts.separator);
  if (busiGroupNames) return busiGroupNames;

  const tagLabels = _.compact(
    _.map(input.tags, (item) => {
      const values = toValues(item?.value);
      if (!item?.key || _.isEmpty(values)) return '';
      return `${item.key}=${values[0]}`;
    }),
  );
  const tagNames = joinNames(tagLabels, texts.separator);
  if (tagNames) return tagNames;

  return input.cateLabel ?? '';
}

/**
 * 根据筛选配置与通知配置生成订阅名称，形如「规则名-S1-升级-值班组」。
 * 筛选与通知都还没配时返回空串，交由调用方保持名称为空。
 * 纯函数，相同入参多次调用结果一致。
 */
export function buildAutoName(input: AutoNameInput, texts: AutoNameTexts): string {
  const subject = buildSubject(input, texts);
  const receivers = joinNames(input.receiverNames ?? [], texts.separator);
  if (!subject && !receivers) return '';

  const parts: string[] = [subject || texts.all];

  const severities = input.severities;
  if (!_.isEmpty(severities) && _.size(severities) < 3) {
    parts.push(_.map(_.sortBy(severities), (item) => `S${item}`).join('/'));
  }

  if (input.forDuration !== undefined && input.forDuration > 0) {
    parts.push(texts.escalation);
  }

  if (receivers) {
    parts.push(receivers);
  }

  return _.compact(parts).join(texts.joiner);
}
