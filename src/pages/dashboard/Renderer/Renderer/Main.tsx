import React, { useState, useRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Dropdown, Menu, Tooltip, Space, Drawer, message } from 'antd';
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
import PanelEmpty from '../components/PanelEmpty';
import CloneIcon from '../components/CloneIcon';
import Timeseries from './TimeSeriesNG';
import Stat from './Stat';
import Table from './Table';
import Pie from './Pie';
import Hexbin from './Hexbin';
import BarGauge from './BarGauge';
import Text from './Text';
import Gauge from './Gauge';
import Iframe from './Iframe';
import Heatmap from './Heatmap';
import BarChart from './BarChart';
import Markdown from '../../Editor/Components/Markdown';
import replaceFieldWithVariable from '../utils/replaceFieldWithVariable';
import getPanelCustomTimeDescribe from '../utils/getPanelCustomTimeDescribe';
import Inspect from '../Inspect';
import { IProps } from './index';

function index(
  props: IProps & {
    controllersVisible: boolean;
    queryResult: {
      query: any[];
      series: any[];
      error: string;
      loading: boolean;
      loaded: boolean;
      range: IRawTimeRange;
    };
    containerEleRef: React.RefObject<HTMLDivElement>;
    time: IRawTimeRange;
    setTime: (time: IRawTimeRange) => void;
    inspect: boolean;
    setInspect: (inspect: boolean) => void;
    setViewModalVisible: (visible: boolean) => void;
  },
) {
  const { t } = useTranslation('dashboard');
  const {
    themeMode,
    dashboardId,
    dashboardID,
    id,
    timezone,
    variableConfig,
    isPreview,
    isAuthorized,
    annotations,
    onCloneClick,
    onShareClick,
    onEditClick,
    onDeleteClick,
    onCopyClick,
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
  const tableRef = useRef<any>(null);
  const bodyWrapRef = useRef<HTMLDivElement>(null);
  const { query, series, error, loading, loaded, range } = queryResult;
  const name = replaceFieldWithVariable(dashboardId, values.name, variableConfig, values.scopedVars);
  const description = replaceFieldWithVariable(dashboardId, values.description, variableConfig, values.scopedVars);
  const tipsVisible = description || !_.isEmpty(values.links);
  const panelCustomTimeDescribe = getPanelCustomTimeDescribe(series);

  // TODO: 如果 hexbin 的 colorRange 为 string 时转成成 array
  if (typeof _.get(values, 'custom.colorRange') === 'string') {
    _.set(values, 'custom.colorRange', _.split(_.get(values, 'custom.colorRange'), ','));
  }
  const subProps = {
    id,
    values,
    series,
  };

  const RendererCptMap = {
    timeseries: () => (
      <Timeseries
        {...subProps}
        dashboardID={dashboardID}
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
    table: () => <Table {...subProps} themeMode={themeMode} time={time} isPreview={isPreview} ref={tableRef} />,
    pie: () => <Pie {...subProps} themeMode={themeMode} time={time} isPreview={isPreview} />,
    hexbin: () => <Hexbin {...subProps} themeMode={themeMode} time={time} isPreview={isPreview} />,
    barGauge: () => <BarGauge {...subProps} themeMode={themeMode} time={time} isPreview={isPreview} />,
    text: () => <Text {...subProps} themeMode={themeMode} />,
    gauge: () => <Gauge {...subProps} themeMode={themeMode} isPreview={isPreview} />,
    iframe: () => <Iframe {...subProps} time={time} />,
    heatmap: () => <Heatmap {...subProps} themeMode={themeMode} time={time} isPreview={isPreview} />,
    barchart: () => <BarChart {...subProps} themeMode={themeMode} time={time} isPreview={isPreview} />,
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
                }}
                getPopupContainer={() => containerEleRef.current!}
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
                    overlay={
                      <Menu>
                        <Menu.Item
                          onClick={() => {
                            setVisible(false);
                            setViewModalVisible(true);
                          }}
                          key='review_btn'
                        >
                          <Space>
                            <EyeOutlined />
                            {t('common:btn.view')}
                          </Space>
                        </Menu.Item>
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
                          <Space>
                            <SyncOutlined />
                            {t('refresh_btn')}
                          </Space>
                        </Menu.Item>
                        {isAuthorized && !values.repeatPanelId && (
                          <Menu.Item
                            onClick={() => {
                              setVisible(false);
                              if (onEditClick) onEditClick();
                            }}
                            key='edit_btn'
                          >
                            <Space>
                              <SettingOutlined />
                              {t('common:btn.edit')}
                            </Space>
                          </Menu.Item>
                        )}
                        {isAuthorized && !values.repeatPanelId && (
                          <Menu.Item
                            onClick={() => {
                              setVisible(false);
                              if (onCloneClick) onCloneClick();
                            }}
                            key='clone_btn'
                          >
                            <Space>
                              <CloneIcon />
                              {t('common:btn.clone')}
                            </Space>
                          </Menu.Item>
                        )}
                        {isAuthorized && !values.repeatPanelId && (
                          <Menu.Item
                            onClick={() => {
                              setVisible(false);
                              if (onCopyClick) {
                                message.info(t('copyPanelTip'));
                                onCopyClick();
                              }
                            }}
                            key='copy_btn'
                          >
                            <Space>
                              <CopyOutlined />
                              {t('common:btn.copy')}
                            </Space>
                          </Menu.Item>
                        )}
                        <Menu.Item
                          onClick={() => {
                            setVisible(false);
                            if (onShareClick) onShareClick();
                          }}
                          key='share_btn'
                        >
                          <Space>
                            <ShareAltOutlined />
                            {t('share_btn')}
                          </Space>
                        </Menu.Item>
                        {values.type === 'table' && (
                          <Menu.Item
                            onClick={() => {
                              tableRef.current.exportCsv();
                              setVisible(false);
                            }}
                            key='export_btn'
                          >
                            <Space>
                              <ExportOutlined />
                              {t('export_btn')}
                            </Space>
                          </Menu.Item>
                        )}
                        {values.type === 'table' && (
                          <Tooltip title={t('clear_cache_btn_tip')} placement='left'>
                            <Menu.Item
                              onClick={() => {
                                window.localStorage.removeItem(`dashboard-table2.1-resizable-${values.id}`);
                                setVisible(false);
                              }}
                              key='clear_cache_btn'
                            >
                              <Space>
                                <ClearOutlined />
                                {t('clear_cache_btn')}
                              </Space>
                            </Menu.Item>
                          </Tooltip>
                        )}

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
                          <Space>
                            <InfoCircleOutlined />
                            {t('inspect_btn')}
                          </Space>
                        </Menu.Item>
                        {isAuthorized && !values.repeatPanelId && (
                          <Menu.Item
                            onClick={() => {
                              setVisible(false);
                              if (onDeleteClick) onDeleteClick();
                            }}
                            key='delete_btn'
                          >
                            <Space>
                              <DeleteOutlined />
                              {t('common:btn.delete')}
                            </Space>
                          </Menu.Item>
                        )}
                      </Menu>
                    }
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
              <>{RendererCptMap[values.type] ? RendererCptMap[values.type]() : <div className='unknown-type'>{`无效的图表类型 ${values.type}`}</div>}</>
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
