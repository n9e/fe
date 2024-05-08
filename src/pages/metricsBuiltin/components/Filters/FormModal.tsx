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
import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Select, Space, message } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { getLabels } from '@/services/metricViews';
import { CommonStateContext } from '@/App';
import { getTeamInfoList } from '@/services/manage';
import { postFilter, putFilter } from '../../services';
import Filter from './Filter';

interface IProps {
  visible: boolean;
  onClose: () => void;
  action: 'add' | 'edit';
  initialValues?: any;
  onOk: Function;
}

export default function FormModal(props: IProps) {
  const { t } = useTranslation('metricsBuiltin');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { visible, onClose, action, initialValues, onOk } = props;
  const range = {
    start: 'now-12h',
    end: 'now',
  };
  const [form] = Form.useForm();
  const [labels, setLabels] = useState<string[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const datasourceValue = Form.useWatch('datasourceValue', form);

  useEffect(() => {
    if (datasourceValue) {
      getLabels(datasourceValue, '', range).then((res) => {
        setLabels(res);
      });
    }
  }, [datasourceValue, JSON.stringify(range)]);

  useEffect(() => {
    getTeamInfoList().then((res) => {
      setTeams(res.dat || []);
    });
  }, []);

  return (
    <Modal
      className='built-in-metrics-filter-form-modal'
      title={t(`filter.${action}_title`)}
      visible={visible}
      onCancel={() => {
        onClose();
      }}
      onOk={() => {
        form.validateFields().then((values) => {
          const data: any = {
            id: values.id,
            name: values.name,
            configs: JSON.stringify(values.configs),
            groups_perm: values.groups_perm,
          };
          if (action === 'add') {
            postFilter(data).then((res) => {
              message.success(t('common:success.add'));
              onOk(res);
              onClose();
            });
          } else if (action === 'edit') {
            putFilter(data).then(() => {
              message.success(t('common:success.edit'));
              onOk();
              onClose();
            });
          }
        });
      }}
    >
      <Form
        layout='vertical'
        initialValues={
          initialValues || {
            filters: [{ oper: '=' }],
          }
        }
        form={form}
      >
        <Form.Item name='id' hidden>
          <Input />
        </Form.Item>
        <Form.Item label={t('filter.name')} name='name' rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t('filter.datasource')} name='datasourceValue' tooltip={t('filter.datasource_tip')}>
          <Select
            showSearch
            optionFilterProp='label'
            options={_.map(groupedDatasourceList?.prometheus, (item) => {
              return {
                label: item.name,
                value: item.id,
              };
            })}
          />
        </Form.Item>
        <Form.List name='configs'>
          {(fields, { add, remove }) => (
            <>
              <div style={{ paddingBottom: 8 }}>
                {t('filter.configs')}{' '}
                <PlusCircleOutlined
                  onClick={() => {
                    add({
                      oper: '=',
                    });
                  }}
                />
              </div>
              {fields.map(({ key, name }) => {
                return <Filter key={key} datasourceValue={datasourceValue} range={range} name={name} labels={labels} remove={remove} />;
              })}
            </>
          )}
        </Form.List>
        <Form.List name='groups_perm'>
          {(fields, { add, remove }) => (
            <>
              <div style={{ paddingBottom: 8 }}>
                {t('filter.groups_perm')}{' '}
                <PlusCircleOutlined
                  onClick={() => {
                    add({
                      write: true,
                    });
                  }}
                />
              </div>
              {fields.map(({ key, name }) => {
                return (
                  <Space key={key}>
                    <Form.Item name={[name, 'gid']} rules={[{ required: true }]}>
                      <Select
                        allowClear
                        showSearch
                        style={{ width: 340 }}
                        options={_.map(teams, (item) => {
                          return {
                            label: item.name,
                            value: item.id,
                          };
                        })}
                      />
                    </Form.Item>
                    <Form.Item name={[name, 'write']} rules={[{ required: true }]}>
                      <Select
                        style={{ width: 100 }}
                        showSearch
                        optionFilterProp='label'
                        options={[
                          {
                            label: t('filter.perm.1'),
                            value: true,
                          },
                          {
                            label: t('filter.perm.0'),
                            value: false,
                          },
                        ]}
                      />
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
      </Form>
    </Modal>
  );
}
