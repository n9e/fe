import React from 'react';
import { Card, Space, Form, Select } from 'antd';
import { MinusCircleOutlined, CopyOutlined, UpCircleOutlined, DownCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { IS_PLUS } from '@/utils/constant';

// @ts-ignore
import LabelEnrich from 'plus:/parcels/eventPipeline/LabelEnrich';

import { NS } from '../../../constants';
import Relabel from './Relabel';

interface Props {
  disabled?: boolean;
  fields: FormListFieldData[];
  field: FormListFieldData;
  add: (defaultValue?: any, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

export default function NotifyConfig(props: Props) {
  const { t } = useTranslation(NS);
  const { disabled, fields, field, add, remove, move } = props;
  const resetField = _.omit(field, ['name', 'key']);
  const processorConfig = Form.useWatch(['processors', field.name]);
  const processorType = Form.useWatch(['processors', field.name, 'typ']);

  return (
    <Card
      key={field.key}
      title={<Space>{t('processor.title')}</Space>}
      extra={
        !disabled && (
          <Space>
            <CopyOutlined
              onClick={() => {
                add(processorConfig, field.name + 1);
              }}
            />
            {fields.length > 1 && (
              <>
                {field.name !== 0 && (
                  <UpCircleOutlined
                    onClick={() => {
                      move(field.name, field.name - 1);
                    }}
                  />
                )}
                {field.name !== fields.length - 1 && (
                  <DownCircleOutlined
                    onClick={() => {
                      move(field.name, field.name + 1);
                    }}
                  />
                )}
                <MinusCircleOutlined
                  onClick={() => {
                    remove(field.name);
                  }}
                />
              </>
            )}
          </Space>
        )
      }
    >
      <Form.Item {...resetField} name={[field.name, 'typ']} label={t('processor.typ')}>
        <Select
          options={_.concat(
            [
              {
                label: 'relabel',
                value: 'relabel',
              },
            ],
            IS_PLUS
              ? [
                  {
                    label: 'label_enrich',
                    value: 'label_enrich',
                  },
                ]
              : [],
          )}
        />
      </Form.Item>
      {processorType === 'relabel' && <Relabel field={field} namePath={[field.name, 'config']} prefixNamePath={['processors']} />}
      {processorType === 'label_enrich' && <LabelEnrich field={field} namePath={[field.name, 'config']} prefixNamePath={['processors']} />}
    </Card>
  );
}
