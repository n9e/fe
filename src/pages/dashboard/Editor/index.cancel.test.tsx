/** @jest-environment jsdom */
import React, { forwardRef, useImperativeHandle } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Editor from './index';
let mockCanAccess = true;
let mockValidate: ((values: any) => Promise<any>) | undefined;
jest.mock('@/components/AiChat/hooks/useFlashAiAccess', () => ({ useCanAccessFlashAiChat: () => mockCanAccess }));
beforeEach(() => {
  mockCanAccess = true;
  mockValidate = undefined;
});
import type { IPanel } from '../types';

jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { prometheus: 'prometheus' }, SIZE: 8 }));
jest.mock('uuid', () => ({ v4: () => 'generated-id' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@ant-design/icons', () => ({ CloseOutlined: ({ onClick }: { onClick: () => void }) => <button onClick={onClick}>close</button> }));
jest.mock('antd', () => {
  const React = require('react');
  const Modal = ({ visible, title, footer, children, onCancel }: any) =>
    visible ? (
      <div>
        {title}
        {children}
        {footer}
        <button onClick={onCancel}>modal cancel</button>
      </div>
    ) : null;
  Modal.confirm = jest.fn();
  const Select = ({ value, onChange, children }: any) => (
    <div>
      <button onClick={() => onChange('timeseries')}>type:{value}</button>
      <button onClick={() => onChange('aiButton')}>choose AI</button>
      {children}
    </div>
  );
  Select.Option = ({ value }: any) => <span>option:{value}</span>;
  return { Modal, Select, Space: ({ children }: any) => <div>{children}</div>, Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button> };
});
jest.mock('@/components/TimeRangePicker', () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => <button onClick={() => onChange({ start: 'now-1h', end: 'now' })}>range:{value.start}</button>,
}));
jest.mock('../globalState', () => ({ useGlobalState: () => [[]] }));
jest.mock('./config', () => ({
  defaultValues: { type: 'timeseries' },
}));
jest.mock('../Renderer/registry/panelTypes', () => ({
  visualizations: [{ type: 'aiButton' }, { type: 'timeseries' }],
  NO_QUERY_PANEL_TYPES: ['aiButton'],
}));
jest.mock('../Renderer/registry/defaults', () => ({
  defaultCustomValuesMap: { timeseries: { drawStyle: 'lines' } },
  defaultOptionsValuesMap: { timeseries: {} },
}));
jest.mock('./Form', () => ({
  __esModule: true,
  default: forwardRef(({ initialValues, range }: any, ref) => {
    useImperativeHandle(ref, () => ({
      getFormInstance: () => ({
        getFieldsValue: () => initialValues,
        getFieldValue: (name: string) => initialValues[name],
        validateFields: () => (mockValidate ? mockValidate(initialValues) : Promise.resolve(initialValues)),
      }),
    }));
    return (
      <div>
        form:{initialValues.type} range:{range.start} label:{initialValues.name}
      </div>
    );
  }),
}));
jest.mock('./util', () => ({ normalizeInitialValues: (values: unknown) => values }));
jest.mock('../utils/getDefaultTargets', () => ({ __esModule: true, default: () => [{ refId: 'A' }] }));
jest.mock('../utils/upgradeTableToNG', () => ({ upgradeTableToNG: jest.fn() }));
jest.mock('../Renderer/Renderer/TableNG/utils/normalizeData', () => ({ __esModule: true, default: () => [] }));
jest.mock('./normalization', () => ({ normalizeDashboardPanelForPersist: (values: unknown) => values }));

const panel = { id: 'panel-1', type: 'aiButton', name: 'original', custom: { prompt: 'original prompt' }, options: {}, targets: [] } as unknown as IPanel;
const props = {
  mode: 'edit',
  visible: true,
  setVisible: jest.fn(),
  initialValues: panel,
  id: 'panel-1',
  time: { start: 'now-6h', end: 'now' },
  timezone: 'UTC',
  setTimezone: jest.fn(),
  onOK: jest.fn(),
  onCancel: jest.fn(),
  editModalVariablecontainerRef: React.createRef<HTMLDivElement>(),
};

test.each(['common:btn.cancel', 'close', 'modal cancel'])('discard switched type and temporary range when closing with %s', (closeButton) => {
  const { rerender } = render(<Editor {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'type:aiButton' }));
  fireEvent.click(screen.getByRole('button', { name: 'range:now-6h' }));
  expect(screen.getByText('form:timeseries range:now-1h label:original')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: closeButton }));
  expect(props.onOK).not.toHaveBeenCalled();
  rerender(<Editor {...props} visible={false} />);
  rerender(<Editor {...props} initialValues={{ ...panel }} />);

  expect(screen.getByRole('button', { name: 'type:aiButton' })).toBeInTheDocument();
  expect(screen.getByText('form:aiButton range:now-6h label:original')).toBeInTheDocument();
});

test('loads a different panel after canceling a type change', () => {
  const { rerender } = render(<Editor {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'type:aiButton' }));
  rerender(<Editor {...props} visible={false} />);
  rerender(<Editor {...props} initialValues={{ ...panel, id: 'panel-2', name: 'another' }} id='panel-2' />);
  expect(screen.getByText('form:aiButton range:now-6h label:another')).toBeInTheDocument();
});

test('retains a saved type when the updated panel is reopened', async () => {
  const onOK = jest.fn();
  const { rerender } = render(<Editor {...props} onOK={onOK} />);
  fireEvent.click(screen.getByRole('button', { name: 'type:aiButton' }));
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.save' }));
  await waitFor(() => expect(onOK).toHaveBeenCalledWith(expect.objectContaining({ type: 'timeseries' }), 'edit'));
  const savedPanel = onOK.mock.calls[0][0];
  rerender(<Editor {...props} onOK={onOK} visible={false} />);
  rerender(<Editor {...props} onOK={onOK} initialValues={savedPanel} />);
  expect(screen.getByRole('button', { name: 'type:timeseries' })).toBeInTheDocument();
});

test('hides AI from new panels and blocks a stale type selection', () => {
  mockCanAccess = false;
  render(<Editor {...props} mode='add' initialValues={{ ...panel, type: 'timeseries', targets: [{ refId: 'A' }] } as any} />);
  expect(screen.queryByText('option:aiButton')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'choose AI' }));
  expect(screen.getByText('form:timeseries range:now-6h label:original')).toBeInTheDocument();
});

test('round trips an existing AI panel without access', async () => {
  mockCanAccess = false;
  const onOK = jest.fn();
  render(<Editor {...props} onOK={onOK} />);
  expect(screen.getByText('option:aiButton')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.save' }));
  await waitFor(() => expect(onOK).toHaveBeenCalledWith(expect.objectContaining({ type: 'aiButton', custom: panel.custom }), 'edit'));
});

test('revocation during validation blocks saving a new AI panel', async () => {
  let complete!: (values: any) => void;
  mockValidate = () =>
    new Promise((resolve) => {
      complete = resolve;
    });
  const onOK = jest.fn();
  const { rerender } = render(<Editor {...props} mode='add' onOK={onOK} />);
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.save' }));
  mockCanAccess = false;
  rerender(<Editor {...props} mode='add' onOK={onOK} />);
  complete(panel);
  await waitFor(() => expect(screen.queryByText('option:aiButton')).not.toBeInTheDocument());
  expect(onOK).not.toHaveBeenCalled();
});
