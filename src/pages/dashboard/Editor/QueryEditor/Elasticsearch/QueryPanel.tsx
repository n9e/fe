import React, { useState, useEffect, useMemo } from 'react';
import { Form, Row, Col, Input, InputNumber, Space, Select, Tooltip, Radio } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import HideButton from '@/pages/dashboard/Components/HideButton';
import { IS_PLUS, alphabet } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import KQLInput from '@/components/KQLInput';
import LegendInput from '@/pages/dashboard/Components/LegendInput';
import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';

import { Panel } from '../../Components/Collapse';
import DateField from './DateField';
import IndexSelect from './IndexSelect';
import Values from './Values';
import GroupBy from './GroupBy';
import Time from './Time';
import IndexPatternSelect from './IndexPatternSelect';

interface Props {
  fields: FormListFieldData[];
  field: FormListFieldData;
  index: number;
  remove: (index: number | number[]) => void;
  datasourceValue: number;
}

export default function QueryPanel({ fields, field, index, remove, datasourceValue }: Props) {
  const { t } = useTranslation('dashboard');
  const [indexPatterns, setIndexPatterns] = useState<any[]>([]);
  const prefixName = ['targets', field.name];
  const chartForm = Form.useFormInstance();
  const datasourceCate = Form.useWatch('datasourceCate');
  const targets = Form.useWatch('targets');
  const refId = Form.useWatch([...prefixName, 'refId']) || alphabet[index];
  const indexType = Form.useWatch([...prefixName, 'query', 'index_type']);
  const indexValue = Form.useWatch([...prefixName, 'query', 'index']);
  const syntax = Form.useWatch([...prefixName, 'query', 'syntax']);
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
  }, [indexType, indexValue, indexPatternId, JSON.stringify(indexPatterns)]);
  const targetQueryValues = Form.useWatch([...prefixName, 'query', 'values']);
  const isRawData = _.get(targetQueryValues, [0, 'func']) === 'rawData';

  useEffect(() => {
    if (datasourceValue) {
      getESIndexPatterns(datasourceValue).then((res) => {
        setIndexPatterns(res);
      });
    }
  }, [datasourceValue]);

  return (
    <Panel
      header={refId}
      key={field.key}
      extra={
        <Space>
          {IS_PLUS && (
            <Form.Item noStyle {...field} name={[field.name, 'hide']}>
              <HideButton />
            </Form.Item>
          )}
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
      <Form.Item noStyle {...field} name={[field.name, 'refId']} hidden />
      <Form.Item {...field} name={[field.name, 'query', 'index_type']} initialValue='index'>
        <Radio.Group>
          <Radio value='index'>{t('datasource:es.index')}</Radio>
          <Radio value='index_pattern'>{t('datasource:es.indexPatterns')}</Radio>
        </Radio.Group>
      </Form.Item>
      {indexType === 'index' && <IndexSelect prefixField={field} prefixName={[field.name]} cate={datasourceCate} datasourceValue={datasourceValue} />}
      {indexType === 'index_pattern' && <IndexPatternSelect field={field} name={['query']} indexPatterns={indexPatterns} />}
      <Form.Item
        label={
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Space>
              {t('datasource:es.filter')}
              <a
                href={
                  syntax === 'Lucene'
                    ? 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax'
                    : 'https://www.elastic.co/guide/en/kibana/current/kuery-query.html'
                }
                target='_blank'
              >
                <QuestionCircleOutlined />
              </a>
            </Space>
            <Form.Item {...field} name={[field.name, 'query', 'syntax']} noStyle initialValue='lucene' hidden={IS_PLUS}>
              <Select
                bordered={false}
                options={[
                  {
                    label: 'Lucene',
                    value: 'lucene',
                  },
                  {
                    label: 'KQL',
                    value: 'kuery',
                  },
                ]}
                dropdownMatchSelectWidth={false}
                onChange={(val) => {
                  const newTargets = _.cloneDeep(targets);
                  newTargets[field.name].query.filter = '';
                  newTargets[field.name].query.syntax = val;
                  chartForm.setFieldsValue({
                    targets: newTargets,
                  });
                }}
              />
            </Form.Item>
          </div>
        }
      >
        {syntax === 'lucene' ? (
          <Form.Item {...field} name={[field.name, 'query', 'filter']}>
            <Input />
          </Form.Item>
        ) : (
          <Form.Item {...field} name={[field.name, 'query', 'filter']}>
            <KQLInput
              datasourceValue={datasourceValue}
              query={{
                index: curIndexValues.index,
                date_field: curIndexValues.date_field,
              }}
              historicalRecords={[]}
            />
          </Form.Item>
        )}
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
              <Form.Item {...field} name={[field.name, 'query', 'date_format']}>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={8}>
            <InputGroupWithFormItem label={t('datasource:es.raw.limit')}>
              <Form.Item {...field} name={[field.name, 'query', 'limit']}>
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
          {...field}
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
    </Panel>
  );
}
