import React, { useState, useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import _ from 'lodash';
import { Form, Row, Col, Select, AutoComplete } from 'antd';
import { useTranslation } from 'react-i18next';
import { getFields } from '@/pages/explorer/Elasticsearch/services';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  prefixField?: any;
  prefixNames?: string[]; // 前缀字段名
  datasourceValue: number;
  index: string;
  disabled?: boolean;
}

const functions = ['count', 'avg', 'sum', 'max', 'min', 'p90', 'p95', 'p99'];
const functionsLabelMap = {
  count: 'count',
  avg: 'avg',
  sum: 'sum',
  max: 'max',
  min: 'min',
  p90: 'p90',
  p95: 'p95',
  p99: 'p99',
};

export default function Value(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { datasourceValue, index, prefixField = {}, prefixNames = [], disabled } = props;
  const [fieldsOptions, setFieldsOptions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
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
    <Form.Item shouldUpdate noStyle>
      {({ getFieldValue }) => {
        const func = getFieldValue([...prefixNames, prefixField.name, 'value', 'func']);
        return (
          <Row gutter={8}>
            <Col span={func === 'count' || func === 'rawData' ? 24 : 12}>
              <InputGroupWithFormItem label={<div>{t('datasource:es.value')} </div>} labelWidth={90}>
                <Form.Item {...prefixField} name={[prefixField.name, 'value', 'func']} noStyle>
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
                <InputGroupWithFormItem label='Field key' labelWidth={90}>
                  <Form.Item {...prefixField} name={[prefixField.name, 'value', 'field']} noStyle>
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
      }}
    </Form.Item>
  );
}
