import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { ArrowRight, Check } from 'lucide-react';

import { ONBOARDING_TRACKS } from './tracks';
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
        {ONBOARDING_TRACKS.map((track) => {
          const TrackIcon = track.icon;
          return (
            <div className='n9e-onboarding-pop-track' key={track.key}>
              <div className='n9e-onboarding-pop-track-tag'>
                <span className='n9e-onboarding-pop-track-icon'>
                  <TrackIcon strokeWidth={1.9} />
                </span>
                <span className='n9e-onboarding-pop-track-name'>{t(`onboarding.${track.key}Track`)}</span>
              </div>
              <div className='n9e-onboarding-pop-steps'>
                {track.steps.map((step) => {
                  const done = doneMap[step.key];
                  return (
                    <button type='button' key={step.key} className='n9e-onboarding-pop-step' onClick={() => onNavigate(step.to)}>
                      <span className={classNames('n9e-onboarding-pop-node', done ? 'is-done' : 'is-todo')}>{done ? <Check strokeWidth={2.6} /> : null}</span>
                      <span className='n9e-onboarding-pop-step-text'>
                        <span className={classNames('n9e-onboarding-pop-step-title', { 'is-done': done })}>{t(`onboarding.steps.${step.key}.title`)}</span>
                        <span className='n9e-onboarding-pop-step-desc'>{t(`onboarding.steps.${step.key}.desc`)}</span>
                      </span>
                      <ArrowRight className='n9e-onboarding-pop-step-arrow' size={15} strokeWidth={1.9} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
