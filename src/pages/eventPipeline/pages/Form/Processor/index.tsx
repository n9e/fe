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
import PlusProcessor, { options as PlusOptions } from 'plus:/parcels/eventPipeline';

import { NS, DEFAULT_PROCESSOR_CONFIG_MAP } from '../../../constants';
import TestModal from '../TestModal';
import Relabel from './Relabel';
import Callback from './Callback';
import EventDrop from './EventDrop';
import AISummary from './AISummary';

interface Props {
  disabled?: boolean;
  fields: FormListFieldData[];
  field: FormListFieldData;
  add: (defaultValue?: any, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

const documentPathMap = {
  relabel: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/notification/processor-event-relabel/',
  event_drop: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/notification/processor-event-drop/',
  event_update: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/notification/processor-event-update/',
  callback: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/notification/processor-callback/',
  ai_summary: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/notification/processor-ai-summary/',
};
export default function NotifyConfig(props: Props) {
  const { t, i18n } = useTranslation(NS);
  const { darkMode } = useContext(CommonStateContext);
  const { disabled, fields, field, add, remove, move } = props;
  const resetField = _.omit(field, ['name', 'key']);
  const form = Form.useFormInstance();
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
            {documentPathMap[processorType] && (
              <a
                onClick={(event) => {
                  event.stopPropagation();
                  DocumentDrawer({
                    language: i18n.language,
                    darkMode,
                    type: 'iframe',
                    title: t('processor.help_btn'),
                    documentPath: documentPathMap[processorType],
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
              {
                label: 'Callback',
                value: 'callback',
              },
              {
                label: 'Event Update',
                value: 'event_update',
              },
              {
                label: 'Event Drop',
                value: 'event_drop',
              },
              {
                label: 'AI Summary',
                value: 'ai_summary',
              },
            ],
            IS_PLUS ? PlusOptions : [],
          )}
          onChange={(newTyp) => {
            const newConfig = _.cloneDeep(DEFAULT_PROCESSOR_CONFIG_MAP[newTyp]);
            const formValues = _.cloneDeep(form.getFieldsValue());
            const newFormValues = _.set(formValues, ['processors', field.name, 'config'], newConfig);

            form.setFieldsValue(newFormValues);
          }}
        />
      </Form.Item>
      {processorType === 'relabel' && <Relabel field={field} namePath={[field.name, 'config']} prefixNamePath={['processors']} />}
      {processorType === 'callback' && <Callback field={field} namePath={[field.name, 'config']} />}
      {processorType === 'event_update' && <Callback field={field} namePath={[field.name, 'config']} />}
      {processorType === 'event_drop' && <EventDrop field={field} namePath={[field.name, 'config']} />}
      {processorType === 'ai_summary' && <AISummary field={field} namePath={[field.name, 'config']} />}
      <PlusProcessor processorType={processorType} field={field} />

      <TestModal type='processor' config={processorConfig} />
    </Card>
  );
}
