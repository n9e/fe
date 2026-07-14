import React, { useContext, useEffect, useState } from 'react';
import { Badge, Button, Col, Form, InputNumber, Row, Segmented } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../constants';
import { BUILDER_PINNED_CACHE_KEY, DEFAULT_RAW_LOG_LIMIT, MAX_RAW_LOG_LIMIT, METRIC_DEFAULT_QUERY, RAW_DEFAULT_QUERY } from '../constants';
import { Field } from '../types';
import Builder from '../Builder';
import MainMoreOperations from '../components/MainMoreOperations';
import Metric from './Metric';
import QueryInput from './QueryInput';
import Raw from './Raw';

interface Props {
  indexData: Field[];
  executeLoading: boolean;
  setExecuteLoading: (loading: boolean) => void;
  executeQuery: () => void;
}

export default function Main(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange } = useContext(CommonStateContext);
  const { indexData, executeLoading, setExecuteLoading, executeQuery } = props;
  const form = Form.useFormInstance();
  const queryValues = Form.useWatch('query', form);
  const mode = queryValues?.mode || 'raw';
  const [queryBuilderPinned, setQueryBuilderPinned] = useState(() => localStorage.getItem(BUILDER_PINNED_CACHE_KEY) === 'true');
  const [queryBuilderVisible, setQueryBuilderVisible] = useState(false);
  const [isContentChangedDotVisible, setIsContentChangedDotVisible] = useState(false);

  useEffect(() => {
    setExecuteLoading(false);
  }, [mode]);

  const normalizeLimit = (value?: string | number | null) => {
    const parsed = _.toNumber(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_RAW_LOG_LIMIT;
    return Math.max(1, Math.min(Math.floor(parsed), MAX_RAW_LOG_LIMIT));
  };

  const handleLimitChange = (value?: string | number | null) => {
    const limit = normalizeLimit(value);
    const query = form.getFieldValue('query') || {};
    const builder = query.builder || {};
    form.setFieldsValue({
      query: {
        ...query,
        limit,
        builder: builder.raw
          ? {
              ...builder,
              raw: {
                ...builder.raw,
                limit,
              },
            }
          : builder,
      },
    });
    setIsContentChangedDotVisible(true);
  };

  const executeCommittedQuery = () => {
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
          {mode === 'raw' && (
            <Col flex='none'>
              <InputGroupWithFormItem label={t('builder.limit')}>
                <Form.Item name={['query', 'limit']} initialValue={DEFAULT_RAW_LOG_LIMIT} noStyle>
                  <InputNumber className='w-[96px]' min={1} max={MAX_RAW_LOG_LIMIT} onChange={handleLimitChange} />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
          )}
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
            const nextLimit = mode === 'raw' ? values.raw?.limit || oldQuery.limit : oldQuery.limit;
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
                limit: nextLimit,
              },
            });
            setIsContentChangedDotVisible(true);
            setQueryBuilderVisible(false);
          }}
          onExecute={(query, values) => {
            const oldQuery = form.getFieldValue('query') || {};
            const nextLimit = mode === 'raw' ? values.raw?.limit || oldQuery.limit : oldQuery.limit;
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
                limit: nextLimit,
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
          <Raw indexData={indexData} setExecuteLoading={setExecuteLoading} executeQuery={executeCommittedQuery} />
        )}
      </div>
    </div>
  );
}
