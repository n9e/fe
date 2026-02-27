import React, { useState, useEffect, createContext } from 'react';
import { Spin, Space, Radio } from 'antd';
import _ from 'lodash';
import moment, { Moment } from 'moment';
import { useTranslation } from 'react-i18next';

import { IRawTimeRange } from '@/components/TimeRangePicker/types';

import { NAME_SPACE } from '../../constants';
import { Field } from '../../components/FieldsList/types';
import FullscreenButton from '../../components/FullscreenButton';
import HistogramChart from './components/HistogramChart';
import OriginSettings from './components/OriginSettings';
import Raw from './Raw';
import Table from './Table';
import { OptionsType, OnValueFilterParams } from './types';

import './style.less';
import classNames from 'classnames';

interface Props {
  /** 时间字段 */
  timeField: string;
  /** 直方图数据 */
  hideHistogram?: boolean;
  histogramLoading?: boolean;
  histogram?: {
    metric: string;
    data: [number, number][];
  }[];
  histogramHash?: string;
  /** 日志数据加载状态 */
  loading: boolean;
  /** 日志数据 */
  logs: { [index: string]: string }[];
  highlights?: {
    [index: number]: string[];
  }[];
  logsHash?: string;
  /** 字段列表 */
  fields: string[];
  /** 日志格式配置项 */
  options: OptionsType;
  /** 配置项变更回调 */
  onOptionsChange?: (options: OptionsType, reload?: boolean) => void;
  /** 添加过滤条件回调 */
  onAddToQuery?: (condition: OnValueFilterParams) => void;
  /** 时间范围变更回调 */
  onRangeChange?: (range: { start: Moment; end: Moment }) => void;
  /** 更新日志请求参数回调 */
  onLogRequestParamsChange?: (params: any) => void;
  /** 滚动捕获回调 */
  onScrollCapture?: () => void;
  /** 每行日志前面的额外内容 */
  rowPrefixRender?: (record: { [index: string]: any }) => React.ReactNode;
  /** 过滤每行日志的字段，返回需要显示的字段数组 */
  filterFields?: (fieldKeys: string[]) => string[];
  organizeFields?: string[];
  setOrganizeFields?: (value?: string[]) => void;
  histogramAddonBeforeRender?: React.ReactNode;
  renderHistogramAddonAfterRender?: (toggleNode: React.ReactNode) => React.ReactNode;
  optionsExtraRender?: React.ReactNode;
  showDateField?: boolean;
  stacked?: boolean;
  colWidths?: { [key: string]: number };
  tableColumnsWidthCacheKey?: string;
  showPageLoadMode?: boolean;
  showJSONSettings?: boolean;
  showTopNSettings?: boolean;
  showLogMode?: boolean;
  addonBefore?: React.ReactNode;
  timeFieldColumnFormat?: (timeFieldValue: string | number) => React.ReactNode;
  linesColumnFormat?: (linesValue: number) => React.ReactNode;
  id_key?: string;
  raw_key?: string;
  logViewerExtraRender?: (log: { [index: string]: any }) => React.ReactNode;
  logViewerFilterFields?: (log: Record<string, any>) => string[];
  logViewerRenderCustomTagsArea?: (log: Record<string, any>) => React.ReactNode;
  adjustFieldValue?: (formatedValue: string, highlightValue?: string[]) => React.ReactNode;
  showExistsAction?: boolean;

  /** 以下是 context 依赖的数据 */
  /** 字段下钻、格式化相关配置 */
  fieldConfig?: any;
  /** 日志索引数据 */
  indexData?: Field[];
  range?: IRawTimeRange;
  getAddToQueryInfo?: (params: { parentKey?: string; fieldName: string; logRowData: { [index: string]: any }; indexData: Field[] }) => {
    isIndex: boolean;
    indexName: string;
  };
}

interface LogsViewerState {
  id_key: string;
  raw_key: string;
  /** 字段下钻、格式化相关配置 */
  fieldConfig?: Props['fieldConfig'];
  indexData?: Props['indexData'];
  range?: Props['range'];
  getAddToQueryInfo?: Props['getAddToQueryInfo'];
}
export const LogsViewerStateContext = createContext({} as LogsViewerState);

export default function LogsViewer(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const {
    timeField,
    hideHistogram = false,
    histogramLoading = false,
    histogram,
    loading,
    logs,
    highlights,
    logsHash,
    fields,
    onOptionsChange,
    onAddToQuery,
    onRangeChange,
    onLogRequestParamsChange,
    onScrollCapture,
    rowPrefixRender,
    filterFields,
    organizeFields,
    setOrganizeFields,
    histogramAddonBeforeRender,
    renderHistogramAddonAfterRender,
    optionsExtraRender,
    showDateField = true,
    stacked = false,
    colWidths,
    tableColumnsWidthCacheKey,
    showPageLoadMode,
    showJSONSettings,
    showTopNSettings,
    showLogMode = true,
    addonBefore,
    timeFieldColumnFormat,
    linesColumnFormat,
    id_key = '___id___',
    raw_key = '___raw___',
    logViewerExtraRender,
    logViewerFilterFields,
    logViewerRenderCustomTagsArea,
    adjustFieldValue,
    showExistsAction,
  } = props;
  const [options, setOptions] = useState(props.options);
  const [histogramVisible, setHistogramVisible] = useState(true);

  const updateOptions = (newOptions: any, reload?: boolean) => {
    onOptionsChange?.(newOptions, reload);
  };

  const originSettingsRef = React.useRef<{
    setOrganizeFieldsModalVisible: (newVisible: boolean) => void;
  }>(null);

  useEffect(() => {
    setOptions(props.options);
  }, [props.options]);

  return (
    <LogsViewerStateContext.Provider
      value={{
        id_key,
        raw_key,
        fieldConfig: props.fieldConfig,
        indexData: props.indexData,
        range: props.range,
        getAddToQueryInfo: props.getAddToQueryInfo,
      }}
    >
      <>
        {!hideHistogram && (
          <div
            className={classNames('flex-shrink-0', {
              'h-[130px]': histogramVisible,
              'h-[30px]': !histogramVisible,
            })}
          >
            <div className='mt-1 px-2 flex justify-between h-[19px] overflow-hidden'>
              <Space>
                {histogramAddonBeforeRender}
                <Spin spinning={histogramLoading} size='small' />
              </Space>

              {renderHistogramAddonAfterRender?.(
                <a
                  onClick={() => {
                    setHistogramVisible(!histogramVisible);
                  }}
                >
                  {histogramVisible ? t('histogram_hide') : t('histogram_show')}
                </a>,
              )}
            </div>
            <div
              className={classNames('flex-shrink-0', {
                'h-[120px]': histogramVisible,
                block: histogramVisible,
                hidden: !histogramVisible,
              })}
            >
              {props.range && histogram && (
                <HistogramChart
                  series={histogram}
                  stacked={stacked}
                  onClick={(start, end) => {
                    if (start && end) {
                      onLogRequestParamsChange?.({
                        from: start,
                        to: end,
                        context: undefined,
                      });
                    }
                  }}
                  onZoomWithoutDefult={(times) => {
                    onRangeChange?.({
                      start: moment(times[0]),
                      end: moment(times[1]),
                    });
                  }}
                />
              )}
            </div>
          </div>
        )}
        <FullscreenButton.Provider>
          <div className='flex justify-between pb-2'>
            <Space>
              {addonBefore}
              {showLogMode && (
                <Radio.Group
                  size='small'
                  optionType='button'
                  options={[
                    {
                      label: t('logs.settings.mode.origin'),
                      value: 'origin',
                    },
                    {
                      label: t('logs.settings.mode.table'),
                      value: 'table',
                    },
                  ]}
                  value={options.logMode}
                  onChange={(e) => {
                    updateOptions({
                      logMode: e.target.value,
                    });
                  }}
                />
              )}
              <OriginSettings
                ref={originSettingsRef}
                showDateField={showDateField}
                options={options}
                updateOptions={updateOptions}
                fields={fields}
                showPageLoadMode={showPageLoadMode}
                showJSONSettings={showJSONSettings}
                showTopNSettings={showTopNSettings}
                organizeFields={organizeFields}
                setOrganizeFields={setOrganizeFields}
              />
              <FullscreenButton />
              <Spin spinning={loading} size='small' />
            </Space>
            {optionsExtraRender}
          </div>
          <div className='h-full min-h-0' onScrollCapture={onScrollCapture}>
            <div className='n9e-antd-table-height-full'>
              {options.logMode === 'origin' && (
                <Raw
                  id_key={id_key}
                  raw_key={raw_key}
                  timeField={timeField}
                  data={logs}
                  highlights={highlights}
                  options={options}
                  onReverseChange={(val) => {
                    onLogRequestParamsChange?.({
                      reverse: val,
                      context: undefined,
                    });
                  }}
                  onValueFilter={onAddToQuery}
                  rowPrefixRender={rowPrefixRender}
                  filterFields={filterFields}
                  timeFieldColumnFormat={timeFieldColumnFormat}
                  linesColumnFormat={linesColumnFormat}
                  logViewerExtraRender={logViewerExtraRender}
                  logViewerFilterFields={logViewerFilterFields}
                  logViewerRenderCustomTagsArea={logViewerRenderCustomTagsArea}
                  adjustFieldValue={adjustFieldValue}
                  showExistsAction={showExistsAction}
                />
              )}
              {options.logMode === 'table' && (
                <Table
                  id_key={id_key}
                  raw_key={raw_key}
                  indexData={props.indexData}
                  timeField={timeField}
                  data={logs}
                  highlights={highlights}
                  logsHash={logsHash}
                  options={options}
                  onReverseChange={(val) => {
                    onLogRequestParamsChange?.({
                      reverse: val,
                      context: undefined,
                    });
                  }}
                  onValueFilter={onAddToQuery}
                  filterFields={filterFields}
                  colWidths={colWidths}
                  tableColumnsWidthCacheKey={tableColumnsWidthCacheKey}
                  onOpenOrganizeFieldsModal={() => {
                    originSettingsRef.current?.setOrganizeFieldsModalVisible(true);
                  }}
                  timeFieldColumnFormat={timeFieldColumnFormat}
                  linesColumnFormat={linesColumnFormat}
                  logViewerExtraRender={logViewerExtraRender}
                  logViewerFilterFields={logViewerFilterFields}
                  logViewerRenderCustomTagsArea={logViewerRenderCustomTagsArea}
                  adjustFieldValue={adjustFieldValue}
                  showExistsAction={showExistsAction}
                />
              )}
            </div>
          </div>
        </FullscreenButton.Provider>
      </>
    </LogsViewerStateContext.Provider>
  );
}
