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
import React, { useRef, useState, useContext } from 'react';
import _ from 'lodash';
import semver from 'semver';
import { v4 as uuidv4 } from 'uuid';
import { message, Modal } from 'antd';
import { useLocation } from 'react-router-dom';
import querystring from 'query-string';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { updateDashboardConfigs as updateDashboardConfigsFunc } from '@/services/dashboardV2';
import { Dashboard } from '@/store/dashboardInterface';
import { CommonStateContext } from '@/App';
import {
  buildLayout,
  sortPanelsByGridLayout,
  updatePanelsLayout,
  handleRowToggle,
  updatePanelsWithNewPanel,
  updatePanelsInsertNewPanel,
  panelsMergeToConfigs,
  updatePanelsInsertNewPanelToRow,
  getRowCollapsedPanels,
  getRowUnCollapsedPanels,
} from './utils';
import Renderer from '../Renderer/Renderer/index';
import Row from './Row';
import Editor from '../Editor';
import './style.less';

interface IProps {
  id: string;
  editable: boolean;
  datasourceValue: number;
  dashboard: Dashboard;
  range: IRawTimeRange;
  step: number | null;
  variableConfig: any;
  panels: any[];
  isPreview: boolean;
  setPanels: (panels: any[]) => void;
  onShareClick: (panel: any) => void;
  onUpdated: (res: any) => void;
}

const ReactGridLayout = WidthProvider(RGL);

function index(props: IProps) {
  const { profile } = useContext(CommonStateContext);
  const location = useLocation();
  const { themeMode } = querystring.parse(location.search);
  const { editable, datasourceValue, dashboard, range, step, variableConfig, panels, isPreview, setPanels, onShareClick, onUpdated } = props;
  const layoutInitialized = useRef(false);
  const allowUpdateDashboardConfigs = useRef(false);
  const reactGridLayoutDefaultProps = {
    rowHeight: 40,
    cols: 24,
    useCSSTransforms: false,
    draggableHandle: '.dashboards-panels-item-drag-handle',
  };
  const updateDashboardConfigs = (dashboardId, options) => {
    const roles = _.get(profile, 'roles', []);
    const isAuthorized = !_.some(roles, (item) => item === 'Guest') && !isPreview;
    if (!editable) {
      message.warning('仪表盘已经被别人修改，为避免相互覆盖，请刷新仪表盘查看最新配置和数据');
    }
    if (!_.isEmpty(roles) && isAuthorized && editable) {
      return updateDashboardConfigsFunc(dashboardId, options);
    }
    return Promise.reject();
  };
  const [editorData, setEditorData] = useState({
    mode: 'add',
    visible: false,
    id: '',
    initialValues: {} as any,
  });

  return (
    <div className='dashboards-panels scroll-container'>
      <ReactGridLayout
        layout={buildLayout(panels)}
        onLayoutChange={(layout) => {
          if (layoutInitialized.current) {
            const newPanels = sortPanelsByGridLayout(updatePanelsLayout(panels, layout));
            if (!_.isEqual(panels, newPanels)) {
              setPanels(newPanels);
              // TODO: 这里可能会触发两次 update, 删除、克隆面板后可能会触发 layoutChange，此时需要更新面板重新更新下 dashboard 配置
              if (allowUpdateDashboardConfigs.current) {
                allowUpdateDashboardConfigs.current = false;
                updateDashboardConfigs(dashboard.id, {
                  configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                }).then((res) => {
                  onUpdated(res);
                });
              }
            }
          }
          layoutInitialized.current = true;
        }}
        onDragStop={(layout) => {
          const newPanels = sortPanelsByGridLayout(updatePanelsLayout(panels, layout));
          if (!_.isEqual(panels, newPanels)) {
            updateDashboardConfigs(dashboard.id, {
              configs: panelsMergeToConfigs(dashboard.configs, newPanels),
            }).then((res) => {
              onUpdated(res);
            });
          }
        }}
        onResizeStop={(layout) => {
          const newPanels = sortPanelsByGridLayout(updatePanelsLayout(panels, layout));
          if (!_.isEqual(panels, newPanels)) {
            updateDashboardConfigs(dashboard.id, {
              configs: panelsMergeToConfigs(dashboard.configs, newPanels),
            }).then((res) => {
              onUpdated(res);
            });
          }
        }}
        {...reactGridLayoutDefaultProps}
      >
        {_.map(panels, (item) => {
          return (
            <div key={item.layout.i} data-id={item.layout.i}>
              {item.type !== 'row' ? (
                semver.valid(item.version) ? (
                  <Renderer
                    isPreview={isPreview}
                    themeMode={themeMode as 'dark'}
                    dashboardId={_.toString(props.id)}
                    id={item.id}
                    time={range}
                    step={step}
                    values={
                      {
                        ...item,
                        datasourceValue: item.datasourceValue || datasourceValue,
                      } as any
                    }
                    variableConfig={variableConfig}
                    onCloneClick={() => {
                      const newPanels = updatePanelsInsertNewPanel(panels, {
                        ...item,
                        id: uuidv4(),
                        layout: {
                          ...item.layout,
                          i: uuidv4(),
                        },
                      });
                      setPanels(newPanels);
                      // 克隆面板必然会触发 layoutChange，更新 dashboard 放到 onLayoutChange 里面处理
                      allowUpdateDashboardConfigs.current = true;
                    }}
                    onShareClick={() => {
                      onShareClick(item);
                    }}
                    onEditClick={() => {
                      setEditorData({
                        mode: 'edit',
                        visible: true,
                        id: item.id,
                        initialValues: {
                          ...item,
                          id: item.id,
                        },
                      });
                    }}
                    onDeleteClick={() => {
                      Modal.confirm({
                        title: `是否删除图表：${item.name}`,
                        onOk: async () => {
                          const newPanels = _.filter(panels, (panel) => panel.id !== item.id);
                          allowUpdateDashboardConfigs.current = true;
                          setPanels(newPanels);
                          updateDashboardConfigs(dashboard.id, {
                            configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                          }).then((res) => {
                            onUpdated(res);
                          });
                        },
                      });
                    }}
                  />
                ) : (
                  <div className='dashboards-panels-item-invalid'>
                    <div>
                      <div>无效的图表配置</div>
                      <a
                        onClick={() => {
                          const newPanels = _.filter(panels, (panel) => panel.id !== item.id);
                          allowUpdateDashboardConfigs.current = true;
                          setPanels(newPanels);
                          updateDashboardConfigs(dashboard.id, {
                            configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                          }).then((res) => {
                            onUpdated(res);
                          });
                        }}
                      >
                        删除
                      </a>
                    </div>
                  </div>
                )
              ) : (
                <Row
                  name={item.name}
                  row={item}
                  onToggle={() => {
                    const newPanels = handleRowToggle(!item.collapsed, panels, _.cloneDeep(item));
                    setPanels(newPanels);
                    updateDashboardConfigs(dashboard.id, {
                      configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                    }).then((res) => {
                      onUpdated(res);
                    });
                  }}
                  onAddClick={() => {
                    setEditorData({
                      mode: 'add',
                      visible: true,
                      id: item.id,
                      initialValues: {
                        type: 'timeseries',
                        name: 'Panel Title',
                        targets: [
                          {
                            refId: 'A',
                            expr: '',
                          },
                        ],
                      },
                    });
                  }}
                  onEditClick={(newPanel) => {
                    const newPanels = updatePanelsWithNewPanel(panels, newPanel);
                    setPanels(newPanels);
                    updateDashboardConfigs(dashboard.id, {
                      configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                    }).then((res) => {
                      onUpdated(res);
                    });
                  }}
                  onDeleteClick={(mode: 'self' | 'withPanels') => {
                    let newPanels: any[] = _.cloneDeep(panels);
                    if (mode === 'self') {
                      newPanels = getRowCollapsedPanels(newPanels, item);
                      newPanels = _.filter(newPanels, (panel) => panel.id !== item.id);
                    } else {
                      newPanels = getRowUnCollapsedPanels(newPanels, item);
                      newPanels = _.filter(newPanels, (panel) => panel.id !== item.id);
                    }
                    allowUpdateDashboardConfigs.current = true;
                    setPanels(newPanels);
                    updateDashboardConfigs(dashboard.id, {
                      configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                    }).then((res) => {
                      onUpdated(res);
                    });
                  }}
                />
              )}
            </div>
          );
        })}
      </ReactGridLayout>
      <Editor
        mode={editorData.mode}
        visible={editorData.visible}
        setVisible={(visible) => {
          setEditorData({
            ...editorData,
            visible,
          });
        }}
        variableConfigWithOptions={variableConfig}
        datasourceValue={datasourceValue}
        id={editorData.id}
        time={range}
        initialValues={editorData.initialValues}
        onOK={(values, mode) => {
          const newPanels = mode === 'edit' ? updatePanelsWithNewPanel(panels, values) : updatePanelsInsertNewPanelToRow(panels, editorData.id, values);
          setPanels(newPanels);
          updateDashboardConfigs(dashboard.id, {
            configs: panelsMergeToConfigs(dashboard.configs, newPanels),
          }).then((res) => {
            onUpdated(res);
          });
        }}
      />
    </div>
  );
}

export default React.memo(index);
