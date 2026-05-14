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

type PageType =
  | 'dashboards'
  | 'alert_rule'
  | 'alert_history'
  | 'active_alert'
  | 'targets'
  | 'notification_rules'
  | 'notification_channels'
  | 'self_healing';

function matchPageTypeByUrl(url: string): PageType | undefined {
  const pathname = (url.split('?')[0] || '').toLowerCase();
  if (pathname.startsWith('/dashboards')) return 'dashboards';
  if (pathname.startsWith('/alert-rules')) return 'alert_rule';
  if (pathname.startsWith('/alert-his-events') || pathname.startsWith('/history-events')) return 'alert_history';
  if (pathname.startsWith('/alert-cur-events') || pathname.startsWith('/alert-cur-event')) return 'active_alert';
  if (pathname.startsWith('/targets')) return 'targets';
  if (pathname.startsWith('/notification-rules')) return 'notification_rules';
  if (pathname.startsWith('/notification-channels')) return 'notification_channels';
  if (pathname.startsWith('/job-tpls') || pathname.startsWith('/job-tasks')) return 'self_healing';
  return undefined;
}

export function getRecommendByUrl(url: string, lang?: string): IAiChatRecommendConfig {
  const pageType = matchPageTypeByUrl(url);

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
        promptList: isZhCN(lang)
          ? ['创建一条 CPU 使用率超过 80% 的告警规则', '为什么某个告警规则没有发出告警', '这个告警为什么会触发']
          : [
              'Create a CPU usage alert rule with a threshold above 80%',
              'Why did a certain alert rule not fire',
              'Why did this alert trigger',
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
    case 'targets':
      return {
        promptList: isZhCN(lang)
          ? ['我刚装的机器为什么没出现 / 显示 unknown？', '这台机器为什么失联了？', '如何部署 categraf 采集器']
          : [
              'I just installed a machine but it does not appear / shows unknown, why?',
              'Why did this machine go offline?',
              'How to deploy the categraf collector',
            ],
      };
    case 'notification_rules':
      return {
        promptList: isZhCN(lang)
          ? ['这条规则保存后会命中哪些事件？', '为什么我这条告警没发出通知？', '为什么测试能收到但实际发不出通知？']
          : [
              'Which events will this rule match after saving?',
              'Why did my alert not send a notification?',
              'Why can the test receive but real notifications fail?',
            ],
      };
    case 'notification_channels':
      return {
        promptList: isZhCN(lang)
          ? ['检查一下这条媒介配置的是否正确', '飞书 / 钉钉 / 企微怎么 @ 到具体的人？', '我有个 v6/v7 老脚本 / 老媒介配置，v8 升级后字段对不上，帮我看看怎么改']
          : [
              'Check whether this channel is configured correctly',
              'How to @ a specific person in Feishu / DingTalk / WeCom?',
              'I have an old v6/v7 script or channel config that no longer matches v8 fields, help me fix it',
            ],
      };
    case 'self_healing':
      return {
        promptList: isZhCN(lang)
          ? ['帮我写一个磁盘清理 / 服务重启 / OOM dump 自愈脚本', '自愈脚本怎么从 stdin 拿告警字段？', '我最近哪些告警频繁触发？有没有适合自愈的场景推荐？']
          : [
              'Write a self-healing script for disk cleanup / service restart / OOM dump',
              'How does a self-healing script read alert fields from stdin?',
              'Which alerts fired most frequently recently? Any scenarios suitable for self-healing?',
            ],
      };
    default:
      return {
        promptList: isZhCN(lang)
          ? ['如何使用仪表盘可视化业务指标？', '如何配置我的第一条告警规则？', '如何添加数据源？']
          : [
              'How to visualize business metrics with dashboards?',
              'How to configure my first alert rule?',
              'How to add a data source?',
            ],
      };
  }
}

export function getExplorerPrompts(lang?: string) {
  return isZhCN(lang)
    ? ['帮我生成一个查询主机 CPU 使用率的语句', '帮我生成一个查询机器内存使用率的语句', '帮我生成一个查询机器磁盘使用率的语句']
    : ['Generate a query for host CPU usage', 'Generate a query for memory usage', 'Generate a query for host disk usage'];
}

export function getNotifyTplPrompts(lang?: string) {
  return isZhCN(lang)
    ? ['在通知模板中加入主机名和告警级别', '把 trigger_value 保留两位小数', '在通知模板中加入排障文档链接', '在模板中加入告警持续时间和首次触发时间']
    : [
        'Add hostname and severity label to the notification template',
        'Format trigger_value with two decimal places in the template',
        'Include a runbook link in the notification template',
        'Add alert duration and first triggered time to the template',
      ];
}

export function getAlertEventDetailPrompts(lang?: string) {
  return isZhCN(lang)
    ? ['分析这条告警事件的根因', '查找同对象/同规则下的相似历史告警', '看下同一对象在这个时间点附近还有哪些活跃告警']
    : ['Analyze the root cause of this alert event', 'Find similar historical alerts on the same target/rule', 'Show other active alerts on the same target around this time'];
}
