import React from 'react';
import { Form, Row, Col, Input, InputNumber, Space, Select } from 'antd';
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import HideButton from '@/pages/dashboard/Components/HideButton';
import { IS_PLUS } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import KQLInput from '@/components/KQLInput';
import LegendInput from '@/pages/dashboard/Components/LegendInput';
import DateField from './DateField';
import IndexSelect from './IndexSelect';
import Values from './Values';
import GroupBy from './GroupBy';
import Time from './Time';
import { Panel } from '../../Components/Collapse';
import { replaceExpressionVars } from '../../../VariableConfig/constant';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

interface Props {
  fields: FormListFieldData[];
  field: FormListFieldData;
  index: number;
  remove: (index: number | number[]) => void;

  dashboardId: number;
  variableConfig: any;
}

export default function QueryPanel({ fields, field, index, remove, dashboardId, variableConfig }: Props) {
  const { t } = useTranslation('dashboard');
  const prefixName = ['targets', field.name];
  const chartForm = Form.useFormInstance();
  const datasourceCate = Form.useWatch('datasourceCate');
  const datasourceValue = Form.useWatch('datasourceValue');
  const realDatasourceValue = _.toNumber(replaceExpressionVars(datasourceValue as any, variableConfig, variableConfig.length, _.toString(dashboardId)));
  const targets = Form.useWatch('targets');
  const refId = Form.useWatch([...prefixName, 'refId']) || alphabet[index];
  const indexValue = Form.useWatch([...prefixName, 'query', 'index']);
  const syntax = Form.useWatch([...prefixName, 'query', 'syntax']);
  const date_field = Form.useWatch([...prefixName, 'query', 'date_field']);

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
      <IndexSelect prefixField={field} prefixName={[field.name]} cate={datasourceCate} datasourceValue={realDatasourceValue} />
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
            <Form.Item {...field} name={[field.name, 'query', 'syntax']} noStyle initialValue='lucene'>
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
                index: indexValue,
                date_field: date_field,
              }}
              historicalRecords={[]}
            />
          </Form.Item>
        )}
      </Form.Item>
      <Values prefixField={field} prefixFields={['targets']} prefixNameField={[field.name]} datasourceValue={realDatasourceValue} index={indexValue} valueRefVisible={false} />
      <Form.Item
        shouldUpdate={(prevValues, curValues) => {
          const preQueryValues = _.get(prevValues, [...prefixName, 'query', 'values']);
          const curQueryValues = _.get(curValues, [...prefixName, 'query', 'values']);
          return !_.isEqual(preQueryValues, curQueryValues);
        }}
        noStyle
      >
        {({ getFieldValue }) => {
          const targetQueryValues = getFieldValue([...prefixName, 'query', 'values']);
          // 当提取日志原文时不显示 groupBy 设置
          if (_.get(targetQueryValues, [0, 'func']) === 'rawData') {
            return null;
          }
          return (
            <GroupBy
              parentNames={['targets']}
              prefixField={field}
              prefixFieldNames={[field.name, 'query']}
              datasourceValue={datasourceValue}
              index={getFieldValue([...prefixName, 'query', 'index'])}
            />
          );
        }}
      </Form.Item>
      <Form.Item
        shouldUpdate={(prevValues, curValues) => {
          const preQueryValues = _.get(prevValues, [...prefixName, 'query', 'values']);
          const curQueryValues = _.get(curValues, [...prefixName, 'query', 'values']);
          return !_.isEqual(preQueryValues, curQueryValues);
        }}
        noStyle
      >
        {({ getFieldValue }) => {
          const targetQueryValues = getFieldValue([...prefixName, 'query', 'values']);
          // 当提取日志原文时不显示 groupBy 设置
          if (_.get(targetQueryValues, [0, 'func']) === 'rawData') {
            return (
              <Row gutter={10}>
                <Col span={12}>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      let datasourceValue = getFieldValue('datasourceValue');
                      datasourceValue = replaceExpressionVars(datasourceValue as any, variableConfig, variableConfig.length, _.toString(dashboardId));
                      const index = getFieldValue(['targets', field.name, 'query', 'index']);
                      return <DateField datasourceValue={datasourceValue} index={index} prefixField={field} prefixNames={[field.name, 'query']} />;
                    }}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <InputGroupWithFormItem label={t('datasource:es.raw.limit')}>
                    <Form.Item {...field} name={[field.name, 'query', 'limit']}>
                      <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                  </InputGroupWithFormItem>
                </Col>
              </Row>
            );
          }
          return <Time prefixField={field} prefixNameField={[field.name]} chartForm={chartForm} variableConfig={variableConfig} dashboardId={dashboardId} />;
        }}
      </Form.Item>
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
