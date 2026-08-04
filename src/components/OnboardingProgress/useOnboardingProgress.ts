import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { getMonObjectList } from '@/services/targets';
import { getBusiGroupsDashboards } from '@/services/dashboardV2';
import { getBusiGroupsAlertRules } from '@/services/warning';
import { getItems as getNotifyRules } from '@/pages/notificationRules/services';
import { getList as getLlmConfigs } from '@/pages/aiConfig/llmConfigs/services';
import { getNotifyUsed } from '@/pages/event/EventNotifyRecords/services';

import { hasEnabledHostRule, hasNotifyBoundHostRule, isHostBoard, readOnboardingMarker } from './detect';
import { CACHEABLE_KEYS, DetectCache, isProbeThrottled, readDetectCache, writeDetectCache } from './detectCache';

/** 计入进度分母的步骤 */
export type OnboardingStepKey = 'machine' | 'hostDashboard' | 'hostAlert' | 'testDelivered' | 'datasource' | 'dashboard' | 'alert' | 'notification' | 'llm';

/**
 * 只在清单里展示、不计入分母的步骤。
 * Categraf 装完就自带 OS 基础指标，「配置采集」本质是可选的；而且服务端没有廉价手段判断
 * 某台机器是否验证过采集，若计入分母就只能靠浏览器标记，会让老用户永久停在 N-1。
 */
export type OnboardingOptionalStepKey = 'collectVerified';

export type OnboardingDisplayKey = OnboardingStepKey | OnboardingOptionalStepKey;

/**
 * 只用于派生判定、不单独成步骤展示的键。
 * hostNotifyBound：已启用的主机告警是否至少有一条绑定了通知规则 ——
 * NextStepsCard 的「绑定通知」完成态需要它兜住「基础包留空导入、告警实际无人收到」的缺口。
 */
export type OnboardingDerivedKey = 'hostNotifyBound';

export const ONBOARDING_STEP_KEYS: OnboardingStepKey[] = [
  'machine',
  'hostDashboard',
  'hostAlert',
  'testDelivered',
  'datasource',
  'dashboard',
  'alert',
  'notification',
  'llm',
];

/** 本地标记推导出的步骤：只涉及这些 key 的刷新不必重新拉接口 */
const MARKER_DERIVED_KEYS: OnboardingDisplayKey[] = ['collectVerified', 'testDelivered'];

interface DetectState {
  machine: boolean;
  dashboard: boolean;
  // 是否存在「主机大盘」（基础包 tag 或 name 近似，与「任意大盘」dashboard 区分开）
  hostDashboard: boolean;
  alert: boolean;
  // 是否存在启用中的主机类告警规则（cate=host，与「任意告警规则」alert 区分开）
  hostAlert: boolean;
  // 启用中的主机告警是否至少有一条绑定了通知规则（判定见 detect.hasNotifyBoundHostRule）
  hostNotifyBound: boolean;
  // 是否已配置通知规则（告警能否真正发出来）
  notification: boolean;
  // 是否已接入大模型（解锁 AI 助手与智能分析）
  llm: boolean;
  // 服务端探测：这套部署是否产生过通知记录（无论成败）。让已在正常使用的老用户自动点亮「发送测试告警」
  notifyUsed: boolean;
  // 采集向导验证通过的本地标记（不计入分母）
  collectVerified: boolean;
  // 测试告警发送成功的本地标记，与 notifyUsed 取或：点完立刻点亮，换浏览器由 notifyUsed 兜住
  testDeliveredLocal: boolean;
  // 短路标记在场（全部完成 / 用户「不再显示」）。datasource 步骤不由探测决定，读的是
  // CommonStateContext 里的数据源列表，光把探测项置真凑不满进度，得靠这个显式标记收口
  dismissed: boolean;
  loaded: boolean;
}

export interface OnboardingProgress {
  loaded: boolean;
  total: number;
  doneCount: number;
  doneMap: Record<OnboardingDisplayKey | OnboardingDerivedKey, boolean>;
  /** 用户显式关闭引导（「不再显示」）：立即隐藏并持久化，与全完成短路取或 */
  dismiss: () => void;
}

// 全部完成或用户显式关闭后写入持久化标记，后续直接短路、不再探测，避免每次加载都拉全量大盘 / 告警。
// 用 localStorage 而非 sessionStorage：老手关闭一次即永久生效，不随会话结束复活。
// key 带版本号：步骤集合变化后 total 也变了，沿用旧 key 会把老用户永久钉在「已完成」、再也看不到新步骤。
const ONBOARDING_DONE_KEY = 'n9e_onboarding_done_v2';
const DONE_DETECT: DetectState = {
  machine: true,
  dashboard: true,
  hostDashboard: true,
  alert: true,
  hostAlert: true,
  hostNotifyBound: true,
  notification: true,
  llm: true,
  notifyUsed: true,
  collectVerified: true,
  testDeliveredLocal: true,
  dismissed: true,
  loaded: true,
};

const INITIAL_DETECT: DetectState = {
  machine: false,
  dashboard: false,
  hostDashboard: false,
  alert: false,
  hostAlert: false,
  hostNotifyBound: false,
  notification: false,
  llm: false,
  notifyUsed: false,
  collectVerified: false,
  testDeliveredLocal: false,
  dismissed: false,
  loaded: false,
};

// 跨实例（侧栏徽标 + 着陆页清单 + 机器列表横幅 + 各成功态卡片）与多次挂载共享的最近一次探测结果：
// 既作初始值避免重复请求与闪烁，也用于跳过已完成步骤的探测（大盘 / 告警接口偏重，置真后不再重复拉取）。
let lastDetect: DetectState = INITIAL_DETECT;

// 当前用户 id：缓存读写都要按它隔离。由 hook 在拿到 profile 后写入，模块级函数据此存取缓存
let detectCacheUid: number | undefined;
// 已经并过缓存的用户 id：每个用户只并一次，重复并没有意义还会多广播一轮
let hydratedUid: number | undefined;

// 挂载点从 2 处涨到 5 处，同一轮里并发挂载必须共用一次探测，否则大盘 / 告警列表会被拉 5 遍
let pendingProbe: Promise<DetectState> | null = null;
const listeners = new Set<(state: DetectState) => void>();

function publish(next: DetectState) {
  lastDetect = next;
  // 遍历快照：广播是在 promise 回调里发生的，React 17 不会批量处理，某个订阅者的 setState 会
  // 同步触发重渲染、并可能让另一个订阅者当场卸载并注销自己。直接遍历 Set 会踩到迭代中被修改。
  Array.from(listeners).forEach((listener) => listener(next));
}

function readMarkers(known: DetectState) {
  return {
    collectVerified: known.collectVerified || readOnboardingMarker('collectVerified'),
    testDeliveredLocal: known.testDeliveredLocal || readOnboardingMarker('testDelivered'),
  };
}

/** 把本轮探测结论里为真的项落盘。CACHEABLE_KEYS 与 DetectState 的字段名在这里由 tsc 兜住 */
function persistDetect(state: DetectState) {
  if (!detectCacheUid) return;
  writeDetectCache(
    detectCacheUid,
    CACHEABLE_KEYS.filter((key) => state[key]),
  );
}

/**
 * 把缓存里的已完成项并回 lastDetect 并广播，返回缓存记录供调用方做探测节流。
 * 与探测本身同一口径：只并 true、不回退。
 */
function hydrateDetectCache(uid: number): DetectCache | undefined {
  const cache = readDetectCache(uid);
  if (hydratedUid === uid) return cache;

  // 同一次页面加载内换了登录用户：探测结论是「当前用户可见范围内是否存在」，一律归零重来，
  // 不能继承前一个人的完成态
  const switched = hydratedUid !== undefined;
  hydratedUid = uid;
  const base = switched ? INITIAL_DETECT : lastDetect;

  if (!cache) {
    // 换用户且新用户没缓存时也要广播一次归零，否则挂载中的实例还画着上一个人的完成态；
    // 首次挂载 base 就是 lastDetect，广播没有意义、还会多一轮渲染
    if (switched) publish(base);
    return undefined;
  }

  // loaded 一并置真：缓存本身就来自一轮完整探测，先把清单画出来，不必等这次请求回来
  const next: DetectState = { ...base, loaded: true };
  CACHEABLE_KEYS.forEach((key) => {
    if (_.includes(cache.done, key)) {
      next[key] = true;
    }
  });
  publish({ ...next, ...readMarkers(next) });
  return cache;
}

function probeOnboarding(): Promise<DetectState> {
  const known = lastDetect;
  const machineP = known.machine
    ? Promise.resolve(true)
    : getMonObjectList({ p: 1, limit: 1 }).then(
        (res) => (res?.dat?.total ?? 0) > 0,
        () => false,
      );
  // dashboard（任意大盘）与 hostDashboard（主机大盘）复用同一次大盘列表请求，两者都已知为真才跳过
  const dashboardP: Promise<{ any: boolean; host: boolean }> =
    known.dashboard && known.hostDashboard
      ? Promise.resolve({ any: true, host: true })
      : getBusiGroupsDashboards(undefined).then(
          (res) => {
            const list = (res as { name?: string; tags?: string }[]) ?? [];
            return { any: known.dashboard || list.length > 0, host: known.hostDashboard || _.some(list, isHostBoard) };
          },
          () => ({ any: known.dashboard, host: known.hostDashboard }),
        );
  // 同上，alert（任意告警规则）/ hostAlert（主机类告警）/ hostNotifyBound（主机告警已绑通知）
  // 复用同一次请求。判断条件必须是三者都已知为真：少看任何一个，都会在「前者已完成、后者未完成」
  // 的组合下永远跳过探测，后者便再也没有机会点亮。
  const alertP: Promise<{ any: boolean; host: boolean; bound: boolean }> =
    known.alert && known.hostAlert && known.hostNotifyBound
      ? Promise.resolve({ any: true, host: true, bound: true })
      : getBusiGroupsAlertRules(undefined).then(
          (res) => {
            const list = (res?.dat as { cate?: string; disabled?: number; notify_version?: number; notify_rule_ids?: number[] }[]) ?? [];
            return {
              any: known.alert || list.length > 0,
              host: known.hostAlert || hasEnabledHostRule(list),
              bound: known.hostNotifyBound || hasNotifyBoundHostRule(list),
            };
          },
          () => ({ any: known.alert, host: known.hostAlert, bound: known.hostNotifyBound }),
        );
  // 通知规则（全局，不分业务组）：决定告警能否真正发出来
  const notificationP = known.notification
    ? Promise.resolve(true)
    : getNotifyRules().then(
        (res) => (res?.length ?? 0) > 0,
        () => false,
      );
  // 大模型配置：决定 AI 助手是否可用
  const llmP = known.llm
    ? Promise.resolve(true)
    : getLlmConfigs().then(
        (res) => (res?.length ?? 0) > 0,
        () => false,
      );
  // 没有通知规则就不可能产生过通知记录，与 doneMap 里 testDelivered 的 gate 保持一致；
  // 也避免全新部署（正是新手引导的目标用户）每次路由变化都白跑一次这个查询。
  // gate 必须挂在本轮 notificationP 的结果上：若读上一轮的 known.notification（新会话初值恒为
  // false），首轮探测会永远跳过这个查询，已正常收过通知的老部署要等一次路由切换才能点亮。
  // 老后端没有该路由时请求会失败，按未使用处理，此时仅靠本地标记。
  const notifyUsedP: Promise<boolean> = known.notifyUsed
    ? Promise.resolve(true)
    : notificationP.then((notification) =>
        notification
          ? getNotifyUsed().then(
              (res) => !!res?.used,
              () => false,
            )
          : false,
      );

  return Promise.all([machineP, dashboardP, alertP, notificationP, llmP, notifyUsedP]).then(([machine, dashboard, alert, notification, llm, notifyUsed]) => ({
    machine,
    dashboard: dashboard.any,
    hostDashboard: dashboard.host,
    alert: alert.any,
    hostAlert: alert.host,
    hostNotifyBound: alert.bound,
    notification,
    llm,
    notifyUsed,
    ...readMarkers(known),
    // 探测结论不该把「已关闭引导」冲掉
    dismissed: known.dismissed,
    loaded: true,
  }));
}

/** 共享同一轮探测：并发挂载只发一组请求，结果广播给所有实例 */
function probeOnboardingShared(): Promise<DetectState> {
  if (!pendingProbe) {
    pendingProbe = probeOnboarding()
      .then((next) => {
        publish(next);
        // 只有真实探测过才刷新缓存与节流时间戳；标记态的就地广播不该顺延下一次探测
        persistDetect(next);
        return next;
      })
      .finally(() => {
        pendingProbe = null;
      });
  }
  return pendingProbe;
}

/**
 * 主动刷新引导进度并广播给所有挂载中的实例。
 *
 * 探测本身只在路由变化时跑，所以基础包导入、通知创建、测试发送这类「留在原地完成的动作」
 * 必须显式调一次，否则侧栏徽标和清单要等用户切页面才更新。
 *
 * 注意：任何路径都不会把已完成步骤翻回未完成 —— 探测结果与 lastDetect 取或，请求失败的分支
 * 也原样返回旧值。调用方只需传自己确实改动了的 key。
 */
export function refreshOnboardingProgress(keys?: OnboardingDisplayKey[]) {
  if (keys && keys.length > 0 && keys.every((key) => _.includes(MARKER_DERIVED_KEYS, key))) {
    // 只动了本地标记：标记是同步可读的，直接重算并广播，不必重新拉接口
    publish({ ...lastDetect, ...readMarkers(lastDetect) });
    return;
  }
  probeOnboardingShared().catch(() => undefined);
}

/**
 * 新手引导进度检测：数据源读 CommonStateContext，机器 / 大盘 / 告警 / 通知 / 大模型 / 通知记录各拉一次轻量接口。
 * 供着陆页清单、侧栏进度徽标、机器列表横幅与各成功态卡片共用，保证多处口径一致；
 * 随路由变化重新探测（已完成项走本地缓存、未完成项受 PROBE_MIN_INTERVAL 节流），
 * 也可由 refreshOnboardingProgress 就地刷新（不受节流限制）。
 */
export default function useOnboardingProgress(): OnboardingProgress {
  const { datasourceList, profile } = useContext(CommonStateContext);
  const { pathname } = useLocation();
  const [detect, setDetect] = useState<DetectState>(lastDetect);

  // 订阅广播时套一层挂载判断：卸载后再收到广播就丢弃，避免 React 报
  // "Can't perform a React state update on an unmounted component"
  useEffect(() => {
    let mounted = true;
    const listener = (next: DetectState) => {
      if (mounted) setDetect(next);
    };
    listeners.add(listener);
    return () => {
      mounted = false;
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_DONE_KEY)) {
      lastDetect = DONE_DETECT;
      setDetect(DONE_DETECT);
      return;
    }
    // 缓存按用户隔离，profile 由 App 初始化时拉取。理论上本 hook 的挂载点都在初始化之后，
    // 拿不到 id 只可能是异常路径 —— 此时退回改动前的行为：照旧探测，只是不读写缓存
    const uid = profile?.id;
    if (!uid) {
      probeOnboardingShared().catch(() => undefined);
      return;
    }
    detectCacheUid = uid;
    if (isProbeThrottled(hydrateDetectCache(uid))) {
      return;
    }
    probeOnboardingShared().catch(() => undefined);
  }, [pathname, profile?.id]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_DONE_KEY, '1');
    } catch (e) {
      // localStorage 不可用时仅本次会话隐藏
    }
    // 走广播而不是只 setDetect：侧栏徽标、着陆页清单等多个挂载点要一起收起
    publish(DONE_DETECT);
  }, []);

  const doneMap = useMemo<Record<OnboardingDisplayKey | OnboardingDerivedKey, boolean>>(

    () => ({
      machine: detect.machine,
      // 没有机器上报就不可能套用主机大盘、跑主机告警或验证采集，这几步统一 gate 在 machine 上，
      // 避免"未部署采集器却显示主机大盘已完成"的矛盾态
      hostDashboard: detect.machine && detect.hostDashboard,
      hostAlert: detect.machine && detect.hostAlert,
      hostNotifyBound: detect.hostNotifyBound,
      collectVerified: detect.machine && detect.collectVerified,
      // 通知都没配就谈不上"发过测试告警"
      testDelivered: detect.notification && (detect.testDeliveredLocal || detect.notifyUsed),
      datasource: detect.dismissed || !!datasourceList?.length,
      dashboard: detect.dashboard,
      alert: detect.alert,
      notification: detect.notification,
      llm: detect.llm,
    }),
    [detect, datasourceList],
  );

  const total = ONBOARDING_STEP_KEYS.length;
  const doneCount = ONBOARDING_STEP_KEYS.filter((key) => doneMap[key]).length;

  useEffect(() => {
    if (detect.loaded && doneCount === total) {
      try {
        localStorage.setItem(ONBOARDING_DONE_KEY, '1');
      } catch (e) {
        // localStorage 不可用时降级为本次会话短路
      }
    }
  }, [detect.loaded, doneCount, total]);

  return { loaded: detect.loaded, total, doneCount, doneMap, dismiss };
}
