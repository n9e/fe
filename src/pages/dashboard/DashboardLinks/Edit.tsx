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
import React from 'react';
import { Modal, Form, Input, Tooltip, Switch, Button, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '../Components/ModalHOC';
import { ILink } from '../types';

interface IProps {
  initialValues: ILink[];
  onOk: (values: any) => void;
}

function index(props: ModalWrapProps & IProps) {
  const { t } = useTranslation('dashboard');
  const { visible, initialValues } = props;
  const [form] = Form.useForm();
  return (
    <Modal
      width={800}
      title={t('link.title')}
      style={{ top: 10, padding: 0 }}
      visible={visible}
      closable={false}
      onOk={() => {
        form.validateFields().then((values) => {
          props.onOk(values.links);
          props.destroy();
        });
      }}
      onCancel={() => {
        props.destroy();
      }}
      bodyStyle={{
        padding: '10px 24px 24px 24px',
      }}
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
                return (
                  <Space
                    key={key}
                    style={{
                      alignItems: 'flex-start',
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'title']}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input placeholder={t('link.name')} style={{ width: 192 }} />
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
                      <Input style={{ width: 460 }} placeholder={t('link.url')} />
                    </Form.Item>
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
              })}
              <Button
                type='dashed'
                style={{ width: '100%', marginBottom: 10 }}
                onClick={() => {
                  add({});
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
