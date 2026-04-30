import React, { useContext } from 'react';
import { Card, Space, Form, Select, Tag } from 'antd';
import { MinusCircleOutlined, CopyOutlined, UpCircleOutlined, DownCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { IS_PLUS } from '@/utils/constant';
import DocumentDrawer from '@/components/DocumentDrawer';

// @ts-ignore
import PlusProcessor, { options as PlusOptions } from 'plus:/parcels/eventPipeline';

import { NS, DEFAULT_PROCESSOR_CONFIG_MAP, documentPathMap } from '@/pages/eventPipeline/constants';
import TestModal from '@/pages/eventPipeline/pages/Form/TestModal';
import Relabel from '@/pages/eventPipeline/pages/Form/Processor/Relabel';
import Callback from '@/pages/eventPipeline/pages/Form/Processor/Callback';
import EventDrop from '@/pages/eventPipeline/pages/Form/Processor/EventDrop';
import AISummary from '@/pages/eventPipeline/pages/Form/Processor/AISummary';

interface Props {
  disabled?: boolean;
  fields: FormListFieldData[];
  field: FormListFieldData;
  namePath: (string | number)[];
  prefixNamePath?: (string | number)[];
  add: (defaultValue?: any, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

export default function Processor(props: Props) {
  const { t, i18n } = useTranslation(NS);
  const { darkMode } = useContext(CommonStateContext);
  const { disabled, fields, field, namePath = [], prefixNamePath = [], add, remove, move } = props;
  const resetField = _.omit(field, ['name', 'key']);
  const form = Form.useFormInstance();
  const processorConfig = Form.useWatch([...prefixNamePath, ...namePath]);
  const processorType = Form.useWatch([...prefixNamePath, ...namePath, 'typ']);

  return (
    <Card
      size='small'
      title={
        <span>
          <Tag color='purple'>{field.name}</Tag>
          {/* <Tag color='purple'>{t(`processor.options.${processorType}`)}</Tag> */}
          {/* <TestModal type='processor' config={processorConfig} size='small' /> */}
        </span>
      }
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
              </>
            )}
            <MinusCircleOutlined
              onClick={() => {
                remove(field.name);
              }}
            />
          </Space>
        )
      }
    >
      <Form.Item
        {...resetField}
        name={[...namePath, 'typ']}
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
          options={_.map(_.concat(['relabel', 'event_drop', 'event_update', 'callback', 'ai_summary'], IS_PLUS ? PlusOptions : []), (item) => {
            return {
              label: t(`processor.options.${item}`),
              value: item,
            };
          })}
          onChange={(newTyp) => {
            const newConfig = _.cloneDeep(DEFAULT_PROCESSOR_CONFIG_MAP[newTyp]);
            const formValues = _.cloneDeep(form.getFieldsValue());
            const newFormValues = _.set(formValues, [...prefixNamePath, ...namePath, 'config'], newConfig);

            form.setFieldsValue(newFormValues);
          }}
          showSearch
          optionFilterProp='label'
          disabled={disabled}
        />
      </Form.Item>
      {processorType === 'relabel' && <Relabel field={field} namePath={[...namePath, 'config']} prefixNamePath={prefixNamePath} />}
      {processorType === 'callback' && <Callback field={field} namePath={[...namePath, 'config']} />}
      {processorType === 'event_update' && <Callback field={field} namePath={[...namePath, 'config']} />}
      {processorType === 'event_drop' && <EventDrop field={field} namePath={[...namePath, 'config']} />}
      {processorType === 'ai_summary' && <AISummary field={field} namePath={[...namePath, 'config']} />}
      <PlusProcessor processorType={processorType} field={field} prefixNamePath={prefixNamePath} />
    </Card>
  );
}
