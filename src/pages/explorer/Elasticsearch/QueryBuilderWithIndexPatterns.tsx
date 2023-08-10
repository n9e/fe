import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Space, Input, Form, Select, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TimeRangePicker from '@/components/TimeRangePicker';
import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';
import { getFullFields, Field } from './services';

interface Props {
  onExecute: () => void;
  datasourceValue?: number;
  form: any;
  setFields: (fields: Field[]) => void;
  onIndexChange: () => void;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation('explorer');
  const { onExecute, datasourceValue, form, setFields, onIndexChange } = props;
  const [indexPatterns, setIndexPatterns] = useState<any[]>([]);
  const { run: onIndexPatternChange } = useDebounceFn(
    (indexPattern) => {
      if (datasourceValue && indexPattern) {
        getFullFields(datasourceValue, indexPattern.name, {
          allowHideSystemIndices: indexPattern.allow_hide_system_indices,
        }).then((res) => {
          setFields(res.allFields);
        });
      }
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (datasourceValue) {
      getESIndexPatterns(datasourceValue).then((res) => {
        setIndexPatterns(res);
      });
    }
  }, [datasourceValue]);

  return (
    <>
      <Form.Item name={['query', 'index']} hidden>
        <div />
      </Form.Item>
      <Form.Item name={['query', 'date_field']} hidden>
        <div />
      </Form.Item>
      <Form.Item name={['fieldConfig']} hidden>
        <div />
      </Form.Item>
      <Space>
        <Input.Group compact>
          <span
            className='ant-input-group-addon'
            style={{
              width: 'max-content',
              height: 32,
              lineHeight: '32px',
            }}
          >
            {t('datasource:es.indexPatterns')}
          </span>
          <Form.Item
            name={['query', 'indexPattern']}
            rules={[
              {
                required: true,
                message: t('datasource:es.indexPattern_msg'),
              },
            ]}
            validateTrigger='onBlur'
            style={{ width: 190 }}
          >
            <Select
              options={_.map(indexPatterns, (item) => {
                return {
                  label: item.name,
                  value: item.id,
                };
              })}
              style={{ minWidth: 100 }}
              dropdownMatchSelectWidth={false}
              onChange={(val) => {
                const indexPattern = _.find(indexPatterns, (item) => item.id === val);
                if (indexPattern) {
                  onIndexPatternChange(indexPattern);
                  const formValuesQuery = form.getFieldValue('query');
                  let fieldConfig;
                  try {
                    if (indexPattern.fields_format) {
                      fieldConfig = JSON.parse(indexPattern.fields_format);
                    }
                  } catch (error) {
                    console.warn(error);
                  }

                  formValuesQuery.date_field = indexPattern.time_field;
                  formValuesQuery.index = indexPattern.name;
                  form.setFieldsValue({
                    query: formValuesQuery,
                    fieldConfig,
                  });
                  onIndexChange();
                }
              }}
            />
          </Form.Item>
        </Input.Group>
        <Input.Group compact>
          <span
            className='ant-input-group-addon'
            style={{
              width: 90,
              height: 32,
              lineHeight: '32px',
            }}
          >
            {t('datasource:es.filter')}{' '}
            <a href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax ' target='_blank'>
              <QuestionCircleOutlined />
            </a>
          </span>
          <Form.Item name={['query', 'filter']} style={{ minWidth: 300 }}>
            <Input
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  onExecute();
                }
              }}
            />
          </Form.Item>
        </Input.Group>
        <div style={{ display: 'flex' }}>
          <Space>
            <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
              <TimeRangePicker />
            </Form.Item>
            <Form.Item>
              <Button
                type='primary'
                onClick={() => {
                  onExecute();
                }}
              >
                {t('query_btn')}
              </Button>
            </Form.Item>
          </Space>
        </div>
      </Space>
    </>
  );
}
