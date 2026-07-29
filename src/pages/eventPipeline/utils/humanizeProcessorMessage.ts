import _ from 'lodash';

/**
 * 后端处理器返回的固定短语 → 人话文案 key。
 *
 * 「事件丢弃」条件不命中是最常见、也最正常的结果，但后端原文是「丢弃事件失败 / drop event failed」，
 * 直接展示会让用户以为处理器出错了（何况它还配在绿色的「执行成功」横幅里）。
 * 只翻译认识的片段，认不出的一律原样透出，后端改文案也不会炸。
 */
const TOKEN_I18N_KEY: Record<string, string> = {
  丢弃事件成功: 'processor_message.drop_hit',
  'drop event success': 'processor_message.drop_hit',
  丢弃事件失败: 'processor_message.drop_miss',
  'drop event failed': 'processor_message.drop_miss',
  'no-change': 'processor_message.no_change',
};

type Translate = (key: string) => unknown;

/**
 * 后端消息可能是用 | 拼起来的多段，如 "drop event failed | no-change"。
 * 按段翻译再拼回去；不含 | 的消息（如 relabel 的 "tags:[...]→[...]" 差异串）会作为单段处理，
 * 匹配不到就原样返回，不会被切碎。
 */
export default function humanizeProcessorMessage(message: string | undefined, t: Translate): string | undefined {
  if (!message) return message;

  const parts = _.map(_.split(message, '|'), (part) => _.trim(part));
  // 一段都不认识时原样返回，避免把原文的分隔符样式改掉
  if (!_.some(parts, (part) => TOKEN_I18N_KEY[part])) return message;

  return _.map(parts, (part) => (TOKEN_I18N_KEY[part] ? String(t(TOKEN_I18N_KEY[part])) : part)).join(' · ');
}
