/** @jest-environment jsdom */
import React, { useLayoutEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import { DashboardRuntimeProvider } from '../../../globalState';
import GraphStyles from './GraphStyles';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it.each([
  ['host', 'mount'],
  [undefined, undefined],
])('restores saved axes %s/%s after registering fields', async (xAxisField, yAxisField) => {
  let instance: FormInstance;
  function Harness() {
    const [form] = Form.useForm();
    instance = form;
    // 与图表编辑器一致：字段注册后在 layout effect 写入已保存配置。
    useLayoutEffect(() => {
      form.setFieldsValue({ custom: { xAxisField, yAxisField } });
    }, [form]);
    return (
      <DashboardRuntimeProvider>
        <Form form={form}>
          <GraphStyles />
        </Form>
      </DashboardRuntimeProvider>
    );
  }
  render(<Harness />);
  await waitFor(() => {
    expect(instance.getFieldValue(['custom', 'xAxisField'])).toBe(xAxisField ?? 'Name');
    expect(instance.getFieldValue(['custom', 'yAxisField'])).toBe(yAxisField ?? 'Value');
  });
});
