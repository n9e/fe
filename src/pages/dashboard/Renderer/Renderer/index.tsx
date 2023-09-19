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
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { useInViewport } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Dropdown, Menu, Tooltip, Space, Drawer } from 'antd';
import {
  InfoCircleOutlined,
  MoreOutlined,
  LinkOutlined,
  SettingOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  CopyOutlined,
  SyncOutlined,
  DragOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import Timeseries from './Timeseries';
import Stat from './Stat';
import Table from './Table';
import Pie from './Pie';
import Hexbin from './Hexbin';
import BarGauge from './BarGauge';
import Text from './Text';
import Gauge from './Gauge';
import Iframe from './Iframe';
import { IVariable } from '../../VariableConfig/definition';
import Markdown from '../../Editor/Components/Markdown';
import useQuery from '../datasource/useQuery';
import { IPanel } from '../../types';
import replaceFieldWithVariable from '../utils/replaceFieldWithVariable';
import Inspect from '../Inspect';
import './style.less';

interface IProps {
  datasourceValue?: number; // 全局数据源，如 values.datasourceValue 未设置则用全局数据源
  themeMode?: 'dark';
  dashboardId: string;
  id?: string;
  time: IRawTimeRange;
  values: IPanel;
  variableConfig?: IVariable[];
  isPreview?: boolean; // 是否是预览，预览中不显示编辑和分享
  onCloneClick?: () => void;
  onShareClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function index(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { datasourceValue, themeMode, dashboardId, id, variableConfig, isPreview, onCloneClick, onShareClick, onEditClick, onDeleteClick } = props;
  const [time, setTime] = useState(props.time);
  const [visible, setVisible] = useState(false);
  const values = _.cloneDeep(props.values);
  const ref = useRef<HTMLDivElement>(null);
  const bodyWrapRef = useRef<HTMLDivElement>(null);
  const [inViewPort] = useInViewport(ref);
  const [inspect, setInspect] = useState(false);
  const { query, series, error, loading } = useQuery({
    id,
    dashboardId,
    time,
    targets: values.targets,
    variableConfig,
    inViewPort: isPreview || inViewPort,
    datasourceCate: values.datasourceCate || 'prometheus',
    datasourceValue: values.datasourceValue || datasourceValue,
    spanNulls: values.custom?.spanNulls,
    scopedVars: values.scopedVars,
    inspect,
    type: values.type,
  });
  const name = replaceFieldWithVariable(dashboardId, values.name, variableConfig, values.scopedVars);
  const description = replaceFieldWithVariable(dashboardId, values.description, variableConfig, values.scopedVars);
  const tipsVisible = description || !_.isEmpty(values.links);

  useEffect(() => {
    setTime(props.time);
  }, [JSON.stringify(props.time)]);

  if (_.isEmpty(values)) return null;

  // TODO: 如果 hexbin 的 colorRange 为 string 时转成成 array
  if (typeof _.get(values, 'custom.colorRange') === 'string') {
    _.set(values, 'custom.colorRange', _.split(_.get(values, 'custom.colorRange'), ','));
  }
  const subProps = {
    values,
    series,
  };
  const RendererCptMap = {
    timeseries: () => <Timeseries {...subProps} themeMode={themeMode} time={time} />,
    stat: () => <Stat {...subProps} bodyWrapRef={bodyWrapRef} themeMode={themeMode} />,
    table: () => <Table {...subProps} themeMode={themeMode} time={time} />,
    pie: () => <Pie {...subProps} themeMode={themeMode} time={time} />,
    hexbin: () => <Hexbin {...subProps} themeMode={themeMode} time={time} />,
    barGauge: () => <BarGauge {...subProps} themeMode={themeMode} time={time} />,
    text: () => <Text {...subProps} />,
    gauge: () => <Gauge {...subProps} themeMode={themeMode} />,
    iframe: () => <Iframe {...subProps} time={time} />,
  };

  return (
    <div
      className={classNames({
        'renderer-container': true,
        'renderer-container-no-title': !values.name,
      })}
      ref={ref}
    >
      <div className='renderer-body-wrap' ref={bodyWrapRef}>
        <div className='renderer-header graph-header'>
          {error && (
            <Tooltip
              title={error}
              placement='leftTop'
              overlayInnerStyle={{
                maxWidth: 300,
              }}
              getPopupContainer={() => ref.current!}
            >
              <div className='renderer-header-error'>
                <WarningOutlined />
              </div>
            </Tooltip>
          )}
          <div
            className='renderer-header-content'
            style={{
              width: error ? 'calc(100% - 58px)' : 'calc(100% - 32px)',
            }}
          >
            <Tooltip title={name} getPopupContainer={() => ref.current!}>
              <div className='renderer-header-title dashboards-panels-item-drag-handle'>{name}</div>
            </Tooltip>
            {tipsVisible ? (
              <Tooltip
                placement='top'
                overlayInnerStyle={{
                  maxWidth: 300,
                }}
                getPopupContainer={() => ref.current!}
                title={
                  <Space direction='vertical'>
                    {description ? <Markdown content={description} /> : null}
                    {_.map(values.links, (link, i) => {
                      return (
                        <div key={i}>
                          <a href={replaceFieldWithVariable(dashboardId, link.url, variableConfig, values.scopedVars)} target={link.targetBlank ? '_blank' : '_self'}>
                            {replaceFieldWithVariable(dashboardId, link.title, variableConfig, values.scopedVars)}
                          </a>
                        </div>
                      );
                    })}
                  </Space>
                }
              >
                <div className='renderer-header-desc'>{description ? <InfoCircleOutlined /> : <LinkOutlined />}</div>
              </Tooltip>
            ) : null}
          </div>
          <div
            className='renderer-header-controllers'
            style={{
              width: name ? 28 : 52,
            }}
          >
            {loading ? (
              <SyncOutlined spin style={{ marginRight: 8 }} />
            ) : (
              !isPreview && (
                <Space size={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {!name && <DragOutlined className='renderer-header-controller dashboards-panels-item-drag-handle' />}
                  <Dropdown
                    trigger={['click']}
                    placement='bottom'
                    getPopupContainer={() => ref.current!}
                    overlayStyle={{
                      minWidth: '100px',
                    }}
                    visible={visible}
                    onVisibleChange={(visible) => {
                      setVisible(visible);
                    }}
                    overlay={
                      <Menu>
                        <Menu.Item
                          onClick={() => {
                            setVisible(true);
                            setTime({
                              ...time,
                              refreshFlag: _.uniqueId('refreshFlag_ '),
                            });
                          }}
                          key='refresh_btn'
                        >
                          <div>
                            <SyncOutlined style={{ marginRight: 8 }} />
                            {t('refresh_btn')}
                          </div>
                        </Menu.Item>
                        {!values.repeatPanelId && (
                          <Menu.Item
                            onClick={() => {
                              setVisible(false);
                              if (onEditClick) onEditClick();
                            }}
                            key='edit_btn'
                          >
                            <SettingOutlined style={{ marginRight: 8 }} />
                            {t('common:btn.edit')}
                          </Menu.Item>
                        )}
                        {!values.repeatPanelId && (
                          <Menu.Item
                            onClick={() => {
                              setVisible(false);
                              if (onCloneClick) onCloneClick();
                            }}
                            key='clone_btn'
                          >
                            <CopyOutlined style={{ marginRight: 8 }} />
                            {t('common:btn.clone')}
                          </Menu.Item>
                        )}
                        <Menu.Item
                          onClick={() => {
                            setVisible(false);
                            if (onShareClick) onShareClick();
                          }}
                          key='share_btn'
                        >
                          <ShareAltOutlined style={{ marginRight: 8 }} />
                          {t('share_btn')}
                        </Menu.Item>
                        <Menu.Item
                          onClick={() => {
                            setVisible(false);
                            setTime({
                              ...time,
                              refreshFlag: _.uniqueId('refreshFlag_ '),
                            });
                            setInspect(true);
                          }}
                          key='inspect_btn'
                        >
                          <InfoCircleOutlined style={{ marginRight: 8 }} />
                          {t('inspect_btn')}
                        </Menu.Item>
                        {!values.repeatPanelId && (
                          <Menu.Item
                            onClick={() => {
                              setVisible(false);
                              if (onDeleteClick) onDeleteClick();
                            }}
                            key='delete_btn'
                          >
                            <DeleteOutlined style={{ marginRight: 8 }} />
                            {t('common:btn.delete')}
                          </Menu.Item>
                        )}
                      </Menu>
                    }
                  >
                    <MoreOutlined className='renderer-header-controller' />
                  </Dropdown>
                </Space>
              )
            )}
          </div>
        </div>
        <div className='renderer-body' style={{ height: values.name ? `calc(100% - 34px)` : '100%' }}>
          {_.isEmpty(series) && values.type !== 'text' && values.type !== 'iframe' ? (
            <div className='renderer-body-content-empty'>No Data</div>
          ) : (
            <>{RendererCptMap[values.type] ? RendererCptMap[values.type]() : <div className='unknown-type'>{`无效的图表类型 ${values.type}`}</div>}</>
          )}
        </div>
      </div>
      <Drawer
        title={t('panel.inspect.title')}
        placement='right'
        width={800}
        onClose={() => {
          setInspect(false);
        }}
        visible={inspect}
      >
        <Inspect query={query} values={values} />
      </Drawer>
    </div>
  );
}

export default React.memo(index);
