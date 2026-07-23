import _ from 'lodash';

/**
 * 处理器卡片折叠态的一行摘要：让用户不展开也能看出这一步在做什么。
 * config 结构因类型而异，全部防御式读取，读不到就返回空串（由调用方回退到类型名）。
 */
export function getProcessorSummary(typ: string, config: any): string {
  if (!config) return '';
  const truncate = (s: string, len = 48) => (s && s.length > len ? `${s.slice(0, len)}…` : s || '');

  switch (typ) {
    case 'relabel': {
      const action = config.action ?? 'replace';
      if (action === 'replace') {
        const source = _.compact(_.castArray(config.source_labels)).join(',');
        const target = config.target_label;
        if (target || source) return truncate(_.compact([target, source]).join(' ← '));
        return action;
      }
      return truncate(_.compact([action, config.regex]).join(': '));
    }
    case 'callback':
    case 'event_update': {
      const method = config.method || 'POST';
      return config.url ? truncate(`${method} ${config.url}`) : '';
    }
    case 'event_drop':
      return truncate(_.trim(_.split(config.content ?? '', '\n')[0]));
    case 'ai_summary':
      return truncate(config.model_name || (config.llm_config_id ? 'LLM' : ''));
    case 'script':
      return config.timeout ? `timeout ${config.timeout}ms` : '';
    default:
      return '';
  }
}
