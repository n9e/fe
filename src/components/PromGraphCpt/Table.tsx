import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import moment from 'moment';
import _ from 'lodash';
import { Input, DatePicker, Space, Button, message, Popover, Table as AntdTable } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { json2csv } from 'json-2-csv';

import UnitPicker from '@/pages/dashboard/Components/UnitPicker';
import { instantInterpolateString } from '@/components/PromQLInputNG';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { downloadFile } from '@/pages/alertRules/List/utils';

import { getPromData } from './services';
import { QueryStats } from './components/QueryStatsView';
import { formatPrometheusValue } from './value';

interface IProps {
  url: string;
  datasourceValue: number;
  promql?: string;
  setQueryStats?: (stats: QueryStats) => void;
  setErrorContent: (content: string) => void;
  contentMaxHeight?: number;
  timestamp?: number;
  setTimestamp: (timestamp?: number) => void;
  refreshFlag?: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  defaultUnit?: string;
  showUnitPicker?: boolean; // 是否显示单位选择器
  controlsPortalDomNode?: HTMLDivElement | null; // 用于渲染控件的容器节点
  showExportButton?: boolean; // 是否显示导出按钮
  seriesFilterText?: string;
  onSeriesFilterTextChange?: (value: string) => void;
  onQueryRequest?: () => void;
}
type ResultType = 'matrix' | 'vector' | 'scalar' | 'string' | 'streams';

const LIMIT = 1000;

function getListItemLabel(resultType, record) {
  const { metric } = record;
  if (resultType === 'scalar') return 'scalar';
  if (resultType === 'string') return 'string';
  const metricName = metric?.__name__;
  const labels = _.keys(metric)
    .filter((ml) => ml !== '__name__')
    .map((label, i, labels) => (
      <span key={i}>
        <strong className='prom-graph-table-label-key'>{label}</strong>="{metric[label]}"{i === labels.length - 1 ? '' : ', '}
      </span>
    ));
  return (
    <>
      <span className='prom-graph-table-metric-name'>{metricName}</span>
      <span className='prom-graph-table-bracket'>{'{'}</span>
      {labels}
      <span className='prom-graph-table-bracket'>{'}'}</span>
    </>
  );
}

function getListItemName(resultType, record) {
  if (resultType === 'scalar') return 'scalar';
  if (resultType === 'string') return 'string';

  const metric = record?.metric || {};
  const metricName = metric.__name__ || '';
  const labels = _.keys(metric)
    .filter((label) => label !== '__name__')
    .map((label) => `${label}="${metric[label]}"`);

  return `${metricName}{${labels.join(', ')}}`;
}

// step 只取整数部分(秒)
function toFixedNoRound(num1 = 0, num2 = 0) {
  const num1Str = num1.toFixed(0);
  const num2Str = num2.toFixed(0);
  return _.toNumber(num1Str) - _.toNumber(num2Str);
}

function getListItemValue(resultType, record, unit) {
  if (resultType === 'scalar' || resultType === 'string') {
    return formatPrometheusValue(_.get(record, '[1]'), unit);
  }
  if (resultType === 'vector') {
    return formatPrometheusValue(_.get(record, 'value[1]'), unit);
  }
  if (resultType === 'matrix' || resultType === 'streams') {
    const values = _.get(record, 'values');
    return (
      <div style={{ display: 'table' }}>
        {_.map(values, (value, i: number) => {
          const timestamp = _.get(value, 0);
          return (
            <div key={i} style={{ display: 'table-row' }}>
              <span style={{ display: 'table-cell', padding: '0 4px' }}>{formatPrometheusValue(_.get(value, 1), unit)}</span>
              <span style={{ display: 'table-cell', padding: '0 4px' }}>@{timestamp || '-'}</span>
              <span style={{ display: 'table-cell', padding: '0 4px' }}>{moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>
              <span style={{ display: 'table-cell', padding: '0 4px' }}>{i > 0 ? `+${toFixedNoRound(timestamp, _.get(values[i - 1], 0))}` : ''}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

export default function Table(props: IProps) {
  const { t } = useTranslation('promGraphCpt');
  const {
    url,
    datasourceValue,
    promql,
    setQueryStats,
    setErrorContent,
    contentMaxHeight,
    timestamp,
    setTimestamp,
    refreshFlag,
    loading,
    setLoading,
    defaultUnit,
    showUnitPicker = true,
    controlsPortalDomNode,
    showExportButton = false,
    seriesFilterText: controlledSeriesFilterText,
    onSeriesFilterTextChange,
    onQueryRequest,
  } = props;
  const [data, setData] = useState<{
    resultType: ResultType;
    result: any[];
  }>({
    resultType: 'matrix',
    result: [],
  });
  const [unit, setUnit] = useState(defaultUnit || 'sishort');
  const [internalSeriesFilterText, setInternalSeriesFilterText] = useState('');
  const [seriesFilterVisible, setSeriesFilterVisible] = useState(false);
  const seriesFilterText = controlledSeriesFilterText ?? internalSeriesFilterText;
  const setSeriesFilterText = (value: string) => {
    onSeriesFilterTextChange?.(value);
    if (controlledSeriesFilterText === undefined) {
      setInternalSeriesFilterText(value);
    }
  };
  const rawResultRef = useRef<any[]>([]);
  const controls = (
    <Space>
      <InputGroupWithFormItem label={t('promGraphCpt:time')}>
        <DatePicker
          value={timestamp ? moment.unix(timestamp) : undefined}
          onChange={(val) => {
            setTimestamp(val ? val.unix() : undefined);
          }}
          showTime
          placeholder={t('promGraphCpt:evaluation_time')}
          getPopupContainer={() => document.body}
          disabledDate={(current) => current > moment()}
        />
      </InputGroupWithFormItem>
      {showUnitPicker && (
        <InputGroupWithFormItem label={t('promGraphCpt:unit')}>
          <UnitPicker
            dropdownMatchSelectWidth={false}
            value={unit}
            onChange={(val) => {
              setUnit(val);
            }}
          />
        </InputGroupWithFormItem>
      )}
      {showExportButton && (
        <Button
          disabled={_.isEmpty(rawResultRef.current)}
          onClick={() => {
            json2csv(rawResultRef.current, (err, csv) => {
              if (err) {
                message.error(t('common:error.export'));
                console.warn('导出 prometheus 即时查询 Table 数据失败', err);
              } else {
                downloadFile(csv, `prometheus_explorer_table_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
              }
            });
          }}
        >
          {t('common:btn.export_csv')}
        </Button>
      )}
    </Space>
  );

  useEffect(() => {
    if (datasourceValue && promql) {
      onQueryRequest?.();
      const queryStart = Date.now();
      setLoading(true);
      getPromData(`${url}/${datasourceValue}/api/v1/query`, {
        time: timestamp || moment().unix(),
        query: instantInterpolateString({
          query: promql,
          time: timestamp ? moment.unix(timestamp) : undefined,
        }),
      })
        .then((res) => {
          const { resultType } = res;
          let { result } = res;
          // 保存全量原始数据用于 CSV 导出
          rawResultRef.current = result;
          let tooLong = false;
          let maxLength = 0;
          if (result) {
            if (result.length > LIMIT) {
              tooLong = true;
              maxLength = result.length;
              result = result.slice(0, LIMIT);
            }
            result.forEach((item) => {
              if (item.values && item.values.length > LIMIT) {
                tooLong = true;
                if (item.values.length > maxLength) {
                  maxLength = item.values.length;
                }
                item.values = item.values.slice(0, LIMIT);
              }
            });
          }
          if (tooLong) {
            setErrorContent(`Warning：Fetched ${maxLength} metrics, only displaying first ${LIMIT}`);
          } else {
            setErrorContent('');
          }
          if (resultType === 'scalar' || resultType === 'string') {
            setData({ resultType, result: [result] });
          } else {
            setData({ resultType, result });
          }
          setQueryStats &&
            setQueryStats({
              loadTime: Date.now() - queryStart,
              resultSeries: result.length,
            });
        })
        .catch((err) => {
          const msg = _.get(err, 'message');
          setErrorContent(`Error executing query: ${msg}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [timestamp, datasourceValue, promql, refreshFlag, onQueryRequest]);

  useEffect(() => {
    if (defaultUnit) {
      setUnit(defaultUnit);
    }
  }, [defaultUnit]);

  const filteredResult = useMemo(() => {
    if (!seriesFilterText) return data.result;
    const keyword = seriesFilterText.toLowerCase();
    return data.result.filter((item) => getListItemName(data.resultType, item).toLowerCase().includes(keyword));
  }, [data, seriesFilterText]);

  const columns = [
    {
      title: (
        <Popover
          placement='topLeft'
          trigger='click'
          visible={seriesFilterVisible}
          onVisibleChange={setSeriesFilterVisible}
          content={
            <SeriesFilterDropdown
              initialValue={seriesFilterText}
              onConfirm={(value) => {
                setSeriesFilterText(value);
                setSeriesFilterVisible(false);
              }}
            />
          }
          getPopupContainer={() => document.body}
          destroyTooltipOnHide
        >
          <Space>
            <span>{t('series', { count: filteredResult.length })}</span>
            <SearchOutlined className='cursor-pointer' style={{ color: seriesFilterText ? 'var(--fc-primary-color)' : undefined }} title={t('series_filter')} />
            {seriesFilterText && <span className='text-soft'>({t('filtered')})</span>}
          </Space>
        </Popover>
      ),
      dataIndex: 'name',
      render: (_text, record) => <div style={{ wordBreak: 'break-all' }}>{data.resultType !== 'streams' && getListItemLabel(data.resultType, record)}</div>,
    },
    {
      title: t('value'),
      dataIndex: 'value',
      className: 'prom-graph-table-value',
      render: (_text, record) => <div>{getListItemValue(data.resultType, record, unit)}</div>,
    },
  ];

  return (
    <div className='prom-graph-table-container'>
      {controlsPortalDomNode ? createPortal(controls, controlsPortalDomNode) : controls}
      <AntdTable
        className='prom-graph-table-list'
        style={{
          maxHeight: contentMaxHeight,
        }}
        size='small'
        loading={loading}
        rowKey={(_record, index) => index!}
        dataSource={filteredResult}
        columns={columns}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}

function SeriesFilterDropdown({ initialValue, onConfirm }: { initialValue: string; onConfirm: (value: string) => void }) {
  const { t } = useTranslation('promGraphCpt');
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className='flex items-center gap-2'>
      <Input
        allowClear
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={() => onConfirm(value)}
        style={{ width: 160 }}
        size='small'
        placeholder={t('series_filter')}
      />
      <Button type='primary' size='small' onClick={() => onConfirm(value)}>
        {t('common:btn.ok')}
      </Button>
    </div>
  );
}
