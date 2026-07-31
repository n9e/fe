import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { OnboardingStep } from '@/components/OnboardingProgress/tracks';

import { useOnboardingActions } from './index';

/**
 * 引导清单里点某一步该做什么：带 action 的就地开弹窗，其余按 to 跳转。
 * 动作层不可用时（商业版）一律回退到跳转 —— 点了没反应是最糟的结果。
 */
export default function useOnboardingStepClick() {
  const history = useHistory();
  const { openAction, enabled } = useOnboardingActions();

  return useCallback(
    (step: OnboardingStep) => {
      if (step.action && enabled) {
        openAction(step.action);
        return;
      }
      history.push(step.to);
    },
    [enabled, history, openAction],
  );
}
