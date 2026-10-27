/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import { Form } from 'antd';

import Builder from './Builder';

let closePopover: (() => void) | undefined;

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh_CN' } }) }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { elasticsearch: 'elasticsearch' }, IS_PLUS: true }));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: (range) => range }));
jest.mock('@/pages/logExplorer/constants', () => ({ NAME_SPACE: 'log_explorer' }));
jest.mock('./builderContext', () => ({ __esModule: true, default: require('react').createContext({}) }));
jest.mock('plus:/datasource/elasticsearch/ExplorerNG/components/QueryBuilder', () => ({
  __esModule: true,
  default: () => {
    // Mirror what the filter/aggregate/order-by popovers do on every close.
    const { useContext } = require('react');
    const BuilderContext = require('./builderContext').default;
    closePopover = useContext(BuilderContext).ignoreNextOutsideClick;
    return null;
  },
}));

function Host() {
  const [builderForm] = Form.useForm();
  const [explorerForm] = Form.useForm();
  return <Builder explorerForm={explorerForm} form={builderForm} datasourceValue={1} onChange={() => {}} />;
}

it('hands the builder popovers a close hook instead of an undefined callback', () => {
  render(<Host />);
  // Without this the popovers threw on close and never wrote the new filter/aggregate back into the form.
  expect(typeof closePopover).toBe('function');
  expect(() => closePopover?.()).not.toThrow();
});
