/** i18n namespace，与 locale/index.ts 的 key 保持一致 */
export const NS = 'n9e-onboarding';

/** 内置 Linux 集成的 component ident，基础包的模板都取自它 */
export const LINUX_COMPONENT_IDENT = 'Linux';

/**
 * 基础包的告警规则来源：`integrations/Linux/alerts/linux_by_categraf.json`。
 *
 * BuiltinPayload 的 cate 就是文件名去掉后缀，与语言无关，可安全用于过滤。
 * 选这一份而不是 26 条的 Common Alert Rules：新人刚装完 Categraf，9 条规则
 * （8 条指标 + 1 条机器失联）与采集器一一对应，不会一上来就被规则数量淹没。
 */
export const PACK_ALERT_CATE = 'linux_by_categraf';

/**
 * 基础包的两个大盘，按 uuid 钉住。
 *
 * 不按名字选：payload 的 name/tags 会被后端按 X-Language 翻译（center/integration/i18n.go），
 * 按名字匹配在 en_US 下会失配。uuid 取自 `integrations/Linux/dashboards/*.json` 里已提交的值。
 *
 * 用字符串比较：这两个值超过 Number.MAX_SAFE_INTEGER，JSON.parse 之后已是有精度损失的 double。
 * 实测 String() 能原样还原出这两个字面量（见 resolvePack.test.ts），统一转字符串比较可避免
 * 以后换成字符串类型的 uuid 时静默失配。
 */
export const PACK_BOARD_UUIDS = [
  '1737103014612000', // categraf-detail.json —— 机器常用指标
  '1717556327742611000', // categraf-overview.json —— 机器台账表格视图
];

/** 机器列表页顶部引导横幅的折叠状态，镜像 hosts 页 STATS_COLLAPSED_KEY 的做法 */
export const NEXT_STEPS_COLLAPSED_KEY = 'n9e_onboarding_next_steps_collapsed';

/** 通知媒介配置文档：测试告警发不出去时多半是 token / SMTP 没配好。用站内已在用的地址，避免死链 */
export const NOTIFY_CHANNEL_DOC = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/notify-channel/';
