import React from 'react';
import { Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';

import { Field, AggregateConfig } from '../../../types';
import { NAME_SPACE } from '../../../../constants';

import ConfigPopover from './AggregateConfigPopover';
import Describe from '../Describe';

interface Props {
  eleRef: React.RefObject<HTMLDivElement>;
  indexData: Field[];

  value?: AggregateConfig[];
  onChange?: (values: AggregateConfig[]) => void;
}

export default function Aggregates(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { eleRef, indexData, value, onChange } = props;

  return (
    <Space size={SIZE} wrap>
      {_.map(value, (item, index) => {
        if (!item.field || !item.func) {
          return null;
        }
        return (
          <ConfigPopover
            key={`${item.field}-${item.func}-${item.alias}`}
            eleRef={eleRef}
            indexData={indexData}
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
                <strong className='text-main bg-fc-200 px-1'>{item.func}</strong>
                <span>{item.field}</span>
                {item.alias ? (
                  <>
                    <strong className='text-main bg-fc-200 px-1'>AS</strong>
                    <span>{item.alias}</span>
                  </>
                ) : null}
              </Space>
            </Describe>
          </ConfigPopover>
        );
      })}

      <ConfigPopover
        eleRef={eleRef}
        indexData={indexData}
        onAdd={(values) => {
          onChange?.([...(value || []), values]);
        }}
      >
        <Button size='small' type='text' icon={<PlusOutlined />} className='hover:bg-fc-150'>
          {t('builder.aggregates.add')}
        </Button>
      </ConfigPopover>
    </Space>
  );
}
