import React from 'react';
import { Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import _ from 'lodash';

import { IS_PLUS } from '@/utils/constant';
import useOnboardingProgress from '@/components/OnboardingProgress/useOnboardingProgress';

import { useOnboardingActions } from '../index';
import { NEXT_STEPS_DISMISSED_KEY, NS } from '../constants';
import { hasActionableRows, pickPrimaryRow, NextStepsVariant } from './visibility';

type RowKey = 'collect' | 'pack' | 'notify' | 'test';

interface Props {
  /**
   * compact 用于弹窗成功态内嵌（每步一行、带描述）；
   * inline 用于机器列表页工具栏内的单行常驻条（只列未完成项、描述进 Tooltip）。
   */
  variant?: NextStepsVariant;
  /**
   * 「配置采集」入口。只有机器列表页能提供 —— 采集向导依赖 CategrafInstallMeta 与列表选中的机器，
   * 不传则不展示该行。
   */
  onCollect?: () => void;
  /** 触发任意动作前的收尾，通常是关闭承载本卡片的弹窗，避免弹窗叠在动作弹窗下面继续轮询 */
  onBeforeAction?: () => void;
}

function readDismissed(): boolean {
  try {
    return !!localStorage.getItem(NEXT_STEPS_DISMISSED_KEY);
  } catch (e) {
    return false;
  }
}

function persistDismissed() {
  try {
    localStorage.setItem(NEXT_STEPS_DISMISSED_KEY, '1');
  } catch (e) {
    // 存不下只影响下次还会不会再提示一遍，不值得打断渲染
  }
}

/**
 * 「接下来」接力：装完机器后把「套大盘 → 开告警 → 配通知 → 验证送达」串起来。
 *
 * 完成态直接读 useOnboardingProgress 的 doneMap，不另建真相源，所以和侧栏徽标、着陆页清单
 * 始终一致；用户中途退出再回来也不会从头念一遍。
 */
export default function NextStepsCard({ variant = 'compact', onCollect, onBeforeAction }: Props) {
  const { t } = useTranslation(NS);
  const { openAction, enabled } = useOnboardingActions();
  const { loaded, doneMap } = useOnboardingProgress();
  const [dismissed, setDismissed] = React.useState(readDismissed);

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
      // 只看「存在通知规则」不够：基础包允许 notify_rule_ids 留空导入，主机告警可能一条都没绑
      // 通知，真告警仍无人收到。已有启用中的主机告警时，额外要求至少一条真的绑定了通知；
      // 主机告警还没导入时「绑定」无从谈起，维持「有通知规则即完成」的原口径。
      done: doneMap.notification && (!doneMap.hostAlert || doneMap.hostNotifyBound),
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

  const runAction = (onClick: () => void) => {
    onBeforeAction?.();
    onClick();
  };

  if (variant === 'inline') {
    if (dismissed) {
      return null;
    }
    // 分母只算必做项，与引导清单「可选步骤不计入进度」的口径保持一致
    const required = _.filter(rows, (row) => !row.optional);
    const doneCount = _.filter(required, 'done').length;
    // 已完成项压成一个数字，不再各占一行 —— 这一行回答的是「还剩什么」，不是进度回顾
    const pending = _.filter(rows, (row) => !row.done);
    // hasActionableRows('inline') 已经保证存在未完成的必做项，这里必然挑得出主按钮
    const primary = pickPrimaryRow(rows);

    return (
      <div className='mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-0 border-b border-dashed border-[var(--fc-border-color)] pb-3'>
        <span className='font-bold'>{t('card.title')}</span>
        <span className='text-soft'>{`${doneCount}/${required.length}`}</span>
        {_.map(pending, (row) => (
          // 描述进 Tooltip：撑住原先「一项一行」的正是这段文案，摘掉它几项才能并排
          <Tooltip key={row.key} title={t(`card.rows.${row.key}.desc`)}>
            <a onClick={() => runAction(row.onClick)}>
              {t(`card.rows.${row.key}.title`)}
              {row.optional && <span className='ml-1 text-[10px] text-soft'>{t('card.optional')}</span>}
            </a>
          </Tooltip>
        ))}
        {primary && (
          // ml-auto 把主按钮和关闭推到最右：中间的步骤链接再多也不会把它们挤成不对齐的一坨
          <Button size='small' type='primary' className='ml-auto' onClick={() => runAction(primary.onClick)}>
            {t(`card.rows.${primary.key}.action`)}
          </Button>
        )}
        <Tooltip title={t('card.dismiss')}>
          <a
            className='text-soft'
            onClick={() => {
              setDismissed(true);
              persistDismissed();
            }}
          >
            <CloseOutlined />
          </a>
        </Tooltip>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-1 font-bold'>{t('card.title')}</div>
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
            <Button size='small' type='primary' ghost={row.optional} onClick={() => runAction(row.onClick)}>
              {t(`card.rows.${row.key}.action`)}
            </Button>
          )}
        </div>
      ))}
      <div className='mt-1 text-soft'>{t('card.later')}</div>
    </div>
  );
}
