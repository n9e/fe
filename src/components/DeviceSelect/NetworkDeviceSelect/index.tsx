import React from 'react';
import { Form, Card, Space, Select } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import ValuesSelect from './ValuesSelect';
import Preview from './Preview';
import '../locale';

interface Props {
  prefixName: (string | number)[];
}

export default function index(props: Props) {
  const { t } = useTranslation('DeviceSelect');
  const queryKeyOptions = ['all_devices', 'group_ids', 'tags', 'ips'];
  const { prefixName } = props;
  const form = Form.useFormInstance();
  const prefixNameValues = Form.useWatch(prefixName);

  return (
    <div>
      <Form.List
        name={prefixName}
        initialValue={[
          {
            key: 'all_devices',
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <Card
            title={
              <Space>
                <span>{t('network_device.title')}</span>
                <PlusCircleOutlined
                  onClick={() => {
                    if (fields.length === 0) {
                      add({
                        key: 'all_devices',
                        op: '==',
                        values: [],
                      });
                    } else {
                      add({
                        key: 'group_ids',
                        op: '==',
                        values: [],
                      });
                    }
                  }}
                />
              </Space>
            }
            size='small'
          >
            {fields.map((field, idx) => {
              const queryKey = form.getFieldValue([...prefixName, field.name, 'key']);
              const queryOp = form.getFieldValue([...prefixName, field.name, 'op']);

              return (
                <div key={field.key}>
                  <Space align='baseline'>
                    <Form.Item {...field} name={[field.name, 'key']} rules={[{ required: true, message: 'Missing key' }]}>
                      <Select
                        style={{ minWidth: idx > 0 ? 100 : 142 }}
                        onChange={() => {
                          const values = _.cloneDeep(form.getFieldsValue());
                          _.set(values, [...prefixName, field.name, 'op'], '==');
                          _.set(values, [...prefixName, field.name, 'values'], undefined);
                          form.setFieldsValue(values);
                        }}
                      >
                        {queryKeyOptions.map((item) => (
                          <Select.Option key={item} value={item}>
                            {t(`network_device.key.${item}`)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {queryKey !== 'all_devices' && (
                      <Space align='baseline'>
                        <Form.Item {...field} name={[field.name, 'op']} rules={[{ required: true, message: 'Missing op' }]}>
                          <Select
                            style={{ minWidth: 60 }}
                            options={[
                              {
                                value: '==',
                                label: '==',
                              },
                              {
                                value: '!=',
                                label: '!=',
                              },
                            ]}
                            onChange={() => {
                              const values = _.cloneDeep(form.getFieldsValue());
                              _.set(values, [...prefixName, field.name, 'values'], undefined);
                              form.setFieldsValue(values);
                            }}
                          />
                        </Form.Item>
                        <ValuesSelect queryKey={queryKey} queryOp={queryOp} field={field} />
                      </Space>
                    )}
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                </div>
              );
            })}
            <Preview queries={prefixNameValues} />
          </Card>
        )}
      </Form.List>
    </div>
  );
}
