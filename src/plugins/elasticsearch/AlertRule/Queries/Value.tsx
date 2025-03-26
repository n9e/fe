import React, { useState, useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import _ from 'lodash';
import { Form, Row, Col, Select, AutoComplete } from 'antd';
import { useTranslation } from 'react-i18next';
import { getFields } from '@/pages/explorer/Elasticsearch/services';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  field?: any;
  preName?: (string | number)[]; // field.name 之前的字段
  midName?: (string | number)[]; // 在 field.name 和 date_field 之间插入的字段
  datasourceValue: number;
  index: string;
  disabled?: boolean;
  functions: string[];
}

const functionsLabelMap = {
  count: 'count',
  avg: 'avg',
  sum: 'sum',
  max: 'max',
  min: 'min',
  p90: 'p90',
  p95: 'p95',
  p99: 'p99',
  rawData: 'raw data',
};

export default function Value(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { datasourceValue, index, field = {}, preName = [], midName = [], disabled, functions } = props;
  const [fieldsOptions, setFieldsOptions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const func = Form.useWatch([...preName, field.name, ...midName, 'value', 'func']);

  const { run } = useDebounceFn(
    () => {
      getFields(datasourceValue, index, 'number').then((res) => {
        setFieldsOptions(
          _.map(res.fields, (item) => {
            return {
              value: item,
            };
          }),
        );
      });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (datasourceValue && index) {
      run();
    }
  }, [datasourceValue, index]);
  return (
    <Row gutter={8}>
      <Col span={func === 'count' || func === 'rawData' ? 24 : 12}>
        <InputGroupWithFormItem label={t('datasource:es.value')}>
          <Form.Item {...field} name={[field.name, ...midName, 'value', 'func']} noStyle initialValue={functions[0]}>
            <Select style={{ width: '100%' }} disabled={disabled}>
              {functions.map((func) => (
                <Select.Option key={func} value={func}>
                  {functionsLabelMap[func]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </InputGroupWithFormItem>
      </Col>
      {func !== 'count' && func !== 'rawData' && (
        <Col span={12}>
          <InputGroupWithFormItem label='Field key'>
            <Form.Item {...field} name={[field.name, ...midName, 'value', 'field']} noStyle>
              <AutoComplete
                options={_.filter(fieldsOptions, (item) => {
                  if (search) {
                    return item.value.includes(search);
                  }
                  return true;
                })}
                style={{ width: '100%' }}
                onSearch={setSearch}
                disabled={disabled}
              />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
      )}
    </Row>
  );
}
