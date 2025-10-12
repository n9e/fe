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
import React, { useState, useRef, useEffect, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment';
import semver from 'semver';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'ahooks';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { useBeforeunload } from 'react-beforeunload';
import queryString from 'query-string';
import { Alert, Modal, Button, Affix, message, Spin } from 'antd';

import { useParamsAiAction } from '@/utils/useHook';
import PageLayout from '@/components/pageLayout';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { Dashboard } from '@/store/dashboardInterface';
import { getDashboard, updateDashboard, updateDashboardConfigs, getDashboardPure, getAnnotations } from '@/services/dashboardV2';
import { getPayloadByUUID } from '@/pages/builtInComponents/services';
import { SetTmpChartData } from '@/services/metric';
import { CommonStateContext, basePrefix } from '@/App';
import MigrationModal from '@/pages/help/migrate/MigrationModal';
import RouterPrompt from '@/components/RouterPrompt';
import { adjustURL } from '@/pages/embeddedDashboards/utils';
import initializeVariablesValue from '@/pages/dashboard/Variables/utils/initializeVariablesValue';
import replaceTemplateVariables, { replaceDatasourceVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import Variables, { IVariable } from '../Variables';
import { ILink, IDashboardConfig } from '../types';
import Panels from '../Panels';
import Title from './Title';
import { JSONParse } from '../utils';
import Editor from '../Editor';
import { sortPanelsByGridLayout, panelsMergeToConfigs, updatePanelsInsertNewPanelToGlobal, ajustPanels, processRepeats } from '../Panels/utils';
import { useGlobalState, DashboardMeta } from '../globalState';
import { scrollToLastPanel, getDefaultTimeRange, getDefaultIntervalSeconds, getDefaultTimezone, dashboardTimezoneCacheKey } from './utils';
import dashboardMigrator from './utils/dashboardMigrator';
import adjustInitialValues from '../Renderer/utils/adjustInitialValues';
import './style.less';

interface URLParam {
  id: string;
}

interface IProps {
  isPreview?: boolean;
  isBuiltin?: boolean;
  gobackPath?: string;
  builtinParams?: any;
  onLoaded?: (dashboard: Dashboard['configs']) => boolean;
}

const fetchDashboard = ({ id, builtinParams }) => {
  if (builtinParams) {
    return getPayloadByUUID(builtinParams).then((res) => {
      let { content } = res;
      try {
        content = JSON.parse(content);
        return content;
      } catch (e) {
        console.error(e);
      }
    });
  }
  return getDashboard(id);
};
const builtinParamsToID = (builtinParams) => {
  return `${builtinParams['__uuid__']}`;
};

export default function DetailV2(props: IProps) {
  const { isPreview = false, isBuiltin = false, gobackPath, builtinParams } = props;
  const { t, i18n } = useTranslation('dashboard');
  const history = useHistory();
  const location = useLocation();
  const { dashboardDefaultRangeIndex, dashboardSaveMode, perms, groupedDatasourceList, darkMode, datasourceList } = useContext(CommonStateContext);
  const isAuthorized = _.includes(perms, '/dashboards/put') && !isPreview;
  const [dashboardMeta, setDashboardMeta] = useGlobalState('dashboardMeta');
  const [variablesWithOptions, setVariablesWithOptions] = useGlobalState('variablesWithOptions');
  const [panelClipboard] = useGlobalState('panelClipboard');
  const [, setParamsAiAction] = useParamsAiAction();
  let { id } = useParams<URLParam>();
  const query = queryString.parse(location.search);
  if (isBuiltin) {
    id = builtinParamsToID(query);
  }
  const [dashboard, setDashboard] = useState<Dashboard>({} as Dashboard);
  const [dashboardLinks, setDashboardLinks] = useState<ILink[]>();
  const [panels, setPanels] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [annotationsRefreshFlag, setAnnotationsRefreshFlag] = useState<string>(_.uniqueId('annotationsRefreshFlag_'));
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<IRawTimeRange>(getDefaultTimeRange(id, query, dashboardDefaultRangeIndex));
  const [timezone, setTimezone] = useState<string>(getDefaultTimezone(id, query));
  const [intervalSeconds, setIntervalSeconds] = useState<number | undefined>(getDefaultIntervalSeconds(query));
  const [editable, setEditable] = useState(true);
  const [editorData, setEditorData] = useState({
    visible: false,
    id: '',
    initialValues: {} as any,
  });
  const [migrationVisible, setMigrationVisible] = useState(false);
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [allowedLeave, setAllowedLeave] = useState(true);
  const [variablesInitialized, setVariablesInitialized] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const editModalVariablecontainerRef = useRef<HTMLDivElement>(null);
  let updateAtRef = useRef<number>();
  const routerPromptRef = useRef<any>();
  const refresh = async (cbk?: () => void) => {
    // 自动保存模式下不显示 loading
    if (dashboardSaveMode === 'manual') {
      setLoading(true);
    }
    fetchDashboard({
      id,
      builtinParams,
    })
      .then((res) => {
        const dashboardId = res.id;
        updateAtRef.current = res.update_at;
        let configs = _.isString(res.configs) ? JSONParse(res.configs) : res.configs;
        // 仪表盘迁移
        configs = dashboardMigrator(configs);
        if (props.onLoaded && !props.onLoaded(configs)) {
          return;
        }
        if ((!configs.version || semver.lt(configs.version, '3.0.0')) && !builtinParams) {
          setMigrationVisible(true);
        }
        setDashboardMeta({
          ...(dashboardMeta || {}),
          dashboardId: _.toString(dashboardId), // TODO 为什么要转字符串？
          id: dashboardId,
          group_id: res.group_id,
          public: res.public,
          public_cate: res.public_cate,
          graphTooltip: configs.graphTooltip,
          graphZoom: configs.graphZoom,
        });
        const newDashboard = {
          ...res,
          configs,
        };
        setDashboard(newDashboard);

        if (configs) {
          setPanels(sortPanelsByGridLayout(ajustPanels(configs.panels)));
          // TODO: configs 中可能没有 var 属性会导致 VariableConfig 报错
          const variableConfig = configs.var
            ? configs
            : {
                ...configs,
                var: [],
              };
          const currentVariables = _.map(variableConfig.var, (item) => {
            return _.omit(item, 'options'); // 兼容性代码，去除掉已保存的 options
          }) as IVariable[];
          const normalizedVariables = initializeVariablesValue(currentVariables, query, {
            dashboardId,
          });
          setVariablesWithOptions(normalizedVariables);
          // 暂时不处理 panels，等待变量初始化完成
          setVariablesInitialized(false);
          setDashboardLinks(configs.links);
          if (cbk) {
            cbk();
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleUpdateDashboardConfigs = (id, updateData) => {
    if (dashboardSaveMode === 'manual') {
      let configs = {} as IDashboardConfig;
      try {
        configs = JSON.parse(updateData.configs);
      } catch (e) {
        console.error(e);
      }
      // 如果是手动保存模式，并且没有编辑权限则不触发 RouterPrompt 提示
      if (isAuthorized) {
        setAllowedLeave(false);
      }
      if (configs.graphTooltip || configs.graphZoom) {
        setDashboardMeta({
          ...(dashboardMeta || {}),
          graphTooltip: configs.graphTooltip,
          graphZoom: configs.graphZoom,
        });
      }
      setDashboard({
        ...dashboard,
        name: updateData.name,
        ident: updateData.ident,
        tags: updateData.tags,
        configs,
      });
    } else {
      updateDashboardConfigs(id, updateData).then((res) => {
        updateAtRef.current = res.update_at;
        refresh();
      });
    }
  };
  const handleVariableChange = (newValue) => {
    const dashboardConfigs: any = dashboard.configs;
    dashboardConfigs.var = newValue;
    // TODO: 手动模式需要在这里更新变量配置，自动模式会在获取大盘配置时更新
    // if (dashboardSaveMode === 'manual') {
    //   setVariablesWithOptions(newValue);
    // }
    // 触发 dashboard configs 的更新
    handleUpdateDashboardConfigs(dashboard.id, {
      ...dashboard,
      configs: JSON.stringify(dashboardConfigs),
    });
    // 变量配置变更后，不需要手动调用 processRepeats
    // 因为 variablesWithOptions 的变化会自动触发 useEffect 重新处理 panels
  };

  // 监听变量初始化完成和变量值变化，重新处理 repeat panels
  useEffect(() => {
    // 只有在变量初始化完成后才处理 panels
    if (!variablesInitialized || !dashboard.configs?.panels) return;

    // 重新处理 panels（使用原始配置，而不是已处理的 panels）
    const processedPanels = processRepeats(panels, variablesWithOptions);
    setPanels(processedPanels);
  }, [
    variablesInitialized,
    // 监听变量的 name 和 value，不监听 options（避免 options 更新时重复处理）
    JSON.stringify(_.map(variablesWithOptions, (v) => ({ name: v.name, value: v.value }))),
  ]);

  useEffect(() => {
    // 切换仪表盘时，立即清空 variablesWithOptions，避免使用上一个仪表盘的变量
    setDashboardMeta({} as DashboardMeta);
    setVariablesWithOptions([]);
    setVariablesInitialized(false);
    refresh();

    // 组件卸载时清空全局状态
    return () => {
      setDashboardMeta({} as DashboardMeta);
      setVariablesWithOptions([]);
    };
  }, [id]);

  useInterval(() => {
    // 2024-12-27 当手动保存模式时，只有仪表盘配置被更改后（!allowedLeave）才会触发 "持续查询" 的检测
    if (import.meta.env.PROD && dashboard.id && (dashboardSaveMode === 'manual' ? !allowedLeave : true)) {
      getDashboardPure(_.toString(dashboard.id)).then((res) => {
        if (updateAtRef.current && res.update_at > updateAtRef.current) {
          if (editable) setEditable(false);
        } else {
          setEditable(true);
        }
      });
    }
  }, 2000);

  useBeforeunload(!allowedLeave && import.meta.env.PROD ? () => t('detail.prompt.message') : undefined);

  useEffect(() => {
    if (dashboard.id) {
      // 获取 annotations 数据
      const parsedRange = parseRange(range);
      getAnnotations({
        dashboard_id: dashboard.id,
        from: moment(parsedRange.start).unix(),
        to: moment(parsedRange.end).unix(),
        limit: 100,
      }).then((res) => {
        setAnnotations(res);
      });
    }
  }, [dashboard.id, JSON.stringify(range), annotationsRefreshFlag]);

  useEffect(() => {
    // 更新全局状态
    const obj = {};
    _.forEach(variablesWithOptions, (item) => {
      obj[item.name] = _.isArray(item.value) ? item.value : [item.value];
    });
    const parsedRange = parseRange(range);
    setParamsAiAction({
      page: 'dashboards',
      dashboard: {
        id,
        start: moment(parsedRange.start).unix(),
        end: moment(parsedRange.end).unix(),
        var: obj,
      },
    });
  }, [JSON.stringify(_.map(variablesWithOptions, _.pick(['name', 'value']))), JSON.stringify(range)]);

  return (
    <PageLayout customArea={<div />}>
      <div className='dashboard-detail-container'>
        <Spin spinning={loading} tip='Loading...' className='dashboard-detail-loading' />
        <div className='dashboard-detail-content scroll-container' ref={containerRef}>
          <Affix
            target={() => {
              return containerRef.current;
            }}
          >
            <div
              className='dashboard-detail-content-header-container'
              style={{
                display: query.viewMode !== 'fullscreen' ? 'block' : 'none',
                paddingBottom: dashboard.configs?.mode === 'iframe' ? 0 : 16,
              }}
            >
              <Title
                isPreview={isPreview}
                isBuiltin={isBuiltin}
                isAuthorized={isAuthorized}
                editable={editable}
                updateAtRef={updateAtRef}
                allowedLeave={allowedLeave}
                setAllowedLeave={setAllowedLeave}
                gobackPath={gobackPath}
                dashboard={dashboard}
                dashboardLinks={dashboardLinks}
                setDashboardLinks={setDashboardLinks}
                handleUpdateDashboardConfigs={handleUpdateDashboardConfigs}
                range={range}
                setRange={(v) => {
                  setRange(v);
                }}
                timezone={timezone}
                setTimezone={(newTimezone) => {
                  setTimezone(newTimezone);
                  window.localStorage.setItem(`${dashboardTimezoneCacheKey}_${id}`, newTimezone);
                }}
                intervalSeconds={intervalSeconds}
                setIntervalSeconds={setIntervalSeconds}
                onAddPanel={(type) => {
                  if (type === 'row') {
                    const newPanels = updatePanelsInsertNewPanelToGlobal(
                      panels,
                      {
                        type: 'row',
                        id: uuidv4(),
                        name: i18n.language === 'en_US' || i18n.language === 'ru_RU' ? 'Row' : '分组',
                        collapsed: true,
                      },
                      'row',
                    );
                    setPanels(newPanels);
                    handleUpdateDashboardConfigs(dashboard.id, {
                      ...dashboard,
                      configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                    });
                  } else if (type === 'pastePanel') {
                    if (panelClipboard) {
                      const newPanels = updatePanelsInsertNewPanelToGlobal(panels, { ...panelClipboard, id: uuidv4() }, 'chart', false);
                      setPanels(newPanels);
                      scrollToLastPanel(newPanels);
                      handleUpdateDashboardConfigs(dashboard.id, {
                        ...dashboard,
                        configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                      });
                    } else {
                      message.error(t('detail.noPanelToPaste'));
                    }
                  } else {
                    setEditorData(adjustInitialValues(type, groupedDatasourceList, panels, variablesWithOptions));
                  }
                }}
                routerPromptRef={routerPromptRef}
              />
              {!editable && (
                <div style={{ padding: '0px 10px', marginBottom: 8 }}>
                  <Alert type='warning' message={t('detail.expired')} />
                </div>
              )}
              {dashboard.configs?.mode !== 'iframe' && (
                <Variables
                  editable={editable && isAuthorized}
                  queryParams={query}
                  onChange={handleVariableChange}
                  onInitialized={() => {
                    setVariablesInitialized(true);
                  }}
                />
              )}
            </div>
          </Affix>
          {dashboard.configs?.mode !== 'iframe' ? (
            <>
              <Panels
                dashboardId={id}
                isPreview={isPreview}
                editable={editable}
                panels={panels}
                setPanels={setPanels}
                dashboard={dashboard}
                setDashboard={setDashboard}
                annotations={annotations}
                setAllowedLeave={setAllowedLeave}
                range={range}
                setRange={setRange}
                timezone={timezone}
                setTimezone={(newTimezone) => {
                  setTimezone(newTimezone);
                  window.localStorage.setItem(`${dashboardTimezoneCacheKey}_${id}`, newTimezone);
                }}
                onShareClick={(panel) => {
                  const curDatasourceValue = replaceDatasourceVariables(panel.datasourceValue, {
                    datasourceList,
                  });
                  const serielData = {
                    dataProps: {
                      ...panel,
                      datasourceValue: curDatasourceValue,
                      // @ts-ignore
                      datasourceName: _.find(datasourceList, { id: curDatasourceValue })?.name,
                      targets: _.map(panel.targets, (target) => {
                        const realExpr = replaceTemplateVariables(target.expr);
                        return {
                          ...target,
                          expr: realExpr,
                        };
                      }),
                      range,
                    },
                  };
                  SetTmpChartData([
                    {
                      configs: JSON.stringify(serielData),
                    },
                  ]).then((res) => {
                    const ids = res.dat;
                    window.open(basePrefix + '/chart/' + ids);
                  });
                }}
                onUpdated={(res) => {
                  updateAtRef.current = res.update_at;
                  refresh();
                }}
                setAnnotationsRefreshFlag={setAnnotationsRefreshFlag}
                editModalVariablecontainerRef={editModalVariablecontainerRef}
              />
            </>
          ) : (
            <iframe className='embedded-dashboards-iframe' src={adjustURL(dashboard.configs?.iframe_url!, darkMode)} width='100%' height='100%' />
          )}
        </div>
      </div>
      <Editor
        mode='add'
        visible={editorData.visible}
        setVisible={(visible) => {
          setEditorData({
            ...editorData,
            visible,
          });
        }}
        id={editorData.id}
        time={range}
        timezone={timezone}
        setTimezone={(newTimezone) => {
          setTimezone(newTimezone);
          window.localStorage.setItem(`${dashboardTimezoneCacheKey}_${id}`, newTimezone);
        }}
        initialValues={editorData.initialValues}
        onOK={(values, mode) => {
          const newPanels = updatePanelsInsertNewPanelToGlobal(panels, values, 'chart');
          // 新增图表后也立即处理 repeat，避免等待变量变化才生效
          const processedPanels = processRepeats(newPanels, variablesWithOptions);
          setPanels(processedPanels);
          if (mode === 'add') {
            scrollToLastPanel(newPanels);
          }
          handleUpdateDashboardConfigs(dashboard.id, {
            ...dashboard,
            configs: panelsMergeToConfigs(dashboard.configs, newPanels),
          });
        }}
        editModalVariablecontainerRef={editModalVariablecontainerRef}
      />
      {/*迁移*/}
      <Modal
        title='迁移大盘'
        visible={migrationVisible}
        onCancel={() => {
          setMigrationVisible(false);
        }}
        footer={[
          <Button
            key='cancel'
            danger
            onClick={() => {
              setMigrationVisible(false);
              handleUpdateDashboardConfigs(dashboard.id, {
                ...dashboard,
                configs: JSON.stringify({
                  ...dashboard.configs,
                  version: '3.0.0',
                }),
              });
            }}
          >
            关闭并不再提示
          </Button>,
          <Button
            key='batchMigrate'
            type='primary'
            ghost
            onClick={() => {
              history.push('/help/migrate');
            }}
          >
            前往批量迁移大盘
          </Button>,
          <Button
            key='migrate'
            type='primary'
            onClick={() => {
              setMigrationVisible(false);
              setMigrationModalOpen(true);
            }}
          >
            迁移当前大盘
          </Button>,
        ]}
      >
        v6 版本将不再支持全局 Prometheus 集群切换，新版本可通过图表关联数据源变量来实现该能力。 <br />
        迁移工具会创建数据源变量以及关联所有未关联数据源的图表。
      </Modal>
      <MigrationModal
        visible={migrationModalOpen}
        setVisible={setMigrationModalOpen}
        boards={[dashboard]}
        onOk={() => {
          refresh();
        }}
      />
      <RouterPrompt
        ref={routerPromptRef}
        when={!allowedLeave}
        title={t('detail.prompt.title')}
        message={<div style={{ fontSize: 16 }}>{t('detail.prompt.message')}</div>}
        footer={[
          <Button
            key='cancel'
            onClick={() => {
              routerPromptRef.current.hidePrompt();
            }}
          >
            {t('detail.prompt.cancelText')}
          </Button>,
          <Button
            key='discard'
            type='primary'
            danger
            onClick={() => {
              routerPromptRef.current.redirect();
            }}
          >
            {t('detail.prompt.discardText')}
          </Button>,
          <Button
            key='ok'
            type='primary'
            onClick={() => {
              routerPromptRef.current.hidePrompt();
              updateDashboard(dashboard.id, {
                name: dashboard.name,
                ident: dashboard.ident,
                tags: dashboard.tags,
              });
              updateDashboardConfigs(dashboard.id, {
                configs: JSON.stringify(dashboard.configs),
              }).then((res) => {
                updateAtRef.current = res.update_at;
                message.success(t('detail.saved'));
                setAllowedLeave(true);
              });
            }}
          >
            {t('detail.prompt.okText')}
          </Button>,
        ]}
        validator={(prompt) => {
          // 如果 pathname 不变意味着是同一个页面，不需要提示
          return location.pathname === prompt.pathname;
        }}
      />
    </PageLayout>
  );
}
