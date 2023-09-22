import React from 'react';
import { Form, Radio } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Severity from '@/pages/alertRules/Form/components/Severity';
import Builder from './Builder';
import Code from './Code';

interface IProps {
  prefixField?: any;
  fullPrefixName?: (string | number)[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: (string | number)[]; // 列表字段名
  queries: any[];
  disabled?: boolean;
}

export default function Trigger(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { prefixField = {}, fullPrefixName = [], prefixName = [], queries, disabled } = props;

  return (
    <div style={{ backgroundColor: '#fafafa', padding: 10 }}>
      <Form.Item {...prefixField} name={[...prefixName, 'mode']}>
        <Radio.Group buttonStyle='solid' size='small' disabled={disabled}>
          <Radio.Button value={0}>{t('datasource:es.alert.trigger.builder')}</Radio.Button>
          <Radio.Button value={1}>{t('datasource:es.alert.trigger.code')}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const mode = getFieldValue([...fullPrefixName, 'mode']);
          if (mode == 0) {
            return <Builder prefixField={prefixField} prefixName={prefixName} queries={queries} disabled={disabled} />;
          }
          if (mode === 1) {
            return <Code prefixField={prefixField} prefixName={prefixName} disabled={disabled} />;
          }
        }}
      </Form.Item>
      {/* <Form.List {...prefixField} name={[...prefixName, 'relation_key']}>
        {(fields, { add, remove }) => (
          <div>
            <div style={{ marginBottom: 8 }}>
              {t('datasource:es.alert.trigger.label')}:{' '}
              <PlusCircleOutlined
                onClick={() => {
                  add({
                    op: '==',
                  });
                }}
              />
            </div>
            {fields.map((field) => {
              return (
                <Space align='start' key={field.key}>
                  <Form.Item {...field} name={[field.name, 'left_key']}>
                    <Input style={{ width: 197 }} />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'op']}>
                    <Input disabled style={{ width: 64 }} />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'right_key']}>
                    <Input style={{ width: 200 }} />
                  </Form.Item>
                  <Space
                    style={{
                      height: 32,
                      lineHeight: ' 32px',
                    }}
                  >
                    <MinusCircleOutlined
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  </Space>
                </Space>
              );
            })}
          </div>
        )}
      </Form.List> */}
      <Severity field={prefixField} disabled={disabled} />
    </div>
  );
}
