import React, { useState, useRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Dropdown, Menu, Tooltip, Space, Drawer, message } from 'antd';
import type { MenuProps } from 'antd';
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
  ExportOutlined,
  ClearOutlined,
  FieldTimeOutlined,
  EyeOutlined,
} from '@ant-design/icons';

import { IRawTimeRange } from '@/components/TimeRangePicker';
import replaceTemplateVariables from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';
import type { DashboardQueryState } from '../datasource/types';
import type { CalculatedSeries } from '../utils/getCalculatedValuesBySeries';

import PanelEmpty from '../components/PanelEmpty';
import CloneIcon from '../components/CloneIcon';
import Timeseries from './TimeSeriesNG';
import Stat from './Stat';
import Table from './Table';
import TableNG from './TableNG';
import Pie from './Pie';
import Hexbin from './Hexbin';
import BarGauge from './BarGauge';
import Text from './Text';
import Gauge from './Gauge';
import Iframe from './Iframe';
import Heatmap from './Heatmap';
import BarChart from './BarChart';
import Markdown from '../../Editor/Components/Markdown';
import getPanelCustomTimeDescribe from '../utils/getPanelCustomTimeDescribe';
import Inspect from '../Inspect';
import { IProps } from './index';

function index(
  props: IProps & {
    controllersVisible: boolean;
    queryResult: DashboardQueryState;
    containerEleRef: React.RefObject<HTMLDivElement>;
    time: IRawTimeRange;
    setTime?: (time: IRawTimeRange) => void;
    inspect: boolean;
    setInspect: (inspect: boolean) => void;
    setViewModalVisible: (visible: boolean) => void;
  },
) {
  const { t } = useTranslation('dashboard');
  const {
    panelWidth,
    themeMode,
    id,
    timezone,
    isPreview,
    isAuthorized,
    annotations,
    onCloneClick,
    onShareClick,
    onEditClick,
    onDeleteClick,
    onCopyClick,
    onOverridesChange,
    // from index.tsx
    controllersVisible,
    queryResult,
    containerEleRef,
    time,
    setTime,
    inspect,
    setInspect,
    setViewModalVisible,
  } = props;
  const [visible, setVisible] = useState(false);
  const values = _.cloneDeep(props.values);
  const tableRef = useRef<{ exportCsv: () => void }>(null);
  const tableNGRef = useRef<{ exportCsv: () => void }>(null);
  const bodyWrapRef = useRef<HTMLDivElement>(null);
  const { query, series, error, loading, loaded, range, revision } = queryResult;
  const name = replaceTemplateVariables(values.name, {
    scopedVars: values.scopedVars,
    range: time,
  });
  const description = replaceTemplateVariables(values.description, {
    scopedVars: values.scopedVars,
    range: time,
  });
  const tipsVisible = description || !_.isEmpty(values.links);
  const panelCustomTimeDescribe = getPanelCustomTimeDescribe(values.queryOptionsTime);

  // TODO: 如果 hexbin 的 colorRange 为 string 时转成成 array
  if (typeof _.get(values, 'custom.colorRange') === 'string') {
    _.set(values, 'custom.colorRange', _.split(_.get(values, 'custom.colorRange') as string, ','));
  }
  const subProps = {
    id,
    values,
    // DashboardSeries 含日志序列（metric 为 unknown），渲染器按 CalculatedSeries 消费，运行时结构兼容
    series: series as CalculatedSeries[],
    dataRevision: revision,
    onOverridesChange,
  };
  const menuItems: MenuProps['items'] = [
    {
      key: 'review_btn',
      label: (
        <Space>
          <EyeOutlined />
          {t('common:btn.view')}
        </Space>
      ),
      onClick: () => {
        setVisible(false);
        setViewModalVisible(true);
      },
    },
    {
      key: 'refresh_btn',
      label: (
        <Space>
          <SyncOutlined />
          {t('refresh_btn')}
        </Space>
      ),
      onClick: () => {
        setVisible(true);
        setTime?.({ ...time, refreshFlag: _.uniqueId('refreshFlag_ ') });
      },
    },
    ...(isAuthorized && !values.repeatPanelId
      ? [
          {
            key: 'edit_btn',
            label: (
              <Space>
                <SettingOutlined />
                {t('common:btn.edit')}
              </Space>
            ),
            onClick: () => {
              setVisible(false);
              onEditClick?.(panelWidth);
            },
          },
          {
            key: 'clone_btn',
            label: (
              <Space>
                <CloneIcon />
                {t('common:btn.clone')}
              </Space>
            ),
            onClick: () => {
              setVisible(false);
              onCloneClick?.();
            },
          },
          {
            key: 'copy_btn',
            label: (
              <Space>
                <CopyOutlined />
                {t('common:btn.copy')}
              </Space>
            ),
            onClick: () => {
              setVisible(false);
              void onCopyClick?.();
            },
          },
        ]
      : []),
    {
      key: 'share_btn',
      label: (
        <Space>
          <ShareAltOutlined />
          {t('share_btn')}
        </Space>
      ),
      onClick: () => {
        setVisible(false);
        onShareClick?.();
      },
    },
    ...(values.type === 'table'
      ? [
          {
            key: 'export_btn',
            label: (
              <Space>
                <ExportOutlined />
                {t('export_btn')}
              </Space>
            ),
            onClick: () => {
              tableRef.current?.exportCsv();
              setVisible(false);
            },
          },
        ]
      : []),
    ...(values.type === 'tableNG'
      ? [
          {
            key: 'export_btn',
            label: (
              <Space>
                <ExportOutlined />
                {t('export_btn')}
              </Space>
            ),
            onClick: () => {
              tableNGRef.current?.exportCsv();
              setVisible(false);
            },
          },
        ]
      : []),
    ...(values.type === 'table'
      ? [
          {
            key: 'clear_cache_btn',
            label: (
              <Tooltip title={t('clear_cache_btn_tip')} placement='left'>
                <Space>
                  <ClearOutlined />
                  {t('clear_cache_btn')}
                </Space>
              </Tooltip>
            ),
            onClick: () => {
              window.localStorage.removeItem(`dashboard-table2.1-resizable-${values.id}`);
              setVisible(false);
            },
          },
        ]
      : []),
    ...(!isPreview
      ? [
          {
            key: 'inspect_btn',
            label: (
              <Space>
                <InfoCircleOutlined />
                {t('inspect_btn')}
              </Space>
            ),
            onClick: () => {
              setVisible(false);
              setTime?.({ ...time, refreshFlag: _.uniqueId('refreshFlag_ ') });
              setInspect(true);
            },
          },
        ]
      : []),
    ...(isAuthorized && !values.repeatPanelId
      ? [
          {
            key: 'delete_btn',
            label: (
              <Space>
                <DeleteOutlined />
                {t('common:btn.delete')}
              </Space>
            ),
            onClick: () => {
              setVisible(false);
              onDeleteClick?.();
            },
          },
        ]
      : []),
  ];

  const RendererCptMap = {
    timeseries: () => (
      <Timeseries
        {...subProps}
        annotations={annotations}
        setAnnotationsRefreshFlag={props.setAnnotationsRefreshFlag}
        themeMode={themeMode}
        time={range}
        timezone={timezone}
        setRange={props.setRange}
        isPreview={isPreview}
      />
    ),
    stat: () => <Stat {...subProps} bodyWrapRef={bodyWrapRef} themeMode={themeMode} isPreview={isPreview} />,
    table: () => <Table {...subProps} themeMode={themeMode} isPreview={isPreview} ref={tableRef} />,
    // TableNG 的 series 类型为 DashboardSeries[]，与其他渲染器（CalculatedSeries[]）不同
    tableNG: () => <TableNG {...subProps} series={series} themeMode={themeMode} isPreview={isPreview} ref={tableNGRef} />,
    pie: () => <Pie {...subProps} themeMode={themeMode} isPreview={isPreview} />,
    hexbin: () => <Hexbin {...subProps} themeMode={themeMode} isPreview={isPreview} />,
    barGauge: () => <BarGauge {...subProps} themeMode={themeMode} isPreview={isPreview} />,
    text: () => <Text {...subProps} themeMode={themeMode} />,
    gauge: () => <Gauge {...subProps} themeMode={themeMode} isPreview={isPreview} />,
    iframe: () => <Iframe {...subProps} />,
    heatmap: () => <Heatmap {...subProps} themeMode={themeMode} isPreview={isPreview} />,
    barchart: () => <BarChart {...subProps} themeMode={themeMode} isPreview={isPreview} />,
  };

  return (
    <div
      className={classNames({
        'renderer-container': true,
        'renderer-container-no-title': !values.name,
      })}
    >
      <div className='renderer-body-wrap' ref={bodyWrapRef}>
        <div className='renderer-header graph-header'>
          {error && (
            <Tooltip
              title={error}
              placement='leftTop'
              overlayInnerStyle={{
                maxWidth: 300,
                wordBreak: 'break-all',
              }}
              getPopupContainer={() => containerEleRef.current!}
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
            <Tooltip title={name} getPopupContainer={() => containerEleRef.current!}>
              <div className='renderer-header-title dashboards-panels-item-drag-handle'>{name}</div>
            </Tooltip>
            {tipsVisible ? (
              <Tooltip
                placement='top'
                overlayInnerStyle={{
                  maxWidth: 300,
                  wordBreak: 'break-all',
                }}
                getPopupContainer={() => containerEleRef.current!}
                title={
                  <Space direction='vertical'>
                    {description ? <Markdown content={description} /> : null}
                    {_.map(values.links, (link, i) => {
                      return (
                        <div key={i}>
                          <a
                            href={replaceTemplateVariables(link.url, {
                              scopedVars: values.scopedVars,
                              range: time,
                            })}
                            target={link.targetBlank ? '_blank' : '_self'}
                          >
                            {replaceTemplateVariables(link.title, {
                              scopedVars: values.scopedVars,
                              range: time,
                            })}
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
            {panelCustomTimeDescribe && (
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <FieldTimeOutlined /> {panelCustomTimeDescribe}
              </span>
            )}
          </div>
          {controllersVisible && (
            <div
              className='renderer-header-controllers'
              style={{
                width: name ? 28 : 52,
              }}
            >
              {loading ? (
                <SyncOutlined spin style={{ marginRight: 8 }} />
              ) : (
                <Space size={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {isAuthorized && !name && <DragOutlined className='renderer-header-controller dashboards-panels-item-drag-handle' />}
                  <Dropdown
                    trigger={['click']}
                    placement='bottom'
                    getPopupContainer={() => containerEleRef.current!}
                    overlayStyle={{
                      minWidth: '130px',
                    }}
                    visible={visible}
                    onVisibleChange={(visible) => {
                      setVisible(visible);
                    }}
                    overlay={<Menu items={menuItems} />}
                  >
                    <MoreOutlined className='renderer-header-controller' />
                  </Dropdown>
                </Space>
              )}
            </div>
          )}
        </div>
        {loaded && (
          <div className='renderer-body' style={{ height: values.name ? `calc(100% - 34px)` : '100%' }}>
            {_.isEmpty(series) && values.type !== 'text' && values.type !== 'iframe' ? (
              <PanelEmpty values={values} bodyWrapRef={bodyWrapRef} />
            ) : (
              <>{RendererCptMap[values.type] ? RendererCptMap[values.type]() : <div className='unknown-type'>{`${t('detail.invalidPanelType')} ${values.type}`}</div>}</>
            )}
          </div>
        )}
      </div>
      <Drawer
        title={t('panel.inspect.title')}
        placement='right'
        width={800}
        onClose={() => {
          setInspect(false);
        }}
        visible={inspect}
        className='n9e-antd-drawer'
      >
        <Inspect query={query} values={values} />
      </Drawer>
    </div>
  );
}

export default React.memo(index, (prevProps, nextProps) => {
  const omitKeys = [
    'setRange',
    'onCloneClick',
    'onShareClick',
    'onEditClick',
    'onDeleteClick',
    'onCopyClick',
    'setAnnotationsRefreshFlag',
    'setTime',
    'setInspect',
    'setViewModalVisible',
  ];
  return _.isEqual(_.omit(prevProps, omitKeys), _.omit(nextProps, omitKeys));
});
