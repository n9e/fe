/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';

import QueryWorkspace from './index';
import type { QueryWorkspaceProps } from './types';
import zh_CN from '../../locale/zh_CN';

jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('../../constants', () => ({ NAME_SPACE: 'log_explorer' }));
jest.mock('@fc-components/monaco-editor', () => ({ SqlMonacoPreview: ({ value }: { value?: string }) => <pre>{value}</pre> }));

import { copy2ClipBoard } from '@/utils';

const i18n = i18next.createInstance();
beforeAll(async () => {
  await i18n.init({ lng: 'zh_CN', resources: { zh_CN: { log_explorer: zh_CN, common: { btn: { reset: '重置', copy2: '复制' } } } } });
});

function setup(overrides: Partial<QueryWorkspaceProps> = {}) {
  const props: QueryWorkspaceProps = {
    assistEnabled: false,
    dirty: false,
    generating: false,
    builder: <div>backend form</div>,
    editor: <textarea aria-label='SQL editor' />,
    onAssistChange: jest.fn(),
    onReset: jest.fn(),
    onConvert: jest.fn(),
    onExecute: jest.fn(),
    onContinueWriting: jest.fn(),
    ...overrides,
  };
  const view = render(
    <I18nextProvider i18n={i18n}>
      <QueryWorkspace {...props} />
    </I18nextProvider>,
  );
  return { ...view, props };
}

it('shows the manual editor and no conversion button while assistance is off', () => {
  const { props } = setup();
  expect(screen.getByLabelText('SQL editor')).toBeVisible();
  expect(screen.getByText('backend form')).not.toBeVisible();
  expect(screen.queryByRole('button', { name: /转换 SQL/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('switch', { name: '表单辅助' }));
  expect(props.onAssistChange).toHaveBeenCalledWith(true, expect.anything());
  fireEvent.click(screen.getByRole('button', { name: '重置' }));
  fireEvent.click(screen.getByRole('button', { name: /查询/ }));
  expect(props.onReset).toHaveBeenCalled();
  expect(props.onExecute).toHaveBeenCalled();
});

it('folds the panel body from the toolbar and reveals it again for a conversion', () => {
  const { props } = setup({ assistEnabled: true });
  expect(screen.getByText('表单构建')).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: '收起' }));
  expect(screen.getByText('表单构建')).not.toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: /转换 SQL/ }));
  // The conversion is reported below, so the panel comes back instead of updating out of sight.
  expect(props.onConvert).toHaveBeenCalled();
  expect(screen.getByText('表单构建')).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: '收起' }));
  fireEvent.click(screen.getByRole('button', { name: '展开' }));
  expect(screen.getByText('表单构建')).toBeVisible();
});

it('reopens the folded panel when a generation fails, so the error is visible', () => {
  const { props, rerender } = setup({ assistEnabled: true });
  fireEvent.click(screen.getByRole('button', { name: '收起' }));
  expect(screen.getByText('表单构建')).not.toBeVisible();

  rerender(
    <I18nextProvider i18n={i18n}>
      <QueryWorkspace {...props} error='build failed' />
    </I18nextProvider>,
  );
  expect(screen.getByText('build failed')).toBeVisible();
  expect(screen.getByText('表单构建')).toBeVisible();
});

it('renders backend slots, conversion and empty preview controls in assisted mode', () => {
  const { props, container } = setup({ assistEnabled: true });
  expect(screen.getByText('表单构建')).toBeVisible();
  expect(container.querySelector('.lucide-rectangle-ellipsis')).toBeInTheDocument();
  expect(screen.getByText('SQL 预览')).toBeVisible();
  expect(screen.getByText('·')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('待转换');
  expect(screen.getByRole('status')).toHaveClass('text-soft');
  expect(screen.getByText('backend form')).toBeVisible();
  expect(screen.getByLabelText('SQL editor')).not.toBeVisible();
  expect(screen.getByRole('button', { name: /用此 SQL 继续手写/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /转换 SQL/ }));
  expect(props.onConvert).toHaveBeenCalled();
});

it('flags the conversion as pending on the button once the builder has changes', () => {
  const { props } = setup({ assistEnabled: true, dirty: true });
  const convert = screen.getByRole('button', { name: /转换 SQL · 待转换/ });
  expect(convert).toBeEnabled();
  expect(convert).toHaveClass('ant-btn-primary', 'ant-btn-background-ghost', 'ant-btn-round');
  fireEvent.click(convert);
  expect(props.onConvert).toHaveBeenCalled();
});

it('shows stale status and copies or continues with the last preview', () => {
  const { props } = setup({ assistEnabled: true, preview: 'SELECT 42', dirty: true });
  expect(screen.getByRole('status')).toHaveTextContent('表单已修改');
  expect(screen.getByRole('button', { name: /转换 SQL · 表单已修改/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /复制/ }));
  expect(copy2ClipBoard).toHaveBeenCalledWith('SELECT 42');
  fireEvent.click(screen.getByRole('button', { name: /用此 SQL 继续手写/ }));
  expect(props.onContinueWriting).toHaveBeenCalled();
});

it('reports errors, blocks generation while busy, and allows reset to cancel', () => {
  const { props } = setup({ assistEnabled: true, generating: true, error: 'conversion failed' });
  expect(screen.getByRole('alert')).toHaveTextContent('conversion failed');
  expect(screen.getByRole('button', { name: /转换 SQL/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '重置' }));
  expect(props.onReset).toHaveBeenCalled();
});
