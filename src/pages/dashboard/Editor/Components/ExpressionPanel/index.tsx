import React from 'react';
import { Form, Input, Space } from 'antd';
import type { FormListFieldData, FormListOperation } from 'antd/lib/form/FormList';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import HideButton from '@/pages/dashboard/Components/HideButton';
import LegendInput from '@/pages/dashboard/Components/LegendInput';
import { generateQueryNameByIndex } from '@/components/QueryName/utils';
import { Panel } from '../Collapse';

interface ExpressionPanelProps {
  fields: FormListFieldData[];
  remove: FormListOperation['remove'];
  field: FormListFieldData;
}

export default function index({ fields, remove, field }: ExpressionPanelProps) {
  const { t } = useTranslation('dashboard');
  const targets = Form.useWatch('targets');
  const target = targets?.[field.name] || {};
  const name = target?.refId || generateQueryNameByIndex(field.name);
  const { key: fieldKey, ...restField } = field;

  return (
    <Panel
      header={name}
      key={fieldKey}
      extra={
        <Space>
          <Form.Item noStyle {...restField} name={[field.name, 'hide']}>
            <HideButton />
          </Form.Item>
          {fields.length > 1 ? (
            <DeleteOutlined
              onClick={() => {
                remove(field.name);
              }}
            />
          ) : null}
        </Space>
      }
    >
      <Form.Item
        label='Expression'
        tooltip={{
          getPopupContainer: () => document.body,
          overlayClassName: 'max-w-[min(640px,calc(100vw_-_32px))]',
          title: (
            <div className='whitespace-pre-line'>
              {t('query.expression_placeholder')}
              {'\n\n'}
              {t('query.expression_variables_tip')}
            </div>
          ),
        }}
        {...restField}
        name={[field.name, 'expression']}
        rules={[
          {
            required: true,
          },
        ]}
        className='flex-1'
      >
        <Input.TextArea autoSize placeholder={t('query.expression_placeholder')} />
      </Form.Item>
      <Form.Item
        label='Legend'
        {...restField}
        name={[field.name, 'legend']}
        tooltip={{
          getPopupContainer: () => document.body,
          title: t('query.legendTip2', {
            interpolation: { skipOnVariables: true },
          }),
        }}
      >
        <LegendInput />
      </Form.Item>
    </Panel>
  );
}
