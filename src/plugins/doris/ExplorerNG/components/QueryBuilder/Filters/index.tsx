import React from 'react';
import { Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';

import { Field, FilterConfig, FieldSampleParams } from '../../../types';
import { NAME_SPACE } from '../../../../constants';

import describeFieldValue from '../utils/describeFieldValue';
import Describe from '../Describe';
import ConfigPopover from './FilterConfigPopover';

interface Props {
  size?: 'small' | 'middle' | 'large';
  indexData: Field[];
  fieldSampleParams: FieldSampleParams;

  value?: FilterConfig[];
  onChange?: (values: FilterConfig[]) => void;
}

export default function Filters(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { size = 'middle', indexData, fieldSampleParams, value, onChange } = props;

  return (
    <Space size={[SIZE, SIZE / 2]} wrap>
      {_.map(value, (item, index) => {
        if (!item.field || !item.operator) {
          return null;
        }
        return (
          <ConfigPopover
            key={`${item.field}-${item.operator}-${item.value}-${index}`}
            indexData={indexData}
            fieldSampleParams={fieldSampleParams}
            data={item}
            index={index}
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
                <span
                  dangerouslySetInnerHTML={{
                    __html: describeFieldValue(item.operator, item.value),
                  }}
                />
              </Space>
            </Describe>
          </ConfigPopover>
        );
      })}

      <ConfigPopover
        indexData={indexData}
        fieldSampleParams={fieldSampleParams}
        index={value ? value.length : 0}
        onAdd={(values) => {
          onChange?.([...(value || []), values]);
        }}
      >
        <Button size={size} type='text' icon={<PlusOutlined />} className='hover:bg-fc-150'>
          {t('builder.filters.add')}
        </Button>
      </ConfigPopover>
    </Space>
  );
}
