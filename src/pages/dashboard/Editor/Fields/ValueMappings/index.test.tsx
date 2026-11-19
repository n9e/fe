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

function getFormValues() {
  return JSON.parse(screen.getByTestId('form-values').textContent || '{}');
}

function renderValueMappings(initialValues: Record<string, unknown>, isActive = true) {
  const formRef: { current?: ReturnType<typeof Form.useForm>[0] } = {};

  function Harness() {
    const [form] = Form.useForm();
    formRef.current = form;

    return (
      <Form form={form} initialValues={initialValues}>
        <ValueMappings isActive={isActive} />
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
  it.each([undefined, null])('兼容已有配置中的空映射 %s', (valueMappings) => {
    expect(() => renderValueMappings({ options: { valueMappings } })).not.toThrow();
    expect(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' })).toBeInTheDocument();
  });

  it('折叠时已有映射仍进入预览订阅和保存结果', async () => {
    const formRef = renderValueMappings({ options: { valueMappings: [numericMapping] } }, false);

    await waitFor(() => {
      expect(getFormValues()).toMatchObject({ options: { valueMappings: [numericMapping] } });
    });
    expect(await formRef.current?.validateFields()).toMatchObject({ options: { valueMappings: [numericMapping] } });
  });

  it('新增及删除映射都同步预览和保存，取消重开不会保留草稿', async () => {
    const formRef = renderValueMappings({});
    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
    fireEvent.click(await screen.findByRole('button', { name: 'panel.options.valueMappings.btn' }));
    fireEvent.change(screen.getByPlaceholderText('panel.options.valueMappings.value_placeholder'), { target: { value: '60' } });
    fireEvent.change(screen.getByPlaceholderText('panel.options.valueMappings.text_placeholder'), { target: { value: 'QA_SIXTY' } });
    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.update_btn' }));

    const mapping = { type: 'special', match: { special: 60 }, result: { text: 'QA_SIXTY', color: 'text' } };
    await waitFor(() => {
      expect(getFormValues()).toMatchObject({ options: { valueMappings: [mapping] } });
    });
    expect(await formRef.current?.validateFields()).toMatchObject({ options: { valueMappings: [mapping] } });

    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
    fireEvent.change(await screen.findByPlaceholderText('panel.options.valueMappings.text_placeholder'), { target: { value: 'UNSAVED' } });
    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.cancel_btn' }));
    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
    expect(await screen.findByPlaceholderText('panel.options.valueMappings.text_placeholder')).toHaveValue('QA_SIXTY');
    fireEvent.click(screen.getByRole('button', { name: 'delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.update_btn' }));

    await waitFor(() => {
      expect(getFormValues()).toMatchObject({ options: { valueMappings: [] } });
    });
    expect(await formRef.current?.validateFields()).toMatchObject({ options: { valueMappings: [] } });
  });

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
      expect(getFormValues()).toMatchObject({
        options: { valueMappings: [{ ...numericMapping, result: { ...numericMapping.result, text: 'Updated' } }] },
      });
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
          matcher: { id: 'byFrameRefID', value: 'A' },
          properties: {
            standardOptions: { decimals: 2 },
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
          <Form.List name='overrides'>
            {(fields) =>
              fields.map((field) => <ValueMappings key={field.key} preNamePrefix={['overrides']} namePrefix={[field.name, 'properties', 'valueMappings']} isActive={false} />)
            }
          </Form.List>
          <ValuesProbe form={form} />
        </Form>
      );
    }

    render(<Harness />);
    expect(screen.getByText('1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('panel.options.valueMappings.title', { selector: '.n9e-collapse-header' }));

    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
    fireEvent.change(await screen.findByPlaceholderText('panel.options.valueMappings.text_placeholder'), { target: { value: 'Override updated' } });
    fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.update_btn' }));

    await waitFor(() => {
      expect(formRef.current?.getFieldValue(['overrides', 0, 'properties', 'valueMappings', 0, 'result', 'text'])).toBe('Override updated');
      expect(getFormValues()).toMatchObject({
        overrides: [{ properties: { valueMappings: [{ ...numericMapping, result: { ...numericMapping.result, text: 'Override updated' } }] } }],
      });
    });
    expect(await formRef.current?.validateFields()).toEqual({
      overrides: [
        {
          matcher: { id: 'byFrameRefID', value: 'A' },
          properties: { standardOptions: { decimals: 2 }, valueMappings: [{ ...numericMapping, result: { ...numericMapping.result, text: 'Override updated' } }] },
        },
      ],
    });
  });
});
