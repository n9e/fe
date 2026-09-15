import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AutoComplete, Col, Form, message, Modal, Row, Select } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { getIndices, getFullFields } from '@/pages/explorer/Elasticsearch/services';
import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';
import { DatasourceCateEnum } from '@/utils/constant';

// @ts-ignore QueryBuilder is supplied by the commercial package.
import QueryBuilder from 'plus:/datasource/elasticsearch/ExplorerNG/components/QueryBuilder';
// @ts-ignore QueryBuilder context is supplied by the commercial package.
import QueryBuilderCommonStateContext from 'plus:/datasource/elasticsearch/ExplorerNG/components/QueryBuilder/commonStateContext';
// @ts-ignore esQueryBuilder is supplied by the commercial package.
import { esQueryBuilder } from 'plus:/datasource/elasticsearch/ExplorerNG/services';

export interface ESBuilderConfig {
  index?: string;
  date_field?: string;
  filters?: any[];
  aggregates?: any[];
  mode?: 'table' | 'timeseries';
  group_by?: string[];
  order_by?: any[];
  limit?: number;
}

interface Props {
  visible: boolean;
  datasourceValue: number;
  interval: number;
  builderConfig?: ESBuilderConfig;
  onCancel: () => void;
  onConfirm: (builderConfig: ESBuilderConfig, result: { sql: string; value_key: string[]; label_key: string[]; time_key?: string; mode: string }) => void;
}

export default function SQLBuilderModal({ visible, datasourceValue, interval, builderConfig, onCancel, onConfirm }: Props) {
  const { t } = useTranslation('elasticsearch');
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { esIndexMode } = useContext(CommonStateContext);
  const [indices, setIndices] = useState<string[]>([]);
  const [indexPatterns, setIndexPatterns] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const index = Form.useWatch('index', form);
  const dateField = Form.useWatch('date_field', form);
  const searchMode = Form.useWatch('search_mode', form) || (esIndexMode !== 'all' ? esIndexMode : 'indices');
  const range = useMemo(() => ({ start: `now-${Math.max(interval || 60, 1)}s`, end: 'now' }), [interval]);

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    form.setFieldsValue({
      index: builderConfig?.index,
      date_field: builderConfig?.date_field,
      search_mode: esIndexMode !== 'all' ? esIndexMode : 'indices',
      query: { range },
    });
  }, [visible, builderConfig, range, form]);

  useEffect(() => {
    if (!visible || !datasourceValue) return;
    getIndices(datasourceValue).then(setIndices).catch(() => setIndices([]));
  }, [visible, datasourceValue]);

  useEffect(() => {
    if (!visible || !datasourceValue) return;
    getESIndexPatterns(datasourceValue).then(setIndexPatterns).catch(() => setIndexPatterns([]));
  }, [visible, datasourceValue]);

  useEffect(() => {
    if (!visible || !datasourceValue || !index) {
      setFields([]);
      return;
    }
    getFullFields(datasourceValue, index)
      .then((res) => setFields(Array.isArray(res.allFields) ? res.allFields : []))
      .catch(() => setFields([]));
  }, [visible, datasourceValue, index]);

  useEffect(() => {
    if (searchMode !== 'index-patterns' || !index) return;
    const pattern = indexPatterns.find((item) => item.name === index);
    if (pattern?.time_field && pattern.time_field !== dateField) {
      form.setFieldsValue({ date_field: pattern.time_field });
    }
  }, [searchMode, index, indexPatterns, dateField, form]);

  const build = (values: ESBuilderConfig) => {
    if (!index || !dateField) return Promise.resolve();
    const to = moment().unix();
    const from = to - Math.max(interval || 60, 1);
    return esQueryBuilder({
      cate: DatasourceCateEnum.elasticsearch,
      datasource_id: datasourceValue,
      query: [{ ...values, index, time_field: dateField, from, to }],
    }).then((result) => {
      onConfirm({ ...values, index, date_field: dateField }, result);
    });
  };

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        setConfirmLoading(true);
        return build(values);
      })
      .catch((error) => {
        // Validation errors are rendered by Form.Item; only notify for builder
        // execution failures to avoid an unhandled promise rejection.
        if (!(error && typeof error === 'object' && 'errorFields' in error)) {
          message.error(t('builder.preview_sql_failed'));
        }
      })
      .finally(() => setConfirmLoading(false));
  };

  return (
    <Modal width={960} visible={visible} title={t('builder.title')} confirmLoading={confirmLoading} onCancel={onCancel} onOk={handleOk} destroyOnClose>
      <QueryBuilderCommonStateContext.Provider value={{ ignoreNextOutsideClick: () => {} }}>
        <Form form={form} layout='vertical'>
          <Form.Item name={['query', 'range']} hidden><input type='hidden' /></Form.Item>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name='search_mode' label={t('query.mode')} hidden={esIndexMode !== 'all'}>
              <Select
                options={[{ label: t('query.mode_indices'), value: 'indices' }, { label: t('query.mode_index_patterns'), value: 'index-patterns' }]}
                onChange={() => form.setFieldsValue({ index: undefined, date_field: undefined })}
              />
            </Form.Item>
          </Col>
          {searchMode === 'indices' ? (
            <>
              <Col span={8}>
              <Form.Item name='index' label={t('query.index')} rules={[{ required: true, message: t('query.index_required') }]}>
                <AutoComplete options={indices.map((item) => ({ label: item, value: item }))} />
              </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name='date_field' label={t('query.date_field')} rules={[{ required: true, message: t('query.date_field_required') }]}>
                  <Select showSearch optionFilterProp='label' options={fields.map((item) => ({ label: typeof item === 'string' ? item : item.field || item.name, value: typeof item === 'string' ? item : item.field || item.name }))} />
                </Form.Item>
              </Col>
            </>
          ) : (
            <Col span={16}>
              <Form.Item name='index' label={t('query.index_pattern')} rules={[{ required: true, message: t('query.index_pattern_required') }]}>
                <Select
                  showSearch
                  optionFilterProp='label'
                  options={indexPatterns.map((item) => ({ label: item.name, value: item.name }))}
                  onChange={(value) => {
                    const pattern = indexPatterns.find((item) => item.name === value);
                    if (pattern?.time_field) form.setFieldsValue({ date_field: pattern.time_field });
                  }}
                />
              </Form.Item>
            </Col>
          )}
          {searchMode === 'index-patterns' && <Form.Item name='date_field' hidden><input type='hidden' /></Form.Item>}
        </Row>
        <QueryBuilder
          explorerForm={form}
          datasourceValue={datasourceValue}
          index={index}
          date_field={dateField}
          range={range}
          builderConfig={builderConfig}
          hideActions
          form={form}
          embedded
          contentClassName='mt-[-12px]'
          visible={visible}
          onExecute={build}
          onPreviewSQL={build}
        />
        </Form>
      </QueryBuilderCommonStateContext.Provider>
    </Modal>
  );
}
