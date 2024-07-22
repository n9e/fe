import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { useLocation } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Tooltip, Form, AutoComplete, Button, FormInstance, Select } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TimeRangePicker from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import KQLInput from '@/components/KQLInput';
import { getLocalQueryHistory, setLocalQueryHistory } from '@/components/KQLInput/utils';
import { getIndices, getFullFields, Field } from './services';
import InputFilter from './InputFilter';

interface Props {
  onExecute: () => void;
  datasourceValue?: number;
  setFields: (fields: Field[]) => void;
  allowHideSystemIndices?: boolean;
  form: FormInstance;
  loading: boolean;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation('explorer');
  const { onExecute, datasourceValue, setFields, allowHideSystemIndices = false, form, loading } = props;
  const params = new URLSearchParams(useLocation().search);
  const [indexOptions, setIndexOptions] = useState<any[]>([]);
  const [indexSearch, setIndexSearch] = useState('');
  const [dateFields, setDateFields] = useState<Field[]>([]);
  const indexValue = Form.useWatch(['query', 'index']);
  const date_field = Form.useWatch(['query', 'date_field']);
  const syntax = Form.useWatch(['query', 'syntax']);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const refInputFilter = useRef<any>();
  const initialized = useRef<boolean>(false);
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
          // 如果没有初始化过，并且 URL 携带了 index_name 和 timestamp，则不需要初始化 date_field 字段值
          if (!initialized.current && params.get('timestamp') && params.get('index_name')) {
            initialized.current = true;
            return;
          }
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
    // 假设 URL 携带了 index_name 和 timestamp，则触发一次查询
    if (params.get('timestamp') && params.get('index_name')) {
      onExecute();
    }
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
          </>
        }
        addonAfter={
          <Form.Item name={['query', 'syntax']} noStyle initialValue='lucene'>
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
              onChange={() => {
                form.setFieldsValue({
                  query: {
                    filter: '',
                  },
                });
              }}
            />
          </Form.Item>
        }
      >
        {syntax === 'lucene' ? (
          <Form.Item name={['query', 'filter']}>
            <InputFilter fields={allFields} ref={refInputFilter} onExecute={onExecute} />
          </Form.Item>
        ) : (
          <Form.Item name={['query', 'filter']}>
            <KQLInput
              datasourceValue={datasourceValue}
              query={{
                index: indexValue,
                date_field: date_field,
              }}
              historicalRecords={getLocalQueryHistory(datasourceValue)}
              onEnter={onExecute}
            />
          </Form.Item>
        )}
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
            <AutoComplete
              dropdownMatchSelectWidth={false}
              style={{ width: '100%' }}
              options={_.map(dateFields, (item) => {
                return {
                  value: item.name,
                };
              })}
            />
          </Form.Item>
        </InputGroupWithFormItem>
      </div>
      <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
        <TimeRangePicker
          onChange={() => {
            if (refInputFilter.current) {
              refInputFilter.current.onCallback();
            }
            setLocalQueryHistory(datasourceValue, form.getFieldValue(['query', 'filter']));
            onExecute();
          }}
          ajustTimeOptions={(options) => {
            return _.concat(
              [
                { start: 'now-5s', end: 'now', display: 'Last 5 seconds' },
                { start: 'now-15s', end: 'now', display: 'Last 15 seconds' },
                { start: 'now-30s', end: 'now', display: 'Last 30 seconds' },
              ],
              options,
            );
          }}
        />
      </Form.Item>
      <Form.Item>
        <Button
          loading={loading}
          type='primary'
          onClick={() => {
            if (refInputFilter.current) {
              refInputFilter.current.onCallback();
            }
            setLocalQueryHistory(datasourceValue, form.getFieldValue(['query', 'filter']));
            onExecute();
          }}
        >
          {t('query_btn')}
        </Button>
      </Form.Item>
    </div>
  );
}
