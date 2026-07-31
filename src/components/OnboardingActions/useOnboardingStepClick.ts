import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { OnboardingStep } from '@/components/OnboardingProgress/tracks';

import { useOnboardingActions } from './index';

/**
 * 引导清单里点某一步该做什么：带 action 的就地开弹窗，其余按 to 跳转。
 * 动作层不可用（商业版）或当前用户无该动作权限（弹窗开了也只会在提交时 403）时
 * 一律回退到跳转 —— 点了没反应是最糟的结果。
 */
export default function useOnboardingStepClick() {
  const history = useHistory();
  const { openAction, enabled, permittedActions } = useOnboardingActions();

  return useCallback(
    (step: OnboardingStep) => {
      if (step.action && enabled && permittedActions[step.action]) {
        openAction(step.action);
        return;
      }
      history.push(step.to);
    },
    [enabled, history, openAction, permittedActions],
  );
}
