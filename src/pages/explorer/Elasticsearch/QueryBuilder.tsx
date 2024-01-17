import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { useLocation } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Input, Tooltip, Form, AutoComplete, Select, Button, FormInstance } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TimeRangePicker from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { getIndices, getFullFields, Field } from './services';
import InputFilter from './InputFilter';

interface Props {
  onExecute: () => void;
  datasourceValue?: number;
  setFields: (fields: Field[]) => void;
  allowHideSystemIndices?: boolean;
  form: FormInstance;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation('explorer');
  const { onExecute, datasourceValue, setFields, allowHideSystemIndices = false, form } = props;
  const params = new URLSearchParams(useLocation().search);
  const [indexOptions, setIndexOptions] = useState<any[]>([]);
  const [indexSearch, setIndexSearch] = useState('');
  const [dateFields, setDateFields] = useState<Field[]>([]);
  const indexValue = Form.useWatch(['query', 'index']);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const refInputFilter = useRef<any>();
  const { run: onIndexChange } = useDebounceFn(
    (val) => {
      if (datasourceValue && val) {
        getFullFields(datasourceValue, val, {
          type: 'date',
          allowHideSystemIndices,
        }).then((res) => {
          setFields(res.allFields);
          setAllFields(res.allFields);
          setDateFields(res.fields);
          const query = form.getFieldValue('query');
          const dateField = _.find(res.fields, { name: query.date_field })?.name;
          const defaultDateField = _.find(res.fields, { name: '@timestamp' })?.name || res.fields[0]?.name;
          form.setFieldsValue({
            query: {
              ...query,
              date_field: dateField || defaultDateField,
            },
          });
        });
      }
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (datasourceValue) {
      getIndices(datasourceValue, allowHideSystemIndices).then((res) => {
        const indexOptions = _.map(res, (item) => {
          return {
            value: item,
          };
        });
        setIndexOptions(indexOptions);
      });
    }
  }, [datasourceValue, allowHideSystemIndices]);

  useEffect(() => {
    // 假设携带数据源值时会同时携带其他的参数，并且触发一次查询
    onIndexChange(params.get('index_name'));
  }, []);

  useEffect(() => {
    if (indexValue) {
      onIndexChange(indexValue);
    }
  }, [indexValue]);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ width: 290, flexShrink: 0 }}>
        <InputGroupWithFormItem
          label={
            <>
              {t('datasource:es.index')}{' '}
              <Tooltip title={<Trans ns='datasource' i18nKey='datasource:es.index_tip' components={{ 1: <br /> }} />}>
                <QuestionCircleOutlined />
              </Tooltip>
            </>
          }
        >
          <Form.Item
            name={['query', 'index']}
            rules={[
              {
                required: true,
                message: t('datasource:es.index_msg'),
              },
            ]}
            validateTrigger='onBlur'
          >
            <AutoComplete
              dropdownMatchSelectWidth={false}
              options={_.filter(indexOptions, (item) => {
                if (indexSearch) {
                  return _.includes(item.value, indexSearch);
                }
                return true;
              })}
              onSearch={(val) => {
                setIndexSearch(val);
              }}
            />
          </Form.Item>
        </InputGroupWithFormItem>
      </div>
      <InputGroupWithFormItem
        label={
          <>
            {t('datasource:es.filter')}{' '}
            <a href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax ' target='_blank'>
              <QuestionCircleOutlined />
            </a>
          </>
        }
      >
        <Form.Item name={['query', 'filter']}>
          <InputFilter fields={allFields} ref={refInputFilter} onExecute={onExecute} />
        </Form.Item>
      </InputGroupWithFormItem>
      <div style={{ width: 200, flexShrink: 0 }}>
        <InputGroupWithFormItem label={t('datasource:es.date_field')}>
          <Form.Item
            name={['query', 'date_field']}
            rules={[
              {
                required: true,
                message: t('datasource:es.date_field_msg'),
              },
            ]}
          >
            <Select dropdownMatchSelectWidth={false} showSearch>
              {_.map(dateFields, (item) => {
                return (
                  <Select.Option key={item.name} value={item.name}>
                    {item.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </InputGroupWithFormItem>
      </div>
      <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
        <TimeRangePicker />
      </Form.Item>
      <Form.Item>
        <Button
          type='primary'
          onClick={() => {
            if (refInputFilter.current) {
              refInputFilter.current.onCallback();
            }
            onExecute();
          }}
        >
          {t('query_btn')}
        </Button>
      </Form.Item>
    </div>
  );
}
