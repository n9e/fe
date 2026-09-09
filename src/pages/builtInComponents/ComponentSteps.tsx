import React, { useEffect, useMemo, useState } from 'react';
import { Space, Tooltip } from 'antd';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import _ from 'lodash';

import { IS_PLUS } from '@/utils/constant';

import { getPayloads } from './services';
import { Payload, TypeEnum } from './types';
import { PackStepKey, readPackProgress } from './packProgress';

interface Props {
  ident: string;
  componentId: number;
  activeTab: string;
  onGoTab: (tab: string) => void;
  /** 导入成功后由外层递增，用来重读本地进度 */
  refreshFlag?: number;
}

const STEP_TABS: Record<PackStepKey, string> = {
  collect: 'tab_collectTpls',
  dashboard: 'tab_dashboards',
  alert: 'tab_alertRules',
};

const STEP_TYPES: Record<PackStepKey, TypeEnum> = {
  collect: TypeEnum.collect,
  dashboard: TypeEnum.dashboard,
  alert: TypeEnum.alert,
};

/**
 * 一个组件接入到位的三步：配置采集 → 导入仪表盘 → 导入告警规则。
 *
 * 这三样本来就都在这个抽屉的页签里，只是各自为战 —— 用户导完仪表盘不会知道还该去隔壁开告警。
 * 这里只做两件事：把顺序说出来，并记住走到哪了。
 *
 * **没有的步骤不展示**：内置库很不均匀，不少组件根本没有仪表盘或告警规则模板。
 * 摆一个点进去是空表的步骤，比不摆更伤。
 */
export default function ComponentSteps(props: Props) {
  const { t } = useTranslation('builtInComponents');
  const { ident, componentId, activeTab, onGoTab, refreshFlag } = props;
  const [available, setAvailable] = useState<PackStepKey[]>([]);
  const [progress, setProgress] = useState<Record<string, PackStepKey[]>>({});

  useEffect(() => {
    setProgress(readPackProgress());
  }, [ident, refreshFlag]);

  useEffect(() => {
    if (!componentId) {
      setAvailable([]);
      return;
    }
    let stale = false;
    // 采集模板页签本身只在专业版渲染，开源版这一步无从谈起
    const steps: PackStepKey[] = IS_PLUS ? ['collect', 'dashboard', 'alert'] : ['dashboard', 'alert'];
    Promise.all(
      _.map(steps, (step) =>
        getPayloads<Payload[]>({ component_id: componentId, type: STEP_TYPES[step] })
          .then((res) => (_.isEmpty(res) ? undefined : step))
          .catch(() => undefined),
      ),
    ).then((res) => {
      if (stale) return;
      setAvailable(_.compact(res));
    });
    return () => {
      stale = true;
    };
  }, [componentId]);

  const doneSteps = progress[ident] ?? [];
  const rows = useMemo(() => _.filter(available, (step) => !!STEP_TABS[step]), [available]);

  // 一步都没有的组件（只有说明文档的那些）不占地方
  if (rows.length === 0) return null;

  return (
    <div className='mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg fc-border bg-fc-100 px-3 py-2'>
      <span className='font-bold text-title'>{t('pack.title')}</span>
      {_.map(rows, (step, idx) => {
        const done = _.includes(doneSteps, step);
        const active = activeTab === STEP_TABS[step];
        return (
          <Tooltip key={step} title={t(`pack.steps.${step}_tip`)}>
            <a className={classNames('flex items-center gap-1', { 'font-bold': active })} onClick={() => onGoTab(STEP_TABS[step])}>
              <span
                className={classNames('flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full text-[10px]', {
                  'bg-[var(--fc-fill-success)] text-white': done,
                  'border border-dashed border-[var(--fc-border-color)] text-soft': !done,
                })}
              >
                {done ? <Check size={9} strokeWidth={3} /> : idx + 1}
              </span>
              <span className={classNames({ 'text-soft line-through': done })}>{t(`pack.steps.${step}`)}</span>
            </a>
          </Tooltip>
        );
      })}
      <Space className='text-[12px] text-soft'>{t('pack.progress', { done: _.intersection(doneSteps, rows).length, total: rows.length })}</Space>
    </div>
  );
}
