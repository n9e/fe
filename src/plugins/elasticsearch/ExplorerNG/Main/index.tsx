import React, { useState, useContext, useRef, useEffect } from 'react';
import { Form, Row, Col, Button, Segmented, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { SIZE, DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE, QUERY_BUILDER_PINNED_CACHE_KEY } from '../../constants';
import { Field, Interval } from '../types';
import MainMoreOperations from '../components/MainMoreOperations';
import { HandleValueFilterParams } from '../types';
import RawMain from './Raw';
import QueryQueryInput from './QueryInput';
import SQLQueryInput from './SQL/QueryInput';

import SQLQueryBuilder from './SQL/QueryBuilder';

import SQLMain from './SQL';
import { getESClusterInfo } from '../../services';

interface Props {
  tabKey: string;
  indexData: Field[];

  datasourceValue: number;

  organizeFields: string[];
  setOrganizeFields: (value: string[]) => void;
  executeQuery: () => void;
  handleValueFilter: HandleValueFilterParams;

  interval?: Interval;
  setInterval: React.Dispatch<React.SetStateAction<Interval | undefined>>;
  intervalFixedRef: React.MutableRefObject<boolean>;

  rangeRef: React.MutableRefObject<
    | {
        from: number;
        to: number;
      }
    | undefined
  >;
  serviceParams: {
    current: number;
    pageSize: number;
    reverse: boolean;
    refreshFlag: string | undefined;
  };
  setServiceParams: React.Dispatch<
    React.SetStateAction<{
      current: number;
      pageSize: number;
      reverse: boolean;
      refreshFlag: string | undefined;
    }>
  >;
  getServiceParams: () => {
    current: number;
    pageSize: number;
    reverse: boolean;
    refreshFlag: string | undefined;
  };
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange } = useContext(CommonStateContext);

  const {
    tabKey,
    indexData,
    datasourceValue,
    organizeFields,
    setOrganizeFields,
    executeQuery,
    handleValueFilter,
    interval,
    setInterval,
    intervalFixedRef,
    rangeRef,
    serviceParams,
    setServiceParams,
    getServiceParams,
  } = props;

  const logsAntdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table .ant-table-body`;
  const logsRgdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table`;

  const [executeLoading, setExecuteLoading] = useState(false);
  const [supportsSQL, setSupportsSQL] = useState(false);
  const [queryBuilderPinned, setQueryBuilderPinned] = useState(() => {
    return localStorage.getItem(QUERY_BUILDER_PINNED_CACHE_KEY) === 'true';
  });
  const [queryBuilderVisible, setQueryBuilderVisible] = useState(false);

  const form = Form.useFormInstance();
  const syntax = Form.useWatch(['query', 'syntax'], form);
  const isSQLMode = syntax === 'sql';
  const isQueryMode = syntax === 'kuery' || syntax === 'lucene';

  useEffect(() => {
    if (datasourceValue) {
      getESClusterInfo({ cate: DatasourceCateEnum.elasticsearch, datasource_id: datasourceValue })
        .then((info) => {
          setSupportsSQL(info?.is_sql_supported ?? false);
        })
        .catch(() => {
          setSupportsSQL(false);
        });
    }
  }, [datasourceValue]);

  const queryValues = Form.useWatch('query', form);

  // 点击直方图某个柱子时，设置的时间范围
  const snapRangeRef = useRef<{
    from?: number;
    to?: number;
  }>({
    from: undefined,
    to: undefined,
  });

  // Segmented 受控值：query 模式统一映射为 'query'，SQL 模式映射为 'sql'
  const segmentedValue = isQueryMode ? 'query' : 'sql';

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-shrink-0 relative'>
        <Row gutter={SIZE} wrap={false}>
          <Col flex='none'>
            <Segmented
              value={segmentedValue}
              options={[
                {
                  label: (
                    <Dropdown
                      overlay={
                        <Menu
                          onClick={({ key }) => {
                            form.setFieldsValue({
                              query: { syntax: key, query: '' },
                            });
                          }}
                          items={[
                            { label: t('query.syntax_kuery'), key: 'kuery' },
                            { label: t('query.syntax_lucene'), key: 'lucene' },
                          ]}
                        />
                      }
                      trigger={['click']}
                    >
                      <span>
                        {syntax === 'lucene' ? t('query.syntax_lucene') : t('query.syntax_kuery')}
                        <DownOutlined style={{ marginLeft: 4, fontSize: 10 }} />
                      </span>
                    </Dropdown>
                  ),
                  value: 'query',
                },
                ...(supportsSQL ? [{ label: 'SQL', value: 'sql' }] : []),
              ]}
              onChange={(val) => {
                if (val === 'sql') {
                  form.setFieldsValue({
                    query: { syntax: 'sql', query: '' },
                  });
                }
                if (val === 'query' && isSQLMode) {
                  form.setFieldsValue({
                    query: { syntax: 'kuery', query: '' },
                  });
                }
              }}
            />
          </Col>
          <Col flex='auto' style={{ minWidth: 0 }}>
            {isSQLMode ? (
              <SQLQueryInput
                snapRangeRef={snapRangeRef}
                executeQuery={executeQuery}
                queryBuilderPinned={queryBuilderPinned}
                queryBuilderVisible={queryBuilderVisible}
                onLableClick={() => {
                  if (queryBuilderPinned) {
                    setQueryBuilderPinned(false);
                    localStorage.setItem(QUERY_BUILDER_PINNED_CACHE_KEY, 'false');
                  } else {
                    setQueryBuilderVisible(!queryBuilderVisible);
                  }
                }}
              />
            ) : (
              <QueryQueryInput snapRangeRef={snapRangeRef} executeQuery={executeQuery} />
            )}
          </Col>
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
        {IS_PLUS && isSQLMode && (
          <SQLQueryBuilder
            datasourceValue={datasourceValue}
            index={queryValues?.index}
            date_field={queryValues?.date_field}
            sql={queryValues?.sql}
            visible={queryBuilderVisible}
            onClose={() => setQueryBuilderVisible(false)}
            queryBuilderPinned={queryBuilderPinned}
            setQueryBuilderPinned={(pinned) => {
              setQueryBuilderPinned(pinned);
              localStorage.setItem(QUERY_BUILDER_PINNED_CACHE_KEY, pinned ? 'true' : 'false');
              if (pinned) {
                setQueryBuilderVisible(true);
              }
            }}
            onExecute={(values) => {
              // TODO: SQL execution API not yet designed
            }}
            onPreviewSQL={() => {
              // SQL 已由 QueryBuilderCpt 写入表单，此处无需额外处理
            }}
          />
        )}
      </div>

      {isSQLMode ? (
        <SQLMain
          tableSelector={{
            antd: logsAntdTableSelector,
            rgd: logsRgdTableSelector,
          }}
          setExecuteLoading={setExecuteLoading}
          executeQuery={executeQuery}
          timeseriesKeys={queryValues?.keys || { value: [], label: [] }}
        />
      ) : (
        <RawMain
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
          interval={interval}
          setInterval={setInterval}
          intervalFixedRef={intervalFixedRef}
          serviceParams={serviceParams}
          setServiceParams={setServiceParams}
          getServiceParams={getServiceParams}
        />
      )}
    </div>
  );
}
