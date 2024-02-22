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
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Drawer, Button, Form, Input, Row, Col, Table, Select, Switch, message } from 'antd';
import { useDebounceFn } from 'ahooks';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getFullIndices, getFields } from '@/pages/explorer/Elasticsearch/services';
import { postESIndexPattern } from './services';

interface Props {
  indexPatterns: any[];
  datasourceList: any[];
  onOk: () => void;
}

const DEFAULT_DATE_FIELD = '@timestamp';

function Add(props: Props & ModalWrapProps) {
  const { t } = useTranslation('es-index-patterns');
  const { visible, destroy, indexPatterns, datasourceList, onOk } = props;
  const [form] = Form.useForm();
  const datasourceID = Form.useWatch('datasource_id', form);
  const name = Form.useWatch('name', form);
  const allow_hide_system_indices = Form.useWatch('allow_hide_system_indices', form);
  const [indices, setIndices] = useState<{ name: string }[]>([]);
  const [tablePageCurrent, setTablePageCurrent] = useState<number>(1);
  const [dateFields, setDateFields] = useState<string[]>([]);
  const inputRef = useRef<any>(null);
  const alreadyWildcard = useRef<boolean>(false);
  const { run: fetchIndices } = useDebounceFn(
    (datasourceID, name, fetchIndices) => {
      if (datasourceID) {
        getFullIndices(datasourceID, name, fetchIndices).then((res) => {
          setIndices(
            _.map(res, (item) => {
              return {
                name: item.index,
                uuid: item.uuid,
              };
            }),
          );
          setTablePageCurrent(1);
        });
      }
    },
    {
      wait: 500,
    },
  );
  const { run: fetchFields } = useDebounceFn(
    (datasourceID, name) => {
      getFields(datasourceID, name, 'date').then((res) => {
        const fields = res.fields || [];
        setDateFields(res.fields || []);
        if (_.includes(fields, DEFAULT_DATE_FIELD)) {
          form.setFieldsValue({
            time_field: DEFAULT_DATE_FIELD,
          });
        }
      });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    fetchIndices(datasourceID, name, allow_hide_system_indices);
    fetchFields(datasourceID, name);
  }, [datasourceID, name]);

  useEffect(() => {
    fetchIndices(datasourceID, name, allow_hide_system_indices);
  }, [allow_hide_system_indices]);

  return (
    <Drawer width={1000} destroyOnClose maskClosable={false} title={t('create_title')} visible={visible} onClose={destroy}>
      <Row gutter={32}>
        <Col span={12}>
          <Form
            form={form}
            onFinish={(values) => {
              postESIndexPattern(values).then(() => {
                message.success(t('common:success.create'));
                destroy();
                onOk();
              });
            }}
            layout='vertical'
          >
            <Form.Item
              name='datasource_id'
              label={t('common:datasource.id')}
              rules={[
                {
                  required: true,
                },
              ]}
              initialValue={_.head(datasourceList)?.id}
            >
              <Select
                showSearch
                optionFilterProp='label'
                options={_.map(datasourceList, (item) => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                })}
              />
            </Form.Item>
            <Form.Item
              name='name'
              label={t('name')}
              normalize={(value) => {
                if (value && value.indexOf('*') === -1 && alreadyWildcard.current === false) {
                  setTimeout(() => {
                    inputRef.current.setSelectionRange(1, 1);
                  }, 0);
                  alreadyWildcard.current = true;
                  return value + '*';
                }
                return value;
              }}
              rules={[
                {
                  validator(rule, value) {
                    if (!value) {
                      return Promise.reject(new Error(t('name_msg1')));
                    }
                    // if (_.find(indexPatterns, { name: value })) {
                    //   return Promise.reject(new Error(t('name_msg2')));
                    // }
                    return Promise.resolve();
                  },
                },
              ]}
              required
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Form.Item
              name='time_field'
              label={t('time_field')}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                options={_.map(dateFields, (field) => {
                  return {
                    label: field,
                    value: field,
                  };
                })}
              />
            </Form.Item>
            <Form.Item name='allow_hide_system_indices' label={t('allow_hide_system_indices')} valuePropName='checked'>
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type='primary' htmlType='submit'>
                {t('common:btn.create')}
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Table
            size='small'
            showHeader={false}
            columns={[
              {
                dataIndex: 'name',
              },
            ]}
            dataSource={indices}
            pagination={{
              current: tablePageCurrent,
              defaultPageSize: 10,
              showTotal: (total) => {
                return t('common:table.total', { total });
              },
              onChange: (page) => {
                setTablePageCurrent(page);
              },
            }}
            locale={{
              emptyText: t('indexes_empty'),
            }}
          />
        </Col>
      </Row>
    </Drawer>
  );
}

export default ModalHOC<Props>(Add);
