/** @jest-environment jsdom */
import React from 'react';
import { Form, message } from 'antd';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { getDorisLogsQuery } from '@/plugins/doris/services';
import { getCKLogsQuery } from '@/plugins/clickHouse/services';
import { parseRange } from '@/components/TimeRangePicker';
import { format } from '@/pages/dashboard/Renderer/utils/byteConverter';
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
function actions(Provider: any, active: boolean, uniqueCount?: number, searchActive = false) {
  const setStackByField = jest.fn();
  const setDefaultSearchField = jest.fn();
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
        defaultSearchField={searchActive ? field.field : undefined}
        setDefaultSearchField={setDefaultSearchField}
      />
    </Form>,
  );
  const props = mockFieldsProps;
  cleanup();
  const { container } = render(
    <>
      {props.renderFieldNameExtra?.(field)}
      {props.renderStatsPopoverTitleExtra({ index: field, getUniqueCount: jest.fn().mockResolvedValue(uniqueCount ?? 3), statsScope: {}, setTopNVisible: jest.fn() })}
    </>,
  );
  return { setStackByField, setDefaultSearchField, container };
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
    it('enables stacking after click validation', async () => {
      const { setStackByField } = actions(Provider, false, 3);
      const button = screen.getByRole('button', { name: 'query.stack_tip_pin' });
      expect(button).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(button);
      await waitFor(() => expect(setStackByField).toHaveBeenCalledWith(field.field));
    });
    it('explains unsupported cardinality after clicking, without applying it', async () => {
      const info = jest.spyOn(message, 'warning').mockImplementation(() => (() => {}) as any);
      const { setStackByField } = actions(Provider, false, 1);
      const button = screen.getByRole('button', { name: 'query.stack_tip_pin' });
      expect(button).toBeEnabled();
      fireEvent.click(button);
      await waitFor(() => expect(info).toHaveBeenCalledWith(expect.objectContaining({ duration: 10, content: expect.anything() })));
      expect(setStackByField).not.toHaveBeenCalled();
      info.mockRestore();
    });
  });
}

describe('Doris default search field', () => {
  it('shows one selected search button after the stack button, without a separate field badge', () => {
    const { container, setDefaultSearchField } = actions(DorisSidebar, false, undefined, true);
    const button = screen.getByRole('button', { name: 'query.default_search_tip_2' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveClass('n9e-log-field-search-active');
    expect(container.querySelectorAll('button')).toHaveLength(2);
    expect(container.querySelectorAll('svg')).toHaveLength(2);
    expect(container.querySelectorAll('button')[1]).toBe(button);
    fireEvent.click(button);
    expect(setDefaultSearchField).toHaveBeenCalledWith(undefined);
  });
  it('sets the field when the same search button is unselected', () => {
    const { setDefaultSearchField } = actions(DorisSidebar, false, 3);
    const button = screen.getByRole('button', { name: 'query.default_search_tip_1' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(setDefaultSearchField).toHaveBeenCalledWith(field.field);
  });
});

for (const [name, Provider, query] of [
  ['Doris', DorisSidebar, getDorisLogsQuery],
  ['ClickHouse', ClickHouseSidebar, getCKLogsQuery],
] as const) {
  it(`${name} sends only unique_count for stack validation and retains the raw count from detailed stats`, async () => {
    (parseRange as jest.Mock).mockReturnValue({ start: new Date(100000), end: new Date(200000) });
    (format as jest.Mock).mockReturnValue({ text: '1.5K' });
    (query as jest.Mock).mockResolvedValue({ list: [{ ref: 'unique_count', unique_count: '1500' }] });
    render(
      <Form
        initialValues={{
          datasourceValue: 42,
          refreshFlag: 'query-1',
          query: { database: 'db', table: 'logs', time_field: 'timestamp', range: { start: 'now-30m', end: 'now' }, query: 'error', query_builder_filter: [] },
        }}
      >
        <Form.Item name='query' hidden>
          <input />
        </Form.Item>
        <Form.Item name='datasourceValue' hidden>
          <input />
        </Form.Item>
        <Form.Item name='refreshFlag' hidden>
          <input />
        </Form.Item>
        <Provider
          data={[]}
          loading={false}
          organizeFields={[]}
          setOrganizeFields={jest.fn()}
          executeQuery={jest.fn()}
          onValueFilter={jest.fn()}
          setStackByField={jest.fn()}
          setDefaultSearchField={jest.fn()}
        />
      </Form>,
    );
    expect(query).not.toHaveBeenCalled();
    expect(await mockFieldsProps.fetchUniqueCount(field)).toBe(1500);
    const request = (query as jest.Mock).mock.calls[0][0];
    expect(request.datasource_id).toBe(42);
    expect(request.query).toHaveLength(1);
    expect(request.query[0]).toMatchObject({
      database: 'db',
      table: 'logs',
      field: field.field,
      func: 'unique_count',
      ref: 'unique_count',
      from: name === 'Doris' ? 100000 : 100,
      to: name === 'Doris' ? 200000 : 200,
    });
    const detail = await mockFieldsProps.fetchStats(field);
    expect(detail.uniqueCount).toBe(1500);
    expect(detail.stats.unique_count).toBe('1.5K');
    (query as jest.Mock).mockResolvedValue({ list: [] });
    await expect(mockFieldsProps.fetchUniqueCount(field)).rejects.toThrow('cardinality');
    (query as jest.Mock).mockReset();
  });
}
