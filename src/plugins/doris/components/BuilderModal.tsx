import React, { useEffect, useMemo, useState } from 'react';
import { Form, Modal, Row, Col, Space, Segmented, Select, InputNumber, Tooltip, message } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { SIZE, DatasourceCateEnum } from '@/utils/constant';

import { NAME_SPACE, DATE_TYPE_LIST } from '../constants';
import { getDorisIndex, buildSql, Field } from '../services';
import { FieldSampleParams } from '../ExplorerNG/types';
import DatabaseSelect from '../Explorer/Query/DatabaseSelect';
import TableSelect from '../Explorer/Query/TableSelect';
import DateFieldSelect from '../Explorer/Query/DateFieldSelect';
import Filters from '../ExplorerNG/components/QueryBuilder/Filters';
import Aggregates from '../ExplorerNG/components/QueryBuilder/Aggregates';
import OrderBy from '../ExplorerNG/components/QueryBuilder/OrderBy';
import CommonStateContext from '../ExplorerNG/components/QueryBuilder/commonStateContext';
import getMaxLabelWidth from '../ExplorerNG/components/QueryBuilder/utils/getMaxLabelWidth';

export interface BuilderConfig {
  database?: string;
  table?: string;
  time_field?: string;
  filters?: any[];
  aggregates?: any[];
  mode?: 'table' | 'timeseries';
  group_by?: string[];
  order_by?: any[];
  limit?: number;
}

export interface BuildSqlResult {
  sql: string;
  mode: string;
  value_key: string[];
  label_key: string[];
}

interface Props {
  visible: boolean;
  datasourceId: number;
  builderConfig?: BuilderConfig;
  onCancel: () => void;
  onConfirm: (builderConfig: BuilderConfig, result: BuildSqlResult) => void;
}

const getDefaultBuilderConfig = (builderConfig?: BuilderConfig): BuilderConfig => {
  return {
    filters: [],
    aggregates: [],
    mode: 'table',
    group_by: [],
    order_by: [],
    limit: 100,
    ...builderConfig,
  };
};

export default function BuilderModal(props: Props) {
  const { visible, datasourceId, builderConfig, onCancel, onConfirm } = props;
  const { t, i18n } = useTranslation(NAME_SPACE);
  const [form] = Form.useForm<BuilderConfig>();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const database = Form.useWatch('database', form);
  const table = Form.useWatch('table', form);
  const timeField = Form.useWatch('time_field', form);
  const filters = Form.useWatch('filters', form);
  const aggregates = Form.useWatch('aggregates', form);
  const groupBy = Form.useWatch('group_by', form);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(getDefaultBuilderConfig(builderConfig));
    }
  }, [visible, builderConfig, form]);

  const indexDataService = () => {
    if (!datasourceId || !database || !table) {
      return Promise.resolve(undefined);
    }
    return getDorisIndex({
      cate: DatasourceCateEnum.doris,
      datasource_id: datasourceId,
      database,
      table,
    })
      .then((res) => {
        const currentTimeField = form.getFieldValue('time_field');
        const fieldExists = _.some(res, (item) => item.field === currentTimeField);
        if (!currentTimeField || !fieldExists) {
          const firstDateField = _.find(res, (item) => {
            return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
          })?.field;
          if (firstDateField) {
            form.setFieldsValue({
              time_field: firstDateField,
            });
          }
        }
        return res;
      })
      .catch(() => {
        return [];
      });
  };

  const { data: indexData = [] } = useRequest<Field[] | undefined, any>(indexDataService, {
    refreshDeps: [datasourceId, database, table],
    ready: visible,
  });

  const validIndexData = useMemo(() => {
    return _.filter(indexData, (item) => item.indexable === true);
  }, [indexData]);

  const dateFields = useMemo(() => {
    return _.filter(indexData, (item) => {
      return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
    });
  }, [indexData]);

  const fieldSampleParams = useMemo(() => {
    if (!database || !table || !timeField) return {} as FieldSampleParams;
    return {
      cate: DatasourceCateEnum.doris,
      datasource_id: datasourceId,
      database,
      table,
      time_field: timeField,
      filters: filters || [],
      from: moment().subtract(24, 'hours').unix(),
      to: moment().unix(),
      limit: 100,
    };
  }, [datasourceId, database, table, timeField, JSON.stringify(filters)]);

  const maxLabelWidth = useMemo(() => {
    return getMaxLabelWidth([t('builder.filters.label'), t('builder.aggregates.label'), t('builder.display_label'), t('builder.order_by.label')]);
  }, [i18n.language]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      setConfirmLoading(true);
      buildSql({
        cate: DatasourceCateEnum.doris,
        datasource_id: datasourceId,
        query: [
          {
            database: values.database!,
            table: values.table!,
            time_field: values.time_field!,
            from: moment().subtract(6, 'hours').unix(),
            to: moment().unix(),
            filters: values.filters || [],
            aggregates: values.aggregates || [],
            group_by: values.group_by || [],
            order_by: values.order_by || [],
            mode: values.mode || 'table',
            limit: values.limit || 100,
          },
        ],
      })
        .then((res) => {
          onConfirm(getDefaultBuilderConfig(values), res);
        })
        .catch(() => {
          message.error(t('query.editMode.build_sql_failed'));
        })
        .finally(() => {
          setConfirmLoading(false);
        });
    });
  };

  return (
    <CommonStateContext.Provider
      value={{
        ignoreNextOutsideClick: () => {},
      }}
    >
      <Modal width={960} visible={visible} title='Builder' confirmLoading={confirmLoading} onCancel={onCancel} onOk={handleOk} destroyOnClose>
        <Form form={form} layout='vertical'>
          <Row gutter={10}>
            <Col span={8}>
              <Form.Item label={t('query.database')} name='database' rules={[{ required: true, message: t('query.database_msg') }]}>
                <DatabaseSelect
                  datasourceValue={datasourceId}
                  onChange={() => {
                    const current = form.getFieldsValue(true);
                    form.setFieldsValue({
                      database: current.database,
                      table: undefined,
                      time_field: undefined,
                      filters: [],
                      aggregates: [],
                      group_by: [],
                      order_by: [],
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t('query.table')} name='table' rules={[{ required: true, message: t('query.table_msg') }]}>
                <TableSelect
                  datasourceValue={datasourceId}
                  database={database}
                  onChange={() => {
                    const current = form.getFieldsValue(true);
                    form.setFieldsValue({
                      table: current.table,
                      time_field: undefined,
                      filters: [],
                      aggregates: [],
                      group_by: [],
                      order_by: [],
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t('query.time_field')} name='time_field' rules={[{ required: true, message: t('query.time_field_msg') }]}>
                <DateFieldSelect dateFields={dateFields} />
              </Form.Item>
            </Col>
          </Row>
          <div className='w-full table border-separate border-spacing-y-2 mt-[-12px]'>
            <div
              className='table-column'
              style={{
                width: maxLabelWidth,
              }}
            />
            <div className='table-column' />
            <div className='table-row'>
              <div className='table-cell align-top'>
                <div className='h-[24px] flex items-center'>
                  <Tooltip title={t('builder.filters.label_tip')}>
                    <Space size={SIZE / 2}>
                      <span>{t('builder.filters.label')}</span>
                      <InfoCircleOutlined />
                    </Space>
                  </Tooltip>
                </div>
              </div>
              <div className='table-cell'>
                <Form.Item name='filters' noStyle initialValue={[]}>
                  <Filters size='small' indexData={validIndexData} fieldSampleParams={fieldSampleParams} />
                </Form.Item>
              </div>
            </div>
            <div className='table-row'>
              <div className='table-cell align-top'>
                <div className='h-[24px] flex items-center'>{t('builder.aggregates.label')}</div>
              </div>
              <div className='table-cell'>
                <Form.Item name='aggregates' noStyle initialValue={[]}>
                  <Aggregates indexData={validIndexData} />
                </Form.Item>
              </div>
            </div>
            <div className='table-row'>
              <div className='table-cell align-top'>
                <div className='h-[24px] flex items-center'>{t('builder.display_label')}</div>
              </div>
              <div className='table-cell'>
                <Space size={SIZE} wrap>
                  <Form.Item name='mode' noStyle initialValue='table'>
                    <Segmented
                      size='small'
                      options={[
                        { label: t('builder.mode.table'), value: 'table' },
                        { label: t('builder.mode.timeseries'), value: 'timeseries' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item name='group_by' noStyle initialValue={[]}>
                    <Select
                      size='small'
                      className='min-w-[160px] doris-query-builder-group-by-select'
                      dropdownClassName='doris-query-builder-popup'
                      options={_.map(indexData, (item) => {
                        return { label: item.field, value: item.field };
                      })}
                      mode='multiple'
                      showSearch
                      optionFilterProp='label'
                      dropdownMatchSelectWidth={false}
                      placeholder={t('builder.group_by')}
                    />
                  </Form.Item>
                  <Form.Item name='limit' noStyle initialValue={100}>
                    <InputNumber size='small' className='w-[80px]' min={1} max={10000000} placeholder={t('builder.limit')} />
                  </Form.Item>
                </Space>
              </div>
            </div>
            <div className='table-row mb-4'>
              <div className='table-cell align-top'>
                <div className='h-[24px] flex items-center'>{t('builder.order_by.label')}</div>
              </div>
              <div className='table-cell'>
                <Form.Item name='order_by' noStyle initialValue={[]}>
                  <OrderBy indexData={validIndexData} aggregates={aggregates || []} group_by={groupBy || []} />
                </Form.Item>
              </div>
            </div>
          </div>
        </Form>
      </Modal>
    </CommonStateContext.Provider>
  );
}
