import React, { useState, useContext, useRef, useEffect } from 'react';
import { Form, Row, Col, Button, Segmented, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { SIZE, DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS, QUERY_INPUT_MIN_WIDTH } from '@/pages/logExplorer/constants';
import QueryWorkspace from '@/pages/logExplorer/components/QueryWorkspace';
import getErrorMessage from '@/pages/logExplorer/components/QueryWorkspace/getErrorMessage';

import { NAME_SPACE } from '../../constants';
import { Field, Interval } from '../types';
import MainMoreOperations from '../components/MainMoreOperations';
import FiltersBuilder from '../components/FiltersBuilder';
import { HandleValueFilterParams } from '../types';
import RawMain from './Raw';
import QueryQueryInput from './QueryInput';
import SQLQueryInput from './SQL/QueryInput';
import QueryBuilder from './SQL/Builder';
import type { ESQueryWorkspace } from '../useQueryWorkspace';
import { defaultBuilderValues } from '../useQueryWorkspace';

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
  workspace: ESQueryWorkspace;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange, darkMode } = useContext(CommonStateContext);

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
    workspace,
  } = props;

  const logsAntdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table .ant-table-body`;
  const logsRgdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table`;

  const [executeLoading, setExecuteLoading] = useState(false);
  const [supportsSQL, setSupportsSQL] = useState(false);

  const queryInputRef = useRef<any>(null);

  const form = Form.useFormInstance();
  const syntax = Form.useWatch(['query', 'syntax'], form);
  const isSQLMode = syntax === 'sql';

  // 切换模式时重置 loading 状态，避免 RawMain 遗留的 loading 状态
  useEffect(() => {
    setExecuteLoading(false);
  }, [isSQLMode]);

  useEffect(() => {
    if (IS_PLUS && datasourceValue) {
      getESClusterInfo({ cate: DatasourceCateEnum.elasticsearch, datasource_id: datasourceValue })
        .then((info) => {
          setSupportsSQL(info?.is_sql_supported ?? false);
        })
        .catch((err) => {
          console.error('getESClusterInfo failed:', err);
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
  const segmentedValue = isSQLMode ? 'sql' : 'query';

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-shrink-0 relative'>
        <Row gutter={SIZE} wrap>
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
          <Col flex='1 1 0' style={{ minWidth: QUERY_INPUT_MIN_WIDTH }}>
            {!isSQLMode && <QueryQueryInput snapRangeRef={snapRangeRef} executeQuery={executeQuery} />}
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
                showMillisecond
              />
            </Form.Item>
          </Col>
          {!isSQLMode && (
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
          )}
          <Col flex='none'>
            <MainMoreOperations />
          </Col>
        </Row>
        {isSQLMode && (
          <div>
            <QueryWorkspace
              assistEnabled={workspace.assistEnabled}
              preview={workspace.preview?.statement}
              dirty={workspace.dirty}
              generating={workspace.generating}
              executeLoading={executeLoading}
              darkMode={darkMode}
              error={workspace.error ? getErrorMessage(workspace.error, t(`${logExplorerNS}:query_workspace.build_failed`)) : undefined}
              onAssistChange={(enabled) => {
                workspace.setAssistEnabled(enabled);
              }}
              onReset={() => {
                workspace.reset();
              }}
              onConvert={() => {
                void workspace.convert();
              }}
              onExecute={() => {
                snapRangeRef.current = {
                  from: undefined,
                  to: undefined,
                };
                executeQuery();
              }}
              onContinueWriting={() => {
                workspace.continueWriting();
                requestAnimationFrame(() => queryInputRef.current?.focus());
              }}
              builder={
                <QueryBuilder
                  explorerForm={form}
                  form={workspace.builderForm}
                  datasourceValue={datasourceValue}
                  index={queryValues?.index}
                  date_field={queryValues?.date_field}
                  onChange={() => {
                    workspace.markDirty();
                  }}
                />
              }
              editor={<SQLQueryInput ref={queryInputRef} executeQuery={executeQuery} onSelectSQL={workspace.enterManual} />}
            />
          </div>
        )}
        {!isSQLMode && (
          <FiltersBuilder
            datasourceValue={datasourceValue}
            indexData={indexData}
            filters={queryValues?.filters || []}
            onChange={(filters) => {
              form.setFieldsValue({
                query: {
                  filters,
                },
              });
              snapRangeRef.current = {
                from: undefined,
                to: undefined,
              };
            }}
            executeQuery={executeQuery}
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
          timeseriesKeys={{ value: workspace.preview?.metadata.value_key || [], label: workspace.preview?.metadata.label_key || [] }}
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
