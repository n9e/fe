import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { Server, Database, Check, ArrowRight, type LucideIcon } from 'lucide-react';

import { CommonStateContext } from '@/App';
import { getMonObjectList } from '@/services/targets';
import { getBusiGroupsDashboards } from '@/services/dashboardV2';
import { getBusiGroupsAlertRules } from '@/services/warning';

type StepKey = 'machine' | 'hostDashboard' | 'datasource' | 'dashboard' | 'alert';

interface StepDef {
  key: StepKey;
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

interface DetectState {
  machine: boolean;
  dashboard: boolean;
  alert: boolean;
  loaded: boolean;
}

export default function OnboardingChecklist() {
  const { t } = useTranslation('n9e-landing');
  const history = useHistory();
  const { datasourceList } = useContext(CommonStateContext);

  const [detect, setDetect] = useState<DetectState>({ machine: false, dashboard: false, alert: false, loaded: false });

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([getMonObjectList({ p: 1, limit: 1 }), getBusiGroupsDashboards(undefined), getBusiGroupsAlertRules(undefined)])
      .then(([machineRes, dashboardRes, alertRes]) => {
        if (cancelled) return;
        setDetect({
          machine: machineRes.status === 'fulfilled' && (machineRes.value?.dat?.total ?? 0) > 0,
          dashboard: dashboardRes.status === 'fulfilled' && ((dashboardRes.value as any[])?.length ?? 0) > 0,
          alert: alertRes.status === 'fulfilled' && (alertRes.value?.dat?.length ?? 0) > 0,
          loaded: true,
        });
      })
      .catch(() => {
        if (!cancelled) setDetect((s) => ({ ...s, loaded: true }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const doneMap: Record<StepKey, boolean> = useMemo(
    () => ({
      machine: detect.machine,
      hostDashboard: detect.dashboard,
      datasource: !!datasourceList?.length,
      dashboard: detect.dashboard,
      alert: detect.alert,
    }),
    [detect, datasourceList],
  );

  const allSteps = useMemo(() => _flatSteps(), []);
  const doneCount = allSteps.filter((s) => doneMap[s.key]).length;
  const total = allSteps.length;

  // 加载中、或已全部完成（5/5）时不展示；完成前一直显示，引导用户跑通监控
  if (!detect.loaded || doneCount === total) {
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

function _flatSteps(): StepDef[] {
  return TRACKS.reduce<StepDef[]>((acc, track) => acc.concat(track.steps), []);
}
