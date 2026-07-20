import React, { useContext, useEffect, useState } from 'react';
import { Badge, Button, Col, Form, Modal, Row, Segmented } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../constants';
import { BUILDER_PINNED_CACHE_KEY, METRIC_DEFAULT_QUERY, RAW_DEFAULT_QUERY } from '../constants';
import { Field } from '../types';
import Builder from '../Builder';
import { inferMetricTimeseriesKeys } from '../utils/logsQL';
import MainMoreOperations from '../components/MainMoreOperations';
import Metric from './Metric';
import QueryInput, { QueryInputHandle } from './QueryInput';
import Raw from './Raw';

interface Props {
  tabKey: string;
  indexData: Field[];
  executeLoading: boolean;
  setExecuteLoading: (loading: boolean) => void;
  executeQuery: () => void;
}

export default function Main(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange } = useContext(CommonStateContext);
  const { tabKey, indexData, executeLoading, setExecuteLoading, executeQuery } = props;
  const form = Form.useFormInstance();
  const queryValues = Form.useWatch('query', form);
  const mode = queryValues?.mode || 'raw';
  const [queryBuilderPinned, setQueryBuilderPinned] = useState(() => localStorage.getItem(BUILDER_PINNED_CACHE_KEY) === 'true');
  const [queryBuilderVisible, setQueryBuilderVisible] = useState(false);
  const [isContentChangedDotVisible, setIsContentChangedDotVisible] = useState(false);
  const queryInputRef = React.useRef<QueryInputHandle>(null);
  const tableSelector = {
    antd: `.victorialogs-explorer-container-${tabKey} .n9e-event-logs-table .ant-table-body`,
    rgd: `.victorialogs-explorer-container-${tabKey} .n9e-event-logs-table`,
  };

  useEffect(() => {
    setExecuteLoading(false);
  }, [mode]);

  const executeCommittedQuery = () => {
    queryInputRef.current?.commit();
    setIsContentChangedDotVisible(false);
    executeQuery();
  };

  return (
    <div className='flex flex-col flex-1 h-full min-h-0'>
      <div className='flex-shrink-0 relative z-10'>
        <Row gutter={SIZE} wrap={false}>
          <Col flex='none'>
            <Segmented
              value={mode}
              options={[
                { label: t(`${logExplorerNS}:mode.raw_logs`), value: 'raw' },
                { label: t(`${logExplorerNS}:mode.statistical_charts`), value: 'metric' },
              ]}
              onChange={(val) => {
                const nextMode = val as 'raw' | 'metric';
                const currentQuery = _.trim(queryValues?.query);
                const isDefaultQuery = currentQuery === RAW_DEFAULT_QUERY || currentQuery === METRIC_DEFAULT_QUERY;
                // 从统计图表切换到日志原文时，如果查询条件包含管道符，弹窗提示
                if (mode === 'metric' && nextMode === 'raw' && !isDefaultQuery && currentQuery.includes('|')) {
                  Modal.confirm({
                    title: t(`${logExplorerNS}:mode_switch.confirm_title`),
                    content: t(`${logExplorerNS}:mode_switch.confirm_content`),
                    okText: t(`${logExplorerNS}:mode_switch.confirm_ok`),
                    cancelText: t(`${logExplorerNS}:mode_switch.confirm_cancel`),
                    onOk: () => {
                      form.setFieldsValue({
                        query: {
                          ...queryValues,
                          mode: nextMode,
                          query: RAW_DEFAULT_QUERY,
                        },
                      });
                    },
                  });
                  return;
                }
                form.setFieldsValue({
                  query: {
                    ...queryValues,
                    mode: nextMode,
                    query: isDefaultQuery ? (nextMode === 'metric' ? METRIC_DEFAULT_QUERY : RAW_DEFAULT_QUERY) : queryValues?.query,
                  },
                });
              }}
            />
          </Col>
          <Col flex='auto' style={{ minWidth: 0 }}>
            <QueryInput
              ref={queryInputRef}
              executeQuery={() => {
                setIsContentChangedDotVisible(false);
                executeQuery();
              }}
              queryBuilderPinned={queryBuilderPinned}
              queryBuilderVisible={!queryBuilderPinned ? queryBuilderVisible : true}
              onLableClick={() => {
                setQueryBuilderVisible(!queryBuilderVisible);
              }}
              onContentChange={() => {
                setIsContentChangedDotVisible(true);
              }}
            />
          </Col>
          <Col flex='none'>
            <Form.Item name={['query', 'range']} initialValue={logsDefaultRange} noStyle>
              <TimeRangePicker
                onChange={() => {
                  executeCommittedQuery();
                }}
                showMillisecond
              />
            </Form.Item>
          </Col>
          <Col flex='none'>
            <Badge dot={isContentChangedDotVisible}>
              <Button
                type='primary'
                loading={executeLoading}
                onClick={() => {
                  executeCommittedQuery();
                }}
              >
                {t(`${logExplorerNS}:execute`)}
              </Button>
            </Badge>
          </Col>
          <Col flex='none'>
            <MainMoreOperations />
          </Col>
        </Row>
        <Builder
          visible={!queryBuilderPinned ? queryBuilderVisible : true}
          mode={mode}
          onClose={() => {
            if (!queryBuilderPinned) {
              setQueryBuilderVisible(false);
            }
          }}
          queryBuilderPinned={queryBuilderPinned}
          setQueryBuilderPinned={(pinned) => {
            setQueryBuilderPinned(pinned);
            localStorage.setItem(BUILDER_PINNED_CACHE_KEY, pinned ? 'true' : 'false');
            if (pinned) {
              setQueryBuilderVisible(true);
            }
          }}
          onPreviewQL={(query, values) => {
            const oldQuery = form.getFieldValue('query') || {};
            const keys = values.metric ? inferMetricTimeseriesKeys(values.metric) : oldQuery.keys;
            form.setFieldsValue({
              query: {
                ...oldQuery,
                query,
                builder: {
                  ...(oldQuery.builder || {}),
                  raw: values.raw,
                  metric: values.metric,
                },
                builderStatus: 'synced',
                querySource: 'builder',
                vizType: values.vizType || oldQuery.vizType,
                keys,
              },
            });
            setIsContentChangedDotVisible(true);
            setQueryBuilderVisible(false);
          }}
          onExecute={(query, values) => {
            const oldQuery = form.getFieldValue('query') || {};
            const keys = values.metric ? inferMetricTimeseriesKeys(values.metric) : oldQuery.keys;
            form.setFieldsValue({
              query: {
                ...oldQuery,
                query,
                builder: {
                  ...(oldQuery.builder || {}),
                  raw: values.raw,
                  metric: values.metric,
                },
                builderStatus: 'synced',
                querySource: 'builder',
                vizType: values.vizType || oldQuery.vizType,
                keys,
              },
            });
            executeQuery();
            setIsContentChangedDotVisible(false);
            setQueryBuilderVisible(false);
          }}
        />
      </div>
      <div className='min-h-0 flex-1 flex flex-col'>
        <Form.Item name={['query', 'mode']} initialValue='raw' hidden>
          <div />
        </Form.Item>
        <Form.Item name={['query', 'query']} initialValue={RAW_DEFAULT_QUERY} hidden>
          <div />
        </Form.Item>
        <Form.Item name={['query', 'vizType']} initialValue='timeseries' hidden>
          <div />
        </Form.Item>
        {mode === 'metric' ? (
          <Metric indexData={indexData} setExecuteLoading={setExecuteLoading} executeQuery={executeCommittedQuery} />
        ) : (
          <Raw tableSelector={tableSelector} indexData={indexData} setExecuteLoading={setExecuteLoading} executeQuery={executeCommittedQuery} />
        )}
      </div>
    </div>
  );
}
