import React from 'react';
import { Form, Select, Space } from 'antd';

interface Props {
  /** 映射在表单里的完整路径，如 ['request_config', 'ntfy_request_config', 'priority_map'] */
  name: string[];
  label: string;
  tooltip: string;
  options: { label: string; value: string | number }[];
  /** 与后端一致的缺省映射：存量媒介没存某个级别时按它回显 */
  defaults: Record<string, string | number>;
  width?: number;
}

/** 夜莺告警级别（S1 / S2 / S3）到对方级别的映射。字段不设 initialValue，原因见 Jira.tsx。 */
export default function SeverityMap({ name, label, tooltip, options, defaults, width = 150 }: Props) {
  return (
    <Form.Item label={label} tooltip={tooltip}>
      <Space wrap>
        {['1', '2', '3'].map((sev) => (
          <Space key={sev} size={4}>
            <span>S{sev}</span>
            <Form.Item noStyle name={[...name, sev]} getValueProps={(v) => ({ value: v ?? defaults[sev] })}>
              <Select style={{ width }} options={options} />
            </Form.Item>
          </Space>
        ))}
      </Space>
    </Form.Item>
  );
}
