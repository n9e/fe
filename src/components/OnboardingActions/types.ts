import { OnboardingActionKey } from '@/components/OnboardingProgress/tracks';

export type { OnboardingActionKey };

/** 打开动作弹窗时携带的上下文 */
export interface OnboardingActionPayload {
  /** 发送测试告警时默认选中的通知规则，通常是刚快捷创建出来的那条 */
  notifyRuleId?: number;
}

export interface OnboardingActionState {
  key: OnboardingActionKey;
  payload?: OnboardingActionPayload;
}
