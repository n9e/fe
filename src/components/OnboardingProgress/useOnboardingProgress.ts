import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { CommonStateContext } from '@/App';
import { getMonObjectList } from '@/services/targets';
import { getBusiGroupsDashboards } from '@/services/dashboardV2';
import { getBusiGroupsAlertRules } from '@/services/warning';

export type OnboardingStepKey = 'machine' | 'hostDashboard' | 'datasource' | 'dashboard' | 'alert';

export const ONBOARDING_STEP_KEYS: OnboardingStepKey[] = ['machine', 'hostDashboard', 'datasource', 'dashboard', 'alert'];

interface DetectState {
  machine: boolean;
  dashboard: boolean;
  // 是否存在「主机大盘」（按 name 近似判断，与「任意大盘」dashboard 区分开）
  hostDashboard: boolean;
  alert: boolean;
  loaded: boolean;
}

export interface OnboardingProgress {
  loaded: boolean;
  total: number;
  doneCount: number;
  doneMap: Record<OnboardingStepKey, boolean>;
}

// 全部完成后写入会话级标记，已上手的用户后续直接短路、不再探测，避免每次加载都拉全量大盘 / 告警
const ONBOARDING_DONE_KEY = 'n9e_onboarding_done';
const DONE_DETECT: DetectState = { machine: true, dashboard: true, hostDashboard: true, alert: true, loaded: true };

// 跨实例（侧栏徽标 + 着陆页清单）与多次挂载共享的最近一次探测结果：
// 既作初始值避免重复请求与闪烁，也用于跳过已完成步骤的探测（大盘 / 告警接口偏重，置真后不再重复拉取）。
let lastDetect: DetectState = { machine: false, dashboard: false, hostDashboard: false, alert: false, loaded: false };

// 内置主机大盘的 name 约定：中文盘多为「机器…」，英文盘含 Host（如 Host Table NG / Windows Host by Categraf），
// 与内置库 integrations/Linux 对齐。仅按 name 关键字近似判断「是否套用过主机大盘」，无需额外接口。
const HOST_DASHBOARD_NAME_HINTS = ['机器', 'host'];
function isHostDashboardName(name?: string): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return HOST_DASHBOARD_NAME_HINTS.some((hint) => lower.includes(hint));
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
            const list = (res as { name?: string }[]) ?? [];
            return { any: known.dashboard || list.length > 0, host: known.hostDashboard || list.some((board) => isHostDashboardName(board?.name)) };
          },
          () => ({ any: known.dashboard, host: known.hostDashboard }),
        );
  const alertP = known.alert
    ? Promise.resolve(true)
    : getBusiGroupsAlertRules(undefined).then(
        (res) => (res?.dat?.length ?? 0) > 0,
        () => false,
      );

  return Promise.all([machineP, dashboardP, alertP]).then(([machine, dashboard, alert]) => {
    lastDetect = { machine, dashboard: dashboard.any, hostDashboard: dashboard.host, alert, loaded: true };
    return lastDetect;
  });
}

/**
 * 新手引导进度检测：数据源读 CommonStateContext，机器 / 大盘 / 告警各拉一次轻量接口。
 * 供着陆页清单与侧栏进度徽标共用，保证两处口径一致；随路由变化重新探测以反映刚完成的步骤。
 */
export default function useOnboardingProgress(): OnboardingProgress {
  const { datasourceList } = useContext(CommonStateContext);
  const { pathname } = useLocation();
  const [detect, setDetect] = useState<DetectState>(lastDetect);

  useEffect(() => {
    if (sessionStorage.getItem(ONBOARDING_DONE_KEY)) {
      setDetect(DONE_DETECT);
      return;
    }
    let cancelled = false;
    probeOnboarding().then((next) => {
      if (!cancelled) setDetect(next);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const doneMap = useMemo<Record<OnboardingStepKey, boolean>>(
    () => ({
      machine: detect.machine,
      // 没有机器上报就不可能套用主机大盘，gate 在 machine 上，避免“未部署采集器却显示主机大盘已完成”的矛盾态
      hostDashboard: detect.machine && detect.hostDashboard,
      datasource: !!datasourceList?.length,
      dashboard: detect.dashboard,
      alert: detect.alert,
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
