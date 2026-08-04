// 只取类型：constants 被 resolvePack 等纯逻辑模块引用，不能经 tracks 拖进 lucide-react 这类运行时依赖
import type { OnboardingActionKey } from '@/components/OnboardingProgress/tracks';

/** i18n namespace，与 locale/index.ts 的 key 保持一致 */
export const NS = 'n9e-onboarding';

/**
 * 各动作放行所需的权限点，与后端路由的 rt.perm 对齐（center/router/router.go）：
 * - pack：POST /busi-group/:id/boards 要 /dashboards/add，POST …/alert-rules/import 要 /alert-rules/add
 * - notify：POST /notify-rules 要 /notification-rules/add
 * - test：GET /notify-rules 与 POST /notify-rule/test 都挂在 /notification-rules 查看权限下
 * 业务组级写权限（bgrw）无法在打开弹窗前判定，仍由后端把关、在弹窗内逐条展示失败。
 */
export const ACTION_PERMS: Record<OnboardingActionKey, string[]> = {
  pack: ['/dashboards/add', '/alert-rules/add'],
  notify: ['/notification-rules/add'],
  test: ['/notification-rules'],
};

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

/**
 * 机器列表页工具栏内那条引导的「不再提示」标记。
 *
 * 只剩一行之后「折叠」已无意义（折起来也还是一行），改成彻底关掉；沿用旧的 collapsed key 会让
 * 之前折叠过的用户直接看不到这条引导，所以换新 key 重新开始。
 * 关掉之后仍可从侧栏引导徽标进入同样的动作，不是死路。
 */
export const NEXT_STEPS_DISMISSED_KEY = 'n9e_onboarding_next_steps_dismissed';

/** 通知媒介配置文档：测试告警发不出去时多半是 token / SMTP 没配好。用站内已在用的地址，避免死链 */
export const NOTIFY_CHANNEL_DOC = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/notify-channel/';
