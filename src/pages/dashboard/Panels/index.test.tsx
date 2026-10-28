/** @jest-environment jsdom */

import React, { useState } from 'react';
import { act, render } from '@testing-library/react';
import type { Layout } from 'react-grid-layout';

import { createDashboardRuntimeStore, DashboardRuntimeProvider } from '../globalState';
import type { IPanel, IDashboardConfig } from '../types';
import type { IVariable } from '../Variables/types';
import type { IProps as RendererProps } from '../Renderer/Renderer/index';
import Panels from './index';
import { processRepeats, updatePanelsInsertNewPanelToGlobal } from './utils';

type GridCallbacks = {
  layout: Layout[];
  onDragStop: (layout: Layout[]) => void;
  onResizeStop: (layout: Layout[]) => void;
  onLayoutChange: (layout: Layout[]) => void;
};
let mockGridProps: GridCallbacks;
let mockEditorProps: { onPanelsChange: (panels: IPanel[]) => void };
let mockRuntimePanels: IPanel[];
const mockRowProps = new Map<string, { row: IPanel; onToggle: () => void; onEditClick: (row: IPanel) => void; onDeleteClick: (mode: 'self' | 'withPanels') => void }>();
const mockRendererProps = new Map<string, RendererProps>();

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('uuid', () => ({ v4: () => 'generated-id' }));
jest.mock('@/App', () => ({
  CommonStateContext: require('react').createContext({ darkMode: false, perms: ['/dashboards/put'], groupedDatasourceList: [] }),
}));
jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('../Detail/utils', () => ({ ROW_HEIGHT: 30 }));
jest.mock('./Panel', () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock('../Renderer/Renderer/index', () => ({
  __esModule: true,
  default: (props) => {
    mockRendererProps.set(props.id, props);
    return null;
  },
}));
jest.mock('../Renderer/utils/adjustInitialValues', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('./EditorModal', () => ({
  __esModule: true,
  default: require('react').forwardRef((props, ref) => {
    mockEditorProps = props;
    return null;
  }),
}));
jest.mock('./Row', () => ({
  __esModule: true,
  default: (props) => {
    mockRowProps.set(props.row.id, props);
    return null;
  },
}));
jest.mock('react-grid-layout', () => ({
  __esModule: true,
  default: (props) => {
    mockGridProps = props;
    return <div>{props.children}</div>;
  },
  WidthProvider: (component) => component,
}));

function panel(id: string, y: number, overrides: Partial<IPanel> = {}): IPanel {
  return {
    id,
    name: id,
    description: '',
    type: 'timeseries',
    targets: [],
    options: {},
    custom: {},
    overrides: [],
    layout: { i: id, x: 0, y, w: 12, h: 4 },
    ...overrides,
  } satisfies IPanel;
}

function renderPanels(initialPanels?: IPanel[], repeatValues = ['a', 'b', 'c'], extraVariables: IVariable[] = []) {
  const variables: IVariable[] = [{ name: 'region', value: repeatValues, type: 'custom', definition: '', datasource: { cate: 'prometheus' } }, ...extraVariables];
  const sourcePanels = initialPanels ?? [
    panel('row', 0, { type: 'row', repeat: 'region', collapsed: false, layout: { i: 'row', x: 0, y: 0, w: 24, h: 1 } }),
    panel('chart', 1),
    panel('next', 5, { type: 'row', layout: { i: 'next', x: 0, y: 5, w: 24, h: 1 } }),
  ];
  const configs = { version: '4.1.0', panels: sourcePanels } as IDashboardConfig;
  const store = createDashboardRuntimeStore();
  store.setGlobalState('variablesWithOptions', variables);
  const onConfigChange = jest.fn();
  function Harness() {
    const [panels, setPanels] = useState(() => processRepeats(sourcePanels, variables));
    mockRuntimePanels = panels;
    return (
      <DashboardRuntimeProvider store={store}>
        <Panels
          dashboardId='dashboard'
          editable
          dashboard={{ configs } as React.ComponentProps<typeof Panels>['dashboard']}
          annotations={[]}
          range={{ start: 'now-1h', end: 'now' }}
          setRange={jest.fn()}
          timezone='UTC'
          setTimezone={jest.fn()}
          panels={panels}
          setPanels={setPanels}
          isPreview={false}
          onShareClick={jest.fn()}
          onConfigChange={onConfigChange}
          setAnnotationsRefreshFlag={jest.fn()}
          editModalVariablecontainerRef={React.createRef()}
        />
      </DashboardRuntimeProvider>
    );
  }
  render(<Harness />);
  act(() => mockGridProps.onLayoutChange(mockGridProps.layout));
  return { onConfigChange };
}

beforeEach(() => {
  mockRowProps.clear();
  mockRendererProps.clear();
});

test('copy toggles and subsequent RGL compaction only update runtime state', () => {
  const { onConfigChange } = renderPanels();
  act(() => mockRowProps.get('row__row_repeat_1')!.onToggle());
  expect(mockRowProps.get('row__row_repeat_1')!.row.collapsed).toBe(true);
  expect(mockRowProps.get('row')!.row.collapsed).toBe(false);
  expect(mockRowProps.get('row__row_repeat_2')!.row.collapsed).toBe(false);
  const compacted = mockGridProps.layout.map((item) => ({ ...item, y: item.y > 5 ? item.y - 4 : item.y }));
  act(() => mockGridProps.onLayoutChange(compacted));
  expect(onConfigChange).not.toHaveBeenCalled();

  act(() => mockRowProps.get('row')!.onToggle());
  expect(onConfigChange).toHaveBeenCalledTimes(1);
  expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ panels: expect.arrayContaining([expect.objectContaining({ id: 'row', collapsed: true })]) }), false);
  expect(mockRowProps.get('row__row_repeat_2')!.row.collapsed).toBe(false);
});

test.each(['onDragStop', 'onResizeStop'] as const)('recomputes repeats after %s and the following callback using the old closure', (stopCallback) => {
  const { onConfigChange } = renderPanels();
  const callbacks = mockGridProps;
  const newLayout = callbacks.layout.map((item) => (item.i === 'chart' ? { ...item, h: 6 } : { ...item, y: item.y > 1 ? item.y + 2 : item.y }));
  act(() => {
    callbacks[stopCallback](newLayout);
    callbacks.onLayoutChange(newLayout);
  });
  expect(mockGridProps.layout.find((item) => item.i === 'chart__row_repeat_1')).toMatchObject({ h: 6, y: 8 });
  expect(mockGridProps.layout.find((item) => item.i === 'row__row_repeat_2')).toMatchObject({ y: 14 });
  expect(mockGridProps.layout.find((item) => item.i === 'next')).toMatchObject({ y: 21 });
  expect(onConfigChange).toHaveBeenCalledTimes(1);
});

test('row settings can enable repeats and remove the last repeat without leaving copies', () => {
  const { onConfigChange } = renderPanels([panel('row', 0, { type: 'row', layout: { i: 'row', x: 0, y: 0, w: 24, h: 1 } })]);
  act(() => {
    const props = mockRowProps.get('row')!;
    props.onEditClick({ ...props.row, repeat: 'region' });
  });
  expect(mockGridProps.layout.map((item) => item.i)).toEqual(['row', 'row__row_repeat_1', 'row__row_repeat_2']);
  act(() => {
    const props = mockRowProps.get('row')!;
    props.onEditClick({ ...props.row, repeat: undefined });
  });
  expect(mockGridProps.layout.map((item) => item.i)).toEqual(['row']);
  expect(onConfigChange).toHaveBeenCalledTimes(2);
});

test('a runtime copy toggle never persists a pending normalization from row settings', () => {
  const { onConfigChange } = renderPanels();
  act(() => {
    const props = mockRowProps.get('row')!;
    props.onEditClick({ ...props.row, name: 'Updated' });
  });
  expect(onConfigChange).toHaveBeenCalledTimes(1);
  act(() => mockRowProps.get('row__row_repeat_1')!.onToggle());
  act(() => mockGridProps.onLayoutChange(mockGridProps.layout.map((item) => ({ ...item, y: item.y > 5 ? item.y - 4 : item.y }))));
  expect(onConfigChange).toHaveBeenCalledTimes(1);
});

test('editor commits regenerate repeated children', () => {
  renderPanels();
  act(() =>
    mockEditorProps.onPanelsChange([
      mockRowProps.get('row')!.row,
      panel('chart', 1),
      panel('added', 5),
      panel('next', 9, { type: 'row', layout: { i: 'next', x: 0, y: 9, w: 24, h: 1 } }),
    ]),
  );
  expect(mockGridProps.layout.find((item) => item.i === 'added__row_repeat_1')).toMatchObject({ y: 14 });
  expect(mockGridProps.layout.find((item) => item.i === 'next')).toMatchObject({ y: 27 });
});

test('deleting the source row also cleans up its copies', () => {
  renderPanels();
  act(() => mockRowProps.get('row')!.onDeleteClick('withPanels'));
  expect(mockGridProps.layout.map((item) => item.i)).toEqual(['next']);
});

test('dragging into an expanded copy, toggling it, adding a panel and saving never loses the original panel', () => {
  const { compact } = jest.requireActual('react-grid-layout/build/utils');
  const compactLayout = (layout: Layout[]) => compact(layout, 'vertical', 24);
  const { onConfigChange } = renderPanels([
    panel('incoming', 0, { layout: { i: 'incoming', x: 0, y: 0, w: 12, h: 2 } }),
    panel('row', 2, { type: 'row', repeat: 'region', collapsed: true, panels: [panel('chart', 3)], layout: { i: 'row', x: 0, y: 2, w: 24, h: 1 } }),
  ]);
  const copyId = 'row__row_repeat_2';
  act(() => mockRowProps.get(copyId)!.onToggle());
  act(() => mockGridProps.onLayoutChange(compactLayout(mockGridProps.layout)));
  const callbacks = mockGridProps;
  const copyY = callbacks.layout.find((item) => item.i === copyId)!.y;
  const dragged = compactLayout(callbacks.layout.map((item) => (item.i === 'incoming' ? { ...item, x: 12, y: copyY + 2 } : item)));
  act(() => {
    callbacks.onDragStop(dragged);
    callbacks.onLayoutChange(dragged);
  });
  expect(mockRowProps.get(copyId)!.row.collapsed).toBe(false);
  expect(mockRowProps.get('row')!.row.collapsed).toBe(true);
  expect(mockRuntimePanels.find((item) => item.id === 'incoming__row_repeat_2')).toBeDefined();
  expect(mockRowProps.get('row')!.row.panels?.map((item) => item.id)).toEqual(['chart', 'incoming']);
  const dragConfig = onConfigChange.mock.calls.at(-1)![0] as IDashboardConfig;
  expect(dragConfig.panels.find((item) => item.id === 'row')?.panels?.map((item) => item.id)).toEqual(['chart', 'incoming']);

  act(() => mockRowProps.get(copyId)!.onToggle());
  act(() => mockGridProps.onLayoutChange(compactLayout(mockGridProps.layout)));
  expect(mockRowProps.get(copyId)!.row.panels).toHaveLength(2);
  act(() => mockRowProps.get(copyId)!.onToggle());
  act(() => mockRowProps.get(copyId)!.onToggle());
  act(() => mockGridProps.onLayoutChange(compactLayout(mockGridProps.layout)));
  expect(mockRowProps.get(copyId)!.row.panels).toHaveLength(2);

  act(() => mockEditorProps.onPanelsChange(updatePanelsInsertNewPanelToGlobal(mockRuntimePanels, panel('new', 0), 'chart')));
  expect(mockRowProps.get(copyId)!.row.panels?.map((item) => item.repeatPanelId)).toEqual(['chart', 'incoming']);
  expect(mockRuntimePanels.find((item) => item.id === 'new')).toBeDefined();
  const saved = onConfigChange.mock.calls.at(-1)![0] as IDashboardConfig;
  expect(saved.panels.find((item) => item.id === 'row')?.panels?.map((item) => item.id)).toEqual(expect.arrayContaining(['chart', 'incoming']));
  const reloaded = processRepeats(saved.panels, [{ name: 'region', value: ['a', 'b', 'c'], type: 'custom', definition: '', datasource: { cate: 'prometheus' } }]);
  expect(reloaded.find((item) => item.id === copyId)?.panels?.map((item) => item.repeatPanelId)).toEqual(expect.arrayContaining(['chart', 'incoming']));
});

test('resizing a source panel keeps independently collapsed copies collapsed', () => {
  renderPanels();
  act(() => mockRowProps.get('row__row_repeat_1')!.onToggle());
  act(() => mockGridProps.onLayoutChange(mockGridProps.layout.map((item) => ({ ...item, y: item.y > 5 ? item.y - 4 : item.y }))));
  const callbacks = mockGridProps;
  const resized = callbacks.layout.map((item) => (item.i === 'chart' ? { ...item, h: 6 } : { ...item, y: item.y > 1 ? item.y + 2 : item.y }));
  act(() => {
    callbacks.onResizeStop(resized);
    callbacks.onLayoutChange(resized);
  });
  expect(mockRowProps.get('row__row_repeat_1')!.row.collapsed).toBe(true);
  expect(mockRowProps.get('row__row_repeat_2')!.row.collapsed).toBe(false);
  expect(mockGridProps.layout.find((item) => item.i === 'chart__row_repeat_2')).toMatchObject({ h: 6, y: 9 });
});

test('adding panel03 after dragging panel01 into the only expanded copy keeps that copy expanded', () => {
  const { compact } = jest.requireActual('react-grid-layout/build/utils');
  const compactLayout = (layout: Layout[]) => compact(layout, 'vertical', 24);
  const { onConfigChange } = renderPanels(
    [
      panel('panel01', 0, { layout: { i: 'panel01', x: 0, y: 0, w: 12, h: 2 } }),
      panel('row01', 2, { type: 'row', repeat: 'region', collapsed: true, panels: [panel('chart', 3)], layout: { i: 'row01', x: 0, y: 2, w: 24, h: 1 } }),
    ],
    ['a', 'b'],
  );
  const copyId = 'row01__row_repeat_1';
  expect(mockRowProps.get('row01')!.row.collapsed).toBe(true);
  expect(mockRowProps.get(copyId)!.row.collapsed).toBe(true);
  act(() => mockRowProps.get(copyId)!.onToggle());
  const callbacks = mockGridProps;
  const copyY = callbacks.layout.find((item) => item.i === copyId)!.y;
  const dragged = compactLayout(callbacks.layout.map((item) => (item.i === 'panel01' ? { ...item, x: 12, y: copyY + 2 } : item)));
  act(() => {
    callbacks.onDragStop(dragged);
    callbacks.onLayoutChange(dragged);
  });
  expect(mockRowProps.get(copyId)!.row.collapsed).toBe(false);

  act(() => mockEditorProps.onPanelsChange(updatePanelsInsertNewPanelToGlobal(mockRuntimePanels, panel('panel03', 0), 'chart')));
  act(() => mockGridProps.onLayoutChange(compactLayout(mockGridProps.layout)));
  expect(mockRowProps.get(copyId)!.row.collapsed).toBe(false);
  expect(mockRowProps.get('row01')!.row.collapsed).toBe(true);
  expect(mockRuntimePanels.some((item) => item.repeatPanelId === 'panel01')).toBe(true);
  const saved = onConfigChange.mock.calls.at(-1)![0] as IDashboardConfig;
  expect(saved.panels.find((item) => item.id === 'row01')?.panels?.map((item) => item.id)).toEqual(expect.arrayContaining(['chart', 'panel01', 'panel03']));
});

test.each([false, true])('nested repeat overrides update the original panel and survive regeneration (source collapsed=%s)', (collapsed) => {
  const chart = panel('chart', 1, { repeat: 'host' });
  const { onConfigChange } = renderPanels(
    [
      panel('row', 0, { type: 'row', repeat: 'region', collapsed, ...(collapsed ? { panels: [chart] } : {}), layout: { i: 'row', x: 0, y: 0, w: 24, h: 1 } }),
      ...(collapsed ? [] : [chart]),
    ],
    ['a', 'b'],
    [{ name: 'host', value: ['h1', 'h2'], type: 'custom', definition: '', datasource: { cate: 'prometheus' } }],
  );
  if (collapsed) act(() => mockRowProps.get('row__row_repeat_1')!.onToggle());
  const overrides: IPanel['overrides'] = [{ matcher: { id: 'byName', value: 'cpu' }, properties: { color: '#ff0000' } }];
  act(() => mockRendererProps.get('chart__row_repeat_1__repeat_1')!.onOverridesChange!(overrides));
  const source = collapsed
    ? mockRuntimePanels.find((item) => item.id === 'row')!.panels!.find((item) => item.id === 'chart')!
    : mockRuntimePanels.find((item) => item.id === 'chart')!;
  expect(source.overrides).toEqual(overrides);
  expect(mockRuntimePanels.filter((item) => item.type !== 'row').every((item) => item.overrides === overrides)).toBe(true);
  const saved = onConfigChange.mock.calls.at(-1)![0] as IDashboardConfig;
  const persisted = saved.panels.flatMap((item) => [item, ...(item.panels ?? [])]).find((item) => item.id === 'chart');
  expect(persisted?.overrides).toEqual(overrides);
  if (collapsed) expect(mockRowProps.get('row__row_repeat_1')!.row.collapsed).toBe(false);
});
