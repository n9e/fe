import React from 'react';
import { Form, Input, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';

interface Props {
  /** 字段在表单里的完整路径，如 ['request_config', 'line_request_config', 'api_url'] */
  name: string[];
  /** 官方地址，作为占位符显示 */
  defaultUrl: string;
  active: boolean;
  label?: string;
  tip?: string;
  /** 跟在问号图标后面的灰色短提示 */
  hint?: string;
  onValidationError?: () => void;
}

/** 原生媒介可选的接口地址：留空用官方地址，只有经网关或反向代理访问时才需要改。不设 initialValue，原因见 Jira.tsx。 */
export default function NativeApiUrl({ name, defaultUrl, active, label, tip, hint, onValidationError }: Props) {
  const { t } = useTranslation(NS);
  const labelText = label ?? t('native_api_url');
  const tipText = tip ?? t('native_api_url_tip');
  return (
    <Form.Item
      // Form.Item 的 tooltip 图标总排在 label 最后，要把提示放到图标后面只能自己画图标
      label={
        hint ? (
          <Space size={4}>
            {labelText}
            <Tooltip className='n9e-ant-from-item-tooltip' title={tipText}>
              <QuestionCircleOutlined />
            </Tooltip>
            <span className='text-hint'>{hint}</span>
          </Space>
        ) : (
          labelText
        )
      }
      tooltip={hint ? undefined : tipText}
      name={name}
      rules={[
        {
          validator: (_rule, value?: string) => {
            if (!active || !value || value.includes('{{') || /^https?:\/\/\S+$/i.test(value.trim())) return Promise.resolve();
            onValidationError?.();
            return Promise.reject(new Error(t('native_api_url_invalid')));
          },
        },
      ]}
    >
      <Input placeholder={defaultUrl} />
    </Form.Item>
  );
}
