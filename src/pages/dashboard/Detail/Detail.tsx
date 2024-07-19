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
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'ahooks';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { useBeforeunload } from 'react-beforeunload';
import queryString from 'query-string';
import { Alert, Modal, Button, Affix, message } from 'antd';
import PageLayout from '@/components/pageLayout';
import { IRawTimeRange, getDefaultValue, isValid } from '@/components/TimeRangePicker';
import { Dashboard } from '@/store/dashboardInterface';
import { getDashboard, updateDashboardConfigs, getDashboardPure } from '@/services/dashboardV2';
import { getPayload } from '@/pages/builtInComponents/services';
import { SetTmpChartData } from '@/services/metric';
import { CommonStateContext, basePrefix } from '@/App';
import MigrationModal from '@/pages/help/migrate/MigrationModal';
import RouterPrompt from '@/components/RouterPrompt';
import { rangeOptions } from '@/components/TimeRangePicker/config';
import VariableConfig, { IVariable } from '../VariableConfig';
import { replaceExpressionVars, getOptionsList } from '../VariableConfig/constant';
import { ILink, IDashboardConfig } from '../types';
import Panels from '../Panels';
import Title from './Title';
import { JSONParse } from '../utils';
import Editor from '../Editor';
import { defaultCustomValuesMap, defaultOptionsValuesMap } from '../Editor/config';
import { sortPanelsByGridLayout, panelsMergeToConfigs, updatePanelsInsertNewPanelToGlobal, ajustPanels } from '../Panels/utils';
import { useGlobalState } from '../globalState';
import { scrollToLastPanel } from './utils';
import ajustInitialValues from '../Renderer/utils/ajustInitialValues';
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

export const dashboardTimeCacheKey = 'dashboard-timeRangePicker-value';
const fetchDashboard = ({ id, builtinParams }) => {
  if (builtinParams) {
    return getPayload(builtinParams).then((res) => {
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
  return `${builtinParams['__built-in-cate']}_${builtinParams['__built-in-name']}`;
};
/**
 * 获取默认的时间范围
 * 1. 优先使用 URL 中的 __from 和 __to，如果不合法则使用默认值
 * 2. 如果 URL 中没有 __from 和 __to，则使用缓存中的值
 * 3. 如果缓存中没有值，则使用默认值
 */
// TODO: 如果 URL 的 __from 和 __to 不合法就弹出提示，这里临时设置成只能弹出一次
message.config({
  maxCount: 1,
});
const getDefaultTimeRange = (id, query, dashboardDefaultRangeIndex?) => {
  const defaultRange =
    dashboardDefaultRangeIndex !== undefined && dashboardDefaultRangeIndex !== ''
      ? rangeOptions[dashboardDefaultRangeIndex]
      : {
          start: 'now-1h',
          end: 'now',
        };
  if (query.__from && query.__to) {
    if (isValid(query.__from) && isValid(query.__to)) {
      return {
        start: query.__from,
        end: query.__to,
      };
    }
    if (moment(_.toNumber(query.__from)).isValid() && moment(_.toNumber(query.__to)).isValid()) {
      return {
        start: moment(_.toNumber(query.__from)),
        end: moment(_.toNumber(query.__to)),
      };
    }
    message.error(i18next.t('dashboard:detail.invalidTimeRange'));
    return getDefaultValue(`${dashboardTimeCacheKey}_${id}`, defaultRange);
  }
  return getDefaultValue(`${dashboardTimeCacheKey}_${id}`, defaultRange);
};

export default function DetailV2(props: IProps) {
  const { isPreview = false, isBuiltin = false, gobackPath, builtinParams } = props;
  const { t, i18n } = useTranslation('dashboard');
  const history = useHistory();
  const { datasourceList, profile, dashboardDefaultRangeIndex, dashboardSaveMode, perms, groupedDatasourceList } = useContext(CommonStateContext);
  const isAuthorized = _.includes(perms, '/dashboards/put') && !isPreview;
  const [dashboardMeta, setDashboardMeta] = useGlobalState('dashboardMeta');
  const [panelClipboard, setPanelClipboard] = useGlobalState('panelClipboard');
  let { id } = useParams<URLParam>();
  const query = queryString.parse(useLocation().search);
  if (isBuiltin) {
    id = builtinParamsToID(query);
  }
  const refreshRef = useRef<{ closeRefresh: Function }>();
  const [dashboard, setDashboard] = useState<Dashboard>({} as Dashboard);
  const [variableConfig, setVariableConfig] = useState<IVariable[]>();
  const [variableConfigWithOptions, setVariableConfigWithOptions] = useState<IVariable[]>();
  const [dashboardLinks, setDashboardLinks] = useState<ILink[]>();
  const [panels, setPanels] = useState<any[]>([]);
  const [range, setRange] = useState<IRawTimeRange>(getDefaultTimeRange(id, query, dashboardDefaultRangeIndex));
  const [editable, setEditable] = useState(true);
  const [editorData, setEditorData] = useState({
    visible: false,
    id: '',
    initialValues: {} as any,
  });
  const [migrationVisible, setMigrationVisible] = useState(false);
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [variableConfigRefreshFlag, setVariableConfigRefreshFlag] = useState<string>(_.uniqueId('variableConfigRefreshFlag_'));
  const [allowedLeave, setAllowedLeave] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  let updateAtRef = useRef<number>();
  const routerPromptRef = useRef<any>();
  const refresh = async (cbk?: () => void) => {
    fetchDashboard({
      id,
      builtinParams,
    }).then((res) => {
      updateAtRef.current = res.update_at;
      const configs = _.isString(res.configs) ? JSONParse(res.configs) : res.configs;
      if (props.onLoaded && !props.onLoaded(configs)) {
        return;
      }
      if ((!configs.version || semver.lt(configs.version, '3.0.0')) && !builtinParams) {
        setMigrationVisible(true);
      }
      setDashboardMeta({
        ...(dashboardMeta || {}),
        graphTooltip: configs.graphTooltip,
        graphZoom: configs.graphZoom,
      });
      setDashboard({
        ...res,
        configs,
      });
      if (configs) {
        // TODO: configs 中可能没有 var 属性会导致 VariableConfig 报错
        const variableConfig = configs.var
          ? configs
          : {
              ...configs,
              var: [],
            };
        setVariableConfig(
          _.map(variableConfig.var, (item) => {
            return _.omit(item, 'options'); // 兼容性代码，去除掉已保存的 options
          }) as IVariable[],
        );
        setDashboardLinks(configs.links);
        setPanels(sortPanelsByGridLayout(ajustPanels(configs.panels)));
        if (cbk) {
          cbk();
        }
      }
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
      setAllowedLeave(false);
      setDashboard({
        ...dashboard,
        configs,
      });
    } else {
      updateDashboardConfigs(id, updateData).then((res) => {
        updateAtRef.current = res.update_at;
        refresh();
      });
    }
  };
  const handleVariableChange = (value, b, valueWithOptions) => {
    const dashboardConfigs: any = dashboard.configs;
    dashboardConfigs.var = value;
    // TODO: 手动模式需要在这里更新变量配置，自动模式会在获取大盘配置时更新
    if (dashboardSaveMode === 'manual') {
      setVariableConfig(value);
    }
    // 更新变量配置
    b && handleUpdateDashboardConfigs(dashboard.id, { configs: JSON.stringify(dashboardConfigs) });
    // 更新变量配置状态
    if (valueWithOptions) {
      setVariableConfigWithOptions(valueWithOptions);
      setDashboardMeta({
        ...(dashboardMeta || {}),
        dashboardId: _.toString(id),
        variableConfigWithOptions: valueWithOptions,
      });
    }
  };
  const stopAutoRefresh = () => {
    refreshRef.current?.closeRefresh();
  };

  useEffect(() => {
    refresh();
  }, [id]);

  useInterval(() => {
    if (import.meta.env.PROD && dashboard.id) {
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

  return (
    <PageLayout customArea={<div />}>
      <div className='dashboard-detail-container'>
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
              }}
            >
              <Title
                isPreview={isPreview}
                isBuiltin={isBuiltin}
                isAuthorized={isAuthorized}
                editable={editable}
                updateAtRef={updateAtRef}
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
                onAddPanel={(type) => {
                  if (type === 'row') {
                    const newPanels = updatePanelsInsertNewPanelToGlobal(
                      panels,
                      {
                        type: 'row',
                        id: uuidv4(),
                        name: i18n.language === 'en_US' ? 'Row' : '分组',
                        collapsed: true,
                      },
                      'row',
                    );
                    setPanels(newPanels);
                    handleUpdateDashboardConfigs(dashboard.id, {
                      configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                    });
                  } else if (type === 'pastePanel') {
                    if (panelClipboard) {
                      const newPanels = updatePanelsInsertNewPanelToGlobal(panels, { ...panelClipboard, id: uuidv4() }, 'chart', false);
                      setPanels(newPanels);
                      scrollToLastPanel(newPanels);
                      handleUpdateDashboardConfigs(dashboard.id, {
                        configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                      });
                    } else {
                      message.error(t('detail.noPanelToPaste'));
                    }
                  } else {
                    setEditorData(ajustInitialValues(type, groupedDatasourceList, panels, variableConfig));
                  }
                }}
              />
              {!editable && (
                <div style={{ padding: '0px 10px', marginBottom: 8 }}>
                  <Alert type='warning' message={t('detail.expired')} />
                </div>
              )}
              <div className='dashboard-detail-content-header'>
                <div className='variable-area'>
                  {variableConfig && (
                    <VariableConfig
                      isPreview={!isAuthorized}
                      onChange={handleVariableChange}
                      value={variableConfig}
                      range={range}
                      id={id}
                      onOpenFire={stopAutoRefresh}
                      variableConfigRefreshFlag={variableConfigRefreshFlag}
                      dashboard={dashboard}
                    />
                  )}
                </div>
              </div>
            </div>
          </Affix>
          {variableConfigWithOptions && (
            <Panels
              dashboardId={id}
              isPreview={isPreview}
              editable={editable}
              panels={panels}
              setPanels={setPanels}
              dashboard={dashboard}
              setDashboard={setDashboard}
              setAllowedLeave={setAllowedLeave}
              range={range}
              setRange={setRange}
              variableConfig={variableConfigWithOptions}
              onShareClick={(panel) => {
                const curDatasourceValue = replaceExpressionVars(panel.datasourceValue, variableConfigWithOptions, variableConfigWithOptions.length, id);
                const serielData = {
                  dataProps: {
                    ...panel,
                    datasourceValue: curDatasourceValue,
                    // @ts-ignore
                    datasourceName: _.find(datasourceList, { id: curDatasourceValue })?.name,
                    targets: _.map(panel.targets, (target) => {
                      const fullVars = getOptionsList(
                        {
                          dashboardId: _.toString(dashboard.id),
                          variableConfigWithOptions: variableConfigWithOptions,
                        },
                        range,
                      );
                      const realExpr = variableConfigWithOptions ? replaceExpressionVars(target.expr, fullVars, fullVars.length, id) : target.expr;
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
              setVariableConfigRefreshFlag={setVariableConfigRefreshFlag}
            />
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
        variableConfigWithOptions={variableConfigWithOptions}
        id={editorData.id}
        dashboardId={id}
        time={range}
        initialValues={editorData.initialValues}
        onOK={(values, mode) => {
          const newPanels = updatePanelsInsertNewPanelToGlobal(panels, values, 'chart');
          setPanels(newPanels);
          if (mode === 'add') {
            scrollToLastPanel(newPanels);
          }
          handleUpdateDashboardConfigs(dashboard.id, {
            configs: panelsMergeToConfigs(dashboard.configs, newPanels),
          });
        }}
        dashboard={dashboard}
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
      />
    </PageLayout>
  );
}
