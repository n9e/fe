import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Form, Row, Col, Input, InputNumber, Space, Select, Tooltip, Radio, Segmented, Button, Modal } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { FormListFieldData, FormListOperation } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import QueryExtraActions from '@/pages/dashboard/Components/QueryExtraActions';
import { IS_PLUS, DatasourceCateEnum } from '@/utils/constant';
import { generateQueryNameByIndex } from '@/components/QueryName/utils';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import LegendInput from '@/pages/dashboard/Components/LegendInput';
import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';
import { getESClusterInfo } from '@/plugins/elasticsearch/services';
import { SqlMonacoEditor, SqlMonacoPreview } from '@fc-components/monaco-editor';
import SQLBuilderModal from '@/plugins/elasticsearch/components/SQLBuilderModal';
import { CommonStateContext } from '@/App';

import { Panel } from '../../Components/Collapse';
import DateField from './DateField';
import IndexSelect from './IndexSelect';
import Values from './Values';
import GroupBy from './GroupBy';
import Time from './Time';
import IndexPatternSelect from './IndexPatternSelect';
import type { ElasticsearchIndexPattern } from './types';

const DEFAULT_SQL_BUILDER_INTERVAL_SECONDS = 3600;

interface Props {
  fields: FormListFieldData[];
  field: FormListFieldData;
  index: number;
  add: FormListOperation['add'];
  remove: FormListOperation['remove'];
  datasourceValue: number;
}

export default function QueryPanel({ fields, field, index, add, remove, datasourceValue }: Props) {
  const { t } = useTranslation('dashboard');
  const { t: tES } = useTranslation('elasticsearch');
  const { darkMode } = useContext(CommonStateContext);
  const [indexPatterns, setIndexPatterns] = useState<ElasticsearchIndexPattern[]>([]);
  const [supportsSQL, setSupportsSQL] = useState(false);
  const prefixName = ['targets', field.name];
  const datasourceCate = Form.useWatch('datasourceCate');
  const esDatasourceCate = datasourceCate === DatasourceCateEnum.opensearch ? DatasourceCateEnum.opensearch : DatasourceCateEnum.elasticsearch;
  const refId = Form.useWatch([...prefixName, 'refId']) || generateQueryNameByIndex(index);
  const indexType = Form.useWatch([...prefixName, 'query', 'index_type']);
  const indexValue = Form.useWatch([...prefixName, 'query', 'index']);
  const filterLanguage = Form.useWatch([...prefixName, 'query', 'filter_language']) ?? 'lucene';
  const dateField = Form.useWatch([...prefixName, 'query', 'date_field']);
  const indexPatternId = Form.useWatch([...prefixName, 'query', 'index_pattern']);
  const curIndexValues = useMemo(() => {
    if (indexType === 'index') {
      return {
        index: indexValue,
        date_field: dateField,
      };
    }
    return {
      index: _.find(indexPatterns, { id: indexPatternId })?.name,
      date_field: _.find(indexPatterns, { id: indexPatternId })?.time_field,
    };
  }, [indexType, indexValue, indexPatternId, indexPatterns, dateField]);
  const targetQueryValues = Form.useWatch([...prefixName, 'query', 'values']);
  const savedQuerySyntax = Form.useWatch([...prefixName, 'query', 'syntax']);
  const querySyntax = supportsSQL && savedQuerySyntax === 'sql' ? 'sql' : 'dsl';
  const targetQuery = Form.useWatch([...prefixName, 'query']);
  const editMode = targetQuery?.editMode ?? 'code';
  const [builderModalVisible, setBuilderModalVisible] = useState(false);
  const form = Form.useFormInstance();
  const isRawData = _.get(targetQueryValues, [0, 'func']) === 'rawData';
  const { key: fieldKey, ...restField } = field;

  useEffect(() => {
    if (datasourceValue) {
      getESIndexPatterns(datasourceValue).then((res) => {
        setIndexPatterns(res);
      });
    }
  }, [datasourceValue]);

  useEffect(() => {
    setSupportsSQL(false);
    if (!IS_PLUS || !datasourceValue) return;
    getESClusterInfo({ cate: esDatasourceCate, datasource_id: datasourceValue })
      .then((info) => setSupportsSQL(info?.is_sql_supported ?? false))
      .catch(() => setSupportsSQL(false));
  }, [datasourceValue, esDatasourceCate]);

  return (
    <Panel
      header={refId}
      key={fieldKey}
      extra={
        <Space>
          <QueryExtraActions field={field} add={add} />
          {fields.length > 1 ? (
            <DeleteOutlined
              onClick={() => {
                remove(field.name);
              }}
            />
          ) : null}
        </Space>
      }
    >
      <Form.Item noStyle {...restField} name={[field.name, 'refId']} hidden>
        <input type='hidden' />
      </Form.Item>
      {supportsSQL && (
        <div className='mb-3 flex items-center justify-between'>
          <Space size={8}>
            <Form.Item {...restField} name={[field.name, 'query', 'syntax']} initialValue='dsl' noStyle>
              <Segmented size='small' options={[{ label: 'DSL', value: 'dsl' }, { label: 'SQL', value: 'sql' }]} />
            </Form.Item>
            {querySyntax === 'sql' && (
              <Segmented
                size='small'
                value={editMode}
                options={[{ label: 'Builder', value: 'builder' }, { label: 'Code', value: 'code' }]}
                onChange={(value) => {
                  // 从 Code 切到 Builder 且已有 SQL 时需确认丢弃：清空 sql 和 builderConfig，
                  // 强制用 Builder 重新生成，避免残留配置生成的 SQL 与当前手写 SQL 不一致。
                  if (value === 'builder' && editMode === 'code' && targetQuery?.sql) {
                    Modal.confirm({ title: tES('builder.switch_to_builder_confirm_title'), content: tES('builder.switch_to_builder_confirm_content'), onOk: () => form.setFields([
                      { name: [...prefixName, 'query', 'editMode'], value: 'builder' },
                      { name: [...prefixName, 'query', 'sql'], value: undefined },
                      { name: [...prefixName, 'query', 'builderConfig'], value: undefined },
                    ]) });
                    return;
                  }
                  form.setFields([{ name: [...prefixName, 'query', 'editMode'], value }]);
                }}
              />
            )}
          </Space>
          {querySyntax === 'sql' && (
            <Form.Item {...restField} name={[field.name, 'query', 'mode']} initialValue='timeSeries' noStyle hidden={editMode === 'builder'}>
              <Select size='small'>
                <Select.Option value='timeSeries'>{tES('query.dashboard.mode.timeSeries')}</Select.Option>
                <Select.Option value='raw'>{tES('query.dashboard.mode.table')}</Select.Option>
              </Select>
            </Form.Item>
          )}
        </div>
      )}
      {querySyntax === 'sql' ? (
        <>
          <Form.Item {...restField} name={[field.name, 'query', 'editMode']} initialValue='code' hidden><input type='hidden' /></Form.Item>
          {editMode === 'builder' && targetQuery?.sql && <div className={`p-3 rounded max-h-[160px] overflow-y-auto mb-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}><SqlMonacoPreview theme={darkMode ? 'dark' : 'light'} value={targetQuery.sql} /></div>}
          {editMode === 'builder' && <Button className='mb-3' disabled={!datasourceValue} onClick={() => setBuilderModalVisible(true)}>{tES('builder.open_builder')}</Button>}
          {editMode === 'code' && <Form.Item {...restField} name={[field.name, 'query', 'sql']} label='SQL' rules={[{ required: true, message: tES('query.sql_required') }]}>
            <SqlMonacoEditor maxHeight={200} enableAutocomplete enableFormat />
          </Form.Item>}
          {editMode === 'builder' && <SQLBuilderModal
            visible={builderModalVisible}
            datasourceValue={datasourceValue}
            interval={DEFAULT_SQL_BUILDER_INTERVAL_SECONDS}
            builderConfig={targetQuery?.builderConfig}
            onCancel={() => setBuilderModalVisible(false)}
            onConfirm={(builderConfig, result) => {
              form.setFields([
                { name: [...prefixName, 'query', 'sql'], value: result.sql, errors: [] },
                { name: [...prefixName, 'query', 'builderConfig'], value: builderConfig, errors: [] },
                { name: [...prefixName, 'query', 'mode'], value: result.mode === 'timeseries' ? 'timeSeries' : 'raw' },
                { name: [...prefixName, 'query', 'keys', 'valueKey'], value: result.value_key },
                { name: [...prefixName, 'query', 'keys', 'labelKey'], value: result.label_key },
              ]);
              setBuilderModalVisible(false);
            }}
          />}
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item
                {...restField}
                name={[field.name, 'query', 'keys', 'valueKey']}
                label={<Space>{tES('query.advancedSettings.valueKey')}<Tooltip title={tES('query.advancedSettings.valueKey_tip')}><QuestionCircleOutlined /></Tooltip></Space>}
                rules={[{ required: true, message: tES('query.advancedSettings.valueKey_required') }]}
              >
                <Select mode='tags' tokenSeparators={[' ']} placeholder={tES('query.advancedSettings.tags_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...restField}
                name={[field.name, 'query', 'keys', 'labelKey']}
                label={<Space>{tES('query.advancedSettings.labelKey')}<Tooltip title={tES('query.advancedSettings.labelKey_tip')}><QuestionCircleOutlined /></Tooltip></Space>}
              >
                <Select mode='tags' tokenSeparators={[' ']} placeholder={tES('query.advancedSettings.tags_placeholder')} />
              </Form.Item>
            </Col>
          </Row>
          {IS_PLUS && (
            <Form.Item label='Legend' {...restField} name={[field.name, 'legend']}>
              <LegendInput />
            </Form.Item>
          )}
        </>
      ) : <>
      <Form.Item {...restField} name={[field.name, 'query', 'index_type']} initialValue='index'>
        <Radio.Group>
          <Radio value='index'>{t('datasource:es.index')}</Radio>
          <Radio value='index_pattern'>{t('datasource:es.indexPatterns')}</Radio>
        </Radio.Group>
      </Form.Item>
      {indexType === 'index' && <IndexSelect prefixField={field} prefixName={[field.name]} cate={datasourceCate} datasourceValue={datasourceValue} />}
      {indexType === 'index_pattern' && <IndexPatternSelect field={field} name={['query']} indexPatterns={indexPatterns} />}
      <Form.Item
        label={
          <Space>
            {t('datasource:es.filter')}
            <a
              href={
                filterLanguage === 'lucene'
                  ? 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax'
                  : 'https://www.elastic.co/docs/reference/query-languages/kql'
              }
              target='_blank'
            >
              <QuestionCircleOutlined />
            </a>
          </Space>
        }
      >
        <InputGroupWithFormItem
          label={
            <Form.Item {...restField} name={[field.name, 'query', 'filter_language']} noStyle initialValue='lucene'>
              <Select
                bordered={false}
                options={[
                  {
                    label: 'Lucene',
                    value: 'lucene',
                  },
                  {
                    label: 'KQL',
                    value: 'kql',
                  },
                ]}
                dropdownMatchSelectWidth={false}
              />
            </Form.Item>
          }
        >
          <Form.Item {...restField} name={[field.name, 'query', 'filter']} noStyle>
            <Input />
          </Form.Item>
        </InputGroupWithFormItem>
      </Form.Item>
      <Values
        prefixField={field}
        prefixFields={['targets']}
        prefixNameField={[field.name]}
        datasourceValue={datasourceValue}
        index={curIndexValues.index}
        valueRefVisible={false}
      />
      {!isRawData && (
        <GroupBy parentNames={['targets']} prefixField={field} prefixFieldNames={[field.name, 'query']} datasourceValue={datasourceValue} index={curIndexValues.index} />
      )}
      {isRawData ? (
        <Row gutter={10}>
          <Col
            span={8}
            style={{
              display: indexType === 'index_pattern' ? 'none' : 'block',
            }}
          >
            <DateField datasourceValue={datasourceValue} index={curIndexValues.index} prefixField={field} prefixNames={[field.name, 'query']} />
          </Col>
          <Col span={8}>
            <InputGroupWithFormItem
              label={
                <Space>
                  {t('datasource:es.raw.date_format')}
                  <Tooltip title={t('datasource:es.raw.date_format_tip')}>
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Form.Item {...restField} name={[field.name, 'query', 'date_format']}>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={8}>
            <InputGroupWithFormItem label={t('datasource:es.raw.limit')}>
              <Form.Item {...restField} name={[field.name, 'query', 'limit']}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
        </Row>
      ) : (
        <Time prefixField={field} prefixNameField={[field.name]} datasourceValue={datasourceValue} />
      )}
      {IS_PLUS && (
        <Form.Item
          label='Legend'
          {...restField}
          name={[field.name, 'legend']}
          tooltip={{
            getPopupContainer: () => document.body,
            title: t('query.legendTip2', {
              interpolation: { skipOnVariables: true },
            }),
          }}
        >
          <LegendInput />
        </Form.Item>
      )}
      </>}
    </Panel>
  );
}
