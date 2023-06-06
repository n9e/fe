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
import { Modal, Form, Input, Space, Button, Table, Select, Tooltip, Switch, Tabs, message } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getLabels, getLabelValues, addMetricView, updateMetricView } from '@/services/metricViews';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { getFiltersStr } from './utils';

interface IProps {
  datasourceValue: number;
  action: 'add' | 'edit';
  initialValues?: any;
  range: IRawTimeRange;
  admin?: boolean;
  onOk: Function;
}

const titleMap = {
  add: '新建快捷视图',
  edit: '编辑快捷视图',
};
const { TabPane } = Tabs;

function FormCpt(props: ModalWrapProps & IProps) {
  const { t } = useTranslation('objectExplorer');
  const { datasourceValue, action, visible, initialValues = {}, destroy, range, onOk, admin } = props;
  const [form] = Form.useForm();
  const [labels, setLabels] = useState<string[]>([]);
  const [filteredLabels, setFilteredLabels] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [activeKey, setActiveKey] = useState('form');
  const getLabelsOptions = (_labels) => {
    return _.map(_labels, (label) => {
      return (
        <Select.Option key={label} value={label}>
          {label}
        </Select.Option>
      );
    });
  };

  useEffect(() => {
    getLabels(datasourceValue, '', range).then((res) => {
      setLabels(res);
      setFilteredLabels(res);
    });
  }, [JSON.stringify(range)]);

  return (
    <Modal
      className='n9e-metric-views-modal'
      title={
        <Tabs className='custom-import-title' activeKey={activeKey} onChange={setActiveKey}>
          <TabPane tab={t(`list.${action}_title`)} key='form' />
          {action === 'add' && <TabPane tab={t('list.import_title')} key='import' />}
        </Tabs>
      }
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      onOk={() => {
        form.validateFields().then((values) => {
          let _values = _.cloneDeep(values);
          if (activeKey === 'form') {
            _values.dynamicLabels = _.map(_values.dynamicLabels, (item) => {
              return {
                label: item,
                value: '',
              };
            });
            _values.dimensionLabels = _.map(_values.dimensionLabels, (item) => {
              return {
                label: item,
                value: '',
              };
            });
          }
          if (activeKey === 'import') {
            try {
              const config = JSON.parse(values.import);
              _values = {
                name: values.name,
                cate: values.cate,
                ...config,
              };
            } catch (e) {
              console.log(e);
              return;
            }
          }
          const { name, cate } = _values;
          const configs = JSON.stringify(_.omit(_values, ['name', 'cate']));
          const data: any = {
            name,
            cate: cate ? 0 : 1,
            configs,
          };
          if (action === 'add') {
            addMetricView(data).then((res) => {
              message.success(t('common:success.add'));
              onOk(res);
              destroy();
            });
          } else if (action === 'edit') {
            data.id = initialValues.id;
            updateMetricView(data).then(() => {
              message.success(t('common:success.edit'));
              onOk();
              destroy();
            });
          }
        });
      }}
    >
      {activeKey === 'form' && (
        <Form
          layout='vertical'
          initialValues={
            initialValues || {
              cate: false,
            }
          }
          form={form}
          onValuesChange={(changedValues, allValues) => {
            if (changedValues.filters) {
              const filtersStr = getFiltersStr(allValues.filters);
              getLabels(datasourceValue, `${filtersStr ? `{${filtersStr}}` : ''}`, range).then((res) => {
                setFilteredLabels(res);
              });
            }
          }}
        >
          <Form.Item label={t('list.name')} name='name' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {admin && (
            <Form.Item label={t('list.isPublic')} name='cate' valuePropName='checked'>
              <Switch />
            </Form.Item>
          )}
          <Form.List name='filters'>
            {(fields, { add, remove }) => (
              <>
                <div style={{ paddingBottom: 8 }}>
                  {t('list.filters')}{' '}
                  <PlusCircleOutlined
                    onClick={() => {
                      add({
                        oper: '=',
                      });
                    }}
                  />
                </div>
                {fields.map(({ key, name }) => {
                  return (
                    <Space key={key}>
                      <Form.Item name={[name, 'label']} rules={[{ required: true }]}>
                        <Select suffixIcon={<CaretDownOutlined />} allowClear showSearch style={{ width: 170 }}>
                          {getLabelsOptions(labels)}
                        </Select>
                      </Form.Item>
                      <Form.Item name={[name, 'oper']} rules={[{ required: true }]}>
                        <Select suffixIcon={<CaretDownOutlined />} style={{ width: 60 }}>
                          <Select.Option value='='>=</Select.Option>
                          <Select.Option value='!='>!=</Select.Option>
                          <Select.Option value='=~'>=~</Select.Option>
                          <Select.Option value='!~'>!~</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name={[name, 'value']} rules={[{ required: true }]}>
                        <Input style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item>
                        <MinusCircleOutlined
                          onClick={() => {
                            remove(name);
                          }}
                        />
                      </Form.Item>
                    </Space>
                  );
                })}
              </>
            )}
          </Form.List>
          <Form.Item label={t('list.dynamicLabels')} name='dynamicLabels'>
            <Select allowClear showSearch mode='multiple'>
              {getLabelsOptions(filteredLabels)}
            </Select>
          </Form.Item>
          <Form.Item label={t('list.dimensionLabels')} name='dimensionLabels' rules={[{ required: true }]}>
            <Select allowClear showSearch mode='multiple'>
              {getLabelsOptions(filteredLabels)}
            </Select>
          </Form.Item>
          <div style={{ textAlign: 'right', marginBottom: 10 }}>
            <Button
              onClick={() => {
                const values = form.getFieldsValue();
                setPreviewVisible(true);
                setPreviewLoading(true);
                const filtersStr = getFiltersStr(values.filters);
                const _labels = _.compact(_.concat(values.dynamicLabels, values.dimensionLabels));
                const requests = _.map(_labels, (item) => {
                  return getLabelValues(datasourceValue, item, range, filtersStr ? `{${filtersStr}}` : '');
                });
                Promise.all(requests).then((res) => {
                  const data = _.map(_labels, (item, idx) => {
                    return {
                      label: item,
                      values: res[idx],
                    };
                  });
                  setPreviewData(data);
                  setPreviewLoading(false);
                });
              }}
            >
              {t('list.preview')}
            </Button>
          </div>
          {previewVisible && (
            <Table
              size='small'
              rowKey='label'
              columns={[
                {
                  title: 'Label Key',
                  dataIndex: 'label',
                },
                {
                  title: `Label Value ${t('list.count')}`,
                  dataIndex: 'values',
                  render: (text) => {
                    return text.length;
                  },
                },
                {
                  title: `Label Value ${t('list.sample')}`,
                  dataIndex: 'values',
                  render: (text) => {
                    return (
                      <Tooltip
                        placement='right'
                        title={
                          <div>
                            {_.map(text, (item) => {
                              return <div key={item}>{item}</div>;
                            })}
                          </div>
                        }
                      >{`${_.head(text)}...`}</Tooltip>
                    );
                  },
                },
              ]}
              dataSource={previewData}
              loading={previewLoading}
            />
          )}
        </Form>
      )}
      {activeKey === 'import' && (
        <Form
          form={form}
          preserve={false}
          layout='vertical'
          initialValues={
            initialValues || {
              cate: false,
            }
          }
        >
          <Form.Item label={t('list.name')} name='name' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {admin && (
            <Form.Item label={t('list.isPublic')} name='cate' rules={[{ required: true }]} valuePropName='checked'>
              <Switch />
            </Form.Item>
          )}
          <Form.Item
            label={t('list.import_label')}
            name='import'
            rules={[
              {
                required: true,
                validateTrigger: 'trigger',
              },
            ]}
          >
            <Input.TextArea className='code-area' rows={4} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}

export default ModalHOC<IProps>(FormCpt);
