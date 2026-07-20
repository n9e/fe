import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Empty, message, Pagination, Space } from 'antd';
import { Form } from 'antd';
import { useRequest } from 'ahooks';
import { Trans, useTranslation } from 'react-i18next';

import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import LogsViewer from '@/pages/logExplorer/components/LogsViewer';
import calcColWidthByData from '@/pages/logExplorer/components/LogsViewer/utils/calcColWidthByData';

import { NAME_SPACE } from '../../../constants';
import { DEFAULT_LOGS_PAGE_SIZE, DEFAULT_TIME_FIELD, LOGS_OPTIONS_CACHE_KEY, LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY } from '../../constants';
import { getHistogram, logsQuery } from '../../services';
import { Field } from '../../types';
import filteredFields, { filterOutBuiltinFields } from '../../utils/filteredFields';
import { getOptionsFromLocalstorage, setOptionsToLocalstorage } from '../../utils/optionsLocalstorage';
import renderBuiltinFields from '../../utils/renderBuiltinFields';
import renderLogViewerFieldValueWithoutFilters from '../../utils/renderLogViewerFieldValueWithoutFilters';
import { getIsAtBottom, scrollToTop } from '../../utils/tableElementMethods';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

interface Props {
  tableSelector: {
    antd: string;
    rgd: string;
  };
  indexData: Field[];
  setExecuteLoading: (loading: boolean) => void;
  executeQuery: () => void;
}

interface LogsData {
  list: Record<string, any>[];
  total: number;
  hash: string;
  colWidths?: Record<string, number>;
  fields: string[];
}

interface HistogramData {
  data: any[];
  hash: string;
}

function getFields(logs: Record<string, any>[]) {
  const fields: string[] = [];
  _.forEach(logs, (log) => {
    _.forEach(log, (_val, key) => {
      if (!_.includes(fields, key)) {
        fields.push(key);
      }
    });
  });
  return filterOutBuiltinFields(_.sortBy(fields));
}

function isNoDataError(error: any) {
  const code = _.toLower(
    _.toString(error?.code || error?.error_type || error?.errorType || error?.data?.code || error?.response?.data?.code || error?.response?.data?.error_type || ''),
  );
  if (code === 'no_data' || code === 'no-data') return true;

  const legacyMessage = _.toLower(_.trim(_.toString(error?.message || error?.msg || error?.data?.message || error?.response?.data?.message || error?.response?.data?.msg || '')));
  return legacyMessage === 'no data';
}

export default function Raw(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { tableSelector, indexData, setExecuteLoading, executeQuery } = props;
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch('datasourceValue');
  const queryValues = Form.useWatch('query');
  const [options, setOptions] = useState(getOptionsFromLocalstorage(LOGS_OPTIONS_CACHE_KEY));
  const pageLoadMode = options.pageLoadMode || 'pagination';
  const appendRef = useRef(false);
  const fixedRangeRef = useRef(false);
  const loadTimeRef = useRef<number | null>(null);
  const [serviceParams, setServiceParams] = useState({
    current: 1,
    pageSize: DEFAULT_LOGS_PAGE_SIZE,
    reverse: true,
    refreshFlag: undefined as string | undefined,
  });
  const rangeRef = useRef<{
    from: number;
    to: number;
  }>();
  const snapRangeRef = useRef<{
    from?: number;
    to?: number;
  }>({});

  const updateOptions = (newOptions, reload?: boolean) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
    setOptionsToLocalstorage(LOGS_OPTIONS_CACHE_KEY, mergedOptions);
    if (reload) {
      appendRef.current = false;
      setServiceParams({
        current: 1,
        pageSize: DEFAULT_LOGS_PAGE_SIZE,
        reverse: true,
        refreshFlag: _.uniqueId('refreshFlag_'),
      });
    }
  };

  const service = () => {
    const latestQueryValues = form.getFieldValue('query');
    if (refreshFlag && datasourceValue && latestQueryValues?.range) {
      const parsedRange = parseRange(latestQueryValues.range);
      let timeParams =
        fixedRangeRef.current === false
          ? {
              from: moment(parsedRange.start).valueOf(),
              to: moment(parsedRange.end).valueOf(),
            }
          : rangeRef.current!;
      if (snapRangeRef.current?.from && snapRangeRef.current?.to) {
        timeParams = snapRangeRef.current as { from: number; to: number };
      }
      rangeRef.current = timeParams;
      const queryStart = Date.now();
      return logsQuery({
        cate: DatasourceCateEnum.victorialogs,
        datasource_id: datasourceValue,
        query: [
          {
            query: _.trim(latestQueryValues.query || '*') || '*',
            start: moment(timeParams.from).unix(),
            end: moment(timeParams.to).unix(),
            limit: serviceParams.pageSize,
            offset: (serviceParams.current - 1) * serviceParams.pageSize,
            ref: 'A',
            reverse: serviceParams.reverse,
          },
        ],
      })
        .then((res) => {
          if (fixedRangeRef.current === false) {
            loadTimeRef.current = Date.now() - queryStart;
          }
          const newData = _.map(res.list || [], (item) => {
            return {
              ...item,
              __n9e_raw_n9e__: item,
              __n9e_id_n9e__: _.uniqueId('log_id_'),
            };
          });
          if (appendRef.current) {
            appendRef.current = false;
            const mergedList = _.concat(data?.list || [], newData);
            return {
              list: mergedList,
              total: res.total,
              hash: _.uniqueId('logs_'),
              colWidths: calcColWidthByData(mergedList),
              fields: getFields(mergedList),
            };
          }
          if (pageLoadMode === 'infiniteScroll') {
            scrollToTop(tableSelector.antd, tableSelector.rgd);
          }
          appendRef.current = false;
          return {
            list: newData,
            total: res.total,
            hash: _.uniqueId('logs_'),
            colWidths: calcColWidthByData(newData),
            fields: getFields(newData),
          };
        })
        .catch((e: any) => {
          appendRef.current = false;
          if (isNoDataError(e)) {
            return {
              list: [],
              total: 0,
              hash: _.uniqueId('logs_'),
              fields: [],
            };
          }
          message.error(e?.message || e?.msg || 'Query failed');
          loadTimeRef.current = null;
          return {
            list: [],
            total: 0,
            hash: _.uniqueId('logs_'),
            fields: [],
          };
        })
        .finally(() => {
          fixedRangeRef.current = false;
        });
    }
    return Promise.resolve({
      list: [],
      total: 0,
      hash: _.uniqueId('logs_'),
      fields: [],
    });
  };

  const {
    data,
    loading,
    run: fetchLogs,
  } = useRequest<LogsData, any>(service, {
    refreshDeps: [JSON.stringify(serviceParams)],
  });

  const histogramService = () => {
    const latestQueryValues = form.getFieldValue('query');
    if (refreshFlag && datasourceValue && latestQueryValues?.range) {
      const range = parseRange(latestQueryValues.range);
      return getHistogram({
        cate: DatasourceCateEnum.victorialogs,
        datasource_id: datasourceValue,
        query: [
          {
            query: _.trim(latestQueryValues.query || '*') || '*',
            start: moment(range.start).unix(),
            end: moment(range.end).unix(),
          },
        ],
      })
        .then((res) => {
          return {
            data: _.map(res, (item) => ({
              id: _.uniqueId('series_'),
              ref: item.ref,
              name: item.ref || 'logs',
              metric: item.ref || 'logs',
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
      appendRef.current = false;
      if (serviceParams.current !== 1) {
        setServiceParams((prev) => ({
          ...prev,
          current: 1,
        }));
      } else {
        fetchLogs();
      }
    }
  }, [refreshFlag]);

  useEffect(() => {
    setExecuteLoading(loading || histogramLoading);
  }, [loading, histogramLoading, setExecuteLoading]);

  const organizeFields = options.organizeFields;
  const setOrganizeFields = (newOrganizeFields?: string[]) => {
    updateOptions({ organizeFields: newOrganizeFields || [] });
  };

  return refreshFlag ? (
    <>
      {!_.isEmpty(data?.list) || !_.isEmpty(histogramData?.data) ? (
        <LogsViewer
          indexData={indexData}
          range={queryValues?.range}
          id_key='__n9e_id_n9e__'
          raw_key='__n9e_raw_n9e__'
          timeField={DEFAULT_TIME_FIELD}
          histogramLoading={histogramLoading}
          histogram={histogramData?.data || []}
          histogramHash={histogramData?.hash}
          loading={loading}
          logs={data?.list || []}
          logsHash={data?.hash}
          fields={data?.fields || []}
          hideTypeIcon
          options={options}
          organizeFields={organizeFields}
          setOrganizeFields={setOrganizeFields}
          filterFields={(fieldKeys) => filteredFields(fieldKeys, organizeFields)}
          logViewerFilterFields={(log) => filteredFields(_.keys(log), organizeFields)}
          logViewerRenderCustomTagsArea={renderBuiltinFields}
          customLogFieldRender={renderLogViewerFieldValueWithoutFilters}
          renderHistogramAddonAfterRender={(toggleNode) => {
            if (data) {
              return (
                <Space>
                  {rangeRef.current && (
                    <>
                      {moment(rangeRef.current?.from).format('YYYY-MM-DD HH:mm:ss.SSS')} ~ {moment(rangeRef.current?.to).format('YYYY-MM-DD HH:mm:ss.SSS')}
                    </>
                  )}
                  {toggleNode}
                  {IS_PLUS && <DownloadModal marginLeft={0} queryData={{ ...form.getFieldsValue(), mode: 'query', total: data?.total }} />}
                </Space>
              );
            }
            return toggleNode;
          }}
          colWidths={data?.colWidths}
          tableColumnsWidthCacheKey={`${LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY}${JSON.stringify({ datasourceValue })}`}
          optionsExtraRender={
            <Space>
              {loadTimeRef.current !== null && (
                <Space size={4}>
                  <span>{t(`${logExplorerNS}:logs.duration`)} :</span>
                  <span>{loadTimeRef.current} ms</span>
                </Space>
              )}
              {pageLoadMode === 'pagination' ? (
                <Pagination
                  showQuickJumper
                  size='small'
                  total={data?.total}
                  current={serviceParams.current}
                  pageSize={serviceParams.pageSize}
                  onChange={(current, pageSize) => {
                    appendRef.current = false;
                    fixedRangeRef.current = true;
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
                        <span>{total}</span>
                      </Space>
                    );
                  }}
                />
              ) : (
                <Space size={4}>
                  <span>{t(`${logExplorerNS}:logs.count`)} :</span>
                  <span>{data?.total}</span>
                </Space>
              )}
            </Space>
          }
          onOptionsChange={updateOptions}
          onScrollCapture={() => {
            if (loading || pageLoadMode !== 'infiniteScroll') return;
            const isAtBottom = getIsAtBottom(tableSelector.antd, tableSelector.rgd);
            if (isAtBottom && data && data.list.length < data.total) {
              appendRef.current = true;
              fixedRangeRef.current = true;
              setServiceParams((prev) => ({
                ...prev,
                current: prev.current + 1,
              }));
            }
          }}
          onRangeChange={(range) => {
            const query = form.getFieldValue('query') || {};
            snapRangeRef.current = {};
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
                refreshFlag: _.uniqueId('refreshFlag_'),
              }));
            }
            if (params.reverse !== undefined) {
              setServiceParams((prev) => ({
                ...prev,
                current: 1,
                reverse: params.reverse,
              }));
            }
          }}
          linesColumnFormat={(val) => {
            if (pageLoadMode === 'infiniteScroll') return val;
            return serviceParams.pageSize * (serviceParams.current - 1) + val;
          }}
        />
      ) : (
        <div className='h-full flex items-center justify-center'>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
