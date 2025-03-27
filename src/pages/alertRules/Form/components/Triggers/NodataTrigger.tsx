import React from 'react';
import { Form, Space, Switch, Radio, Checkbox, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  disabled?: boolean;
  prefixName?: string[]; // 列表字段名
}

export default function NodataTrigger(props: Props) {
  const { t } = useTranslation('alertRules');
  const { disabled, prefixName = [] } = props;
  const names = [...prefixName, 'nodata_trigger'];

  return (
    <div>
      <Space className='mb2'>
        <Form.Item noStyle name={[...names, 'enable']} valuePropName='checked'>
          <Switch />
        </Form.Item>
        {t('nodata_trigger.enable')}
      </Space>
      <div className='mb2'>
        <Space align='baseline'>
          {t('severity_label')}
          <Form.Item name={[...names, 'severity']} rules={[{ required: true, message: 'Missing severity' }]} noStyle initialValue={2}>
            <Radio.Group disabled={disabled}>
              <Radio value={1}>{t('common:severity.1')}</Radio>
              <Radio value={2}>{t('common:severity.2')}</Radio>
              <Radio value={3}>{t('common:severity.3')}</Radio>
            </Radio.Group>
          </Form.Item>
        </Space>
      </div>
      <div className='mb2'>
        <Space align='baseline'>
          <Form.Item noStyle name={[...names, 'resolve_after_enable']} valuePropName='checked'>
            <Checkbox />
          </Form.Item>
          {t('nodata_trigger.resolve_after')}
          <Form.Item noStyle name={[...names, 'resolve_after']} initialValue={1800}>
            <InputNumber min={0} />
          </Form.Item>
          {t('nodata_trigger.resolve_after_unit')}
        </Space>
      </div>
    </div>
  );
}
