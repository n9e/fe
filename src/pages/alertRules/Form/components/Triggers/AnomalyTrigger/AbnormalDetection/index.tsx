import React, { useState } from 'react';
import { Form, InputNumber, Select, Checkbox, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

export default function index({ disabled }: { disabled?: boolean }) {
  const { t } = useTranslation('db_anomaly');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const names = ['rule_config', 'anomaly_trigger', 'algo_params'];

  return (
    <>
      <Space className='mb1'>
        {t('detect.advanced')}
        <a onClick={() => setSettingsVisible(!settingsVisible)}>{settingsVisible ? t('detect.collapse') : t('detect.expand')}</a>
      </Space>
      <div
        style={{
          display: settingsVisible ? 'block' : 'none',
        }}
      >
        <div>
          <Space align='baseline'>
            {t('detect.t1')}
            <Form.Item name={[...names, 'seasonal_duration']} initialValue={86400}>
              <Select style={{ width: 100 }} disabled={disabled}>
                <Select.Option value={3600}>{t('detect.hour')}</Select.Option>
                <Select.Option value={86400}>{t('detect.day')}</Select.Option>
                <Select.Option value={604800}>{t('detect.week')}</Select.Option>
                <Select.Option value={2592000}>{t('detect.month')}</Select.Option>
              </Select>
            </Form.Item>
          </Space>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <div style={{ marginRight: 16 }}>{t('detect.gap')}</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <Form.Item
                noStyle
                name={[...names, 'upper_bound']}
                valuePropName='checked'
                getValueFromEvent={(e) => {
                  return e.target.checked ? 1 : 0;
                }}
                getValueProps={(value) => ({ checked: value === 1 })}
                initialValue={1}
              >
                <Checkbox disabled={disabled}>{t('detect.upper')}</Checkbox>
              </Form.Item>
              <Form.Item noStyle name={[...names, 'upper_times_num']} initialValue={1}>
                <InputNumber disabled={disabled} />
              </Form.Item>{' '}
              {t('detect.t2')}
            </div>
            <div>
              <Form.Item
                noStyle
                name={[...names, 'lower_bound']}
                valuePropName='checked'
                getValueFromEvent={(e) => {
                  return e.target.checked ? 1 : 0;
                }}
                getValueProps={(value) => ({ checked: value === 1 })}
                initialValue={1}
              >
                <Checkbox disabled={disabled}>{t('detect.downer')}</Checkbox>
              </Form.Item>
              <Form.Item noStyle name={[...names, 'lower_times_num']} initialValue={1}>
                <InputNumber disabled={disabled} />
              </Form.Item>{' '}
              {t('detect.t2')}
            </div>
          </div>
        </div>
        <div>
          <Form.List name={[...names, 'compares']}>
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: 10 }}>
                  {t('detect.t3')}{' '}
                  <PlusCircleOutlined
                    onClick={() => {
                      add({
                        operator: 1,
                        offset: 86400,
                        bound_type: 0,
                      });
                    }}
                  />
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 10 }} align='baseline'>
                    <Form.Item {...restField} name={[name, 'operator']}>
                      <Select disabled={disabled}>
                        <Select.Option value={1}>{t('detect.and')}</Select.Option>
                        <Select.Option value={0}>{t('detect.or')}</Select.Option>
                      </Select>
                    </Form.Item>
                    <span>{t('detect.t4')}</span>
                    <Form.Item {...restField} name={[name, 'offset']}>
                      <Select disabled={disabled}>
                        <Select.Option value={1 * 86400}>1</Select.Option>
                        <Select.Option value={2 * 86400}>2</Select.Option>
                        <Select.Option value={3 * 86400}>3</Select.Option>
                        <Select.Option value={4 * 86400}>4</Select.Option>
                        <Select.Option value={5 * 86400}>5</Select.Option>
                        <Select.Option value={6 * 86400}>6</Select.Option>
                        <Select.Option value={7 * 86400}>7</Select.Option>
                      </Select>
                    </Form.Item>
                    <span>{t('detect.t5')}</span>
                    <Form.Item {...restField} name={[name, 'bound_type']}>
                      <Select disabled={disabled}>
                        <Select.Option value={0}>{t('detect.gap')}</Select.Option>
                        <Select.Option value={1}>{t('detect.up')}</Select.Option>
                        <Select.Option value={2}>{t('detect.down')}</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'value']}>
                      <InputNumber disabled={disabled} />
                    </Form.Item>
                    {' %'}
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>
        </div>
      </div>
    </>
  );
}
