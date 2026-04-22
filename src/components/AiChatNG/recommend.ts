import { IAiChatAction, IAiChatPageInfo } from './types';

export interface IAiChatRecommendConfig {
  queryAction?: IAiChatAction;
  promptList?: string[];
}

export function getCurrentPageUrl() {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname || ''}${window.location.search || ''}` || '/';
}

export function buildPageFrom(options?: { url?: string; param?: Record<string, unknown> }): IAiChatPageInfo {
  const url = options?.url ?? getCurrentPageUrl();
  const param = options?.param;
  return param ? { url, param } : { url };
}

function isZhCN(lang?: string) {
  return (lang || '').toLowerCase() === 'zh_cn';
}

function explorerPrompts(lang?: string) {
  return isZhCN(lang)
    ? ['帮我生成一个查询主机 CPU 使用率的语句', '帮我生成一个查询机器内存使用率的语句', '帮我生成一个查询机器磁盘使用率的语句']
    : ['Generate a query for host CPU usage', 'Generate a query for memory usage', 'Generate a query for host disk usage'];
}

function matchPageTypeByUrl(url: string): 'dashboards' | 'alert_rule' | 'alert_history' | 'active_alert' | undefined {
  const pathname = (url.split('?')[0] || '').toLowerCase();
  if (pathname.startsWith('/dashboards')) return 'dashboards';
  if (pathname.startsWith('/alert-rules')) return 'alert_rule';
  if (pathname.startsWith('/alert-his-events') || pathname.startsWith('/history-events')) return 'alert_history';
  if (pathname.startsWith('/alert-cur-events') || pathname.startsWith('/alert-cur-event')) return 'active_alert';
  return undefined;
}

export function getRecommendByUrl(url: string, lang?: string): IAiChatRecommendConfig | undefined {
  const pageType = matchPageTypeByUrl(url);
  if (!pageType) return undefined;

  switch (pageType) {
    case 'dashboards':
      return {
        queryAction: { key: 'creation' },
        promptList: isZhCN(lang)
          ? ['帮我创建一个 Host 机器的仪表盘', '帮我创建一个 MySQL 的仪表盘', '帮我创建一个 Redis 的仪表盘']
          : ['Create a Host machine dashboard', 'Create a MySQL dashboard', 'Create a Redis dashboard'],
      };
    case 'alert_rule':
      return {
        queryAction: { key: 'creation' },
        promptList: isZhCN(lang)
          ? ['创建一条 CPU 使用率超过 80% 的告警规则', '创建一条主机失联的告警规则', '创建一条机器磁盘使用率超过 85% 的告警规则']
          : [
              'Create a CPU usage alert rule with a threshold above 80%',
              'Create a host down alert rule based on target heartbeat loss',
              'Create a disk usage alert rule with a threshold above 85%',
            ],
      };
    case 'alert_history':
      return {
        queryAction: { key: 'alert_query' },
        promptList: isZhCN(lang)
          ? ['总结当前筛选范围内的告警趋势', '哪些告警规则触发最频繁', '按级别、业务组、对象拆解当前告警']
          : ['Summarize alert trends in the current filter range', 'Which alert rules fired most frequently', 'Break down current alerts by severity, busi group and target'],
      };
    case 'active_alert':
      return {
        queryAction: { key: 'alert_query' },
        promptList: isZhCN(lang)
          ? ['总结当前活跃告警的分布情况', '哪些规则或对象的活跃告警最多', '按级别和业务组汇总当前活跃告警']
          : [
              'Summarize the distribution of currently active alerts',
              'Which rules or targets have the most active alerts',
              'Group current active alerts by severity and busi group',
            ],
      };
    default:
      return undefined;
  }
}

export function getExplorerPrompts(lang?: string) {
  return explorerPrompts(lang);
}
