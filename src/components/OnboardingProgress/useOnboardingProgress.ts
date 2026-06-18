import { useContext, useEffect, useMemo, useState } from 'react';

import { CommonStateContext } from '@/App';
import { getMonObjectList } from '@/services/targets';
import { getBusiGroupsDashboards } from '@/services/dashboardV2';
import { getBusiGroupsAlertRules } from '@/services/warning';

export type OnboardingStepKey = 'machine' | 'hostDashboard' | 'datasource' | 'dashboard' | 'alert';

export const ONBOARDING_STEP_KEYS: OnboardingStepKey[] = ['machine', 'hostDashboard', 'datasource', 'dashboard', 'alert'];

interface DetectState {
  machine: boolean;
  dashboard: boolean;
  alert: boolean;
  loaded: boolean;
}

export interface OnboardingProgress {
  loaded: boolean;
  total: number;
  doneCount: number;
  doneMap: Record<OnboardingStepKey, boolean>;
}

/**
 * 新手引导进度检测：数据源读 CommonStateContext，机器 / 大盘 / 告警各拉一次轻量接口。
 * 供着陆页清单与侧栏进度徽标共用，保证两处口径一致。
 */
export default function useOnboardingProgress(): OnboardingProgress {
  const { datasourceList } = useContext(CommonStateContext);
  const [detect, setDetect] = useState<DetectState>({ machine: false, dashboard: false, alert: false, loaded: false });

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([getMonObjectList({ p: 1, limit: 1 }), getBusiGroupsDashboards(undefined), getBusiGroupsAlertRules(undefined)])
      .then(([machineRes, dashboardRes, alertRes]) => {
        if (cancelled) return;
        setDetect({
          machine: machineRes.status === 'fulfilled' && (machineRes.value?.dat?.total ?? 0) > 0,
          dashboard: dashboardRes.status === 'fulfilled' && ((dashboardRes.value as any[])?.length ?? 0) > 0,
          alert: alertRes.status === 'fulfilled' && (alertRes.value?.dat?.length ?? 0) > 0,
          loaded: true,
        });
      })
      .catch(() => {
        if (!cancelled) setDetect((s) => ({ ...s, loaded: true }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const doneMap = useMemo<Record<OnboardingStepKey, boolean>>(
    () => ({
      machine: detect.machine,
      hostDashboard: detect.dashboard,
      datasource: !!datasourceList?.length,
      dashboard: detect.dashboard,
      alert: detect.alert,
    }),
    [detect, datasourceList],
  );

  const total = ONBOARDING_STEP_KEYS.length;
  const doneCount = ONBOARDING_STEP_KEYS.filter((key) => doneMap[key]).length;

  return { loaded: detect.loaded, total, doneCount, doneMap };
}
