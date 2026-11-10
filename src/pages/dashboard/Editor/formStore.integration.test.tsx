/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { FormInstance } from 'antd';

import Editor from './index';
import type { IPanel } from '../types';
import { defaultCustomValuesMap, defaultOptionsValuesMap } from '../Renderer/registry/defaults';

let mockForm: FormInstance;
const mockLoadOptions = jest.fn();

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ darkMode: false }) }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { prometheus: 'prometheus' }, SIZE: 8 }));
jest.mock('uuid', () => ({ v4: () => 'generated-panel-id' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }), Trans: () => null }));
jest.mock('../globalState', () => ({ useGlobalState: () => [[]] }));
jest.mock('re-resizable', () => ({ Resizable: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
jest.mock('@/components/TimeRangePicker', () => ({ __esModule: true, default: () => null }));
jest.mock('../Variables/Main', () => () => null);
jest.mock('../Renderer/Renderer/TableNG/utils/normalizeData', () => ({ __esModule: true, default: () => [] }));
jest.mock('../Renderer/registry', () => ({
  getPanelTypeDefinition: (type: string) => (type ? { type, loadOptions: () => mockLoadOptions(type) } : undefined),
}));
jest.mock('../Renderer/Renderer', () => ({
  __esModule: true,
  default: ({ values }: { values: IPanel }) => <output data-testid='panel-preview'>{JSON.stringify(values)}</output>,
}));
jest.mock('./QueryEditor', () => () => {
  const { Form } = require('antd');
  mockForm = Form.useFormInstance();
  return (
    <>
      <Form.Item name='targets' hidden>
        <div />
      </Form.Item>
      <Form.Item name='datasourceCate' hidden>
        <div />
      </Form.Item>
    </>
  );
});
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  const Modal = ({ visible, title, footer, children }: { visible: boolean; title: React.ReactNode; footer: React.ReactNode; children: React.ReactNode }) =>
    visible ? (
      <div>
        {title}
        {children}
        {footer}
      </div>
    ) : null;
  Modal.confirm = jest.fn();
  const Select = (props: React.ComponentProps<typeof actual.Select>) =>
    props.dropdownMatchSelectWidth === false ? (
      <button type='button' onClick={() => props.onChange('stat')} data-testid='change-visualization'>
        {props.value}
      </button>
    ) : (
      <actual.Select {...props} />
    );
  Select.Option = actual.Select.Option;
  return { ...actual, Modal, Select };
});

function deferredOptions() {
  let resolve!: (module: { default: React.ComponentType }) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<{ default: React.ComponentType }>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

/** 真实 Form.Item 延迟注册，并使用与保存值不同的字段默认值。 */
function LoadedOptions() {
  const { Form, Input } = require('antd');
  return (
    <>
      <Form.Item name={['options', 'legend', 'displayMode']} initialValue='hidden'>
        <Input aria-label='legend mode' />
      </Form.Item>
      <Form.Item name={['custom', 'drawStyle']} initialValue='bars'>
        <Input aria-label='draw style' />
      </Form.Item>
    </>
  );
}

const panel: IPanel = {
  id: 'existing-panel',
  type: 'timeseries',
  name: 'Existing panel',
  description: '',
  layout: { h: 8, w: 12, x: 0, y: 0, i: 'existing-panel' },
  datasourceCate: 'prometheus',
  targets: [{ refId: 'A', kind: 'query', expr: 'up' }],
  // 历史面板可能只保存部分 legend 字段，这里刻意用不完整配置验证兼容行为。
  options: { legend: { displayMode: 'list', columns: ['last'], detailUrl: '/detail' }, standardOptions: { unit: 'bytes' } } as IPanel['options'],
  custom: { drawStyle: 'lines', lineWidth: 3 },
  overrides: [{ matcher: { id: 'byFrameRefID', value: 'A' }, properties: { standardOptions: { decimals: 2 } } }],
  queryOptionsTime: { start: 'now-2h', end: 'now' },
  transformationsNG: [{ id: 'limit', options: { limit: 5 } }],
};

function renderEditor(initialValues = panel) {
  const onOK = jest.fn();
  render(
    <MemoryRouter>
      <Editor
        mode='edit'
        visible
        setVisible={jest.fn()}
        initialValues={initialValues}
        id={panel.id}
        time={{ start: 'now-1h', end: 'now' }}
        timezone='UTC'
        setTimezone={jest.fn()}
        onOK={onOK}
        editModalVariablecontainerRef={React.createRef<HTMLDivElement>()}
      />
    </MemoryRouter>,
  );
  return onOK;
}

function preview(): IPanel {
  return JSON.parse(screen.getByTestId('panel-preview').textContent!);
}

describe('dashboard editor complete form store', () => {
  let request: ReturnType<typeof deferredOptions>;

  beforeEach(() => {
    request = deferredOptions();
    mockLoadOptions.mockImplementation(() => request.promise);
  });

  it('previews the complete configuration before option fields register and reacts to changes in unregistered fields', async () => {
    renderEditor();
    expect(screen.getByTestId('panel-options-loading')).toBeInTheDocument();
    expect(mockForm.getFieldsValue(true)).toMatchObject(panel);
    expect(preview()).toMatchObject(panel);

    act(() => mockForm.setFieldsValue({ custom: { lineWidth: 7 } }));
    expect(preview().custom.lineWidth).toBe(7);

    await act(async () => request.resolve({ default: LoadedOptions }));
    expect(screen.getByLabelText('legend mode')).toHaveValue('list');
    expect(screen.getByLabelText('draw style')).toHaveValue('lines');
    expect(preview().custom.lineWidth).toBe(7);
  });

  it.each(['loading', 'failed'])('preserves unregistered and hidden settings when saving while options are %s', async (state) => {
    const onOK = renderEditor();
    if (state === 'failed') {
      await act(async () => request.reject(new Error('chunk unavailable')));
      expect(screen.getByTestId('panel-options-load-error')).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole('button', { name: 'common:btn.save' }));
    await waitFor(() => expect(onOK).toHaveBeenCalledTimes(1));
    expect(onOK.mock.calls[0][0]).toMatchObject(panel);
    expect(onOK.mock.calls[0][0].overrides).toEqual(panel.overrides);
    expect(onOK.mock.calls[0][0].overrides).not.toBe(mockForm.getFieldValue('overrides'));
    expect(panel.custom.lineWidth).toBe(3);
  });

  it('preserves an initially empty overrides list without adding a default placeholder', async () => {
    const onOK = renderEditor({ ...panel, overrides: [] });
    expect(preview().overrides).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'common:btn.save' }));
    await waitFor(() => expect(onOK).toHaveBeenCalledTimes(1));
    expect(onOK.mock.calls[0][0].overrides).toEqual([]);
  });

  it('keeps explicit clears and removed arrays instead of restoring values from initial config', async () => {
    const onOK = renderEditor();
    act(() => mockForm.setFieldsValue({ options: { legend: { detailUrl: undefined, columns: [] } }, overrides: [], transformationsNG: [] }));
    fireEvent.click(screen.getByRole('button', { name: 'common:btn.save' }));

    await waitFor(() => expect(onOK).toHaveBeenCalledTimes(1));
    const saved = onOK.mock.calls[0][0] as IPanel;
    expect(saved.options.legend?.detailUrl).toBeUndefined();
    expect(saved.options.legend?.columns).toEqual([]);
    expect(saved.overrides).toEqual([]);
    expect(saved.transformationsNG).toEqual([]);
    expect(saved.custom).toMatchObject(panel.custom);
  });

  it('switches visualization from the complete store while replacing type-specific settings', async () => {
    const onOK = renderEditor();
    fireEvent.click(screen.getByTestId('change-visualization'));
    fireEvent.click(screen.getByRole('button', { name: 'common:btn.save' }));

    await waitFor(() => expect(onOK).toHaveBeenCalledTimes(1));
    expect(onOK.mock.calls[0][0]).toMatchObject({
      type: 'stat',
      targets: panel.targets,
      custom: defaultCustomValuesMap.stat,
      options: defaultOptionsValuesMap.stat,
      overrides: [],
      transformationsNG: panel.transformationsNG,
      queryOptionsTime: panel.queryOptionsTime,
    });
  });
});
