import React, { useEffect, useState } from 'react';
import { Form, Checkbox, Space, Button, Tooltip, Popover } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useRequest } from 'ahooks';
import { Link, useLocation } from 'react-router-dom';

import OutlinedAutoComplete from '@/components/OutlinedAutoComplete';
import { OutlinedSelect } from '@/components/OutlinedSelect';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { getESIndexPatterns, standardizeFieldConfig } from '@/pages/log/IndexPatterns/services';

import { NAME_SPACE } from '../../constants';
import { getIndices, getFullFields } from '../../services';
import { HandleValueFilterParams, Field } from '../types';
import { getOrganizeFieldsFromLocalstorage } from '../utils/organizeFieldsLocalstorage';
import FieldsSidebar from './FieldsSidebar';

interface Props {
  disabled?: boolean;
  executeQuery: () => void;
  organizeFields: string[];
  setOrganizeFields: (organizeFields: string[], setLocalstorage?: boolean) => void;
  onIndexDataChange: (data: Field[]) => void;
  handleValueFilter: HandleValueFilterParams;
  requestParams: {
    range?: {
      from: number;
      to: number;
    };
    from: number;
    limit: number;
  };
}

export default function indexCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { disabled, executeQuery, organizeFields, setOrganizeFields, onIndexDataChange, handleValueFilter, requestParams } = props;

  const urlSearchParams = new URLSearchParams(useLocation().search);
  const indexPatternsAuthorized = useIsAuthorized(['/log/index-patterns']);

  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');
  const queryValues = Form.useWatch('query');

  const [indexSearch, setIndexSearch] = useState('');
  const [dateFields, setDateFields] = useState<Field[]>([]);

  const { data: incdices = [] } = useRequest(
    () => {
      return getIndices(datasourceValue, queryValues?.allow_hide_system_indices);
    },
    {
      refreshDeps: [datasourceValue, queryValues?.allow_hide_system_indices],
      ready: !!datasourceValue,
      debounceWait: 300,
    },
  );

  const { data: indexData = [], loading: indexDataLoading } = useRequest(
    () =>
      getFullFields(datasourceValue, queryValues.index, {
        type: 'date',
        allowHideSystemIndices: !!queryValues?.allow_hide_system_indices,
      })
        .then((res) => {
          const fieldData = _.map(res.allFields, (item) => {
            return {
              ...item,
              indexable: true,
            };
          });
          setDateFields(res.fields);
          onIndexDataChange(fieldData);
          return fieldData;
        })
        .catch(() => {
          setDateFields([]);
          return [];
        }),
    {
      refreshDeps: [datasourceValue, queryValues?.index, queryValues?.allow_hide_system_indices],
      ready: !!datasourceValue && !!queryValues?.index,
      debounceWait: 500,
    },
  );

  const { data: indexPatterns, run: runIndexPatterns } = useRequest(() => getESIndexPatterns(datasourceValue), {
    refreshDeps: [datasourceValue],
    ready: !!datasourceValue && queryValues?.mode === 'index-patterns',
    onSuccess: (data) => {
      const queryValues = form.getFieldValue('query');
      if (queryValues.index_pattern && queryValues.index === undefined) {
        const indexPattern = _.find(data, (item) => {
          // Support searching by both id and name for better compatibility with old URL params
          return item.id === _.toNumber(queryValues.index_pattern) || item.name === queryValues.index_pattern;
        });
        if (indexPattern) {
          let fieldConfig;

          try {
            if (indexPattern.fields_format) {
              fieldConfig = standardizeFieldConfig(JSON.parse(indexPattern.fields_format));
            }
          } catch (error) {
            console.warn(error);
          }

          queryValues.date_field = indexPattern.time_field;
          queryValues.index = indexPattern.name;
          queryValues.allow_hide_system_indices = indexPattern.allow_hide_system_indices;
          form.setFieldsValue({
            query: queryValues,
            fieldConfig,
          });
          executeQuery();
        }
      }
    },
  });

  useEffect(() => {
    if (datasourceValue && queryValues?.index) {
      setOrganizeFields(
        getOrganizeFieldsFromLocalstorage({
          datasourceValue,
          index: queryValues.index,
        }),
        false,
      );
    }
  }, [datasourceValue, queryValues?.index]);

  return (
    <>
      <div className='min-h-0 flex-1 h-full flex flex-col'>
        <div className='flex-shrink-0'>
          <Form.Item name={['query', 'mode']} initialValue='indices'>
            <OutlinedSelect
              label={t('query.mode')}
              options={[
                {
                  label: t('query.mode_indices'),
                  value: 'indices',
                },
                {
                  label: t('query.mode_index_patterns'),
                  value: 'index-patterns',
                },
              ]}
            />
          </Form.Item>
          {queryValues?.mode === 'indices' && (
            <>
              <Form.Item name={['query', 'allow_hide_system_indices']} initialValue={false} noStyle hidden>
                <div />
              </Form.Item>
              <Form.Item
                name={['query', 'index']}
                rules={[
                  {
                    required: true,
                    message: t('query.index_required'),
                  },
                ]}
                validateTrigger='onBlur'
              >
                <OutlinedAutoComplete
                  label={t('query.index')}
                  dropdownMatchSelectWidth={false}
                  options={_.map(
                    _.filter(incdices, (item) => {
                      if (indexSearch) {
                        return _.includes(item, indexSearch);
                      }
                      return true;
                    }),
                    (item) => {
                      return {
                        label: item,
                        value: item,
                      };
                    },
                  )}
                  onSearch={(val) => {
                    setIndexSearch(val);
                  }}
                  suffix={
                    <Tooltip title={t('query.indices_tip')} placement='top'>
                      <Popover
                        content={
                          <div>
                            <Form.Item name={['query', 'allow_hide_system_indices']} valuePropName='checked' noStyle>
                              <Checkbox>{t('query.allow_hide_system_indices')}</Checkbox>
                            </Form.Item>
                          </div>
                        }
                        trigger='click'
                        placement='bottom'
                      >
                        <Button icon={<SettingOutlined />} />
                      </Popover>
                    </Tooltip>
                  }
                />
              </Form.Item>
              <Form.Item
                name={['query', 'date_field']}
                rules={[
                  {
                    required: true,
                    message: t('query.date_field_required'),
                  },
                ]}
              >
                <OutlinedAutoComplete
                  label={t('query.date_field')}
                  dropdownMatchSelectWidth={false}
                  style={{ width: '100%' }}
                  options={_.map(dateFields, (item) => {
                    return {
                      label: item.field,
                      value: item.field,
                    };
                  })}
                />
              </Form.Item>
            </>
          )}
          {queryValues?.mode === 'index-patterns' && (
            <>
              <Form.Item name={['query', 'index']} hidden>
                <div />
              </Form.Item>
              <Form.Item name={['query', 'allow_hide_system_indices']} hidden>
                <div />
              </Form.Item>
              <Form.Item name={['query', 'date_field']} hidden>
                <div />
              </Form.Item>
              <Form.Item name={['fieldConfig']} hidden>
                <div />
              </Form.Item>
              <Form.Item
                name={['query', 'index_pattern']}
                rules={[
                  {
                    required: true,
                    message: t('query.index_pattern_required'),
                  },
                ]}
                validateTrigger='onBlur'
              >
                <OutlinedSelect
                  label={t('query.index_pattern')}
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
                  suffix={
                    indexPatternsAuthorized && (
                      <Tooltip
                        overlayClassName='ant-tooltip-with-link'
                        title={
                          <Space>
                            {t('datasource:es.indexPatterns_manage')}
                            <a
                              onClick={() => {
                                runIndexPatterns();
                              }}
                            >
                              {t('common:btn.reload')}
                            </a>
                          </Space>
                        }
                      >
                        <Link to='/log/index-patterns' target='_blank'>
                          <Button icon={<SettingOutlined />} />
                        </Link>
                      </Tooltip>
                    )
                  }
                  onChange={(val) => {
                    const selected = _.find(indexPatterns, (item) => item.id === val);
                    if (selected) {
                      const queryValues = form.getFieldValue('query');

                      let fieldConfig;

                      try {
                        if (selected.fields_format) {
                          fieldConfig = standardizeFieldConfig(JSON.parse(selected.fields_format));
                        }
                      } catch (error) {
                        console.warn(error);
                      }

                      queryValues.date_field = selected.time_field;
                      queryValues.index = selected.name;
                      queryValues.allow_hide_system_indices = selected.allow_hide_system_indices;
                      form.setFieldsValue({
                        query: queryValues,
                        fieldConfig,
                      });
                    }
                  }}
                />
              </Form.Item>
            </>
          )}
        </div>
        <div className='min-h-0 flex-1 children:h-full'>
          <FieldsSidebar
            organizeFields={organizeFields}
            setOrganizeFields={setOrganizeFields}
            data={indexData}
            loading={indexDataLoading}
            onValueFilter={handleValueFilter}
            executeQuery={executeQuery}
            requestParams={requestParams}
          />
        </div>
      </div>
    </>
  );
}
