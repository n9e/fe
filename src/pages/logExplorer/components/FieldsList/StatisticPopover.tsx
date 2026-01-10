import React, { useState } from 'react';
import _ from 'lodash';
import { Popover, Col, Statistic, Button } from 'antd';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../../constants';
import { Field } from './types';

interface Props {
  statName: string;
  statValue: number | string;
  field: Field;
  onStatisticClick?: (type: string, statName: string, field: Field) => void;
  setTopNVisible: (visible: boolean) => void;
}

export default function StatisticPopover(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { statName, statValue, field, onStatisticClick, setTopNVisible } = props;
  const [statisticPopoverVisible, setStatisticPopoverVisible] = useState<boolean>(false);

  return (
    <Popover
      placement='bottom'
      trigger='click'
      content={
        <>
          <div>
            <Button
              type='link'
              onClick={() => {
                onStatisticClick?.('table', statName, field);
                setStatisticPopoverVisible(false);
                setTopNVisible(false);
              }}
            >
              {t('field_value_statistic.view_statistic')}
            </Button>
          </div>
          <div>
            <Button
              type='link'
              onClick={() => {
                onStatisticClick?.('timeseries', statName, field);
                setStatisticPopoverVisible(false);
                setTopNVisible(false);
              }}
            >
              {t('field_value_statistic.view_timeseries')}
            </Button>
          </div>
        </>
      }
      visible={statisticPopoverVisible}
      onVisibleChange={(visible) => {
        setStatisticPopoverVisible(visible);
      }}
    >
      <Col span={_.includes(['unique_count', 'exist_ratio'], statName) ? 12 : 8} key={statName}>
        <Statistic
          className='n9e-logexplorer-field-statistic text-center hover:bg-fc-100 cursor-pointer'
          title={t(`stats.${statName}`)}
          value={statValue}
          suffix={statName === 'exist_ratio' ? '%' : undefined}
        />
      </Col>
    </Popover>
  );
}
