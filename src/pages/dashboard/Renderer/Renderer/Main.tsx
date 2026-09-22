import React, { useState, useRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Menu, Tooltip, Space, Drawer, message } from 'antd';
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
  LineChartOutlined,
} from '@ant-design/icons';

import { IRawTimeRange } from '@/components/TimeRangePicker';
import { useGlobalState } from '@/pages/dashboard/globalState';
import { useReplaceTemplateVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';
import type { DashboardQueryHookResult } from '../datasource/types';
import type { CalculatedSeries } from '../utils/getCalculatedValuesBySeries';

import PanelEmpty from '../components/PanelEmpty';
import CloneIcon from '../components/CloneIcon';
import Markdown from '../../Components/Markdown';
import getPanelCustomTimeDescribe from '../utils/getPanelCustomTimeDescribe';
import Inspect from '../Inspect';
import PanelRenderer from '../registry/PanelRenderer';
import type { PanelChartProps } from '../registry/types';
import { IProps } from './index';

const LOADING_BAR_MILLISECONDS_PER_PIXEL = 2.4;
const LOADING_BAR_MIN_DURATION_MS = 500;
const LOADING_BAR_MAX_DURATION_MS = 4000;
const LOADING_BAR_FALLBACK_WIDTH = 400;

/**
 * 渲染带图表图标的面板加载骨架，避免纯色背景难以辨认当前状态。
 *
 * 仅作为展示层占位，不会发起请求或修改面板查询状态。
 */
function PanelLoadingSkeleton({ label }: { label: string }) {
  return (
    <div className='flex h-full items-center justify-center rounded' aria-label={label}>
      <LineChartOutlined data-testid='panel-loading-chart-icon' style={{ fontSize: 32, opacity: 0.18 }} />
    </div>
  );
}

/**
 * 在面板顶部显示无进度语义的加载动画，反馈查询仍在执行且不占用标题栏操作区域。
 *
 * 该指示器只表示活动状态，不根据请求耗时推断完成比例。
 */
function PanelLoadingBar({ label, width }: { label: string; width?: number }) {
  return (
    <div className='renderer-loading-bar' role='progressbar' aria-label={label} data-testid='panel-loading-bar' style={{ animationDuration: `${getLoadingBarDuration(width)}ms` }}>
      <div className='renderer-loading-bar-gradient' />
    </div>
  );
}

/**
 * 根据面板宽度计算活动条时长，使不同尺寸的面板保持近似的横移速度。
 *
 * 未获得宽度时使用常见面板宽度作为回退，并限制时长以避免过快或过慢。
 */
function getLoadingBarDuration(width?: number) {
  const panelWidth = width ?? LOADING_BAR_FALLBACK_WIDTH;
  const calculatedDuration = Math.round(panelWidth * LOADING_BAR_MILLISECONDS_PER_PIXEL);

  return Math.min(Math.max(calculatedDuration, LOADING_BAR_MIN_DURATION_MS), LOADING_BAR_MAX_DURATION_MS);
}

/** 渲染单个仪表盘面板的标题、查询状态、图表和操作入口。 */
function index(
  props: IProps & {
    controllersVisible: boolean;
    queryResult: DashboardQueryHookResult;
    containerEleRef: React.RefObject<HTMLDivElement>;
    time: IRawTimeRange;
    setTime?: (time: IRawTimeRange) => void;
    inspect: boolean;
    setInspect: (inspect: boolean) => void;
    setViewModalVisible: (visible: boolean) => void;
  },
) {
  const { t } = useTranslation('dashboard');
  const replaceTemplateVariables = useReplaceTemplateVariables();
  const [variableExecution] = useGlobalState('variableExecution');
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
  const { query, series, errorsByRef, error, loading, loaded, range, revision, retry } = queryResult;
  // 变量链会先暂停 useQuery，此时查询尚未置为 loading；首次结果前仍须展示面板加载态。
  const waitingForVariables = variableExecution.isExecuting && !loaded && values.targets.length > 0;
  const loadingSkeletonVisible = !loaded && (loading || waitingForVariables);
  const loadingBarVisible = loading || waitingForVariables;
  const failedRefIds = Object.keys(errorsByRef);
  const hasPartialFailure = failedRefIds.length > 0 && series.length > 0;
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
  const chartProps: PanelChartProps = {
    id,
    values,
    // DashboardSeries 含日志序列（metric 为 unknown），渲染器按 CalculatedSeries 消费，运行时结构兼容
    series: series as CalculatedSeries[],
    // TableNG 消费原始 DashboardSeries，保留未转换的序列结构
    rawSeries: series,
    dataRevision: revision,
    onOverridesChange,
    themeMode,
    isPreview,
    time: range,
    timezone,
    setRange: props.setRange,
    annotations,
    setAnnotationsRefreshFlag: props.setAnnotationsRefreshFlag,
    bodyWrapRef,
    tableRef,
    tableNGRef,
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

  return (
    <div
      className={classNames({
        'renderer-container': true,
        'renderer-container-no-title': !values.name,
      })}
    >
      {loadingBarVisible && <PanelLoadingBar label={t('common:loading')} width={panelWidth} />}
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
          {hasPartialFailure && (
            <Tooltip
              title={failedRefIds.map((refId) => `${refId}: ${errorsByRef[refId].message}`).join('\n')}
              placement='leftTop'
              getPopupContainer={() => containerEleRef.current!}
            >
              <span className='renderer-header-partial-error'>{t('detail.partialFailure', { defaultValue: '部分查询失败' })}</span>
            </Tooltip>
          )}
          <div
            className='renderer-header-content'
            style={{
              // 预留右侧错误图标（26px）与「部分查询失败」提示（84px）的宽度，避免标题被压缩
              width: `calc(100% - ${32 + (error ? 26 : 0) + (hasPartialFailure ? 84 : 0)}px)`,
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
            </div>
          )}
        </div>
        {(loaded || loading || waitingForVariables || values.type === 'text' || values.type === 'iframe') && (
          <div className='renderer-body' style={{ height: values.name ? `calc(100% - 34px)` : '100%' }}>
            {loadingSkeletonVisible ? (
              <PanelLoadingSkeleton label={t('common:loading')} />
            ) : _.isEmpty(series) && values.type !== 'text' && values.type !== 'iframe' ? (
              <PanelEmpty values={values} bodyWrapRef={bodyWrapRef} />
            ) : (
              <PanelRenderer type={values.type} {...chartProps} />
            )}
          </div>
        )}
      </div>
      {error && (
        <div className='renderer-query-error-action'>
          <Button type='link' size='small' onClick={retry}>
            {t('refresh_btn')}
          </Button>
        </div>
      )}
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
