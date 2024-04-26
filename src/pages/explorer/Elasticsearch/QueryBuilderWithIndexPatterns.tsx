import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Form, Select, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TimeRangePicker from '@/components/TimeRangePicker';
import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { getFullFields, Field } from './services';
import InputFilter from './InputFilter';
import { useLocation } from 'react-router-dom';

interface Props {
  onExecute: () => void;
  datasourceValue?: number;
  form: any;
  setFields: (fields: Field[]) => void;
  onIndexChange: () => void;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation('explorer');
  const params = new URLSearchParams(useLocation().search);
  const { onExecute, datasourceValue, form, setFields, onIndexChange } = props;
  const [indexPatterns, setIndexPatterns] = useState<any[]>([]);
  const indexPattern = Form.useWatch(['query', 'indexPattern']);
  
  const [allFields, setAllFields] = useState<Field[]>([]);
  const refInputFilter = useRef<any>();
  const { run: onIndexPatternChange } = useDebounceFn(
    (indexPattern) => {
      if (datasourceValue && indexPattern) {
        const finded = _.find(indexPatterns, { id: indexPattern });
        if (finded) {
          const formValuesQuery = form.getFieldValue('query');
          let fieldConfig;
          try {
            if (finded.fields_format) {
              fieldConfig = JSON.parse(finded.fields_format);
            }
          } catch (error) {
            console.warn(error);
          }

          formValuesQuery.date_field = finded.time_field;
          formValuesQuery.index = finded.name;
          form.setFieldsValue({
            query: formValuesQuery,
            fieldConfig,
          });
          onIndexChange();
          getFullFields(datasourceValue, finded.name, {
            allowHideSystemIndices: finded.allow_hide_system_indices,
          }).then((res) => {
            setFields(res.allFields);
            setAllFields(res.allFields);
          });
        }
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
        if (params.get('index_pattern')) {
          const indexPattern = _.find(res, (item) => item.name === params.get('index_pattern'));
          if (indexPattern) {
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
            onExecute();
          }
        }
      });
    }
  }, [datasourceValue]);

  useEffect(() => {
    if (indexPattern) {
      onIndexPatternChange(indexPattern);
    }
  }, [indexPattern]);

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
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ width: 290, flexShrink: 0 }}>
          <InputGroupWithFormItem label={t('datasource:es.indexPatterns')}>
            <Form.Item
              name={['query', 'indexPattern']}
              rules={[
                {
                  required: true,
                  message: t('datasource:es.indexPattern_msg'),
                },
              ]}
              validateTrigger='onBlur'
            >
              <Select
                options={_.map(indexPatterns, (item) => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                })}
                dropdownMatchSelectWidth={false}
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
          <Form.Item name={['query', 'filter']} style={{ minWidth: 300 }}>
            <InputFilter fields={allFields} ref={refInputFilter} onExecute={onExecute} />
          </Form.Item>
        </InputGroupWithFormItem>
        <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
          <TimeRangePicker
            onChange={() => {
              if (refInputFilter.current) {
                refInputFilter.current.onCallback();
              }
              onExecute();
            }}
          />
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
    </>
  );
}
