import React from 'react';
import { Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';

import { Field, OrderByConfig, AggregateConfig } from '../../../types';
import { NAME_SPACE } from '../../../../constants';

import ConfigPopover from './ConfigPopover';
import Describe from '../Describe';

interface Props {
  eleRef: React.RefObject<HTMLDivElement>;
  indexData: Field[];
  aggregates: AggregateConfig[];

  value?: OrderByConfig[];
  onChange?: (values: OrderByConfig[]) => void;
}

export default function Aggregates(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { eleRef, indexData, aggregates, value, onChange } = props;

  return (
    <Space size={SIZE} wrap>
      {_.map(value, (item, index) => {
        if (!item.field || !item.direction) {
          return null;
        }
        return (
          <ConfigPopover
            key={`${item.field}-${item.direction}`}
            eleRef={eleRef}
            indexData={indexData}
            aggregates={aggregates}
            data={item}
            onChange={(values) => {
              onChange?.(_.map(value, (v, i) => (i === index ? values : v)));
            }}
          >
            <Describe
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(_.filter(value, (_, i) => i !== index));
              }}
            >
              <Space className='text-hint'>
                <span>{item.field}</span>
                <strong className='text-main bg-fc-200 px-1'>{t(`builder.order_by.${item.direction}`)}</strong>
              </Space>
            </Describe>
          </ConfigPopover>
        );
      })}

      <ConfigPopover
        eleRef={eleRef}
        indexData={indexData}
        aggregates={aggregates}
        onAdd={(values) => {
          onChange?.([...(value || []), values]);
        }}
      >
        <Button size='small' type='text' icon={<PlusOutlined />} className='hover:bg-fc-150'>
          {t('builder.order_by.add')}
        </Button>
      </ConfigPopover>
    </Space>
  );
}
