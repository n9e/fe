import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Space, Button, Row, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Resizable } from 're-resizable';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import HistoricalRecords from '@/components/HistoricalRecords';
import TimeRangePicker from '@/components/TimeRangePicker';
import DocumentDrawer from '@/components/DocumentDrawer';

import { QUERY_CACHE_KEY, NAME_SPACE, QUERY_SIDEBAR_CACHE_KEY } from '../../constants';
import { getDorisIndex, Field } from '../../services';
import QueryInput from '../components/QueryInput';
import DatabaseSelect from './DatabaseSelect';
import TableSelect from './TableSelect';
import DateFieldSelect from './DateFieldSelect';
import FieldsList from './FieldsList';
import Histogram from './Histogram';
import Content from './Content';

interface Props {
  disabled?: boolean;
  datasourceValue: number;
  executeQuery: () => void;
}

export default function index(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const form = Form.useFormInstance();
  const { disabled, datasourceValue, executeQuery } = props;
  const queryValues = Form.useWatch(['query']);
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem(QUERY_SIDEBAR_CACHE_KEY) || 200));
  const [executeLoading, setExecuteLoading] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    if (datasourceValue && queryValues?.database && queryValues?.table) {
      getDorisIndex({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValue, database: queryValues.database, table: queryValues.table })
        .then((res) => {
          setFields(res);
        })
        .catch(() => {
          setFields([]);
        });
    }
  }, [datasourceValue, queryValues?.database, queryValues?.table]);

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
                dateFields={_.filter(fields, (item) => {
                  return _.includes(['timestamp', 'date', 'datetime'], item.type.toLowerCase());
                })}
                onChange={executeQuery}
              />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='none'>
          <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
            <TimeRangePicker onChange={executeQuery} />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Button type='primary' onClick={executeQuery} disabled={disabled} loading={executeLoading}>
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
                    documentPath: '/docs/doris/query-string',
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
        <HistoricalRecords
          localKey={QUERY_CACHE_KEY}
          datasourceValue={datasourceValue}
          onSelect={(query) => {
            form.setFieldsValue({
              query: {
                query,
              },
            });
            executeQuery();
          }}
        />
      </div>
      {!_.isEmpty(fields) && queryValues?.time_field && (
        <div className='h-full min-h-0 flex gap-[10px]'>
          <div className='flex-shrink-0'>
            <Resizable
              size={{ width, height: '100%' }}
              enable={{
                right: true,
              }}
              onResizeStop={(e, direction, ref, d) => {
                let curWidth = width + d.width;
                if (curWidth < 200) {
                  curWidth = 200;
                }
                setWidth(curWidth);
                localStorage.setItem(QUERY_SIDEBAR_CACHE_KEY, curWidth.toString());
              }}
            >
              <FieldsList
                fields={fields}
                onValueFilter={(params) => {
                  let queryStr = _.trim(_.split(queryValues.query, '|')?.[0]);
                  if (queryStr === '*') {
                    queryStr = '';
                  }
                  queryStr += `${queryStr === '' ? '' : ` ${params.operator}`} ${params.key}:"${params.value}"`;
                  form.setFieldsValue({
                    refreshFlag: _.uniqueId('refreshFlag_'),
                    query: {
                      ...queryValues,
                      query: queryStr,
                    },
                  });
                }}
              />
            </Resizable>
          </div>
          <div className='w-full min-w-0 n9e-border-antd rounded-sm flex flex-col'>
            <div className='h-full min-h-0 p-2 flex-shrink-0 flex flex-col'>
              <Histogram />
              <Content fields={fields} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
