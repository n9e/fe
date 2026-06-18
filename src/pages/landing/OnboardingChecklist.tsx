import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { Server, Database, Check, ArrowRight, type LucideIcon } from 'lucide-react';

import useOnboardingProgress, { OnboardingStepKey } from '@/components/OnboardingProgress/useOnboardingProgress';

interface StepDef {
  key: OnboardingStepKey;
  to: string;
}

interface TrackDef {
  key: 'host' | 'data';
  icon: LucideIcon;
  steps: StepDef[];
}

// 两条平行引导线：主机监控线（机器单独成线）+ 数据接入线
const TRACKS: TrackDef[] = [
  {
    key: 'host',
    icon: Server,
    steps: [
      { key: 'machine', to: '/targets' },
      { key: 'hostDashboard', to: '/components' },
    ],
  },
  {
    key: 'data',
    icon: Database,
    steps: [
      { key: 'datasource', to: '/datasources' },
      { key: 'dashboard', to: '/dashboards' },
      { key: 'alert', to: '/alert-rules' },
    ],
  },
];

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
          {TRACKS.map((track) => {
            const TrackIcon = track.icon;
            return (
              <section className='n9e-landing-onboarding-panel' key={track.key}>
                <div className='n9e-landing-onboarding-panel-tag'>
                  <span className={classNames('n9e-landing-onboarding-tag-icon', `n9e-landing-onboarding-tag-icon-${track.key}`)}>
                    <TrackIcon strokeWidth={1.9} />
                  </span>
                  <span className='n9e-landing-onboarding-tag-name'>{t(`onboarding.${track.key}Track`)}</span>
                </div>
                <div className='n9e-landing-onboarding-steps'>
                  {track.steps.map((step) => {
                    const done = doneMap[step.key];
                    return (
                      <button type='button' key={step.key} onClick={() => history.push(step.to)} className='n9e-landing-onboarding-step'>
                        <span className={classNames('n9e-landing-onboarding-node', done ? 'n9e-landing-onboarding-node-done' : 'n9e-landing-onboarding-node-todo')}>
                          {done ? <Check strokeWidth={2.4} /> : null}
                        </span>
                        <span className='n9e-landing-onboarding-step-text'>
                          <span className={classNames('n9e-landing-onboarding-step-title', { 'n9e-landing-onboarding-step-title-done': done })}>{t(`onboarding.steps.${step.key}.title`)}</span>
                          <span className='n9e-landing-onboarding-step-desc'>{t(`onboarding.steps.${step.key}.desc`)}</span>
                        </span>
                        <ArrowRight className='n9e-landing-onboarding-step-arrow' />
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
