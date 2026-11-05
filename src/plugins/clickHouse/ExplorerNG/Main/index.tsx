import React, { useState, useContext, useRef } from 'react';
import { Form, Row, Col, Button, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS, QUERY_INPUT_MIN_WIDTH } from '@/pages/logExplorer/constants';
import QueryWorkspace from '@/pages/logExplorer/components/QueryWorkspace';
import getErrorMessage from '@/pages/logExplorer/components/QueryWorkspace/getErrorMessage';

import { NAME_SPACE } from '../../constants';
import { Field } from '../types';
import MainMoreOperations from '../components/MainMoreOperations';
import SQLFormatButton from '../components/SQLFormatButton';
import QueryBuilder from '../components/QueryBuilder';
import type { CKQueryWorkspace } from '../useQueryWorkspace';
import { HandleValueFilterParams } from '../types';
import QueryMain from './Query';
import SQLMain from './SQL';
import SQLQueryInput from './SQL/QueryInput';

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
  workspace: CKQueryWorkspace;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange, darkMode } = useContext(CommonStateContext);

  const { tabKey, datasourceValue, indexData, organizeFields, setOrganizeFields, executeQuery, handleValueFilter, stackByField, setStackByField, workspace } = props;
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
          </Col>
          {syntax === 'query' && (
            <Col flex='none'>
              <SQLFormatButton
                rangeRef={rangeRef}
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
          {syntax === 'query' && (
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
        <div style={{ display: syntax === 'sql' ? undefined : 'none' }}>
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
                database={database}
                table={table}
                time_field={time_field}
                indexData={indexData}
                onChange={() => {
                  workspace.markDirty();
                }}
              />
            }
            editor={<SQLQueryInput ref={queryInputRef} executeQuery={executeQuery} onSelectSQL={workspace.enterManual} />}
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
        />
      )}
    </div>
  );
}
