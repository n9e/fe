import React from 'react';
import { useTranslation } from 'react-i18next';

import OnboardingTracks from './OnboardingTracks';
import { OnboardingStepKey } from './useOnboardingProgress';

interface Props {
  doneMap: Record<OnboardingStepKey, boolean>;
  doneCount: number;
  total: number;
  /** 点击某步 / 底部链接时跳转，并由调用方关闭弹窗 */
  onNavigate: (to: string) => void;
}

/** 侧栏徽标点击后弹出的紧凑版引导清单（窄版竖排，复用同一进度数据） */
export default function OnboardingPopoverContent({ doneMap, doneCount, total, onNavigate }: Props) {
  const { t } = useTranslation('n9e-landing');

  return (
    <div className='n9e-onboarding-pop'>
      <div className='n9e-onboarding-pop-head'>
        <span className='n9e-onboarding-pop-title'>{t('onboarding.title')}</span>
        <span className='n9e-onboarding-pop-count'>{t('onboarding.progress', { done: doneCount, total })}</span>
      </div>
      <div className='n9e-onboarding-pop-tracks'>
        <OnboardingTracks
          doneMap={doneMap}
          onStepClick={onNavigate}
          checkStrokeWidth={2.6}
          arrowProps={{ size: 15, strokeWidth: 1.9 }}
          classes={{
            track: 'n9e-onboarding-pop-track',
            trackTag: 'n9e-onboarding-pop-track-tag',
            trackIcon: 'n9e-onboarding-pop-track-icon',
            trackName: 'n9e-onboarding-pop-track-name',
            steps: 'n9e-onboarding-pop-steps',
            step: 'n9e-onboarding-pop-step',
            node: 'n9e-onboarding-pop-node',
            nodeDone: 'is-done',
            nodeTodo: 'is-todo',
            stepText: 'n9e-onboarding-pop-step-text',
            stepTitle: 'n9e-onboarding-pop-step-title',
            stepTitleDone: 'is-done',
            stepDesc: 'n9e-onboarding-pop-step-desc',
            stepArrow: 'n9e-onboarding-pop-step-arrow',
          }}
        />
      </div>
    </div>
  );
}
