import React from 'react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NS, SCENARIO_KEYS } from '../constants';

interface Props {
  className?: string;
}

/** 工作流的三类典型场景，列表空状态与新建页的场景提示卡共用同一份文案 */
export default function ScenarioList({ className }: Props) {
  const { t } = useTranslation(NS);

  return (
    <ul className={classnames('mb-0 pl-[18px] list-disc text-left', className)}>
      {_.map(SCENARIO_KEYS, (key) => (
        <li key={key} className='leading-[1.7]'>
          {t(`scenario_tips.${key}`)}
        </li>
      ))}
    </ul>
  );
}
