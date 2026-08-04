import { Server, Database, Sparkles, type LucideIcon } from 'lucide-react';

import { OnboardingDisplayKey } from './useOnboardingProgress';

/**
 * 步骤点击后就地打开的动作弹窗，实现在 `@/components/OnboardingActions`。
 * 类型定义放在这里而不是那边，是为了让依赖方向保持 OnboardingActions → OnboardingProgress 单向。
 */
export type OnboardingActionKey = 'pack' | 'notify' | 'test';

export interface OnboardingStep {
  key: OnboardingDisplayKey;
  /**
   * 兜底跳转目标。带 action 的步骤也一律给一个 `to`：Provider 不可用时（未挂载 / 商业版）
   * 点击仍能跳到相关页面，而不是毫无反应。
   */
  to: string;
  /** 有值时点击就地开弹窗，不跳页 */
  action?: OnboardingActionKey;
  /** 可选步骤：展示但不计入进度分母 */
  optional?: boolean;
}

export interface OnboardingTrack {
  key: 'host' | 'data' | 'ai';
  icon: LucideIcon;
  steps: OnboardingStep[];
}

// 三条平行引导线：数据接入线（数据源 → 大盘 → 告警 → 通知，闭环到「告警能发出来」）、
// 主机监控线（从装完机器一路走到「真的收到过一条通知」）、智能化线（接入大模型解锁 AI）。
// 着陆页整版清单与侧栏弹窗共用。notification 同时出现在数据线和主机线，两条路都要走到它，
// 完成态共享；它在 ONBOARDING_STEP_KEYS 里只出现一次，因此只计一次分。
export const ONBOARDING_TRACKS: OnboardingTrack[] = [
  {
    key: 'data',
    icon: Database,
    steps: [
      { key: 'datasource', to: '/datasources' },
      { key: 'dashboard', to: '/dashboards' },
      { key: 'alert', to: '/alert-rules' },
      { key: 'notification', to: '/notification-rules', action: 'notify' },
    ],
  },
  {
    key: 'host',
    icon: Server,
    steps: [
      { key: 'machine', to: '/targets?onboarding=install' },
      { key: 'collectVerified', to: '/targets?onboarding=collect', optional: true },
      { key: 'hostDashboard', to: '/components?component=Linux', action: 'pack' },
      { key: 'hostAlert', to: '/alert-rules', action: 'pack' },
      { key: 'notification', to: '/notification-rules', action: 'notify' },
      { key: 'testDelivered', to: '/notification-rules', action: 'test' },
    ],
  },
  {
    key: 'ai',
    icon: Sparkles,
    // Open-source onboarding only; ENT FlashAI host is not on this track.
    steps: [{ key: 'llm', to: '/ai-config/llm-configs' }],
  },
];
