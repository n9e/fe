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
import React, { useEffect } from 'react';
import { Modal, Form, Input, Tooltip, Switch, Button, Space, Select } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getBusiGroupsDashboards } from '@/services/dashboardV2';
import ModalHOC, { ModalWrapProps } from '../Components/ModalHOC';
import { ILink } from '../types';

interface IProps {
  initialValues: ILink[];
  onOk: (values: any) => void;
}

function LinkItem({ allDashboards, restField, name, remove }) {
  const { t } = useTranslation('dashboard');
  const type = Form.useWatch(['links', name, 'type']) ?? 'link';

  return (
    <Space
      style={{
        alignItems: 'flex-start',
      }}
    >
      <Form.Item
        {...restField}
        name={[name, 'type']}
        rules={[
          {
            required: true,
          },
        ]}
        initialValue='link'
      >
        <Select style={{ width: 120 }}>
          <Select.Option value='link'>Link</Select.Option>
          <Select.Option value='dashboards'>Dashboards</Select.Option>
        </Select>
      </Form.Item>
      {type === 'link' && (
        <>
          <Form.Item
            {...restField}
            name={[name, 'title']}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input placeholder={t('link.name')} style={{ width: 152 }} />
          </Form.Item>
          <Form.Item
            {...restField}
            name={[name, 'url']}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input.TextArea autoSize={{ minRows: 1, maxRows: 6 }} style={{ width: 400 }} placeholder={t('link.url')} />
          </Form.Item>
        </>
      )}
      {type === 'dashboards' && (
        <Form.Item
          {...restField}
          name={[name, 'dashboardIds']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            style={{ width: 560 }}
            mode='multiple'
            placeholder={t('link.dashboardIds_placeholder')}
            showSearch
            optionFilterProp='label'
            options={_.map(allDashboards, (item) => {
              return {
                label: item.name,
                value: item.id,
              };
            })}
          />
        </Form.Item>
      )}
      <Tooltip title={t('link.isNewBlank')}>
        <Form.Item {...restField} name={[name, 'targetBlank']} valuePropName='checked'>
          <Switch />
        </Form.Item>
      </Tooltip>
      <Button
        icon={<DeleteOutlined />}
        onClick={() => {
          remove(name);
        }}
      />
    </Space>
  );
}

function index(props: ModalWrapProps & IProps) {
  const { t } = useTranslation('dashboard');
  const { visible, initialValues } = props;
  const [form] = Form.useForm();
  const [allDashboards, setAllDashboards] = React.useState([]);

  useEffect(() => {
    getBusiGroupsDashboards().then((res) => {
      setAllDashboards(res);
    });
  }, []);

  return (
    <Modal
      width={820}
      title={t('link.title')}
      style={{ top: 10, padding: 0 }}
      visible={visible}
      closable={false}
      onOk={() => {
        form.validateFields().then((values) => {
          props.onOk(
            _.map(values.links, (item) => {
              if (item.type === 'dashboards') {
                return {
                  ...item,
                  dashboards: _.map(item.dashboardIds, (id) => {
                    return _.find(allDashboards, { id });
                  }),
                };
              }
              return item;
            }),
          );
          props.destroy();
        });
      }}
      onCancel={() => {
        props.destroy();
      }}
      bodyStyle={{
        padding: '10px 24px 24px 24px',
      }}
      okText={t('common:btn.ok')}
      cancelText={t('common:btn.cancel')}
    >
      <Form
        layout='vertical'
        initialValues={{
          links: initialValues,
        }}
        form={form}
      >
        <Form.List name={'links'}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => {
                return <LinkItem key={key} allDashboards={allDashboards} name={name} restField={restField} remove={remove} />;
              })}
              <Button
                type='dashed'
                style={{ width: '100%', marginBottom: 10 }}
                onClick={() => {
                  add({
                    type: 'link',
                  });
                }}
              >
                <PlusOutlined /> {t('common:btn.add')}
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

export default ModalHOC(index);
