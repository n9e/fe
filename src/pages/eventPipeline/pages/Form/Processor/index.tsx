import React, { useContext } from 'react';
import { Card, Space, Form, Select } from 'antd';
import { MinusCircleOutlined, CopyOutlined, UpCircleOutlined, DownCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { IS_PLUS } from '@/utils/constant';
import DocumentDrawer from '@/components/DocumentDrawer';

// @ts-ignore
import LabelEnrich from 'plus:/parcels/eventPipeline/LabelEnrich';

import { NS } from '../../../constants';
import TestModal from '../TestModal';
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
  const { t, i18n } = useTranslation(NS);
  const { darkMode } = useContext(CommonStateContext);
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
      <Form.Item
        {...resetField}
        name={[field.name, 'typ']}
        label={
          <Space>
            {t('processor.typ')}
            {processorType === 'relabel' && (
              <a
                onClick={(event) => {
                  event.stopPropagation();
                  DocumentDrawer({
                    language: i18n.language,
                    darkMode,
                    title: t('processor.help_btn'),
                    documentPath: '/docs/alert-event-relabel',
                  });
                }}
              >
                {t('processor.help_btn')}
              </a>
            )}
          </Space>
        }
      >
        <Select
          options={_.concat(
            [
              {
                label: 'Relabel',
                value: 'relabel',
              },
            ],
            IS_PLUS
              ? [
                  {
                    label: 'Label Enrich',
                    value: 'label_enrich',
                  },
                ]
              : [],
          )}
        />
      </Form.Item>
      {processorType === 'relabel' && <Relabel field={field} namePath={[field.name, 'config']} prefixNamePath={['processors']} />}
      {processorType === 'label_enrich' && <LabelEnrich field={field} namePath={[field.name, 'config']} prefixNamePath={['processors']} />}

      <TestModal type='processor' config={processorConfig} />
    </Card>
  );
}
