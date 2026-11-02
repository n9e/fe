/** @jest-environment jsdom */

import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { createDashboardRuntimeStore, DashboardRuntimeProvider } from '../globalState';
import type { IPanel, IDashboardConfig } from '../types';
import EditorModal, { EditorModalHandle } from './EditorModal';
import { mergePanelsToConfig } from './utils';

let mockEditorProps: { initialValues: IPanel; visible: boolean; id: string; panelWidth?: number };
jest.mock('../Editor', () => ({
  __esModule: true,
  default: (props) => {
    mockEditorProps = props;
    if (!props.visible) return null;
    return (
      <div role='dialog'>
        <button
          onClick={() => {
            props.onOK(props.initialValues, props.mode);
            props.setVisible(false);
          }}
        >
          Save editor
        </button>
        <button onClick={() => props.setVisible(false)}>Cancel editor</button>
      </div>
    );
  },
}));

function panel(id: string, y: number, overrides: Partial<IPanel> = {}): IPanel {
  return { id, type: 'timeseries', name: id, description: '', targets: [], options: {}, custom: {}, overrides: [], layout: { i: id, x: 0, y, w: 12, h: 4 }, ...overrides };
}

test('an editor submit keeps panel repeat instances in the final parent state and clears temporary editor data', () => {
  const ref = React.createRef<EditorModalHandle>();
  const store = createDashboardRuntimeStore();
  store.setGlobalState('variablesWithOptions', [{ name: 'host', value: ['a', 'b', 'c'], type: 'custom', definition: '', datasource: { cate: 'prometheus' } }]);
  const row = panel('row', 0, { type: 'row', layout: { i: 'row', x: 0, y: 0, w: 24, h: 1 } });
  const chart = panel('chart', 1);
  const configs = { panels: [row, chart] } as IDashboardConfig;
  const onConfigChange = jest.fn();
  function Harness() {
    const [panels, setPanels] = useState(configs.panels);
    return (
      <DashboardRuntimeProvider store={store}>
        <EditorModal
          ref={ref}
          range={{ start: 'now-1h', end: 'now' }}
          timezone='UTC'
          setTimezone={jest.fn()}
          panels={panels}
          setPanels={setPanels}
          editModalVariablecontainerRef={React.createRef()}
          onPanelsChange={(next) => {
            setPanels(next);
            onConfigChange(mergePanelsToConfig(configs, next));
          }}
        />
        <output data-testid='runtime'>{panels.map((item) => item.id).join(',')}</output>
      </DashboardRuntimeProvider>
    );
  }
  render(<Harness />);
  act(() => ref.current!.setEditorData({ mode: 'edit', visible: true, id: chart.id, initialValues: { ...chart, repeat: 'host', maxPerRow: 2 }, panelWidth: 640 }));
  fireEvent.click(screen.getByRole('button', { name: 'Save editor' }));
  expect(screen.getByTestId('runtime')).toHaveTextContent('chart__repeat_1');
  expect(screen.getByTestId('runtime')).toHaveTextContent('chart__repeat_2');
  expect(onConfigChange).toHaveBeenCalledTimes(1);
  expect(onConfigChange.mock.calls[0][0].panels).toEqual([row, { ...chart, repeat: 'host', maxPerRow: 2 }]);
  expect(mockEditorProps.visible).toBe(false);
  expect(mockEditorProps.id).toBe('');
  expect(mockEditorProps.initialValues).toEqual({});
  expect(mockEditorProps.panelWidth).toBeUndefined();
  act(() => ref.current!.setEditorData({ mode: 'add', visible: true, id: row.id, initialValues: panel('added', 0) }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel editor' }));
  expect(onConfigChange).toHaveBeenCalledTimes(1);
  expect(mockEditorProps.initialValues).toEqual({});
});
