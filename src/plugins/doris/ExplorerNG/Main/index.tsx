import React, { useState, useContext, useRef } from 'react';
import { Form, Row, Col, Button, Segmented, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE, QUERY_BUILDER_PINNED_CACHE_KEY } from '../../constants';
import { Field } from '../types';
import MainMoreOperations from '../components/MainMoreOperations';
import SQLFormatButton from '../components/SQLFormatButton';
import { HandleValueFilterParams } from '../types';
import QueryMain from './Query';
import SQLMain from './SQL';
import SQLQueryInput from './SQL/QueryInput';
import QueryQueryInput from './Query/QueryInput';
import QueryBuilder from './SQL/QueryBuilder';

interface Props {
  tabKey: string;
  datasourceValue?: number;
  indexData: Field[];

  organizeFields: string[];
  setOrganizeFields: (value: string[]) => void;
  executeQuery: () => void;
  handleValueFilter: HandleValueFilterParams;

  stackByField?: string;
  setStackByField: (field?: string) => void;
  defaultSearchField?: string;
  setDefaultSearchField: (field?: string) => void;
}

const queryBuilderPinnedCache = window.localStorage.getItem(QUERY_BUILDER_PINNED_CACHE_KEY);

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange } = useContext(CommonStateContext);

  const {
    tabKey,
    datasourceValue,
    indexData,
    organizeFields,
    setOrganizeFields,
    executeQuery,
    handleValueFilter,
    stackByField,
    setStackByField,
    defaultSearchField,
    setDefaultSearchField,
  } = props;
  const logsAntdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table .ant-table-body`;
  const logsRgdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table`;

  const form = Form.useFormInstance();
  // const navMode = Form.useWatch(['query', 'navMode']);
  const navMode = 'fields';
  const syntax = Form.useWatch(['query', 'syntax']);
  const database = Form.useWatch(['query', 'database']);
  const table = Form.useWatch(['query', 'table']);
  const time_field = Form.useWatch(['query', 'time_field']);

  const [executeLoading, setExecuteLoading] = useState(false);
  const [queryBuilderPinned, setQueryBuilderPinned] = useState(queryBuilderPinnedCache ? queryBuilderPinnedCache === 'true' : true); // 是否固定显示
  const [queryBuilderVisible, setQueryBuilderVisible] = useState(false); // 不固定时，控制显示隐藏
  const [isContentChangedDotVisible, setIsContentChangedDotVisible] = useState(false);
  // 当 builder 生成的 sql 同时设置时序图的 value/label keys 的 options，只有 builder 生成 sql 时才更新
  const [timeseriesKeys, setTimeseriesKeys] = useState<{
    value: string[];
    label: string[];
  }>({
    value: [],
    label: [],
  });

  const queryInputRef = useRef<any>(null);

  // 用于显示展示的时间范围
  const rangeRef = useRef<{
    from: number;
    to: number;
  }>();
  // 点击直方图某个柱子时，设置的时间范围
  const snapRangeRef = useRef<{
    from?: number;
    to?: number;
  }>({
    from: undefined,
    to: undefined,
  });

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-shrink-0 relative'>
        <Row gutter={SIZE} wrap={false}>
          <Col flex='none'>
            <Form.Item name={['query', 'syntax']} initialValue='query' noStyle>
              <Segmented
                options={
                  navMode === 'fields'
                    ? [
                        {
                          label: t('query.syntax.query'),
                          value: 'query',
                        },
                        {
                          label: t('query.syntax.sql'),
                          value: 'sql',
                        },
                      ]
                    : [{ label: t('query.syntax.sql'), value: 'sql' }]
                }
              />
            </Form.Item>
          </Col>
          <Col flex='auto' style={{ minWidth: 0 }}>
            {syntax === 'query' && (
              <QueryQueryInput snapRangeRef={snapRangeRef} executeQuery={executeQuery} defaultSearchField={defaultSearchField} setDefaultSearchField={setDefaultSearchField} />
            )}
            {syntax === 'sql' && (
              <SQLQueryInput
                ref={queryInputRef}
                snapRangeRef={snapRangeRef}
                executeQuery={executeQuery}
                queryBuilderPinned={queryBuilderPinned}
                queryBuilderVisible={!queryBuilderPinned ? queryBuilderVisible : true}
                onLableClick={() => {
                  setQueryBuilderVisible(!queryBuilderVisible);
                }}
              />
            )}
          </Col>
          {syntax === 'query' && (
            <Col flex='none'>
              <SQLFormatButton
                rangeRef={rangeRef}
                defaultSearchField={defaultSearchField}
                onClick={(values) => {
                  snapRangeRef.current = {
                    from: undefined,
                    to: undefined,
                  };
                  form.setFieldsValue({
                    refreshFlag: undefined,
                    query: values,
                  });
                  executeQuery();
                }}
              />
            </Col>
          )}
          <Col flex='none'>
            <Form.Item name={['query', 'range']} initialValue={logsDefaultRange} noStyle>
              <TimeRangePicker
                onChange={() => {
                  snapRangeRef.current = {
                    from: undefined,
                    to: undefined,
                  };
                  executeQuery();
                }}
              />
            </Form.Item>
          </Col>
          <Col flex='none'>
            <Badge dot={isContentChangedDotVisible}>
              <Button
                type='primary'
                onClick={() => {
                  setIsContentChangedDotVisible(false);
                  snapRangeRef.current = {
                    from: undefined,
                    to: undefined,
                  };
                  executeQuery();
                }}
                loading={executeLoading}
              >
                {t(`${logExplorerNS}:execute`)}
              </Button>
            </Badge>
          </Col>
          <Col flex='none'>
            <MainMoreOperations />
          </Col>
        </Row>
        {syntax === 'sql' && (
          <QueryBuilder
            key={datasourceValue + database + table + time_field} // 切换这些配置时，重置 QueryBuilder 组件
            datasourceValue={datasourceValue}
            database={database}
            table={table}
            time_field={time_field}
            visible={!queryBuilderPinned ? queryBuilderVisible : true}
            onClose={() => {
              if (!queryBuilderPinned) {
                setQueryBuilderVisible(false);
              }
            }}
            queryBuilderPinned={queryBuilderPinned}
            setQueryBuilderPinned={(pinned) => {
              setQueryBuilderPinned(pinned);
              window.localStorage.setItem(QUERY_BUILDER_PINNED_CACHE_KEY, pinned ? 'true' : 'false');
            }}
            onExecute={(keys) => {
              setIsContentChangedDotVisible(false);
              setTimeseriesKeys(keys);
            }}
            onPreviewSQL={(keys) => {
              queryInputRef.current?.focus();
              setIsContentChangedDotVisible(true);
              setTimeseriesKeys(keys);
            }}
          />
        )}
      </div>
      {syntax === 'query' && (
        <QueryMain
          tableSelector={{
            antd: logsAntdTableSelector,
            rgd: logsRgdTableSelector,
          }}
          indexData={indexData}
          rangeRef={rangeRef}
          snapRangeRef={snapRangeRef}
          organizeFields={organizeFields}
          setOrganizeFields={setOrganizeFields}
          handleValueFilter={handleValueFilter}
          executeQuery={executeQuery}
          setExecuteLoading={setExecuteLoading}
          stackByField={stackByField}
          setStackByField={setStackByField}
          defaultSearchField={defaultSearchField}
        />
      )}
      {syntax === 'sql' && (
        <SQLMain
          tableSelector={{
            antd: logsAntdTableSelector,
            rgd: logsRgdTableSelector,
          }}
          setExecuteLoading={setExecuteLoading}
          executeQuery={executeQuery}
          timeseriesKeys={timeseriesKeys}
        />
      )}
    </div>
  );
}
