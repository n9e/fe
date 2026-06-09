import React, { useState } from 'react';
import { Form, Radio, Space, Segmented, Button, Modal, message, Select, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import Collapse, { Panel } from '@/pages/dashboard/Editor/Components/Collapse';
import { alphabet } from '@/utils/constant';
import { DatasourceCateEnum } from '@/utils/constant';
import ExpressionPanel from '@/pages/dashboard/Editor/Components/ExpressionPanel';
import AddQueryButtons from '@/pages/dashboard/Editor/Components/AddQueryButtons';
import QueryExtraActions from '@/pages/dashboard/Components/QueryExtraActions';

import { NAME_SPACE } from '../constants';
import { buildSql } from '../services';
import QueryStringBuilder from './QueryStringBuilder';
import SQLBuilder from './SQLBuilder';
import BuilderContent from './BuilderContent';

import './style.less';

export default function DorisQueryBuilder({ datasourceValue }) {
  const { t } = useTranslation(NAME_SPACE);
  const type = Form.useWatch('type');
  const targets = Form.useWatch('targets');
  const chartForm = Form.useFormInstance();
  const [builderDirtyMap, setBuilderDirtyMap] = useState<Record<number, boolean>>({});
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
                  const isBuilderDirty = builderDirtyMap[field.name] ?? false;
                  const { __mode__ } = targets?.[field.name] || {};
                  if (__mode__ === '__expr__') {
                    return <ExpressionPanel key={field.key} fields={fields} remove={remove} field={field} />;
                  }
                  return (
                    <Panel
                      header={
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) => {
                            return getFieldValue([...prefixName, 'refId']) || alphabet[index];
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
                                          ]);
                                        },
                                      });
                                      return;
                                    }
                                  }
                                  chartForm.setFields([
                                    {
                                      name: ['targets', field.name, 'query', 'editMode'],
                                      value,
                                    },
                                  ]);
                                }}
                              />
                              {editMode === 'builder' && (
                                <Space>
                                  <Button
                                    size='small'
                                    onClick={() => {
                                      const builderConfig = _.get(targets, [field.name, 'query', 'builderConfig']);
                                      if (!builderConfig) {
                                        message.warning(t('query.editMode.no_builder_config'));
                                        return;
                                      }
                                      const database = _.get(targets, [field.name, 'query', 'builderConfig', 'database']);
                                      const table = _.get(targets, [field.name, 'query', 'builderConfig', 'table']);
                                      const timeField = _.get(targets, [field.name, 'query', 'builderConfig', 'time_field']);
                                      if (!database || !table || !timeField) {
                                        message.warning(t('query.editMode.require_db_table'));
                                        return;
                                      }
                                      buildSql({
                                        cate: DatasourceCateEnum.doris,
                                        datasource_id: datasourceValue,
                                        query: [
                                          {
                                            database,
                                            table,
                                            time_field: timeField,
                                            from: moment().subtract(6, 'hours').unix(),
                                            to: moment().unix(),
                                            filters: builderConfig?.filters,
                                            aggregates: builderConfig?.aggregates,
                                            group_by: builderConfig?.group_by,
                                            order_by: builderConfig?.order_by,
                                            mode: builderConfig?.mode || 'table',
                                            limit: builderConfig?.limit,
                                          },
                                        ],
                                      })
                                        .then((res) => {
                                          chartForm.setFields([
                                            {
                                              name: ['targets', field.name, 'query', 'query'],
                                              value: res.sql,
                                            },
                                            {
                                              name: ['targets', field.name, 'query', 'mode'],
                                              value: res.mode === 'timeseries' ? 'timeSeries' : 'raw',
                                            },
                                            {
                                              name: ['targets', field.name, 'query', 'builderConfig', 'mode'],
                                              value: res.mode,
                                            },
                                          ]);
                                          setBuilderDirtyMap((prev) => ({ ...prev, [field.name]: false }));
                                        })
                                        .catch(() => {
                                          message.error(t('query.editMode.build_sql_failed'));
                                        });
                                    }}
                                  >
                                    {t('builder.preview_and_run')}
                                  </Button>
                                  {isBuilderDirty && <Tag color='orange'>{t('builder.builder_content_modified')}</Tag>}
                                </Space>
                              )}
                            </>
                          )}
                        </Space>
                        {editMode === 'builder' && (
                          <Form.Item
                            name={[field.name, 'query', '__builderDirty__']}
                            hidden
                            initialValue={false}
                            rules={[
                              {
                                validator: () => {
                                  if (isBuilderDirty) {
                                    return Promise.reject(new Error(t('builder.builder_content_modified')));
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <input type='hidden' />
                          </Form.Item>
                        )}
                        <Form.Item name={[field.name, 'query', 'mode']} initialValue={type === 'timeseries' ? 'timeSeries' : 'raw'} noStyle hidden={editMode === 'builder'}>
                          <Select size='small'>
                            <Select.Option value='timeSeries'>{t('query.dashboard.mode.timeSeries')}</Select.Option>
                            <Select.Option value='raw'>{t('query.dashboard.mode.table')}</Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                      {queryStrategy === 'query' && <QueryStringBuilder field={field} datasourceValue={datasourceValue} />}
                      {queryStrategy === 'sql' && editMode === 'code' && <SQLBuilder field={field} datasourceValue={datasourceValue} mode={mode} />}
                      {queryStrategy === 'sql' && editMode === 'builder' && (
                        <BuilderContent
                          field={field}
                          datasourceValue={datasourceValue}
                          onBuilderChange={() => {
                            setBuilderDirtyMap((prev) => ({ ...prev, [field.name]: true }));
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
