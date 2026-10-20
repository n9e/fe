/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import DorisSidebar from '@/plugins/doris/ExplorerNG/SideBarNav/FieldsSidebar';
import ClickHouseSidebar from '@/plugins/clickHouse/ExplorerNG/SideBarNav/FieldsSidebar';

let mockFieldsProps: any;
jest.mock('./index', () => ({
  __esModule: true,
  default: (props: any) => {
    mockFieldsProps = props;
    return null;
  },
}));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { doris: 'doris', ck: 'ck' } }));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: jest.fn() }));
jest.mock('@/pages/dashboard/Renderer/utils/byteConverter', () => ({ format: jest.fn() }));
jest.mock('@/plugins/doris/services', () => ({ getDorisLogsQuery: jest.fn(), getDorisSQLsPreview: jest.fn() }));
jest.mock('@/plugins/clickHouse/services', () => ({ getCKLogsQuery: jest.fn(), getCKSQLsPreview: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const field = { field: 'labels.alertname', type: 'string', indexable: true };
function actions(Provider: any, active: boolean, uniqueCount?: number) {
  const setStackByField = jest.fn();
  render(
    <Form>
      <Provider
        data={[]}
        loading={false}
        organizeFields={[]}
        setOrganizeFields={jest.fn()}
        executeQuery={jest.fn()}
        onValueFilter={jest.fn()}
        stackByField={active ? field.field : undefined}
        setStackByField={setStackByField}
        setDefaultSearchField={jest.fn()}
      />
    </Form>,
  );
  const props = mockFieldsProps;
  cleanup();
  const { container } = render(
    <>
      {props.renderFieldNameExtra?.(field)}
      {props.renderStatsPopoverTitleExtra({ index: field, stats: uniqueCount === undefined ? undefined : { unique_count: uniqueCount }, setTopNVisible: jest.fn() })}
    </>,
  );
  return { setStackByField, container };
}

for (const [name, Provider] of [
  ['Doris', DorisSidebar],
  ['ClickHouse', ClickHouseSidebar],
] as const) {
  describe(name, () => {
    it('uses one highlighted stack button, placed first, and allows cancelling before statistics load', () => {
      const { container, setStackByField } = actions(Provider, true);
      const button = screen.getByRole('button', { name: 'query.stack_tip_unpin' });
      expect(button).toBeEnabled();
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveClass('n9e-log-field-stack-active');
      expect(container.querySelector('button')).toBe(button);
      expect(container.querySelectorAll('svg')).toHaveLength(name === 'Doris' ? 2 : 1);
      fireEvent.click(button);
      expect(setStackByField).toHaveBeenCalledWith(undefined);
    });
    it('enables stacking for supported statistics', () => {
      const { setStackByField } = actions(Provider, false, 3);
      const button = screen.getByRole('button', { name: 'query.stack_tip_pin' });
      expect(button).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(button);
      expect(setStackByField).toHaveBeenCalledWith(field.field);
    });
    it('disables enabling unsupported fields', () => {
      actions(Provider, false, 1);
      expect(screen.getByRole('button', { name: 'query.stack_tip_pin' })).toBeDisabled();
    });
  });
}
