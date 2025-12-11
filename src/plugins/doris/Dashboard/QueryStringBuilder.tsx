import React, { useContext } from 'react';
import { Form, Row, Col, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import DocumentDrawer from '@/components/DocumentDrawer';
import QueryInput from '@/pages/explorer/components/LogsViewer/components/QueryInput';

import { NAME_SPACE, DATE_TYPE_LIST } from '../constants';
import { getDorisIndex, Field } from '../services';
import DatabaseSelect from '../Explorer/Query/DatabaseSelect';
import TableSelect from '../Explorer/Query/TableSelect';
import DateFieldSelect from '../Explorer/Query/DateFieldSelect';

interface Props {
  field: any;
  datasourceValue: number;
}

export default function QueryStringBuilder(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const { field, datasourceValue } = props;
  const form = Form.useFormInstance();
  const queryValues = Form.useWatch(['targets', field.name, 'query']);

  const indexDataService = () => {
    if (datasourceValue && queryValues?.database && queryValues?.table) {
      return getDorisIndex({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValue, database: queryValues.database, table: queryValues.table })
        .then((res) => {
          const timeField = queryValues?.time_field;
          const fieldExists = _.some(res, (item) => item.field === timeField);
          if (!timeField || !fieldExists) {
            const firstDateField = _.find(res, (item) => {
              return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
            })?.field;
            if (firstDateField) {
              form.setFields([
                {
                  name: ['targets', field.name, 'query', 'time_field'],
                  value: firstDateField,
                },
              ]);
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

  const { data: indexData } = useRequest<Field[] | undefined, any>(indexDataService, {
    refreshDeps: [datasourceValue, queryValues?.database, queryValues?.table],
  });

  return (
    <>
      <Row gutter={10} wrap>
        <Col flex='auto'>
          <Row gutter={10} wrap className='min-w-[300px]'>
            <Col span={12}>
              <Form.Item {...field} label={t('query.database')} name={[field.name, 'query', 'database']} rules={[{ required: true, message: t('query.database_msg') }]}>
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
            </Col>
            <Col span={12}>
              <Form.Item {...field} label={t('query.table')} name={[field.name, 'query', 'table']} rules={[{ required: true, message: t('query.table_msg') }]}>
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
            </Col>
          </Row>
        </Col>
        <Col flex='none'>
          <Form.Item {...field} label={t('query.time_field')} name={[field.name, 'query', 'time_field']} rules={[{ required: true, message: t('query.time_field_msg') }]}>
            <DateFieldSelect
              dateFields={_.filter(indexData, (item) => {
                return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
              })}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
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
        {...field}
        name={[field.name, 'query', 'query']}
      >
        <QueryInput />
      </Form.Item>
    </>
  );
}
