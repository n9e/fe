import { Server, Database, Sparkles, type LucideIcon } from 'lucide-react';

import { OnboardingStepKey } from './useOnboardingProgress';

export interface OnboardingStep {
  key: OnboardingStepKey;
  to: string;
}

export interface OnboardingTrack {
  key: 'host' | 'data' | 'ai';
  icon: LucideIcon;
  steps: OnboardingStep[];
}

// 三条平行引导线：数据接入线（数据源 → 大盘 → 告警 → 通知，闭环到「告警能发出来」）、
// 主机监控线（机器单独成线）、智能化线（接入大模型解锁 AI）。着陆页整版清单与侧栏弹窗共用。
export const ONBOARDING_TRACKS: OnboardingTrack[] = [
  {
    key: 'data',
    icon: Database,
    steps: [
      { key: 'datasource', to: '/datasources' },
      { key: 'dashboard', to: '/dashboards' },
      { key: 'alert', to: '/alert-rules' },
      { key: 'notification', to: '/notification-rules' },
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
  {
    key: 'ai',
    icon: Sparkles,
    steps: [{ key: 'llm', to: '/flashai/llm-configs' }],
  },
];
