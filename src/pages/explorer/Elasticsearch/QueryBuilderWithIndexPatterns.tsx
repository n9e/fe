import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Form, Select, Button, Space, Row, Col } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import TimeRangePicker from '@/components/TimeRangePicker';
import { getESIndexPatterns, standardizeFieldConfig } from '@/pages/log/IndexPatterns/services';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import KQLInput from '@/components/KQLInput';
import IndexPatternSettingsBtn from '@/pages/explorer/Elasticsearch/components/IndexPatternSettingsBtn';
import ConditionHistoricalRecords, { setLocalQueryHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';

import { getFullFields, Field } from './services';
import InputFilter from './InputFilter';

interface Props {
  onExecute: () => void;
  datasourceValue?: number;
  form: any;
  setFields: (fields: Field[]) => void;
  onIndexChange: () => void;
  loading: boolean;
}

const CACHE_KEY = 'es-index-patterns-query-history-records';

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
          formValuesQuery.date_field = finded.time_field;
          formValuesQuery.index = finded.name;
          form.setFieldsValue({
            query: formValuesQuery,
          });
          onIndexChange();
          getFullFields(datasourceValue, finded.name, {
            allowHideSystemIndices: finded.allow_hide_system_indices,
            crossClusterEnabled: finded.cross_cluster_enabled === 1,
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
  const fetchESIndexPatterns = (callback?: (res) => void) => {
    getESIndexPatterns(datasourceValue).then((res) => {
      setIndexPatterns(res);
      callback && callback(res);
    });
  };

  useEffect(() => {
    if (datasourceValue) {
      fetchESIndexPatterns((res) => {
        if (params.get('index_pattern')) {
          const indexPattern = _.find(res, (item) => item.name === params.get('index_pattern'));
          if (indexPattern) {
            const formValuesQuery = form.getFieldValue('query');
            let fieldConfig;
            try {
              if (indexPattern.fields_format) {
                fieldConfig = standardizeFieldConfig(JSON.parse(indexPattern.fields_format));
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

  useEffect(() => {
    if (params.get('__execute__')) {
      onExecute();
    }
  }, []);

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
      <Row gutter={8}>
        <Col flex='none'>
          <div style={{ width: 290 }}>
            <InputGroupWithFormItem
              label={t('datasource:es.indexPatterns')}
              addonAfter={
                indexPatternsAuthorized && (
                  <IndexPatternSettingsBtn
                    onReload={() => {
                      fetchESIndexPatterns();
                    }}
                  />
                )
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
                      label: (
                        <Space>
                          <span>{item.name}</span>
                          <span
                            style={{
                              color: 'var(--fc-text-3)',
                            }}
                          >
                            {item.note}
                          </span>
                        </Space>
                      ),
                      originLabel: item.name,
                      searchIndex: `${item.name} ${item.note}`,
                      value: item.id,
                    };
                  })}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  optionFilterProp='searchIndex'
                  optionLabelProp='originLabel'
                />
              </Form.Item>
            </InputGroupWithFormItem>
          </div>
        </Col>
        <Col flex='auto'>
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
                  historicalRecords={[]}
                  onEnter={onExecute}
                />
              </Form.Item>
            )}
          </InputGroupWithFormItem>
        </Col>
        <Col flex='none'>
          <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }} hidden={!date_field}>
            <TimeRangePicker
              onChange={() => {
                if (refInputFilter.current) {
                  refInputFilter.current.onCallback();
                }
                setLocalQueryHistory(CACHE_KEY, _.omit(form.getFieldValue(['query']), 'range'));
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
        </Col>
        <Col flex='none'>
          <ConditionHistoricalRecords
            localKey={CACHE_KEY}
            datasourceValue={datasourceValue!}
            renderItem={(item) => {
              return (
                <div
                  className='flex flex-wrap items-center gap-x-2 gap-y-1 cursor-pointer hover:bg-[var(--fc-fill-3)] p-1 rounded leading-[1.1] mb-1'
                  key={JSON.stringify(item)}
                  onClick={() => {
                    form.setFieldsValue({
                      query: {
                        ...item,
                        indexPattern: _.toNumber(item.indexPattern),
                      },
                    });
                    onExecute();
                  }}
                >
                  {_.map(_.pick(item, ['indexPattern', 'filter']), (value, key) => {
                    if (!value) return <span key={key} />;
                    return (
                      <span key={key}>
                        <span className='bg-[var(--fc-fill-1)] inline-block p-1 mr-1'>{t(`datasource:es.${key}`)}:</span>
                        <span>{key === 'indexPattern' ? _.find(indexPatterns, { id: _.toNumber(value) })?.name ?? value : value}</span>
                      </span>
                    );
                  })}
                </div>
              );
            }}
          />
        </Col>
        <Col flex='none'>
          <Form.Item>
            <Button
              loading={loading}
              type='primary'
              onClick={() => {
                if (refInputFilter.current) {
                  refInputFilter.current.onCallback();
                }
                setLocalQueryHistory(`${CACHE_KEY}-${datasourceValue}`, _.omit(form.getFieldValue(['query']), 'range'));
                onExecute();
              }}
            >
              {t('query_btn')}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
