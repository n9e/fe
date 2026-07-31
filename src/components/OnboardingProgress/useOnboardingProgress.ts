import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { getMonObjectList } from '@/services/targets';
import { getBusiGroupsDashboards } from '@/services/dashboardV2';
import { getBusiGroupsAlertRules } from '@/services/warning';
import { getItems as getNotifyRules } from '@/pages/notificationRules/services';
import { getList as getLlmConfigs } from '@/pages/aiConfig/llmConfigs/services';
import { getNotifyDelivered } from '@/pages/event/EventNotifyRecords/services';

import { hasEnabledHostRule, isHostBoard, readOnboardingMarker } from './detect';

/** 计入进度分母的步骤 */
export type OnboardingStepKey = 'machine' | 'hostDashboard' | 'hostAlert' | 'testDelivered' | 'datasource' | 'dashboard' | 'alert' | 'notification' | 'llm';

/**
 * 只在清单里展示、不计入分母的步骤。
 * Categraf 装完就自带 OS 基础指标，「配置采集」本质是可选的；而且服务端没有廉价手段判断
 * 某台机器是否验证过采集，若计入分母就只能靠浏览器标记，会让老用户永久停在 N-1。
 */
export type OnboardingOptionalStepKey = 'collectVerified';

export type OnboardingDisplayKey = OnboardingStepKey | OnboardingOptionalStepKey;

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
  // 是否已配置通知规则（告警能否真正发出来）
  notification: boolean;
  // 是否已接入大模型（解锁 AI 助手与智能分析）
  llm: boolean;
  // 服务端探测：这套部署是否曾成功发出过通知。让已在正常使用的老用户自动点亮「发送测试告警」
  delivered: boolean;
  // 采集向导验证通过的本地标记（不计入分母）
  collectVerified: boolean;
  // 测试告警发送成功的本地标记，与 delivered 取或：点完立刻点亮，换浏览器由 delivered 兜住
  testDeliveredLocal: boolean;
  loaded: boolean;
}

export interface OnboardingProgress {
  loaded: boolean;
  total: number;
  doneCount: number;
  doneMap: Record<OnboardingDisplayKey, boolean>;
}

// 全部完成后写入会话级标记，已上手的用户后续直接短路、不再探测，避免每次加载都拉全量大盘 / 告警。
// key 带版本号：步骤集合变化后 total 也变了，沿用旧 key 会把老用户永久钉在「已完成」、再也看不到新步骤。
const ONBOARDING_DONE_KEY = 'n9e_onboarding_done_v2';
const DONE_DETECT: DetectState = {
  machine: true,
  dashboard: true,
  hostDashboard: true,
  alert: true,
  hostAlert: true,
  notification: true,
  llm: true,
  delivered: true,
  collectVerified: true,
  testDeliveredLocal: true,
  loaded: true,
};

// 跨实例（侧栏徽标 + 着陆页清单 + 机器列表横幅 + 各成功态卡片）与多次挂载共享的最近一次探测结果：
// 既作初始值避免重复请求与闪烁，也用于跳过已完成步骤的探测（大盘 / 告警接口偏重，置真后不再重复拉取）。
let lastDetect: DetectState = {
  machine: false,
  dashboard: false,
  hostDashboard: false,
  alert: false,
  hostAlert: false,
  notification: false,
  llm: false,
  delivered: false,
  collectVerified: false,
  testDeliveredLocal: false,
  loaded: false,
};

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
  // 同上，alert（任意告警规则）与 hostAlert（主机类告警）复用同一次请求。
  // 判断条件必须是两者都已知为真：只看 known.alert 会在「有告警规则但还没有主机告警」时永远跳过探测，
  // hostAlert 便再也没有机会点亮。
  const alertP: Promise<{ any: boolean; host: boolean }> =
    known.alert && known.hostAlert
      ? Promise.resolve({ any: true, host: true })
      : getBusiGroupsAlertRules(undefined).then(
          (res) => {
            const list = (res?.dat as { cate?: string; disabled?: number }[]) ?? [];
            return { any: known.alert || list.length > 0, host: known.hostAlert || hasEnabledHostRule(list) };
          },
          () => ({ any: known.alert, host: known.hostAlert }),
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
  // 没有通知规则就不可能送达过，与 doneMap 里 testDelivered 的 gate 保持一致；
  // 也避免全新部署（正是新手引导的目标用户）每次路由变化都白跑一次这个查询。
  // 老后端没有该路由时请求会失败，按未送达处理，此时仅靠本地标记。
  const deliveredP =
    known.delivered || !known.notification
      ? Promise.resolve(known.delivered)
      : getNotifyDelivered().then(
          (res) => !!res?.delivered,
          () => false,
        );

  return Promise.all([machineP, dashboardP, alertP, notificationP, llmP, deliveredP]).then(([machine, dashboard, alert, notification, llm, delivered]) => ({
    machine,
    dashboard: dashboard.any,
    hostDashboard: dashboard.host,
    alert: alert.any,
    hostAlert: alert.host,
    notification,
    llm,
    delivered,
    ...readMarkers(known),
    loaded: true,
  }));
}

/** 共享同一轮探测：并发挂载只发一组请求，结果广播给所有实例 */
function probeOnboardingShared(): Promise<DetectState> {
  if (!pendingProbe) {
    pendingProbe = probeOnboarding()
      .then((next) => {
        publish(next);
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
 * 新手引导进度检测：数据源读 CommonStateContext，机器 / 大盘 / 告警 / 通知 / 大模型 / 送达各拉一次轻量接口。
 * 供着陆页清单、侧栏进度徽标、机器列表横幅与各成功态卡片共用，保证多处口径一致；
 * 随路由变化重新探测，也可由 refreshOnboardingProgress 就地刷新。
 */
export default function useOnboardingProgress(): OnboardingProgress {
  const { datasourceList } = useContext(CommonStateContext);
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
    if (sessionStorage.getItem(ONBOARDING_DONE_KEY)) {
      lastDetect = DONE_DETECT;
      setDetect(DONE_DETECT);
      return;
    }
    probeOnboardingShared().catch(() => undefined);
  }, [pathname]);

  const doneMap = useMemo<Record<OnboardingDisplayKey, boolean>>(
    () => ({
      machine: detect.machine,
      // 没有机器上报就不可能套用主机大盘、跑主机告警或验证采集，这几步统一 gate 在 machine 上，
      // 避免"未部署采集器却显示主机大盘已完成"的矛盾态
      hostDashboard: detect.machine && detect.hostDashboard,
      hostAlert: detect.machine && detect.hostAlert,
      collectVerified: detect.machine && detect.collectVerified,
      // 通知都没配就谈不上"收到过测试告警"
      testDelivered: detect.notification && (detect.testDeliveredLocal || detect.delivered),
      datasource: !!datasourceList?.length,
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
      sessionStorage.setItem(ONBOARDING_DONE_KEY, '1');
    }
  }, [detect.loaded, doneCount, total]);

  return { loaded: detect.loaded, total, doneCount, doneMap };
}
