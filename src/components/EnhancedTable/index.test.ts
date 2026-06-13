import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('./style.less', () => ({}));

jest.mock('lucide-react', () => {
  const icon =
    (name: string) =>
    ({ className }: { className?: string }) =>
      React.createElement('svg', { className, 'data-icon': name });

  return {
    CheckCircle: icon('CheckCircle'),
    Copy: icon('Copy'),
    ExternalLink: icon('ExternalLink'),
    Eye: icon('Eye'),
    Link: icon('Link'),
    MoreVertical: icon('MoreVertical'),
    Network: icon('Network'),
    Pencil: icon('Pencil'),
    Play: icon('Play'),
    Plus: icon('Plus'),
    Search: icon('Search'),
    Settings: icon('Settings'),
    ShieldCheck: icon('ShieldCheck'),
    Sparkles: icon('Sparkles'),
    Trash2: icon('Trash2'),
  };
});

jest.mock('antd', () => {
  return {
    Table: ({ columns, dataSource }: { columns: any[]; dataSource: any[] }) =>
      React.createElement(
        'div',
        {},
        dataSource.map((record, index) =>
          React.createElement(
            'div',
            { key: record.id ?? index },
            columns.map((column) =>
              React.createElement('div', { key: column.key ?? column.dataIndex }, column.render ? column.render(undefined, record, index) : null),
            ),
          ),
        ),
      ),
    Button: ({ children, className, icon }: any) => React.createElement('button', { className }, icon, children),
    Tooltip: ({ children, title }: any) => React.createElement('span', { 'data-tooltip': title }, children),
    Dropdown: ({ children }: any) => React.createElement('span', {}, children),
    Menu: ({ children }: any) => React.createElement('menu', {}, children),
  };
});

const antd = require('antd');
antd.Menu.Item = ({ children }: any) => React.createElement('li', {}, children);
antd.Menu.Divider = () => React.createElement('hr');

import EnhancedTable from './index';

describe('EnhancedTable row actions', () => {
  it('renders inline text actions as icon-only buttons with the text in a tooltip', () => {
    const html = renderToStaticMarkup(
      React.createElement(EnhancedTable, {
        rowKey: 'id',
        dataSource: [{ id: 1 }],
        columns: [],
        rowActions: () => ({
          inline: [{ key: 'query', text: '查询' }],
        }),
      }),
    );

    expect(html).toContain('data-tooltip="查询"');
    expect(html).toContain('data-icon="Search"');
    expect(html).not.toContain('<button class="fc-table-action-inline-btn">查询</button>');
  });

  it('uses a default icon when an inline action has no icon mapping', () => {
    const html = renderToStaticMarkup(
      React.createElement(EnhancedTable, {
        rowKey: 'id',
        dataSource: [{ id: 1 }],
        columns: [],
        rowActions: () => ({
          inline: [{ key: 'custom-action', text: '自定义操作' }],
        }),
      }),
    );

    expect(html).toContain('data-tooltip="自定义操作"');
    expect(html).toContain('data-icon="CheckCircle"');
  });
});
