export const NS = 'hosts';
export const PATH = '/targets';
export const PERM = PATH;
export const STATS_COLLAPSED_KEY = 'hosts_stats_collapsed';

/** 采集向导里上次验证通过的数据源 id，作为下次的默认值 */
export const VERIFIED_DATASOURCE_IDS_KEY = 'hosts_collect_verified_datasource_ids';

/**
 * 机器接入排查文档。安装脚本执行完但机器/指标迟迟不出现时，问题多在上报地址、防火墙或服务启动，
 * 这些都在这一篇里；用站内已在用的地址，避免自造锚点变成死链（渲染前记得过 localizeDocUrl）。
 */
export const CATEGRAF_TROUBLESHOOT_DOC = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc/';
