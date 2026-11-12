/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Editor from './index';
import ValueMappings from './Fields/ValueMappings';
import TimeseriesValueMappings from './Options/Timeseries/ValueMappings';
import type { IPanel, IValueMapping } from '../types';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ darkMode: false }) }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { prometheus: 'prometheus' }, SIZE: 8 }));
jest.mock('uuid', () => ({ v4: () => 'generated-panel-id' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }), Trans: () => null }));
jest.mock('../globalState', () => ({ useGlobalState: () => [[]] }));
jest.mock('re-resizable', () => ({ Resizable: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
jest.mock('@/components/TimeRangePicker', () => ({ __esModule: true, default: () => null }));
jest.mock('../Variables/Main', () => () => null);
jest.mock('../Components/ColorPicker', () => () => null);
jest.mock('../Renderer/Renderer/TableNG/utils/normalizeData', () => ({ __esModule: true, default: () => [] }));
// 保留真实 Editor、Form、映射组件和格式化函数，仅替换查询、绘图及其它选项。
jest.mock('./Options', () => ({
  __esModule: true,
  default: ({ type }: { type: string }) => {
    const { Form } = require('antd');
    return (
      <>
        <Form.Item name='custom' hidden>
          <div />
        </Form.Item>
        {type === 'timeseries' ? <TimeseriesValueMappings /> : <ValueMappings />}
      </>
    );
  },
}));
jest.mock('./QueryEditor', () => () => {
  const { Form } = require('antd');
  return (
    <Form.Item name='targets' hidden>
      <div />
    </Form.Item>
  );
});
jest.mock('../Renderer/Renderer', () => ({
  __esModule: true,
  default: ({ values }: { values: IPanel }) => {
    const { getSerieTextObj, getMappedTextObj } = jest.requireActual('../Renderer/utils/getCalculatedValuesBySeries');
    const mappings = values.options?.valueMappings;
    const text = values.type === 'timeseries' ? getMappedTextObj('QA_B', mappings)?.text : getSerieTextObj(60, {}, mappings)?.value;
    return <output data-testid='panel-preview'>{String(text)}</output>;
  },
}));

function createPanel(type: 'stat' | 'timeseries'): IPanel {
  const mapping: IValueMapping = {
    type: type === 'stat' ? 'special' : 'textValue',
    match: type === 'stat' ? { special: 60 } : { textValue: 'QA_B' },
    result: { text: 'MAPPED' },
  };
  return {
    id: 'mapping-panel',
    name: 'Value mapping regression',
    description: '',
    type,
    layout: { h: 8, w: 12, x: 0, y: 0, i: 'mapping-panel' },
    targets: [{ refId: 'A', expr: 'vector(60)' }],
    options: { valueMappings: [mapping] },
    custom: {},
    overrides: [],
  };
}

function renderEditor(panel: IPanel) {
  const onOK = jest.fn();
  const view = render(
    <MemoryRouter>
      <Editor
        mode='edit'
        visible
        setVisible={jest.fn()}
        initialValues={panel}
        id={panel.id}
        time={{ start: 'now-1h', end: 'now' }}
        timezone='UTC'
        setTimezone={jest.fn()}
        onOK={onOK}
        editModalVariablecontainerRef={React.createRef<HTMLDivElement>()}
      />
    </MemoryRouter>,
  );
  return { ...view, onOK };
}

it.each(['stat', 'timeseries'] as const)('%s 映射立即作用于编辑预览，并在保存、序列化、重开后保留', async (type) => {
  const panel = createPanel(type);
  const { onOK, unmount } = renderEditor(panel);
  await waitFor(() => expect(screen.getByTestId('panel-preview')).toHaveTextContent('MAPPED'));

  fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
  fireEvent.change(await screen.findByPlaceholderText('panel.options.valueMappings.text_placeholder'), { target: { value: 'UPDATED' } });
  fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.update_btn' }));
  await waitFor(() => expect(screen.getByTestId('panel-preview')).toHaveTextContent('UPDATED'));

  fireEvent.click(screen.getByRole('button', { name: 'common:btn.save' }));
  await waitFor(() => expect(onOK).toHaveBeenCalledTimes(1));
  const savedPanel = JSON.parse(JSON.stringify(onOK.mock.calls[0][0])) as IPanel;
  expect(savedPanel.options.valueMappings).toEqual([{ ...panel.options.valueMappings![0], result: { text: 'UPDATED' } }]);
  expect(panel.options.valueMappings![0].result.text).toBe('MAPPED');

  unmount();
  renderEditor(savedPanel);
  await waitFor(() => expect(screen.getByTestId('panel-preview')).toHaveTextContent('UPDATED'));
  fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
  expect(await screen.findByPlaceholderText('panel.options.valueMappings.text_placeholder')).toHaveValue('UPDATED');
});

it.each(['stat', 'timeseries'] as const)('%s 删除最后一条映射后保存、重开保持为空，不恢复旧规则', async (type) => {
  const { onOK, unmount } = renderEditor(createPanel(type));
  fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
  fireEvent.click(await screen.findByRole('button', { name: 'delete' }));
  fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.update_btn' }));
  await waitFor(() => expect(screen.getByTestId('panel-preview')).toHaveTextContent(type === 'stat' ? '60' : 'QA_B'));

  fireEvent.click(screen.getByRole('button', { name: 'common:btn.save' }));
  await waitFor(() => expect(onOK).toHaveBeenCalledTimes(1));
  const savedPanel = JSON.parse(JSON.stringify(onOK.mock.calls[0][0])) as IPanel;
  expect(savedPanel.options.valueMappings).toEqual([]);

  unmount();
  renderEditor(savedPanel);
  fireEvent.click(screen.getByRole('button', { name: 'panel.options.valueMappings.edit_btn' }));
  expect(await screen.findByRole('button', { name: 'panel.options.valueMappings.btn' })).toBeVisible();
  expect(screen.queryByPlaceholderText('panel.options.valueMappings.text_placeholder')).not.toBeInTheDocument();
});
