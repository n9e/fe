/**
 * 引导进度的纯判定逻辑与本地标记读写。
 *
 * 抽出来有两个原因：判定规则可以脱离五个 service mock 直接单测；「写标记」只有一处实现，
 * 避免采集向导、测试发送各写一份 key 而拼不上。
 */

/**
 * 「主机监控基础包」导入大盘时追加到 tags 上的标记。
 *
 * 选 tags 而不是告警规则那侧的 append_tags：Board.Tags 是自由字符串、原样入库，
 * 而 AlertRule.AppendTags 后端强制 k=v 且会附加到该规则产生的每一条事件上。
 * 标记在前端追加（payload 已由后端按 X-Language 翻译完），所以不随语言变化。
 */
export const HOST_PACK_TAG = 'n9e-host-pack';

const MARKER_STORAGE_KEYS = {
  collectVerified: 'n9e_onboarding_collect_verified',
  testDelivered: 'n9e_onboarding_test_delivered',
} as const;

export type OnboardingMarkerKey = keyof typeof MARKER_STORAGE_KEYS;

/** localStorage 在隐私模式/禁用存储时会抛错，读不到一律按未完成处理，不能打断整个探测 */
export function readOnboardingMarker(key: OnboardingMarkerKey): boolean {
  try {
    return !!localStorage.getItem(MARKER_STORAGE_KEYS[key]);
  } catch (e) {
    return false;
  }
}

export function writeOnboardingMarker(key: OnboardingMarkerKey) {
  try {
    localStorage.setItem(MARKER_STORAGE_KEYS[key], '1');
  } catch (e) {
    // 存不下就算了：testDelivered 还有服务端送达探测兜底，collectVerified 不计入进度
  }
}

// 基础包上线前，用户只能从集成中心手工导入主机大盘，那些大盘没有 tag，只能靠名字认。
// 内置主机大盘的 name 约定：中文盘多为「机器…」，英文盘含 Host（如 Host Table NG）。
const HOST_DASHBOARD_NAME_HINTS = ['机器', 'host'];

/** 是否为主机大盘：优先认基础包 tag（语言无关、改名也不丢），回退到 name 关键字兼容存量用户 */
export function isHostBoard(board?: { name?: string; tags?: string } | null): boolean {
  if (!board) return false;
  if (board.tags && board.tags.includes(HOST_PACK_TAG)) return true;
  if (!board.name) return false;
  const lower = board.name.toLowerCase();
  return HOST_DASHBOARD_NAME_HINTS.some((hint) => lower.includes(hint));
}

/**
 * 是否已有启用中的主机类告警规则。
 *
 * 用 `cate === 'host'` 而不是 tag：机器失联/时钟偏移这类规则不依赖指标，是「主机告警已在跑」
 * 最直接的信号，且自己写过 target_miss 规则的用户也应该算完成。
 * 要求 `disabled === 0`：基础包一律以启用状态导入，判定跟着保持自洽 —— 规则存在但被停用时
 * 用户实际收不到告警，不能算完成。后端 `disabled`/`cate` 均无 omitempty，恒有值。
 */
export function hasEnabledHostRule(rules?: { cate?: string; disabled?: number }[] | null): boolean {
  if (!Array.isArray(rules)) return false;
  return rules.some((rule) => rule?.cate === 'host' && rule?.disabled === 0);
}

/**
 * 已启用的主机类告警规则里，是否至少有一条真的绑定了通知规则。
 *
 * 基础包允许 notify_rule_ids 留空导入，此时规则会产生事件但不通知任何人 ——
 * 「绑定通知」这一步不能只看通知规则存在与否，还要看主机告警确实挂上了它。
 * 旧通知模型（notify_version !== 1）的通知配置内嵌在规则自身（notify_groups 等），
 * 不是本引导的产物，一律视为已绑定，避免把老部署的完成态翻回未完成。
 * 后端 `notify_version`/`notify_rule_ids` 均无 omitempty，列表响应恒有值。
 */
export function hasNotifyBoundHostRule(rules?: { cate?: string; disabled?: number; notify_version?: number; notify_rule_ids?: number[] }[] | null): boolean {
  if (!Array.isArray(rules)) return false;
  return rules.some((rule) => {
    if (rule?.cate !== 'host' || rule?.disabled !== 0) return false;
    if (rule.notify_version !== 1) return true;
    return (rule.notify_rule_ids?.length ?? 0) > 0;
  });
}
