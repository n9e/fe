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
import React, { useRef, useContext, useEffect } from 'react';
import _ from 'lodash';
import semver from 'semver';
import { v4 as uuidv4 } from 'uuid';
import { message, Modal } from 'antd';
import { useLocation } from 'react-router-dom';
import querystring from 'query-string';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { useTranslation } from 'react-i18next';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { updateDashboardConfigs as updateDashboardConfigsFunc } from '@/services/dashboardV2';
import { Dashboard } from '@/store/dashboardInterface';
import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';
import {
  buildLayout,
  sortPanelsByGridLayout,
  updatePanelsLayout,
  handleRowToggle,
  updatePanelsWithNewPanel,
  updatePanelsInsertNewPanel,
  panelsMergeToConfigs,
  getRowCollapsedPanels,
  getRowUnCollapsedPanels,
  processRepeats,
} from './utils';
import Renderer from '../Renderer/Renderer/index';
import Row from './Row';
import EditorModal from './EditorModal';
import { getDefaultThemeMode, ROW_HEIGHT } from '../Detail/utils';
import { IDashboardConfig } from '../types';
import { useGlobalState } from '../globalState';
import ajustInitialValues from '../Renderer/utils/ajustInitialValues';
import './style.less';

interface IProps {
  dashboardId: string;
  editable: boolean;
  dashboard: Dashboard;
  setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>;
  setAllowedLeave: (flag: boolean) => void;
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  variableConfig: any;
  panels: any[];
  isPreview: boolean;
  setPanels: React.Dispatch<React.SetStateAction<any[]>>;
  onShareClick: (panel: any) => void;
  onUpdated: (res: any) => void;
  setVariableConfigRefreshFlag: (flag: string) => void;
}

const ReactGridLayout = WidthProvider(RGL);

function index(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { profile, darkMode, dashboardSaveMode, perms, groupedDatasourceList } = useContext(CommonStateContext);
  const location = useLocation();
  let themeMode = darkMode ? 'dark' : 'light';
  if (IS_ENT) {
    themeMode = getDefaultThemeMode(querystring.parse(location.search));
  }
  const { editable, dashboard, setDashboard, setAllowedLeave, range, variableConfig, panels, isPreview, setPanels, onShareClick, onUpdated } = props;
  const roles = _.get(profile, 'roles', []);
  const isAuthorized = _.includes(perms, '/dashboards/put') && !isPreview;
  const layoutInitialized = useRef(false);
  const allowUpdateDashboardConfigs = useRef(false);
  const reactGridLayoutDefaultProps = {
    rowHeight: ROW_HEIGHT,
    cols: 24,
    useCSSTransforms: false,
    draggableHandle: '.dashboards-panels-item-drag-handle',
  };
  const updateDashboardConfigs = (dashboardId, options) => {
    if (dashboardSaveMode === 'manual') {
      let configs = {} as IDashboardConfig;
      try {
        configs = JSON.parse(options.configs);
      } catch (e) {
        console.error(e);
      }
      setAllowedLeave(false);
      setDashboard((dashboard) => {
        return {
          ...dashboard,
          configs,
        };
      });
      return Promise.reject();
    } else {
      if (!editable) {
        message.warning(t('detail.expired'));
      }
      if (!_.isEmpty(roles) && isAuthorized && editable) {
        return updateDashboardConfigsFunc(dashboardId, options);
      }
      return Promise.reject();
    }
  };
  const editorRef = useRef<any>(null);
  const [panelClipboard, setPanelClipboard] = useGlobalState('panelClipboard');

  useEffect(() => {
    setPanels(processRepeats(panels, variableConfig));
  }, [
    JSON.stringify(
      _.map(variableConfig, (item) => {
        return item.value;
      }),
    ),
  ]);

  return (
    <div className='dashboards-panels'>
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
                    isPreview={!isAuthorized}
                    themeMode={themeMode as 'dark'}
                    dashboardId={_.toString(props.dashboardId)}
                    id={item.id}
                    time={range}
                    setRange={props.setRange}
                    values={item}
                    variableConfig={variableConfig}
                    onCloneClick={() => {
                      setPanels((panels) => {
                        return updatePanelsInsertNewPanel(panels, {
                          ...item,
                          id: uuidv4(),
                          layout: {
                            ...item.layout,
                            i: uuidv4(),
                          },
                        });
                      });

                      // 克隆面板必然会触发 layoutChange，更新 dashboard 放到 onLayoutChange 里面处理
                      allowUpdateDashboardConfigs.current = true;
                    }}
                    onShareClick={() => {
                      onShareClick(item);
                    }}
                    onEditClick={() => {
                      editorRef.current?.setEditorData({
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
                          setPanels((panels) => {
                            const newPanels = _.filter(panels, (panel) => panel.id !== item.id);
                            allowUpdateDashboardConfigs.current = true;
                            updateDashboardConfigs(dashboard.id, {
                              configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                            }).then((res) => {
                              onUpdated(res);
                            });
                            return newPanels;
                          });
                        },
                      });
                    }}
                    onCopyClick={() => {
                      setPanelClipboard(item);
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
                  isPreview={!isAuthorized}
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
                    editorRef.current?.setEditorData({
                      mode: 'add',
                      visible: true,
                      id: item.id,
                      initialValues: ajustInitialValues('timeseries', groupedDatasourceList, panels, variableConfig)?.initialValues,
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

      <EditorModal
        ref={editorRef}
        dashboardId={props.dashboardId}
        variableConfig={variableConfig}
        range={range}
        dashboard={dashboard}
        panels={panels}
        setPanels={setPanels}
        updateDashboardConfigs={updateDashboardConfigs}
        onUpdated={onUpdated}
        setVariableConfigRefreshFlag={props.setVariableConfigRefreshFlag}
      />
    </div>
  );
}

export default React.memo(index);
