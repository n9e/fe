import React, { useState, useContext, useRef } from 'react';
import { Form, Row, Col, Button, Space, Tooltip, Popover, Segmented } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker from '@/components/TimeRangePicker';
import DocumentDrawer from '@/components/DocumentDrawer';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../constants';
import { Field } from '../../types';
import QueryInput from '../components/QueryInput';
import MainMoreOperations from '../components/MainMoreOperations';
import { DefaultSearchIcon, UnDefaultSearchIcon } from '../SideBarNav/FieldsSidebar/DefaultSearchIcon';
import QueryInputAddonAfter from '../components/QueryInputAddonAfter';
import SQLFormatButton from '../components/SQLFormatButton';
import { HandleValueFilterParams } from '../types';
import QueryMain from './Query';
import SQLMain from './SQL';

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
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { logsDefaultRange, darkMode } = useContext(CommonStateContext);

  const { tabKey, indexData, organizeFields, setOrganizeFields, executeQuery, handleValueFilter, stackByField, setStackByField, defaultSearchField, setDefaultSearchField } = props;
  const logsAntdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table .ant-table-body`;
  const logsRgdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table`;

  const form = Form.useFormInstance();
  const navMode = Form.useWatch(['query', 'navMode']);
  const syntax = Form.useWatch(['query', 'syntax']);

  const [executeLoading, setExecuteLoading] = useState(false);

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
      <Row gutter={SIZE} className='flex-shrink-0'>
        <Col flex='none'>
          <Form.Item name={['query', 'syntax']} initialValue='query'>
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
          <InputGroupWithFormItem
            label={
              <Space>
                {t(`${logExplorerNS}:query`)}
                <InfoCircleOutlined
                  onClick={() => {
                    DocumentDrawer({
                      language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                      darkMode,
                      title: t('common:document_link'),
                      type: 'iframe',
                      documentPath: `https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-${syntax}-mode-in-doris-discover/`,
                    });
                  }}
                />
              </Space>
            }
            addonAfter={<QueryInputAddonAfter executeQuery={executeQuery} />}
          >
            <div className='relative'>
              <Form.Item name={['query', syntax]} rules={[{ required: syntax === 'sql', message: t(`${logExplorerNS}:query_is_required`) }]}>
                <QueryInput
                  onEnterPress={() => {
                    snapRangeRef.current = {
                      from: undefined,
                      to: undefined,
                    };
                    executeQuery();
                  }}
                  enableAddonBefore={syntax === 'query' && defaultSearchField !== undefined}
                />
              </Form.Item>
              {syntax === 'query' && defaultSearchField && (
                <Popover
                  content={
                    <Space>
                      <span>{t('query.default_search_by_tip')} :</span>
                      <span>{defaultSearchField}</span>
                      <Tooltip title={t('query.default_search_tip_2')}>
                        <Button
                          icon={<UnDefaultSearchIcon />}
                          size='small'
                          type='text'
                          onClick={() => {
                            setDefaultSearchField?.(undefined);
                          }}
                        />
                      </Tooltip>
                    </Space>
                  }
                >
                  <Button
                    className='absolute top-[4px] left-[4px] z-10'
                    size='small'
                    type='text'
                    icon={
                      <DefaultSearchIcon
                        className='text-[12px]'
                        style={{
                          color: 'var(--fc-primary-color)',
                        }}
                      />
                    }
                  />
                </Popover>
              )}
            </div>
          </InputGroupWithFormItem>
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
          <Form.Item name={['query', 'range']} initialValue={logsDefaultRange}>
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
