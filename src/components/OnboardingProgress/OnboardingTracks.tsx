import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Check, ArrowRight } from 'lucide-react';

import { ONBOARDING_TRACKS } from './tracks';
import { OnboardingStepKey } from './useOnboardingProgress';

/** 着陆页整版清单与侧栏弹窗共用同一套「轨道 + 步骤」结构，仅类名与少量装饰参数不同，通过 classes 注入各自类名 */
export interface OnboardingTracksClassNames {
  track: string;
  trackTag: string;
  trackIcon: string;
  trackName: string;
  steps: string;
  step: string;
  node: string;
  nodeDone: string;
  nodeTodo: string;
  stepText: string;
  stepTitle: string;
  stepTitleDone: string;
  stepDesc: string;
  stepArrow: string;
}

interface Props {
  doneMap: Record<OnboardingStepKey, boolean>;
  classes: OnboardingTracksClassNames;
  onStepClick: (to: string) => void;
  /** 着陆页给图标按轨道追加区分类（host/data 不同底色），弹窗版不需要 */
  trackIconExtra?: (trackKey: string) => string | undefined;
  checkStrokeWidth?: number;
  arrowProps?: { size?: number; strokeWidth?: number };
}

export default function OnboardingTracks({ doneMap, classes, onStepClick, trackIconExtra, checkStrokeWidth = 2.4, arrowProps }: Props) {
  const { t } = useTranslation('n9e-landing');

  return (
    <>
      {ONBOARDING_TRACKS.map((track) => {
        const TrackIcon = track.icon;
        return (
          <div className={classes.track} key={track.key}>
            <div className={classes.trackTag}>
              <span className={classNames(classes.trackIcon, trackIconExtra?.(track.key))}>
                <TrackIcon strokeWidth={1.9} />
              </span>
              <span className={classes.trackName}>{t(`onboarding.${track.key}Track`)}</span>
            </div>
            <div className={classes.steps}>
              {track.steps.map((step) => {
                const done = doneMap[step.key];
                return (
                  <button type='button' key={step.key} className={classes.step} onClick={() => onStepClick(step.to)}>
                    <span className={classNames(classes.node, done ? classes.nodeDone : classes.nodeTodo)}>{done ? <Check strokeWidth={checkStrokeWidth} /> : null}</span>
                    <span className={classes.stepText}>
                      <span className={classNames(classes.stepTitle, { [classes.stepTitleDone]: done })}>{t(`onboarding.steps.${step.key}.title`)}</span>
                      <span className={classes.stepDesc}>{t(`onboarding.steps.${step.key}.desc`)}</span>
                    </span>
                    <ArrowRight className={classes.stepArrow} size={arrowProps?.size} strokeWidth={arrowProps?.strokeWidth} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
