import React from 'react';
import { Button } from 'antd';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import _ from 'lodash';

import { IS_PLUS } from '@/utils/constant';
import useOnboardingProgress from '@/components/OnboardingProgress/useOnboardingProgress';

import { useOnboardingActions } from '../index';
import { NEXT_STEPS_COLLAPSED_KEY, NS } from '../constants';
import { hasActionableRows } from './visibility';

type RowKey = 'collect' | 'pack' | 'notify' | 'test';

interface Props {
  /** compact 用于弹窗成功态内嵌，banner 用于机器列表页顶部 */
  variant?: 'compact' | 'banner';
  /**
   * 「配置采集」入口。只有机器列表页能提供 —— 采集向导依赖 CategrafInstallMeta 与列表选中的机器，
   * 不传则不展示该行。
   */
  onCollect?: () => void;
  /** 触发任意动作前的收尾，通常是关闭承载本卡片的弹窗，避免弹窗叠在动作弹窗下面继续轮询 */
  onBeforeAction?: () => void;
}

function readCollapsed(): boolean {
  try {
    return !!localStorage.getItem(NEXT_STEPS_COLLAPSED_KEY);
  } catch (e) {
    return false;
  }
}

function persistCollapsed(collapsed: boolean) {
  try {
    if (collapsed) {
      localStorage.setItem(NEXT_STEPS_COLLAPSED_KEY, '1');
    } else {
      localStorage.removeItem(NEXT_STEPS_COLLAPSED_KEY);
    }
  } catch (e) {
    // 存不下只影响下次是否记住折叠，不值得打断渲染
  }
}

/**
 * 「接下来」接力卡片：装完机器后把「套大盘 → 开告警 → 配通知 → 验证送达」串起来。
 *
 * 完成态直接读 useOnboardingProgress 的 doneMap，不另建真相源，所以和侧栏徽标、着陆页清单
 * 始终一致；用户中途退出再回来也不会从头念一遍。
 */
export default function NextStepsCard({ variant = 'compact', onCollect, onBeforeAction }: Props) {
  const { t } = useTranslation(NS);
  const { openAction, enabled } = useOnboardingActions();
  const { loaded, doneMap } = useOnboardingProgress();
  const [collapsed, setCollapsed] = React.useState(readCollapsed);

  const rows: { key: RowKey; done: boolean; optional?: boolean; onClick: () => void }[] = _.compact([
    onCollect && {
      key: 'collect' as RowKey,
      // 可选行：Categraf 装完就有 OS 基础指标，这步只为数据库/中间件采集，不该卡住进度
      optional: true,
      done: doneMap.collectVerified,
      onClick: onCollect,
    },
    {
      key: 'pack' as RowKey,
      // 一键启用同时导大盘和告警规则，所以两者都完成才算这一行完成
      done: doneMap.hostDashboard && doneMap.hostAlert,
      onClick: () => openAction('pack'),
    },
    {
      key: 'notify' as RowKey,
      done: doneMap.notification,
      onClick: () => openAction('notify'),
    },
    {
      key: 'test' as RowKey,
      done: doneMap.testDelivered,
      onClick: () => openAction('test'),
    },
  ]);

  // 商业版走自己的接入体系；探测还没回来时先不闪一屏未完成；两种形态的收起规则见 visibility.ts
  if (IS_PLUS || !enabled || !loaded || !hasActionableRows(variant, rows)) {
    return null;
  }

  const body = (
    <>
      {_.map(rows, (row) => (
        <div key={row.key} className='flex items-center gap-2 py-1'>
          <span
            className={classNames('flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full', {
              'bg-[var(--fc-fill-success)] text-white': row.done,
              'border border-dashed border-[var(--fc-border-color)]': !row.done,
            })}
          >
            {row.done ? <Check size={9} strokeWidth={3} /> : null}
          </span>
          <span className='min-w-0 flex-1'>
            <span className={classNames({ 'text-soft line-through': row.done })}>{t(`card.rows.${row.key}.title`)}</span>
            {row.optional && <span className='ml-1 text-[10px] text-soft'>{t('card.optional')}</span>}
            <span className='ml-2 text-soft'>{t(`card.rows.${row.key}.desc`)}</span>
          </span>
          {!row.done && (
            <Button
              size='small'
              type='primary'
              ghost={row.optional}
              onClick={() => {
                onBeforeAction?.();
                row.onClick();
              }}
            >
              {t(`card.rows.${row.key}.action`)}
            </Button>
          )}
        </div>
      ))}
    </>
  );

  if (variant === 'banner') {
    return (
      <div className='mb-2 flex-shrink-0 rounded-lg bg-fc-100 fc-border p-4'>
        <div className={classNames('flex items-center justify-between', { 'mb-1': !collapsed })}>
          <span className='font-bold'>{t('card.title')}</span>
          <a
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              persistCollapsed(next);
            }}
          >
            {collapsed ? t('common:btn.expand') : t('common:btn.collapse')}
          </a>
        </div>
        {!collapsed && body}
      </div>
    );
  }

  return (
    <div>
      <div className='mb-1 font-bold'>{t('card.title')}</div>
      {body}
      <div className='mt-1 text-soft'>{t('card.later')}</div>
    </div>
  );
}
