import React from 'react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

const ITEM_KEYS = ['cross_team', 'escalation', 'global_callback'];

interface Props {
  className?: string;
}

/** 订阅规则的三类典型场景，新建页的提示卡片与列表空状态共用同一份文案 */
export default function ScenarioList({ className }: Props) {
  const { t } = useTranslation('alertSubscribes');

  return (
    <ul className={classnames('mb-0 pl-[18px] list-disc text-left', className)}>
      {_.map(ITEM_KEYS, (key) => (
        <li key={key} className='leading-[1.7]'>
          {t(`scenario_tips.${key}`)}
        </li>
      ))}
    </ul>
  );
}
