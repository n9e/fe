/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ValueMappings from './index';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: () => null,
}));

function ValuesProbe({ form }: { form: ReturnType<typeof Form.useForm>[0] }) {
  const values = Form.useWatch([], form);
  return <output data-testid='form-values'>{JSON.stringify(values)}</output>;
}

function renderValueMappings(initialValues: Record<string, unknown>) {
  const formRef: { current?: ReturnType<typeof Form.useForm>[0] } = {};

  function Harness() {
    const [form] = Form.useForm();
    formRef.current = form;

    return (
      <Form form={form} initialValues={initialValues}>
        <ValueMappings />
        <ValuesProbe form={form} />
      </Form>
    );
  }

  render(<Harness />);
  return formRef;
}

describe('dashboard Timeseries ValueMappings', () => {
  it('新增文本映射后更新主表单', async () => {
    const formRef = renderValueMappings({});

    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.btn' }));
    fireEvent.change(screen.getByPlaceholderText('panel.options.valueMappings.value_placeholder'), { target: { value: 'ok' } });
    fireEvent.change(screen.getByPlaceholderText('panel.options.valueMappings.text_placeholder'), { target: { value: 'Success' } });
    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.update_btn' }));

    await waitFor(() => {
      expect(formRef.current?.getFieldValue(['options', 'valueMappings'])).toEqual([
        {
          type: 'textValue',
          match: { textValue: 'ok' },
          result: { text: 'Success' },
        },
      ]);
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  it('删除映射后更新为空数组', async () => {
    const formRef = renderValueMappings({
      options: {
        valueMappings: [
          {
            type: 'textValue',
            match: { textValue: 'ok' },
            result: { text: 'Success' },
          },
        ],
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('img', { name: 'delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.update_btn' }));

    await waitFor(() => {
      expect(formRef.current?.getFieldValue(['options', 'valueMappings'])).toEqual([]);
    });
  });
});
