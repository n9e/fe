/**
 * 表达式模式(代码模式)
 */
import React from 'react';
import { Form, Input } from 'antd';

interface IProps {
  prefixField?: any;
  fullPrefixName?: (string | number)[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: (string | number)[]; // 列表字段名
  disabled?: boolean;
}

export default function Code(props: IProps) {
  const { prefixField = {}, fullPrefixName = [], prefixName = [], disabled } = props;

  return (
    <Form.Item {...prefixField} name={[...prefixName, 'exp']}>
      <Input disabled={disabled} />
    </Form.Item>
  );
}
