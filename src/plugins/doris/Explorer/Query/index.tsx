import React, { useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Space, Button, Row, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import ConditionHistoricalRecords from '@/components/HistoricalRecords/ConditionHistoricalRecords';
import TimeRangePicker from '@/components/TimeRangePicker';
import DocumentDrawer from '@/components/DocumentDrawer';
import QueryInput from '@/pages/explorer/components/LogsViewer/components/QueryInput';

import { QUERY_CACHE_KEY, NAME_SPACE, DATE_TYPE_LIST, QUERY_CACHE_PICK_KEYS } from '../../constants';
import { getDorisIndex, Field } from '../../services';
import DatabaseSelect from './DatabaseSelect';
import TableSelect from './TableSelect';
import DateFieldSelect from './DateFieldSelect';
import Content from './Content';
import SQLFormatButton from './SQLFormatButton';

interface Props {
  disabled?: boolean;
  datasourceValue: number;
  executeQuery: () => void;
}

export default function index(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode, logsDefaultRange } = useContext(CommonStateContext);
  const form = Form.useFormInstance();
  const { disabled, datasourceValue, executeQuery } = props;
  const queryValues = Form.useWatch(['query']);
  // 用于显示展示的时间范围
  const rangeRef = useRef<{
    from: number;
    to: number;
  }>();

  const indexDataService = () => {
    const queryValues = form.getFieldValue('query');
    if (datasourceValue && queryValues?.database && queryValues?.table) {
      return getDorisIndex({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValue, database: queryValues.database, table: queryValues.table })
        .then((res) => {
          const timeField = form.getFieldValue('query')?.time_field;
          const fieldExists = _.some(res, (item) => item.field === timeField);
          if (!timeField || !fieldExists) {
            const firstDateField = _.find(res, (item) => {
              return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
            })?.field;
            if (firstDateField) {
              form.setFieldsValue({
                query: {
                  time_field: firstDateField,
                },
              });
              executeQuery();
            }
          }
          return res;
        })
        .catch(() => {
          return [];
        });
    }
    return Promise.resolve(undefined);
  };

  const { data: indexData, loading: indexDataLoading } = useRequest<Field[] | undefined, any>(indexDataService, {
    refreshDeps: [datasourceValue, queryValues?.database, queryValues?.table],
  });

  return (
    <div className='h-full min-h-0 flex flex-col'>
      <Row gutter={10} wrap>
        <Col flex='auto'>
          <Row gutter={10} wrap className='min-w-[300px]'>
            <Col span={12}>
              <InputGroupWithFormItem label={t('query.database')}>
                <Form.Item name={['query', 'database']} rules={[{ required: true, message: t('query.database_msg') }]}>
                  <DatabaseSelect
                    datasourceValue={datasourceValue}
                    onChange={() => {
                      form.setFieldsValue({
                        query: {
                          table: undefined,
                          time_field: undefined,
                          query: undefined,
                        },
                      });
                    }}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            <Col span={12}>
              <InputGroupWithFormItem label={t('query.table')}>
                <Form.Item name={['query', 'table']} rules={[{ required: true, message: t('query.table_msg') }]}>
                  <TableSelect
                    datasourceValue={datasourceValue}
                    database={queryValues?.database}
                    onChange={() => {
                      form.setFieldsValue({
                        query: {
                          time_field: undefined,
                          query: undefined,
                        },
                      });
                    }}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
          </Row>
        </Col>
        <Col flex='none'>
          <InputGroupWithFormItem label={t('query.time_field')}>
            <Form.Item name={['query', 'time_field']} rules={[{ required: true, message: t('query.time_field_msg') }]}>
              <DateFieldSelect
                dateFields={_.filter(indexData, (item) => {
                  return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
                })}
                onChange={executeQuery}
              />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='none'>
          <Form.Item name={['query', 'range']} initialValue={logsDefaultRange}>
            <TimeRangePicker onChange={executeQuery} />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Button type='primary' onClick={executeQuery} disabled={disabled}>
            {t('query.execute')}
          </Button>
        </Col>
      </Row>
      <div className='flex gap-[10px]'>
        <InputGroupWithFormItem
          label={
            <Space>
              {t('query.query')}
              <InfoCircleOutlined
                onClick={() => {
                  DocumentDrawer({
                    language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                    darkMode,
                    title: t('common:document_link'),
                    type: 'iframe',
                    documentPath: 'https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-query-mode-in-doris-discover/',
                  });
                }}
              />
            </Space>
          }
        >
          <Form.Item name={['query', 'query']}>
            <QueryInput
              onChange={() => {
                executeQuery();
              }}
            />
          </Form.Item>
        </InputGroupWithFormItem>
        <SQLFormatButton rangeRef={rangeRef} />
        <ConditionHistoricalRecords
          localKey={QUERY_CACHE_KEY}
          datasourceValue={datasourceValue!}
          renderItem={(item, setVisible) => {
            return (
              <div
                className='flex flex-wrap items-center gap-y-1 cursor-pointer hover:bg-[var(--fc-fill-3)] p-1 rounded leading-[1.1] mb-1'
                key={JSON.stringify(item)}
                onClick={() => {
                  form.setFieldsValue({ query: item });
                  executeQuery();
                  setVisible(false);
                }}
              >
                {_.map(_.pick(item, QUERY_CACHE_PICK_KEYS), (value, key) => {
                  if (!value) return <span key={key} />;
                  return (
                    <span key={key} className='whitespace-nowrap'>
                      <span className='bg-[var(--fc-fill-1)] inline-block p-1 mr-1'>{t(`query.${key}`)}:</span>
                      <span className='pr-1'>{value}</span>
                    </span>
                  );
                })}
              </div>
            );
          }}
        />
      </div>
      {indexData && <Content rangeRef={rangeRef} indexData={indexData} indexDataLoading={indexDataLoading} executeQuery={executeQuery} />}
    </div>
  );
}
