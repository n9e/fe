import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Tooltip } from 'antd';
import { CommonStateContext } from '@/App';
import '../locale';

interface IProps {
  queries: any[];
  maxLength?: number;
}

export default function QueryRender(props: IProps) {
  const { t } = useTranslation('DeviceSelect');
  const { busiGroups } = useContext(CommonStateContext);
  const { queries, maxLength = 100 } = props;
  const queriesStr = _.join(
    _.map(queries, (item) => {
      const key = t(`network_device.key.${item.key}`);
      let op = '';
      let values = '';
      if (item.key !== 'all_devices') {
        op = item.op;
        values = _.join(item.values, ', ');
        if (item.key === 'group_ids') {
          values = _.join(
            _.map(item.values, (item) => {
              const group = _.find(busiGroups, { id: item });
              return group ? group.name : item;
            }),
            ', ',
          );
        }
      }
      return `${key}${op}${values ? `"${values}"` : ''}`;
    }),
    ' ',
  );
  return (
    <Tooltip title={queriesStr}>
      <div
        style={{
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {queriesStr}
      </div>
    </Tooltip>
  );
}
