/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ValueMappings from './index';
import { getValueMappingConditionText } from './Preview';
import type { IValueMapping } from '../../../types';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: () => null,
}));

jest.mock('../../../Components/ColorPicker', () => () => null);

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

const numericMapping: IValueMapping = {
  type: 'special',
  match: { special: 1 },
  result: { text: '2', color: '#ff0000' },
};

describe('dashboard ValueMappings', () => {
  it('按值映射类型生成条件摘要', () => {
    expect(getValueMappingConditionText(numericMapping)).toBe('1');
    expect(getValueMappingConditionText({ type: 'textValue', match: { textValue: 'ok' }, result: { text: '', color: '' } })).toBe('ok');
    expect(getValueMappingConditionText({ type: 'range', match: { from: 0, to: 100 }, result: { text: '', color: '' } })).toBe('[0 - 100]');
    expect(getValueMappingConditionText({ type: 'range', match: {}, result: { text: '', color: '' } })).toBe('[-Infinity - Infinity]');
    expect(getValueMappingConditionText({ type: 'specialValue', match: { specialValue: 'null' }, result: { text: '', color: '' } })).toBe('Null');
    expect(getValueMappingConditionText({ type: 'specialValue', match: { specialValue: 'empty' }, result: { text: '', color: '' } })).toBe('Empty string');
  });

  it('展示现有映射摘要，并在弹窗更新后写回主表单', async () => {
    const formRef = renderValueMappings({
      options: {
        valueMappings: [numericMapping],
      },
    });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('panel.options.valueMappings.text_placeholder'), { target: { value: 'Updated' } });
    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.update_btn' }));

    await waitFor(() => {
      expect(screen.getByText('Updated')).toBeInTheDocument();
      expect(formRef.current?.getFieldValue(['options', 'valueMappings', 0, 'result', 'text'])).toBe('Updated');
    });
  });

  it('取消编辑时不修改主表单', async () => {
    const formRef = renderValueMappings({
      options: {
        valueMappings: [numericMapping],
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('panel.options.valueMappings.text_placeholder'), { target: { value: 'Discarded' } });
    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.cancel_btn' }));

    await waitFor(() => {
      expect(formRef.current?.getFieldValue(['options', 'valueMappings', 0, 'result', 'text'])).toBe('2');
    });
  });

  it('Overrides 使用完整嵌套路径预览和保存', async () => {
    const initialValues = {
      overrides: [
        {
          properties: {
            valueMappings: [numericMapping],
          },
        },
      ],
    };
    const formRef: { current?: ReturnType<typeof Form.useForm>[0] } = {};

    function Harness() {
      const [form] = Form.useForm();
      formRef.current = form;

      return (
        <Form form={form} initialValues={initialValues}>
          <ValueMappings preNamePrefix={['overrides']} namePrefix={[0, 'properties', 'valueMappings']} />
        </Form>
      );
    }

    render(<Harness />);
    expect(screen.getByText('1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
    fireEvent.change(await screen.findByPlaceholderText('panel.options.valueMappings.text_placeholder'), { target: { value: 'Override updated' } });
    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.update_btn' }));

    await waitFor(() => {
      expect(formRef.current?.getFieldValue(['overrides', 0, 'properties', 'valueMappings', 0, 'result', 'text'])).toBe('Override updated');
    });
  });
});
