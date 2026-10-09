/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useRef, useContext, useCallback } from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { message, Modal, Input } from 'antd';
import RGL, { WidthProvider, type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { useTranslation } from 'react-i18next';

import { IRawTimeRange } from '@/components/TimeRangePicker';
import { Dashboard } from '@/store/dashboardInterface';
import { CommonStateContext } from '@/App';
import { copy2ClipBoard } from '@/utils';

import {
  buildLayout,
  sortPanelsByGridLayout,
  updatePanelsLayout,
  handleRowToggle,
  updatePanelsWithNewPanel,
  updatePanelsInsertNewPanel,
  updatePanelsInsertNewPanelToRow,
  isValidPanelConfig,
  mergePanelsToConfig,
  getRowCollapsedPanels,
  getRowUnCollapsedPanels,
  canEditPanelLayout,
} from './utils';
import Renderer from '../Renderer/Renderer/index';
import Row from './Row';
import EditorModal from './EditorModal';
import { ROW_HEIGHT } from '../Detail/utils';
import { IDashboardConfig, IPanel } from '../types';
import type { EditorModalHandle } from './EditorModal';
import { useGlobalState } from '../globalState';
import adjustInitialValues from '../Renderer/utils/adjustInitialValues';
import Panel from './Panel';
import './style.less';

interface IProps {
  dashboardId: string;
  editable: boolean;
  dashboard: Dashboard;
  annotations: import('../types').DashboardAnnotation[];
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  timezone: string;
  setTimezone: (timezone: string) => void;
  panels: IPanel[];
  isPreview: boolean;
  setPanels: React.Dispatch<React.SetStateAction<IPanel[]>>;
  onShareClick: (panel: IPanel) => void;
  /** Updates the detail page's persisted-config candidate without sending a request. */
  onConfigChange: (configs: IDashboardConfig, shouldConfirmLeave?: boolean) => void;
  setAnnotationsRefreshFlag: (flag: string) => void;
  editModalVariablecontainerRef: React.RefObject<HTMLDivElement>;
}

const ReactGridLayout = WidthProvider(RGL);

function index(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { darkMode, perms, groupedDatasourceList } = useContext(CommonStateContext);
  const [variableConfigWithOptions] = useGlobalState('variablesWithOptions');
  const themeMode = darkMode ? 'dark' : 'light';
  const { editable, dashboard, annotations, range, timezone, setTimezone, panels, isPreview, setPanels, onShareClick, onConfigChange } = props;
  const isAuthorized = _.includes(perms, '/dashboards/put') && !isPreview;
  const layoutEditable = canEditPanelLayout(editable, isAuthorized);
  const layoutInitialized = useRef(false);
  const shouldPersistNextLayoutRef = useRef(false);
  const reactGridLayoutDefaultProps = {
    rowHeight: ROW_HEIGHT,
    cols: 24,
    useCSSTransforms: false,
    draggableHandle: '.dashboards-panels-item-drag-handle',
  };
  /**
   * Commits a complete panel list to page-local state only.
   * Network persistence is intentionally centralized in the detail page's Save action.
   */
  const commitPanels = useCallback(
    (nextPanels: IPanel[], shouldConfirmLeave = true) => {
      setPanels(nextPanels);
      onConfigChange(mergePanelsToConfig(dashboard.configs, nextPanels), shouldConfirmLeave);
    },
    [dashboard.configs, onConfigChange, setPanels],
  );
  const editorRef = useRef<EditorModalHandle>(null);
  const [pasteModalVisible, setPasteModalVisible] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const [pasteRowId, setPasteRowId] = useState<string | null>(null);

  const openRowPasteModal = async (rowId: string) => {
    setPasteRowId(rowId);
    setPasteValue('');
    setPasteModalVisible(true);
    if (!navigator.clipboard?.readText) return;
    try {
      const text = await navigator.clipboard.readText();
      if (isValidPanelConfig(text)) {
        setPasteValue(text);
      }
    } catch {
      // Clipboard read may be blocked by browser permissions.
    }
  };

  const handleRowImportPanel = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(pasteValue);
    } catch {
      message.error(t('detail.importPanel.invalidJSON'));
      return;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !('type' in parsed) || typeof parsed.type !== 'string') {
      message.error(t('detail.importPanel.invalidJSON'));
      return;
    }
    if (!pasteRowId) return;
    // 副作用必须留在 updater 之外：React 可能重放 updater，届时会重复触发父级配置更新
    const newPanels = updatePanelsInsertNewPanelToRow(panels, pasteRowId, { ...(parsed as object), id: uuidv4() } as IPanel, false);
    /** Importing a panel changes the full local dashboard config, never the server directly. */
    commitPanels(newPanels);
    setPasteModalVisible(false);
    setPasteValue('');
    setPasteRowId(null);
  };

  const handleCopyPanel = async (panel: IPanel) => {
    const panelConfig = JSON.stringify(panel, null, 2);

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(panelConfig);
        message.success(t('copyPanelTip'));
        return;
      } catch (error) {
        // Fall back to execCommand-based copy for browsers without clipboard permission.
      }
    }

    const copied = copy2ClipBoard(panelConfig, true);
    if (copied) {
      message.success(t('copyPanelTip'));
    }
  };

  return (
    <div className='dashboards-panels'>
      <ReactGridLayout
        layout={buildLayout(panels, !layoutEditable)}
        isDraggable={layoutEditable}
        onLayoutChange={(layout: Layout[]) => {
          /** RGL 只在非拖拽/缩放期间回调；拖拽中间态由 onDragStop 统一提交，避免重复写入配置。 */
          if (layoutInitialized.current) {
            const newPanels = sortPanelsByGridLayout(updatePanelsLayout(panels, layout));
            if (!_.isEqual(panels, newPanels)) {
              setPanels(newPanels);
              if (shouldPersistNextLayoutRef.current) {
                shouldPersistNextLayoutRef.current = false;
                onConfigChange(mergePanelsToConfig(dashboard.configs, newPanels));
              }
            }
          }
          layoutInitialized.current = true;
        }}
        /**
         * RGL 先回调 onDragStop / onResizeStop，之后才回调 onLayoutChange，
         * 因此这里必须用入参 layout 重算，读不到「本次交互的结果」。
         */
        onDragStop={(layout: Layout[]) => {
          /** 一次拖拽只提交一次本地配置更新。 */
          const nextPanels = sortPanelsByGridLayout(updatePanelsLayout(panels, layout));
          if (!_.isEqual(panels, nextPanels)) commitPanels(nextPanels);
        }}
        onResizeStop={(layout: Layout[]) => {
          /** 一次缩放只提交一次本地配置更新。 */
          const nextPanels = sortPanelsByGridLayout(updatePanelsLayout(panels, layout));
          if (!_.isEqual(panels, nextPanels)) commitPanels(nextPanels);
        }}
        {...reactGridLayoutDefaultProps}
      >
        {_.map(panels, (item) => {
          return (
            <div key={item.layout.i} data-id={item.layout.i}>
              {item.type !== 'row' ? (
                <Panel>
                  <Renderer
                    isPreview={isPreview}
                    isAuthorized={isAuthorized}
                    themeMode={themeMode as 'dark'}
                    id={item.id}
                    time={range}
                    setRange={props.setRange}
                    timezone={timezone}
                    setTimezone={setTimezone}
                    values={item}
                    annotations={_.filter(annotations, (annotation) => annotation.panel_id === item.id)}
                    onOverridesChange={
                      isAuthorized && editable
                        ? (overrides) => {
                            /** Applies generated overrides to the source panel and all of its runtime repeats. */
                            const sourcePanelId = item.repeatPanelId || item.id;
                            const newPanels = _.map(panels, (panel) => {
                              if (panel.id === sourcePanelId || panel.repeatPanelId === sourcePanelId) {
                                return {
                                  ...panel,
                                  overrides,
                                };
                              }
                              return panel;
                            });
                            commitPanels(newPanels);
                          }
                        : undefined
                    }
                    onCloneClick={() => {
                      /** Clones a panel locally; RGL will normalize the final layout in onLayoutChange. */
                      commitPanels(
                        updatePanelsInsertNewPanel(panels, {
                          ...item,
                          id: uuidv4(),
                          layout: {
                            ...item.layout,
                            i: uuidv4(),
                          },
                        }),
                      );
                      // RGL can shift neighbors after a clone; persist that one normalized layout callback.
                      shouldPersistNextLayoutRef.current = true;
                    }}
                    onShareClick={() => {
                      onShareClick(item);
                    }}
                    onEditClick={(panelWidth) => {
                      editorRef.current?.setEditorData({
                        mode: 'edit',
                        visible: true,
                        id: item.id,
                        initialValues: {
                          ...item,
                          id: item.id,
                        },
                        panelWidth,
                      });
                    }}
                    onDeleteClick={() => {
                      Modal.confirm({
                        title: t('detail.deletePanel_confirm', { name: item.name }),
                        onOk: async () => {
                          /** Removes the selected panel from the local config after the user confirms. */
                          commitPanels(_.filter(panels, (panel) => panel.id !== item.id));
                          // RGL can compact after removal; persist its normalized layout once.
                          shouldPersistNextLayoutRef.current = true;
                        },
                      });
                    }}
                    onCopyClick={() => {
                      void handleCopyPanel(item);
                    }}
                    setAnnotationsRefreshFlag={props.setAnnotationsRefreshFlag}
                  />
                </Panel>
              ) : (
                <Row
                  isAuthorized={isAuthorized}
                  name={item.name}
                  row={item}
                  onToggle={() => {
                    /** Keeps the existing collapse persistence behavior without creating a leave prompt. */
                    const newPanels = handleRowToggle(!item.collapsed, panels, _.cloneDeep(item));
                    commitPanels(newPanels, false);
                  }}
                  onAddClick={() => {
                    editorRef.current?.setEditorData({
                      mode: 'add',
                      visible: true,
                      id: item.id,
                      initialValues: adjustInitialValues('timeseries', groupedDatasourceList, panels, variableConfigWithOptions)?.initialValues,
                    });
                  }}
                  onPasteClick={() => {
                    openRowPasteModal(item.id);
                  }}
                  onEditClick={(newPanel) => {
                    /** Replaces the row with the editor's complete row panel result. */
                    const newPanels = updatePanelsWithNewPanel(panels, newPanel);
                    commitPanels(newPanels);
                    shouldPersistNextLayoutRef.current = true;
                  }}
                  onDeleteClick={(mode: 'self' | 'withPanels') => {
                    /** Removes a row alone or together with its contained panels based on the user's choice. */
                    let newPanels: IPanel[] = _.cloneDeep(panels);
                    if (mode === 'self') {
                      newPanels = getRowUnCollapsedPanels(newPanels, item);
                      newPanels = _.filter(newPanels, (panel) => panel.id !== item.id);
                    } else {
                      newPanels = getRowCollapsedPanels(newPanels, item);
                      newPanels = _.filter(newPanels, (panel) => panel.id !== item.id);
                    }
                    commitPanels(newPanels);
                  }}
                />
              )}
            </div>
          );
        })}
      </ReactGridLayout>

      <EditorModal
        ref={editorRef}
        range={range}
        timezone={timezone}
        setTimezone={setTimezone}
        panels={panels}
        setPanels={setPanels}
        onPanelsChange={(nextPanels) => commitPanels(nextPanels)}
        editModalVariablecontainerRef={props.editModalVariablecontainerRef}
      />
      <Modal
        title={t('visualizations.importPanel')}
        visible={pasteModalVisible}
        onCancel={() => {
          setPasteModalVisible(false);
          setPasteValue('');
          setPasteRowId(null);
        }}
        onOk={handleRowImportPanel}
      >
        <Input.TextArea rows={10} value={pasteValue} onChange={(e) => setPasteValue(e.target.value)} placeholder={t('detail.importPanel.placeholder')} />
      </Modal>
    </div>
  );
}

export default React.memo(index);
