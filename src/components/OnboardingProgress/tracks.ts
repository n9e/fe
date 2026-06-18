import { Server, Database, type LucideIcon } from 'lucide-react';

import { OnboardingStepKey } from './useOnboardingProgress';

export interface OnboardingStep {
  key: OnboardingStepKey;
  to: string;
}

export interface OnboardingTrack {
  key: 'host' | 'data';
  icon: LucideIcon;
  steps: OnboardingStep[];
}

// 两条平行引导线：主机监控线（机器单独成线）+ 数据接入线。着陆页整版清单与侧栏弹窗共用。
export const ONBOARDING_TRACKS: OnboardingTrack[] = [
  {
    key: 'data',
    icon: Database,
    steps: [
      { key: 'datasource', to: '/datasources' },
      { key: 'dashboard', to: '/dashboards' },
      { key: 'alert', to: '/alert-rules' },
    ],
  },
  {
    key: 'host',
    icon: Server,
    steps: [
      { key: 'machine', to: '/targets' },
      { key: 'hostDashboard', to: '/components?component=Linux' },
    ],
  },
];
