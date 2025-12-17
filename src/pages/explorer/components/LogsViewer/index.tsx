import React, { useState, useEffect, createContext } from 'react';
import { Spin, Space, Radio } from 'antd';
import _ from 'lodash';
import moment, { Moment } from 'moment';
import { useTranslation } from 'react-i18next';

import { IRawTimeRange } from '@/components/TimeRangePicker/types';
import { Field } from '@/pages/explorer/components/FieldsList/types';
import FullscreenButton from '@/pages/explorer/components/FullscreenButton';

import HistogramChart from './components/HistogramChart';
import OriginSettings from './components/OriginSettings';
import Raw from './Raw';
import Table from './Table';

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
  /** 日志数据加载状态 */
  loading: boolean;
  /** 日志数据 */
  logs: { [index: string]: string }[];
  /** 字段列表 */
  fields: string[];
  /** 日志格式配置项 */
  options: any;
  /** 配置项变更回调 */
  onOptionsChange?: (options: any) => void;
  /** 添加过滤条件回调 */
  onAddToQuery?: (condition: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
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
  histogramExtraRender?: React.ReactNode;
  optionsExtraRender?: React.ReactNode;
  showDateField?: boolean;
  stacked?: boolean;
  histogramXTitle?: string;

  /** 以下是 context 依赖的数据 */
  /** 字段下钻、格式化相关配置 */
  fieldConfig?: any;
  /** 日志索引数据 */
  indexData?: Field[];
  range?: IRawTimeRange;
  getAddToQueryInfo?: (
    fieldName: string,
    logRowData: { [index: string]: any },
    indexData: Field[],
  ) => {
    isIndex: boolean;
    indexName: string;
  };
}

interface LogsViewerState {
  /** 字段下钻、格式化相关配置 */
  fieldConfig?: Props['fieldConfig'];
  indexData?: Props['indexData'];
  range?: Props['range'];
  getAddToQueryInfo?: Props['getAddToQueryInfo'];
}
export const LogsViewerStateContext = createContext({} as LogsViewerState);

export default function LogsViewer(props: Props) {
  const { t } = useTranslation('explorer');
  const {
    timeField,
    hideHistogram = false,
    histogramLoading = false,
    histogram,
    loading,
    logs,
    fields,
    onOptionsChange,
    onAddToQuery,
    onRangeChange,
    onLogRequestParamsChange,
    onScrollCapture,
    rowPrefixRender,
    filterFields,
    histogramExtraRender,
    optionsExtraRender,
    showDateField = true,
    stacked = false,
    histogramXTitle,
  } = props;
  const [options, setOptions] = useState(props.options);

  const updateOptions = (newOptions) => {
    onOptionsChange?.(newOptions);
  };

  useEffect(() => {
    setOptions(props.options);
  }, [props.options]);

  return (
    <LogsViewerStateContext.Provider
      value={{
        fieldConfig: props.fieldConfig,
        indexData: props.indexData,
        range: props.range,
        getAddToQueryInfo: props.getAddToQueryInfo,
      }}
    >
      <>
        {!hideHistogram && (
          <div className='h-[130px]'>
            <div className='mt-1 px-2 flex justify-between'>
              <Space>
                <Spin spinning={histogramLoading} size='small' />
              </Space>
              {histogramExtraRender}
            </div>
            <div className='h-[120px]'>
              {props.range && histogram && (
                <HistogramChart
                  series={histogram}
                  stacked={stacked}
                  histogramXTitle={histogramXTitle}
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
          <div className='flex justify-between p-2 pt-0'>
            <Space>
              <Radio.Group
                size='small'
                optionType='button'
                buttonStyle='solid'
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
              <OriginSettings showDateField={showDateField} options={options} setOptions={updateOptions} fields={fields} />
              <FullscreenButton />
              <Spin spinning={loading} size='small' />
            </Space>
            {optionsExtraRender}
          </div>
          <div className='min-h-0' onScrollCapture={onScrollCapture}>
            <div className='n9e-antd-table-height-full'>
              {options.logMode === 'origin' && (
                <Raw
                  timeField={timeField}
                  data={logs}
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
                />
              )}
              {options.logMode === 'table' && (
                <Table
                  timeField={timeField}
                  data={logs}
                  options={options}
                  onValueFilter={onAddToQuery}
                  scroll={{
                    x: 'max-content',
                    y: 'calc(100% - 40px)',
                  }}
                  filterFields={filterFields}
                />
              )}
            </div>
          </div>
        </FullscreenButton.Provider>
      </>
    </LogsViewerStateContext.Provider>
  );
}
