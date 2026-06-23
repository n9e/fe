import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import useOnboardingProgress from '@/components/OnboardingProgress/useOnboardingProgress';
import OnboardingTracks from '@/components/OnboardingProgress/OnboardingTracks';

export default function OnboardingChecklist() {
  const { t } = useTranslation('n9e-landing');
  const history = useHistory();
  const { loaded, doneCount, total, doneMap } = useOnboardingProgress();

  // 加载中、或已全部完成（5/5）时不展示；完成前一直显示，引导用户跑通监控
  if (!loaded || doneCount === total) {
    return null;
  }

  return (
    <section className='n9e-landing-onboarding'>
      <div className='n9e-landing-onboarding-shell'>
        <div className='n9e-landing-onboarding-head'>
          <div className='n9e-landing-onboarding-heading'>
            <h3 className='n9e-landing-onboarding-title'>{t('onboarding.title')}</h3>
            <p className='n9e-landing-onboarding-subtitle'>{t('onboarding.subtitle')}</p>
          </div>
          <div className='n9e-landing-onboarding-meter'>
            <span className='n9e-landing-onboarding-progress-label'>{t('onboarding.progress', { done: doneCount, total })}</span>
          </div>
        </div>
        <div className='n9e-landing-onboarding-tracks'>
          <OnboardingTracks
            doneMap={doneMap}
            onStepClick={(to) => history.push(to)}
            trackIconExtra={(key) => `n9e-landing-onboarding-tag-icon-${key}`}
            classes={{
              track: 'n9e-landing-onboarding-panel',
              trackTag: 'n9e-landing-onboarding-panel-tag',
              trackIcon: 'n9e-landing-onboarding-tag-icon',
              trackName: 'n9e-landing-onboarding-tag-name',
              steps: 'n9e-landing-onboarding-steps',
              step: 'n9e-landing-onboarding-step',
              node: 'n9e-landing-onboarding-node',
              nodeDone: 'n9e-landing-onboarding-node-done',
              nodeTodo: 'n9e-landing-onboarding-node-todo',
              stepText: 'n9e-landing-onboarding-step-text',
              stepTitle: 'n9e-landing-onboarding-step-title',
              stepTitleDone: 'n9e-landing-onboarding-step-title-done',
              stepDesc: 'n9e-landing-onboarding-step-desc',
              stepArrow: 'n9e-landing-onboarding-step-arrow',
            }}
          />
        </div>
      </div>
    </section>
  );
}
