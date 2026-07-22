import React, { useContext, useState } from 'react';
import { Form, Radio, Space, Segmented, Button, Modal, Select, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { SqlMonacoPreview } from '@fc-components/monaco-editor';

import { CommonStateContext } from '@/App';
import Collapse, { Panel } from '@/pages/dashboard/Editor/Components/Collapse';
import { generateQueryNameByIndex } from '@/components/QueryName/utils';
import ExpressionPanel from '@/pages/dashboard/Editor/Components/ExpressionPanel';
import AddQueryButtons from '@/pages/dashboard/Editor/Components/AddQueryButtons';
import QueryExtraActions from '@/pages/dashboard/Components/QueryExtraActions';

import { NAME_SPACE } from '../constants';
import BuilderModal from '../components/BuilderModal';
import AdvancedSettings from '../components/AdvancedSettings';
import LegendInput from '../components/LegendInput';
import BuilderConfigRequiredItem from '../components/BuilderConfigRequiredItem';
import QueryStringBuilder from './QueryStringBuilder';
import SQLBuilder from './SQLBuilder';

import './style.less';

export default function DorisQueryBuilder({ datasourceValue }) {
  const { t } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const type = Form.useWatch('type');
  const targets = Form.useWatch('targets');
  const chartForm = Form.useFormInstance();
  const [builderModalFieldName, setBuilderModalFieldName] = useState<number>();
  if (!type) return null;

  return (
    <>
      <Form.List name='targets'>
        {(fields, { add, remove }, { errors }) => {
          return (
            <>
              <Collapse>
                {_.map(fields, (field, index) => {
                  const prefixName = ['targets', field.name];
                  const mode = _.get(targets, [field.name, 'query', 'mode']);
                  const queryStrategy = _.get(targets, [field.name, 'query', 'queryStrategy']);
                  const editMode = _.get(targets, [field.name, 'query', 'editMode'], 'code');
                  const sql = _.get(targets, [field.name, 'query', 'query']);
                  const builderConfig = _.get(targets, [field.name, 'query', 'builderConfig']);
                  const { __mode__ } = targets?.[field.name] || {};
                  if (__mode__ === '__expr__') {
                    return <ExpressionPanel key={field.key} fields={fields} remove={remove} field={field} />;
                  }
                  return (
                    <Panel
                      header={
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) => {
                            return getFieldValue([...prefixName, 'refId']) || generateQueryNameByIndex(index);
                          }}
                        </Form.Item>
                      }
                      key={field.key}
                      extra={
                        <Space>
                          <QueryExtraActions field={field} add={add} />
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
                      <Form.Item noStyle {...field} name={[field.name, 'refId']}>
                        <div />
                      </Form.Item>
                      <div className='mb-4 flex justify-between items-center'>
                        <Space>
                          <Form.Item {...field} name={[field.name, 'query', 'queryStrategy']} initialValue='sql' noStyle>
                            <Radio.Group
                              size='small'
                              options={[
                                {
                                  label: t('query.mode.sql'),
                                  value: 'sql',
                                },
                              ]}
                              optionType='button'
                              buttonStyle='solid'
                            />
                          </Form.Item>
                          {queryStrategy === 'sql' && (
                            <>
                              <Segmented
                                size='small'
                                options={[
                                  { label: 'Builder', value: 'builder' },
                                  { label: 'Code', value: 'code' },
                                ]}
                                value={editMode}
                                onChange={(value) => {
                                  if (value === 'builder' && editMode === 'code') {
                                    const sqlValue = _.get(targets, [field.name, 'query', 'query']);
                                    if (sqlValue) {
                                      Modal.confirm({
                                        title: t('query.editMode.switch_to_builder_confirm_title'),
                                        content: t('query.editMode.switch_to_builder_confirm_content'),
                                        onOk: () => {
                                          chartForm.setFields([
                                            {
                                              name: ['targets', field.name, 'query', 'editMode'],
                                              value: 'builder',
                                            },
                                            {
                                              name: ['targets', field.name, 'query', 'query'],
                                              value: undefined,
                                            },
                                            {
                                              name: ['targets', field.name, 'query', 'builderConfig'],
                                              value: undefined,
                                              errors: [],
                                            },
                                          ]);
                                        },
                                      });
                                      return;
                                    }
                                  }
                                  const nextFields: any[] = [
                                    {
                                      name: ['targets', field.name, 'query', 'editMode'],
                                      value,
                                    },
                                  ];
                                  if (value === 'builder') {
                                    nextFields.push(
                                      {
                                        name: ['targets', field.name, 'query', 'query'],
                                        value: undefined,
                                      },
                                      {
                                        name: ['targets', field.name, 'query', 'builderConfig'],
                                        value: undefined,
                                        errors: [],
                                      },
                                    );
                                  }
                                  chartForm.setFields(nextFields);
                                }}
                              />
                            </>
                          )}
                        </Space>
                        <Form.Item name={[field.name, 'query', 'mode']} initialValue={type === 'timeseries' ? 'timeSeries' : 'raw'} noStyle hidden={editMode === 'builder'}>
                          <Select size='small'>
                            <Select.Option value='timeSeries'>{t('query.dashboard.mode.timeSeries')}</Select.Option>
                            <Select.Option value='raw'>{t('query.dashboard.mode.table')}</Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                      {queryStrategy === 'query' && <QueryStringBuilder field={field} datasourceValue={datasourceValue} />}
                      {queryStrategy === 'sql' && editMode === 'code' && <SQLBuilder field={field} datasourceValue={datasourceValue} mode={mode} />}
                      {queryStrategy === 'sql' && editMode === 'builder' && sql && (
                        <div className={`p-3 rounded max-h-[160px] overflow-y-auto mb-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <SqlMonacoPreview theme={darkMode ? 'dark' : 'light'} value={sql} />
                        </div>
                      )}
                      {queryStrategy === 'sql' && editMode === 'builder' && (
                        <div className='mb-4'>
                          <Tooltip title={!datasourceValue ? t('query.datasource_disabled_tip') : undefined}>
                            <Button
                              size='small'
                              disabled={!datasourceValue}
                              onClick={() => {
                                setBuilderModalFieldName(field.name);
                              }}
                            >
                              {t('builder.open_builder')}
                            </Button>
                          </Tooltip>
                          <BuilderConfigRequiredItem field={field} name={[field.name, 'query', 'builderConfig']} message={t('builder.config_required')} />
                        </div>
                      )}
                      {queryStrategy === 'sql' && (
                        <AdvancedSettings span={8} prefixField={field} prefixName={[field.name, 'query']} expanded valueKeyRequired={mode === 'timeSeries'} />
                      )}
                      {queryStrategy === 'sql' && (
                        <Form.Item
                          label='Legend'
                          {...field}
                          name={[field.name, 'legend']}
                          tooltip={{
                            getPopupContainer: () => document.body,
                            title: t('dashboard:query.legendTip2', {
                              interpolation: { skipOnVariables: true },
                            }),
                          }}
                        >
                          <LegendInput />
                        </Form.Item>
                      )}
                      {queryStrategy === 'sql' && editMode === 'builder' && (
                        <BuilderModal
                          visible={builderModalFieldName === field.name}
                          datasourceId={datasourceValue}
                          builderConfig={builderConfig}
                          onCancel={() => {
                            setBuilderModalFieldName(undefined);
                          }}
                          onConfirm={(nextBuilderConfig, res) => {
                            chartForm.setFields([
                              {
                                name: ['targets', field.name, 'query', 'query'],
                                value: res.sql,
                                errors: [],
                              },
                              {
                                name: ['targets', field.name, 'query', 'builderConfig'],
                                value: {
                                  ...nextBuilderConfig,
                                  mode: res.mode,
                                },
                                errors: [],
                              },
                              {
                                name: ['targets', field.name, 'query', 'mode'],
                                value: res.mode === 'timeseries' ? 'timeSeries' : 'raw',
                              },
                              {
                                name: ['targets', field.name, 'query', 'keys', 'valueKey'],
                                value: res.value_key,
                              },
                              {
                                name: ['targets', field.name, 'query', 'keys', 'labelKey'],
                                value: res.label_key,
                              },
                            ]);
                            setBuilderModalFieldName(undefined);
                          }}
                        />
                      )}
                    </Panel>
                  );
                })}

                <Form.ErrorList errors={errors} />
              </Collapse>
              <AddQueryButtons
                add={add}
                addQuery={(newRefId) => {
                  add({
                    query: {
                      query: '',
                      editMode: 'code',
                    },
                    refId: newRefId,
                  });
                }}
              />
            </>
          );
        }}
      </Form.List>
    </>
  );
}
