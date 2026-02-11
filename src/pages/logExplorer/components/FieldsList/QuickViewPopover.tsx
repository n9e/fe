import React, { useState } from 'react';
import _ from 'lodash';
import { Popover, Button } from 'antd';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../../constants';

interface Props {
  options: {
    func: string;
    field?: string;
    ref?: string;
    group_by?: string;
    field_filter?: string;
  };
  onStatisticClick?: (
    type: string,
    options: {
      func: string;
      field?: string;
      ref?: string;
      group_by?: string;
      field_filter?: string;
    },
  ) => void;
  setTopNVisible: (visible: boolean) => void;
  children: React.ReactNode;
}

export default function StatisticPopover(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { options, onStatisticClick, setTopNVisible, children } = props;
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
                onStatisticClick?.('table', options);
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
                onStatisticClick?.('timeseries', options);
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
        if (onStatisticClick) {
          setStatisticPopoverVisible(visible);
        }
      }}
    >
      {children}
    </Popover>
  );
}
