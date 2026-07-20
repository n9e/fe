import React, { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Empty, Pagination, Space } from 'antd';
import { Form } from 'antd';
import { useRequest } from 'ahooks';
import { Trans, useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import LogsViewer from '@/pages/logExplorer/components/LogsViewer';
import calcColWidthByData from '@/pages/logExplorer/components/LogsViewer/utils/calcColWidthByData';
import getFieldsFromTableData from '@/pages/logExplorer/components/LogsViewer/utils/getFieldsFromTableData';

import { NAME_SPACE } from '../../../constants';
import { DEFAULT_LOGS_PAGE_SIZE, DEFAULT_RAW_LOG_LIMIT, DEFAULT_TIME_FIELD, LOGS_OPTIONS_CACHE_KEY, LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY, MAX_RAW_LOG_LIMIT } from '../../constants';
import { getHistogram, logsQuery } from '../../services';
import { Field, LokiLogRow } from '../../types';
import filteredFields from '../../utils/filteredFields';
import { flattenFieldGroup } from '../../utils/logFields';
import { getOptionsFromLocalstorage, setOptionsToLocalstorage } from '../../utils/optionsLocalstorage';
import renderBuiltinFields from '../../utils/renderBuiltinFields';
import renderLogViewerFieldValueWithoutFilters from '../../utils/renderLogViewerFieldValueWithoutFilters';
import ContextViewer from './components/ContextViewer';
import { buildLogHighlights, getLineHighlightFilters } from './utils/highlights';

interface Props {
  indexData: Field[];
  setExecuteLoading: (loading: boolean) => void;
  executeQuery: () => void;
  snapRangeResetKey?: string;
}

interface LogsData {
  list: Record<string, any>[];
  total: number;
  limit: number;
  hash: string;
  colWidths?: Record<string, number>;
  fields: string[];
}

interface HistogramData {
  data: any[];
  hash: string;
}

function normalizeLimit(limit?: number) {
  const value = _.toNumber(limit || DEFAULT_RAW_LOG_LIMIT);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_RAW_LOG_LIMIT;
  return Math.min(Math.floor(value), MAX_RAW_LOG_LIMIT);
}

function transformLogRow(item: LokiLogRow) {
  const labels = item.labels || {};
  const parsedFields = item.parsed_fields || {};
  const row = {
    ...flattenFieldGroup('labels', labels),
    ...flattenFieldGroup('parsed_fields', parsedFields),
    timestamp: item.timestamp,
    __timestamp__: item.__timestamp__,
    line: item.line || '',
    labels,
    parsed_fields: parsedFields,
  };
  return {
    ...row,
    ___raw___: {
      __timestamp__: item.__timestamp__,
      line: item.line || '',
      labels,
      parsed_fields: parsedFields,
    },
    ___id___: _.uniqueId('loki_log_'),
  };
}

function pickVisibleFields(row: Record<string, any>) {
  return _.pick(row, filteredFields(_.keys(row)));
}

function formatTimestamp(value?: string | number) {
  if (!value) return '-';
  return moment(value).format('MM-DD HH:mm:ss.SSS');
}

export default function Raw(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { indexData, setExecuteLoading, executeQuery, snapRangeResetKey } = props;
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch('datasourceValue');
  const queryValues = Form.useWatch('query');
  const [options, setOptions] = useState({
    ...getOptionsFromLocalstorage(LOGS_OPTIONS_CACHE_KEY),
    pageLoadMode: 'pagination' as 'pagination',
  });
  const [serviceParams, setServiceParams] = useState({
    current: 1,
    pageSize: DEFAULT_LOGS_PAGE_SIZE,
    reverse: true,
  });
  const reverseRef = useRef(serviceParams.reverse);
  reverseRef.current = serviceParams.reverse;
  const loadTimeRef = useRef<number | null>(null);
  const rangeRef = useRef<{
    from: number;
    to: number;
  }>();
  const snapRangeRef = useRef<{
    from?: number;
    to?: number;
  }>({});
  const snapRangeResetKeyRef = useRef<string>();

  if (snapRangeResetKey && snapRangeResetKeyRef.current !== snapRangeResetKey) {
    snapRangeRef.current = {};
    snapRangeResetKeyRef.current = snapRangeResetKey;
  }

  const organizeFields = options.organizeFields;
  const setOrganizeFields = (newOrganizeFields?: string[]) => {
    updateOptions({ organizeFields: newOrganizeFields || [] });
  };

  const updateOptions = (newOptions) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
      pageLoadMode: 'pagination' as 'pagination',
    };
    setOptions(mergedOptions);
    setOptionsToLocalstorage(LOGS_OPTIONS_CACHE_KEY, mergedOptions);
  };

  const service = () => {
    const latestQueryValues = form.getFieldValue('query');
    if (refreshFlag && datasourceValue && latestQueryValues?.range) {
      const parsedRange = parseRange(latestQueryValues.range);
      let timeParams = {
        from: moment(parsedRange.start).valueOf(),
        to: moment(parsedRange.end).valueOf(),
      };
      if (snapRangeRef.current?.from && snapRangeRef.current?.to) {
        timeParams = snapRangeRef.current as { from: number; to: number };
      }
      rangeRef.current = timeParams;
      const limit = normalizeLimit(latestQueryValues.limit);
      const queryStart = Date.now();
      return logsQuery({
        cate: DatasourceCateEnum.loki,
        datasource_id: datasourceValue,
        query: [
          {
            query: _.trim(latestQueryValues.query),
            start: moment(timeParams.from).valueOf(),
            end: moment(timeParams.to).valueOf(),
            limit,
            reverse: reverseRef.current,
            ref: 'A',
          },
        ],
      })
        .then((res) => {
          loadTimeRef.current = Date.now() - queryStart;
          const list = _.map(res.list || [], transformLogRow);
          const visibleList = _.map(list, pickVisibleFields);
          return {
            list,
            total: _.toNumber(res.total || 0),
            limit,
            hash: _.uniqueId('logs_'),
            colWidths: calcColWidthByData(visibleList),
            fields: filteredFields(getFieldsFromTableData(visibleList)),
          };
        })
        .catch(() => {
          loadTimeRef.current = null;
          return {
            list: [],
            total: 0,
            limit,
            hash: _.uniqueId('logs_'),
            fields: [],
          };
        });
    }
    return Promise.resolve({
      list: [],
      total: 0,
      limit: normalizeLimit(),
      hash: _.uniqueId('logs_'),
      fields: [],
    });
  };

  const {
    data,
    loading,
    run: fetchLogs,
  } = useRequest<LogsData, any>(service, {
    manual: true,
  });

  const histogramService = () => {
    const latestQueryValues = form.getFieldValue('query');
    if (refreshFlag && datasourceValue && latestQueryValues?.range) {
      const range = parseRange(latestQueryValues.range);
      return getHistogram({
        cate: DatasourceCateEnum.loki,
        datasource_id: datasourceValue,
        query: [
          {
            query: _.trim(latestQueryValues.query),
            start: moment(range.start).valueOf(),
            end: moment(range.end).valueOf(),
          },
        ],
      })
        .then((res) => {
          return {
            data: _.map(res, (item) => ({
              id: _.uniqueId('series_'),
              ref: item.ref,
              name: _.isEmpty(item.metric)
                ? item.ref || 'logs'
                : _.join(
                    _.map(item.metric, (value, key) => `${key}: ${value}`),
                    ' ',
                  ),
              metric: item.metric || {},
              data: _.map(item.values || [], (value) => [value[0], value[1] === null ? 0 : value[1]]),
            })),
            hash: _.uniqueId('histogram_'),
          };
        })
        .catch(() => {
          return {
            data: [],
            hash: _.uniqueId('histogram_'),
          };
        });
    }
    return Promise.resolve({
      data: [],
      hash: _.uniqueId('histogram_'),
    });
  };

  const { data: histogramData, loading: histogramLoading } = useRequest<HistogramData, any>(histogramService, {
    refreshDeps: [refreshFlag],
  });

  useEffect(() => {
    if (refreshFlag) {
      setServiceParams((prev) => ({ ...prev, current: 1 }));
      fetchLogs();
    }
  }, [refreshFlag]);

  useEffect(() => {
    setExecuteLoading(loading || histogramLoading);
  }, [loading, histogramLoading, setExecuteLoading]);

  const pageLogs = useMemo(() => {
    const list = data?.list || [];
    return _.slice(list, (serviceParams.current - 1) * serviceParams.pageSize, serviceParams.current * serviceParams.pageSize);
  }, [data?.hash, serviceParams.current, serviceParams.pageSize]);
  const lineHighlightFilters = useMemo(
    () => getLineHighlightFilters(queryValues),
    [queryValues?.query, queryValues?.querySource, queryValues?.builderStatus, queryValues?.builder],
  );
  const highlights = useMemo(() => buildLogHighlights(pageLogs, lineHighlightFilters), [pageLogs, lineHighlightFilters]);

  return refreshFlag ? (
    <>
      {!_.isEmpty(data?.list) || !_.isEmpty(histogramData?.data) ? (
        <LogsViewer
          indexData={indexData}
          id_key='___id___'
          raw_key='___raw___'
          timeField={DEFAULT_TIME_FIELD}
          range={queryValues?.range}
          histogramLoading={histogramLoading}
          histogram={histogramData?.data || []}
          histogramHash={histogramData?.hash}
          loading={loading}
          logs={pageLogs}
          highlights={highlights}
          logsHash={`${data?.hash}_${serviceParams.current}_${serviceParams.pageSize}`}
          logTotal={data?.total}
          fields={data?.fields || []}
          linesColumnFormat={(pageRelativeLineNum) => {
            return (serviceParams.current - 1) * serviceParams.pageSize + pageRelativeLineNum;
          }}
          colWidths={data?.colWidths}
          options={options}
          onOptionsChange={updateOptions}
          organizeFields={organizeFields}
          setOrganizeFields={setOrganizeFields}
          filterFields={(fieldKeys) => filteredFields(fieldKeys, organizeFields)}
          logViewerFilterFields={(log) => filteredFields(_.keys(log), organizeFields)}
          logViewerRenderCustomTagsArea={renderBuiltinFields}
          logViewerExtraRender={(log) => <ContextViewer log={log as LokiLogRow & Record<string, any>} datasourceValue={datasourceValue} lineFilters={lineHighlightFilters} />}
          customLogFieldRender={renderLogViewerFieldValueWithoutFilters}
          hideTypeIcon
          renderHistogramAddonAfterRender={(toggleNode) => {
            if (rangeRef.current) {
              return (
                <Space>
                  {moment(rangeRef.current.from).format('YYYY-MM-DD HH:mm:ss.SSS')} ~ {moment(rangeRef.current.to).format('YYYY-MM-DD HH:mm:ss.SSS')}
                  {toggleNode}
                </Space>
              );
            }
            return toggleNode;
          }}
          onRangeChange={(range) => {
            snapRangeRef.current = {};
            const query = form.getFieldValue('query') || {};
            form.setFieldsValue({
              query: {
                ...query,
                range,
              },
            });
            executeQuery();
          }}
          onLogRequestParamsChange={(params) => {
            if (params.from && params.to) {
              snapRangeRef.current = {
                from: params.from * 1000,
                to: params.to * 1000,
              };
              setServiceParams((prev) => ({
                ...prev,
                current: 1,
              }));
              fetchLogs();
            }
            if (params.reverse !== undefined) {
              reverseRef.current = params.reverse;
              setServiceParams((prev) => ({
                ...prev,
                current: 1,
                reverse: params.reverse,
              }));
              fetchLogs();
            }
          }}
          tableColumnsWidthCacheKey={`${LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY}-${datasourceValue || 'default'}`}
          timeFieldColumnFormat={formatTimestamp}
          optionsExtraRender={
            <Space>
              {loadTimeRef.current !== null && (
                <Space size={4}>
                  <span>{t(`${logExplorerNS}:logs.duration`)} :</span>
                  <span>{loadTimeRef.current} ms</span>
                </Space>
              )}
              <Pagination
                showQuickJumper
                size='small'
                total={data?.list.length || 0}
                current={serviceParams.current}
                pageSize={serviceParams.pageSize}
                onChange={(current, pageSize) => {
                  setServiceParams((prev) => ({
                    ...prev,
                    current,
                    pageSize,
                  }));
                }}
                showTotal={(total) => {
                  return (
                    <Space>
                      <span>{t(`${logExplorerNS}:logs.count`)} :</span>
                      <span>{data?.total ?? total}</span>
                      <span className='text-hint'>
                        / {t('builder.limit')} : {data?.limit || normalizeLimit(queryValues?.limit)}
                      </span>
                    </Space>
                  );
                }}
              />
            </Space>
          }
        />
      ) : loading || histogramLoading ? (
        <div className='flex justify-center'>
          <Empty className='ant-empty-normal' image='/image/img_executing.svg' description={t(`${logExplorerNS}:loading`)} imageStyle={{ height: 80 }} />
        </div>
      ) : (
        <div className='flex justify-center'>
          <Empty className='ant-empty-normal' image='/image/img_empty.svg' description={t(`${logExplorerNS}:no_data`)} imageStyle={{ height: 80 }} />
        </div>
      )}
    </>
  ) : (
    <div className='h-full flex items-center justify-center'>
      <Empty
        className='ant-empty-normal'
        image='/image/img_execute.svg'
        description={
          <Trans
            ns={logExplorerNS}
            i18nKey='before_query'
            components={{
              b: (
                <a
                  onClick={() => {
                    executeQuery();
                  }}
                />
              ),
            }}
          />
        }
        imageStyle={{ height: 80 }}
      />
    </div>
  );
}
