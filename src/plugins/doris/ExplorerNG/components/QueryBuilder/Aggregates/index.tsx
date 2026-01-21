import React from 'react';
import { Space, Button } from 'antd';
import { PlusOutlined, CloseCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';

import { Field, AggregateConfig } from '../../../types';
import { NAME_SPACE } from '../../../../constants';

import ParamsPopover from './AggregateConfigPopover';

interface Props {
  indexData: Field[];

  value?: AggregateConfig[];
  onChange?: (values: AggregateConfig[]) => void;
}

export default function Aggregates(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { indexData, value, onChange } = props;

  return (
    <Space size={SIZE} wrap>
      {_.map(value, (item, index) => {
        if (!item.field || !item.func) {
          return null;
        }
        return (
          <ParamsPopover
            key={`${item.field}-${item.func}-${item.alias}`}
            indexData={indexData}
            data={item}
            onChange={(values) => {
              onChange?.(_.map(value, (v, i) => (i === index ? values : v)));
            }}
          >
            <div className='bg-fc-150 hover:bg-fc-200 min-h-[24px] px-[7px] py-[1.6px] rounded-xs wrap-break-word whitespace-normal cursor-pointer'>
              <Space className='text-hint'>
                <strong>{item.func}</strong>
                <span>{item.field}</span>
                {item.alias ? (
                  <>
                    <strong>AS</strong>
                    <span>{item.alias}</span>
                  </>
                ) : null}

                <CloseCircleFilled
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange?.(_.filter(value, (_, i) => i !== index));
                  }}
                />
              </Space>
            </div>
          </ParamsPopover>
        );
      })}

      <ParamsPopover
        indexData={indexData}
        onAdd={(values) => {
          console.log('add values', values);
          onChange?.([...(value || []), values]);
        }}
      >
        <Button type='text' icon={<PlusOutlined />} className='bg-fc-150 hover:bg-fc-200'>
          {t('builder.aggregates.add')}
        </Button>
      </ParamsPopover>
    </Space>
  );
}
