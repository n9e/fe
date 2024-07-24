import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Form, Select, Button, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import TimeRangePicker from '@/components/TimeRangePicker';
import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import AuthorizationWrapper, { useIsAuthorized } from '@/components/AuthorizationWrapper';
import KQLInput from '@/components/KQLInput';
import { getLocalQueryHistory, setLocalQueryHistory } from '@/components/KQLInput/utils';
import { getFullFields, Field } from './services';
import InputFilter from './InputFilter';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  onExecute: () => void;
  datasourceValue?: number;
  form: any;
  setFields: (fields: Field[]) => void;
  onIndexChange: () => void;
  loading: boolean;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation('explorer');
  const params = new URLSearchParams(useLocation().search);
  const { onExecute, datasourceValue, form, setFields, onIndexChange, loading } = props;
  const [indexPatterns, setIndexPatterns] = useState<any[]>([]);
  const indexPattern = Form.useWatch(['query', 'indexPattern']);
  const indexPatternObj = _.find(indexPatterns, (item) => item.id === indexPattern);
  const date_field = Form.useWatch(['query', 'date_field']);
  const syntax = Form.useWatch(['query', 'syntax']);
  const indexPatternsAuthorized = useIsAuthorized(['/log/index-patterns']);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const refInputFilter = useRef<any>();
  const { run: onIndexPatternChange } = useDebounceFn(
    (indexPattern) => {
      if (datasourceValue && indexPattern) {
        const finded = indexPatterns.find((i) => i.id === indexPattern || i.name === indexPattern); //从url上带过来时indexPattern不是id，是name，兼容下这种情况
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
          <InputGroupWithFormItem
            label={t('datasource:es.indexPatterns')}
            addonAfter={
              indexPatternsAuthorized ? (
                <Tooltip title={t('datasource:es.indexPatterns_manage')}>
                  <Link to='/log/index-patterns'>
                    <SettingOutlined />
                  </Link>
                </Tooltip>
              ) : undefined
            }
          >
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
                  index: indexPatternObj?.name,
                  date_field: date_field,
                }}
                historicalRecords={getLocalQueryHistory(datasourceValue)}
                onEnter={onExecute}
              />
            </Form.Item>
          )}
        </InputGroupWithFormItem>
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
    </>
  );
}
