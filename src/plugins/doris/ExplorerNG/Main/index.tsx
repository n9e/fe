import React, { useState, useContext, useRef } from 'react';
import { Form, Row, Col, Button, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS, QUERY_INPUT_MIN_WIDTH } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../constants';
import QueryWorkspace from '@/pages/logExplorer/components/QueryWorkspace';
import QueryBuilder from '../components/QueryBuilder';
import type { DorisQueryWorkspace } from '../useQueryWorkspace';
import { Field } from '../types';
import MainMoreOperations from '../components/MainMoreOperations';
import SQLFormatButton from '../components/SQLFormatButton';
import { HandleValueFilterParams } from '../types';
import QueryMain from './Query';
import SQLMain from './SQL';
import SQLQueryInput from './SQL/QueryInput';
import QueryQueryInput from './Query/QueryInput';
import type { QueryRequest } from '@/components/AiQueryDock/usePendingQuery';

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

  /** The AI dock, when this build hosts one: trigger in the SQL box, dock under it. */
  queryExtra?: React.ReactNode;
  noticeBanner?: React.ReactNode;
  queryBoxRef?: React.Ref<HTMLDivElement>;
  queryButtonRef?: React.Ref<HTMLButtonElement>;
  queryRequest?: QueryRequest;
  onQueryEdit?: (sql?: string) => void;
  workspace: DorisQueryWorkspace;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange, darkMode } = useContext(CommonStateContext);

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
    queryExtra,
    noticeBanner,
    queryBoxRef,
    queryButtonRef,
    queryRequest,
    onQueryEdit,
    workspace,
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
        <Row gutter={SIZE} wrap>
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
          <Col flex='1 1 0' style={{ minWidth: syntax === 'query' ? QUERY_INPUT_MIN_WIDTH : 0 }}>
            <Form.Item name={['query', 'query']} hidden noStyle>
              <div />
            </Form.Item>
            {syntax === 'query' && (
              <QueryQueryInput
                snapRangeRef={snapRangeRef}
                executeQuery={executeQuery}
                defaultSearchField={defaultSearchField}
                setDefaultSearchField={setDefaultSearchField}
                queryExtra={queryExtra}
                noticeBanner={noticeBanner}
                queryBoxRef={queryBoxRef}
                onQueryEdit={onQueryEdit}
              />
            )}
          </Col>
          {syntax === 'query' && (
            <Col flex='none'>
              <SQLFormatButton
                rangeRef={rangeRef}
                defaultSearchField={defaultSearchField}
                onClick={(values) => {
                  workspace.enterManual();
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
                showMillisecond
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
          {syntax === 'query' && (
            <Col flex='none'>
              <Button
                ref={queryButtonRef}
                type='primary'
                onClick={() => {
                  snapRangeRef.current = {};
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
        <div style={{ display: syntax === 'sql' ? undefined : 'none' }}>
          <QueryWorkspace
            assistEnabled={workspace.assistEnabled}
            preview={workspace.preview?.statement}
            dirty={workspace.dirty}
            generating={workspace.generating}
            executeLoading={executeLoading}
            darkMode={darkMode}
            error={workspace.error ? (workspace.error instanceof Error ? workspace.error.message : t('query.editMode.build_sql_failed')) : undefined}
            queryButtonRef={syntax === 'sql' ? queryButtonRef : undefined}
            onAssistChange={(enabled) => {
              onQueryEdit?.();
              workspace.setAssistEnabled(enabled);
            }}
            onReset={() => {
              onQueryEdit?.();
              workspace.reset();
            }}
            onConvert={() => {
              void workspace.convert();
            }}
            onExecute={() => {
              snapRangeRef.current = {};
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
                database={database}
                table={table}
                time_field={time_field}
                indexData={indexData}
                onChange={() => {
                  onQueryEdit?.();
                  workspace.markDirty();
                }}
              />
            }
            editor={
              <SQLQueryInput
                ref={queryInputRef}
                executeQuery={executeQuery}
                onSelectSQL={workspace.enterManual}
                queryExtra={syntax === 'sql' && !workspace.assistEnabled ? queryExtra : undefined}
                queryBoxRef={queryBoxRef}
                onQueryEdit={onQueryEdit}
              />
            }
            below={
              syntax === 'sql' && noticeBanner ? (
                // The assistant belongs to the hand-written box: with the builder open the panel takes the room,
                // so the dock stays mounted (its conversation lives in it) but off screen.
                <div hidden={workspace.assistEnabled}>{noticeBanner}</div>
              ) : undefined
            }
          />
        </div>
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
          queryRequest={queryRequest}
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
          timeseriesKeys={{ value: workspace.preview?.metadata.value_key || [], label: workspace.preview?.metadata.label_key || [] }}
          queryRequest={queryRequest}
        />
      )}
    </div>
  );
}
