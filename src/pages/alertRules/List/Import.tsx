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
import { Modal, Input, Form, Table, Button, Divider, message, Select, Row, Col, Switch, Space, Tag, Tabs } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { importStrategy } from '@/services/warning';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import { getComponents, getCates, getPayloads, Component, Payload } from '@/pages/builtInComponents/services';
import { TypeEnum } from '@/pages/builtInComponents/types';
import { createRule } from '@/pages/builtInComponents/AlertRules/services';

type ModalType = 'Import' | 'ImportBuiltin';
interface IProps {
  busiId: number;
  refreshList: () => void;
  groupedDatasourceList: any;
  datasourceCateOptions: any;
  type?: ModalType;
}

const TabPane = Tabs.TabPane;

const ImportBuiltinContent = ({ busiId, onOk, groupedDatasourceList, datasourceCateOptions }) => {
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
  const datasourceCates = _.filter(datasourceCateOptions, (item) => !!item.alertRule);

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
        datasource_cate: 'prometheus',
        datasource_ids: [0],
        enabled: false,
      }}
    >
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
                form.setFieldsValue({
                  selectedRules: selectedRows,
                });
              },
            }}
            scroll={{ y: 300 }}
            pagination={false}
          />
        </>
      </Form.Item>
      <Form.Item label={t('common:datasource.type')} name='datasource_cate'>
        <Select>
          {_.map(datasourceCates, (item) => {
            return (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
        {({ getFieldValue, setFieldsValue }) => {
          const datasourceCate = getFieldValue('datasource_cate');
          return <DatasourceValueSelect mode='multiple' setFieldsValue={setFieldsValue} cate={datasourceCate} datasourceList={groupedDatasourceList[datasourceCate] || []} />;
        }}
      </Form.Item>
      <Form.Item label={t('common:table.enabled')} name='enabled' valuePropName='checked'>
        <Switch />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit'>
          {t('common:btn.import')}
        </Button>
      </Form.Item>
    </Form>
  );
};

function Import(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('alertRules');
  const { visible, destroy, busiId, refreshList, groupedDatasourceList, datasourceCateOptions, type = 'ImportBuiltin' } = props;
  const [modalType, setModalType] = useState(type);
  const [importResult, setImportResult] = useState<{ name: string; msg: string }[]>();
  const datasourceCates = _.filter(datasourceCateOptions, (item) => !!item.alertRule);

  return (
    <Modal
      className='dashboard-import-modal'
      title={
        <Tabs activeKey={modalType} onChange={(e: ModalType) => setModalType(e)} className='custom-import-alert-title'>
          <TabPane tab={t('batch.import_builtin')} key='ImportBuiltin'></TabPane>
          <TabPane tab={t('batch.import.title')} key='Import'></TabPane>
        </Tabs>
      }
      visible={visible}
      onCancel={() => {
        refreshList();
        destroy();
      }}
      footer={null}
    >
      {modalType === 'Import' && (
        <Form
          layout='vertical'
          onFinish={async (vals) => {
            try {
              const importData = _.map(JSON.parse(vals.import), (item) => {
                return {
                  ...item,
                  cate: vals.cate,
                  datasource_ids: vals.datasource_ids,
                  disabled: vals.enabled ? 0 : 1,
                };
              });
              const { dat } = await importStrategy(importData, busiId);
              const dataSource = _.map(dat, (val, key) => {
                return {
                  name: key,
                  msg: val,
                };
              });
              setImportResult(dataSource);
              if (_.every(dataSource, (item) => !item.msg)) {
                message.success(t('common:success.import'));
                refreshList();
                destroy();
              }
            } catch (error) {
              message.error(t('common:error.import') + error);
            }
          }}
          initialValues={{
            cate: 'prometheus',
            datasource_ids: [0],
            enabled: false,
          }}
        >
          <Row gutter={10}>
            <Col span={24}>
              <Form.Item label={t('common:datasource.type')} name='cate'>
                <Select>
                  {_.map(datasourceCates, (item) => {
                    return (
                      <Select.Option key={item.value} value={item.value}>
                        {item.label}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
                {({ getFieldValue, setFieldsValue }) => {
                  const cate = getFieldValue('cate');
                  return <DatasourceValueSelect mode='multiple' setFieldsValue={setFieldsValue} cate={cate} datasourceList={groupedDatasourceList[cate] || []} />;
                }}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label={t('common:table.enabled')} name='enabled' valuePropName='checked'>
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={`${t('batch.import.name')} JSON`}
            name='import'
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input.TextArea className='code-area' rows={16} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              {t('common:btn.import')}
            </Button>
          </Form.Item>
        </Form>
      )}
      {modalType === 'ImportBuiltin' && (
        <ImportBuiltinContent
          busiId={busiId}
          onOk={() => {
            refreshList();
            destroy();
          }}
          groupedDatasourceList={groupedDatasourceList}
          datasourceCateOptions={datasourceCateOptions}
        />
      )}
      {importResult && (
        <>
          <Divider />
          <Table
            className='samll_table'
            dataSource={importResult}
            columns={[
              {
                title: t('batch.import.name'),
                dataIndex: 'name',
              },
              {
                title: t('batch.import.result'),
                dataIndex: 'msg',
                render: (data) => {
                  return !data ? <CheckCircleOutlined style={{ color: '#389e0d', fontSize: '18px' }} /> : <CloseCircleOutlined style={{ color: '#d4380d', fontSize: '18px' }} />;
                },
              },
              {
                title: t('batch.import.errmsg'),
                dataIndex: 'msg',
              },
            ]}
            pagination={false}
            size='small'
          />
        </>
      )}
    </Modal>
  );
}

export default ModalHOC(Import);
