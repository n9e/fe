import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover } from 'antd';
import classNames from 'classnames';

import useOnboardingStepClick from '@/components/OnboardingActions/useOnboardingStepClick';

import useOnboardingProgress from './useOnboardingProgress';
import OnboardingPopoverContent from './PopoverContent';
import { OnboardingStep } from './tracks';
import './style.less';

interface ProgressRingProps {
  done: number;
  total: number;
  size?: number;
  stroke?: number;
  color: string;
  trackColor: string;
}

function ProgressRing({ done, total, size = 22, stroke = 2.5, color, trackColor }: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;
  return (
    <svg className='n9e-onboarding-badge-ring' width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill='none' stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill='none'
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap='round'
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct)}
      />
    </svg>
  );
}

interface Props {
  collapsed?: boolean;
  /** 侧栏处于自定义底色（深色 / 主题色）时，徽标改用白字白线 */
  isCustomBg?: boolean;
}

export default function OnboardingProgressBadge({ collapsed, isCustomBg }: Props) {
  const { t } = useTranslation('n9e-landing');
  const onStepClick = useOnboardingStepClick();
  const { loaded, doneCount, total, doneMap, dismiss } = useOnboardingProgress();
  const [open, setOpen] = useState(false);

  // 加载中、或已全部完成时不展示
  if (!loaded || doneCount === total) {
    return null;
  }

  const ringColor = isCustomBg ? '#ffffff' : 'rgb(var(--fc-text-link-rgb))';
  const ringTrack = isCustomBg ? 'rgba(255,255,255,0.28)' : 'rgb(var(--fc-text-link-rgb) / 0.18)';
  const label = t('onboarding.title');
  const countText = `${doneCount}/${total}`;
  const ring = <ProgressRing done={doneCount} total={total} color={ringColor} trackColor={ringTrack} />;

  // 先收起 popover 再执行动作：带 action 的步骤会开弹窗，popover 留着会盖在弹窗上
  const handleStepClick = (step: OnboardingStep) => {
    setOpen(false);
    onStepClick(step);
  };

  const trigger = collapsed ? (
    <button type='button' aria-label={`${label} ${countText}`} className={classNames('n9e-onboarding-badge-collapsed', { 'is-custom-bg': isCustomBg })}>
      {ring}
    </button>
  ) : (
    <button type='button' className={classNames('n9e-onboarding-badge', { 'is-custom-bg': isCustomBg, 'is-open': open })}>
      {ring}
      <span className='n9e-onboarding-badge-label'>{label}</span>
      <span className='n9e-onboarding-badge-count'>{countText}</span>
    </button>
  );

  return (
    <div className={collapsed ? 'px-2 pt-2' : 'px-3 pt-3'}>
      <Popover
        trigger='click'
        visible={open}
        onVisibleChange={setOpen}
        placement='rightTop'
        align={{ offset: [8, -8] }}
        overlayClassName='n9e-onboarding-pop-overlay'
        content={
          <OnboardingPopoverContent
            doneMap={doneMap}
            doneCount={doneCount}
            total={total}
            onStepClick={handleStepClick}
            onDismiss={() => {
              setOpen(false);
              dismiss();
            }}
          />
        }
      >
        {trigger}
      </Popover>
    </div>
  );
}
