import React, { useState, useContext, useRef } from 'react';
import { Form, Row, Col, Button, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import classNames from 'classnames';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../constants';
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

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange } = useContext(CommonStateContext);

  const { tabKey, indexData, organizeFields, setOrganizeFields, executeQuery, handleValueFilter, stackByField, setStackByField, defaultSearchField, setDefaultSearchField } = props;
  const logsAntdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table .ant-table-body`;
  const logsRgdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table`;

  const form = Form.useFormInstance();
  const navMode = Form.useWatch(['query', 'navMode']);
  const syntax = Form.useWatch(['query', 'syntax']);

  const [executeLoading, setExecuteLoading] = useState(false);
  const [queryBuilderPinned, setQueryBuilderPinned] = useState(false); // 是否固定显示
  const [queryBuilderVisible, setQueryBuilderVisible] = useState(true); // 不固定时，控制显示隐藏

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
        <Row gutter={SIZE}>
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
          <Col flex='auto'>
            {syntax === 'query' && (
              <QueryQueryInput snapRangeRef={snapRangeRef} executeQuery={executeQuery} defaultSearchField={defaultSearchField} setDefaultSearchField={setDefaultSearchField} />
            )}
            {syntax === 'sql' && (
              <div
                className={classNames({
                  'mb-[18px]': !queryBuilderPinned ? !queryBuilderVisible : false,
                })}
              >
                <SQLQueryInput
                  snapRangeRef={snapRangeRef}
                  executeQuery={executeQuery}
                  queryBuilderPinned={queryBuilderPinned}
                  queryBuilderVisible={!queryBuilderPinned ? queryBuilderVisible : true}
                  onLableClick={() => {
                    setQueryBuilderVisible(true);
                  }}
                />
              </div>
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
            <Button
              type='primary'
              onClick={() => {
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
          </Col>
          <Col flex='none'>
            <MainMoreOperations />
          </Col>
        </Row>
        {syntax === 'sql' && (
          <QueryBuilder
            snapRangeRef={snapRangeRef}
            executeQuery={executeQuery}
            visible={!queryBuilderPinned ? queryBuilderVisible : true}
            onClose={() => {
              if (!queryBuilderPinned) {
                setQueryBuilderVisible(false);
              }
            }}
            queryBuilderPinned={queryBuilderPinned}
            setQueryBuilderPinned={setQueryBuilderPinned}
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
        />
      )}
    </div>
  );
}
