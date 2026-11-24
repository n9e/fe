/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Editor from './index';
import { DashboardRuntimeProvider } from '../globalState';
import type { IPanel } from '../types';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ darkMode: false }) }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { prometheus: 'prometheus' }, PRIMARY_COLOR: '#3274d9', SIZE: 8 }));
jest.mock('uuid', () => ({ v4: () => 'generated-panel-id' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }), Trans: () => null }));
jest.mock('@/components/AiChat/images/ai-chat/ai_chat_icon.svg', () => ({ __esModule: true, default: 'ai-chat.svg' }));
jest.mock('@/components/TimeRangePicker', () => ({ __esModule: true, default: () => null }));
jest.mock('../Variables/Main', () => () => null);
jest.mock('../Renderer/Renderer/TableNG/utils/normalizeData', () => ({ __esModule: true, default: () => [] }));
jest.mock('./QueryEditor', () => () => {
  const { Form } = require('antd');
  return (
    <>
      <Form.Item name='targets' hidden>
        <div />
      </Form.Item>
      <Form.Item name='datasourceValue' hidden>
        <div />
      </Form.Item>
    </>
  );
});
jest.mock('../Renderer/Renderer', () => () => null);

const panel: IPanel = {
  id: 'configured-panel',
  name: 'Configured panel',
  description: '',
  layout: { h: 8, w: 12, x: 0, y: 0, i: 'configured-panel' },
  type: 'timeseries',
  datasourceValue: 1,
  targets: [{ refId: 'A', expr: 'up' }],
  custom: { lineWidth: 5 },
  options: { standardOptions: { unit: 'bytes' } },
  overrides: [],
};

function renderEditor(initialValues: IPanel) {
  const onOK = jest.fn();
  render(
    <MemoryRouter>
      <DashboardRuntimeProvider>
        <Editor
          mode='edit'
          visible
          setVisible={jest.fn()}
          initialValues={initialValues}
          id={initialValues.id}
          time={{ start: 'now-1h', end: 'now' }}
          timezone='UTC'
          setTimezone={jest.fn()}
          onOK={onOK}
          editModalVariablecontainerRef={React.createRef<HTMLDivElement>()}
        />
      </DashboardRuntimeProvider>
    </MemoryRouter>,
  );
  return onOK;
}

async function savePanel(onOK: jest.Mock): Promise<IPanel> {
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.save' }));
  await waitFor(() => expect(onOK).toHaveBeenCalledTimes(1));
  return JSON.parse(JSON.stringify(onOK.mock.calls[0][0]));
}

it('serializes custom and options after switching to Text, which only has custom controls', async () => {
  const onOK = renderEditor(panel);
  // 图表类型选择器只存在于弹窗标题区，按标题限定范围，避免依赖 combobox 的渲染顺序。
  const header = screen.getByText('panel.title.edit').closest('.ant-modal-header')!;
  fireEvent.mouseDown(within(header).getByRole('combobox'));
  fireEvent.click(screen.getByText('visualizations.text'));
  const content = screen.getByPlaceholderText('panel.custom.text.content_placeholder');
  fireEvent.change(content, { target: { value: 'Dashboard notes' } });

  const saved = await savePanel(onOK);
  expect(saved).toMatchObject({ type: 'text', custom: { content: 'Dashboard notes' }, options: { thresholds: { mode: 'absolute' } } });
  expect(saved.custom).not.toHaveProperty('lineWidth');
  expect(saved.options).not.toHaveProperty('standardOptions');
});

it('keeps TableNG top-level options and saves the active cell settings when switching to Default', async () => {
  const options: IPanel['options'] = {
    thresholds: {
      mode: 'absolute',
      steps: [
        { type: 'base', color: 'blue-9', value: null },
        { color: 'red-9', value: 42 },
      ],
    },
  };
  const onOK = renderEditor({ ...panel, type: 'tableNG', custom: { cellOptions: { type: 'gauge', valueDisplayMode: 'hidden' } }, options });
  const valueDisplay = 'panel.custom.tableNG.cellOptions.gauge.valueDisplayMode.label';
  expect(screen.getByLabelText(valueDisplay)).toBeInTheDocument();

  fireEvent.mouseDown(screen.getByLabelText('panel.custom.tableNG.cellOptions.type.label', { selector: '#custom_cellOptions_type' }));
  fireEvent.click(screen.getByText('panel.custom.tableNG.cellOptions.type.options.none', { selector: '.ant-select-item-option-content' }));
  expect(screen.queryByLabelText(valueDisplay)).not.toBeInTheDocument();

  const saved = await savePanel(onOK);
  expect(saved.custom.cellOptions).toEqual({ type: 'none' });
  expect(saved).toHaveProperty('options');
  expect(saved.options).not.toHaveProperty('thresholds');
});
