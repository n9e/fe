/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Modal, Input, Form, Table, Button, Select, Switch, Space, Tag, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import { getComponents, getCates, getPayloads, Component, Payload } from '@/pages/builtInComponents/services';
import { TypeEnum } from '@/pages/builtInComponents/types';
import { createRule } from '@/pages/builtInComponents/AlertRules/services';

export default function ImportBuiltinContent({ busiId, onOk, groupedDatasourceList, datasourceCateOptions }) {
  const { t } = useTranslation('dashboard');
  const [filter, setFilter] = useState<{
    query?: string;
  }>({ query: undefined });
  const [components, setComponents] = useState<Component[]>([]);
  const [data, setData] = useState<Payload[]>([]);
  const [cateList, setCateList] = useState<string[]>([]);
  const [form] = Form.useForm();
  const component = Form.useWatch('component', form);
  const cate = Form.useWatch('cate', form);
  const selectedRules = Form.useWatch('selectedRules', form);
  const datasourceCate = Form.useWatch('datasource_cate', form);
  const datasourceCates = _.filter(datasourceCateOptions, (item) => !!item.alertRule);
  const [allowSubmit, setAllowSubmit] = React.useState(true);

  useEffect(() => {
    getComponents().then((res) => {
      setComponents(res);
    });
  }, []);

  useEffect(() => {
    getCates({
      component,
      type: TypeEnum.alert,
    }).then((res) => {
      setCateList(res);
      form.setFieldsValue({
        cate: cate || _.head(res),
      });
    });
  }, [component]);

  useEffect(() => {
    if (!component || !cate) return;
    getPayloads<Payload[]>({
      component,
      type: TypeEnum.alert,
      cate: cate,
      query: filter.query,
    }).then((res) => {
      setData(res);
    });
  }, [component, cate, filter.query]);

  return (
    <Form
      layout='vertical'
      form={form}
      onFinish={(vals) => {
        createRule(
          busiId,
          _.map(vals.selectedRules, (item) => {
            const content = JSON.parse(item.content);
            return {
              ...content,
              cate: vals.datasource_cate,
              datasource_ids: vals.datasource_ids,
              disabled: vals.enabled ? 0 : 1,
            };
          }),
        ).then((res) => {
          const failed = _.some(res, (val) => {
            return !!val;
          });
          if (failed) {
            Modal.error({
              title: t('common:error.clone'),
              content: (
                <div>
                  {_.map(res, (val, key) => {
                    return (
                      <div key={key}>
                        {key}: {val}
                      </div>
                    );
                  })}
                </div>
              ),
            });
          } else {
            onOk();
          }
        });
      }}
      initialValues={{
        enabled: false,
      }}
    >
      {!allowSubmit && <Alert className='mb1' message={t('builtInComponents:import_to_buisGroup_invaild')} type='error' showIcon />}
      <Form.Item
        label={t('builtInComponents:component')}
        name='component'
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select
          showSearch
          options={_.map(components, (item) => {
            return {
              label: item.ident,
              value: item.ident,
            };
          })}
          onChange={() => {
            form.setFieldsValue({
              cate: undefined,
              selectedBoards: undefined,
            });
          }}
        />
      </Form.Item>
      <Form.Item
        label={t('builtInComponents:cate')}
        name='cate'
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select
          showSearch
          options={_.map(cateList, (item) => {
            return {
              label: item,
              value: item,
            };
          })}
          onChange={() => {
            form.setFieldsValue({
              selectedBoards: undefined,
            });
          }}
        />
      </Form.Item>
      <Form.Item name='selectedRules' label={t('builtInComponents:payloads')} hidden={!component}>
        <>
          <Input
            prefix={<SearchOutlined />}
            value={filter.query}
            onChange={(e) => {
              setFilter({ ...filter, query: e.target.value });
            }}
            style={{ marginBottom: 8 }}
            allowClear
          />
          <Table
            size='small'
            rowKey='name'
            columns={[
              {
                title: t('builtInComponents:name'),
                dataIndex: 'name',
              },
              {
                title: t('builtInComponents:tags'),
                dataIndex: 'tags',
                render: (val) => {
                  const tags = _.compact(_.split(val, ' '));
                  return (
                    <Space size='middle'>
                      {_.map(tags, (tag, idx) => {
                        return (
                          <Tag
                            key={idx}
                            color='purple'
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              const queryItem = _.compact(_.split(filter.query, ' '));
                              if (_.includes(queryItem, tag)) return;
                              setFilter((filter) => {
                                return {
                                  ...filter,
                                  query: filter.query ? filter.query + ' ' + tag : tag,
                                };
                              });
                            }}
                          >
                            {tag}
                          </Tag>
                        );
                      })}
                    </Space>
                  );
                },
              },
            ]}
            dataSource={data}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: _.map(selectedRules, 'name'),
              onChange(_selectedRowKeys, selectedRows) {
                const cates = _.union(
                  _.filter(
                    _.map(selectedRows, (item) => {
                      const content = JSON.parse(item.content);
                      return content.cate;
                    }),
                    (item) => {
                      return item !== 'host';
                    },
                  ),
                );
                if (cates.length === 1) {
                  form.setFieldsValue({
                    selectedRules: selectedRows,
                    datasource_cate: cates[0],
                  });
                  setAllowSubmit(true);
                } else {
                  form.setFieldsValue({
                    selectedRules: selectedRows,
                  });
                  setAllowSubmit(false);
                }
              },
            }}
            scroll={{ y: 300 }}
            pagination={false}
          />
        </>
      </Form.Item>
      {!_.isEmpty(selectedRules) && (
        <>
          <Form.Item label={t('common:datasource.type')} name='datasource_cate'>
            <Select disabled>
              {_.map(datasourceCates, (item) => {
                return (
                  <Select.Option key={item.value} value={item.value}>
                    {item.label}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <DatasourceValueSelect mode='multiple' setFieldsValue={form.setFieldsValue} cate={datasourceCate} datasourceList={groupedDatasourceList[datasourceCate] || []} />
        </>
      )}

      <Form.Item label={t('common:table.enabled')} name='enabled' valuePropName='checked'>
        <Switch />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' disabled={!allowSubmit}>
          {t('common:btn.import')}
        </Button>
      </Form.Item>
    </Form>
  );
}
