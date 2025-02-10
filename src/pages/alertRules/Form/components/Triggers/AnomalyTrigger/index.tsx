import React, { useState, useEffect } from 'react';
import { Form, Space, Switch, Select, Radio, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import AbnormalDetection from './AbnormalDetection';
import { getAlgorithms } from './services';

interface Props {
  active: boolean;
  disabled?: boolean;
  prefixName?: string[]; // 列表字段名
}

export default function index(props: Props) {
  const { t } = useTranslation('alertRules');
  const { active, disabled, prefixName = [] } = props;
  const names = [...prefixName, 'anomaly_trigger'];
  const [algorithms, setAlgorithms] = useState<{ [key: string]: string }[]>([]);
  const [algorithmsLoading, setAlgorithmsLoading] = useState(true);

  useEffect(() => {
    if (active) {
      getAlgorithms()
        .then((res) => {
          setAlgorithms(res);
        })
        .finally(() => {
          setAlgorithmsLoading(false);
        });
    }
  }, [active]);

  return (
    <Spin spinning={algorithmsLoading}>
      <div>
        <div className='mb2'>
          <Space>
            <Form.Item noStyle name={[...names, 'enable']} valuePropName='checked'>
              <Switch />
            </Form.Item>
            {t('anomaly_trigger.enable')}
          </Space>
        </div>
        <div>
          <Space align='baseline'>
            {t('anomaly_trigger.algorithm')}
            <Form.Item name={[...names, 'algorithm']} rules={[{ required: false, message: t('anomaly_trigger.algorithm_required') }]} initialValue={_.keys(algorithms)[0]}>
              <Select
                style={{ width: 200 }}
                disabled={disabled}
                options={_.map(algorithms, (label, value) => {
                  return { label, value };
                })}
              />
            </Form.Item>
          </Space>
        </div>
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
        <AbnormalDetection />
      </div>
    </Spin>
  );
}
