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
import React, { useEffect, useState, useImperativeHandle, ReactNode } from 'react';
import { Form, Input, Select, Space } from 'antd';
import { getUserInfo, getNotifyChannels, getRoles } from '@/services/manage';
import { UserAndPasswordFormProps, Contacts, ContactsItem, User } from '@/store/manageInterface';
import { MinusCircleOutlined, PlusCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

const { Option } = Select;
const UserForm = React.forwardRef<ReactNode, UserAndPasswordFormProps>((props, ref) => {
  const { t } = useTranslation();
  const { userId } = props;
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState<User>();
  const [loading, setLoading] = useState<boolean>(true);
  const [contactsList, setContactsList] = useState<ContactsItem[]>([]);
  const [roleList, setRoleList] = useState<{ name: string; note: string }[]>([]);
  const contacts = Form.useWatch('contacts', form);

  useImperativeHandle(ref, () => ({
    form: form,
  }));

  useEffect(() => {
    if (userId) {
      getUserInfoDetail(userId);
    } else {
      setLoading(false);
    }

    getContacts();
    getRoles().then((res) => setRoleList(res));
  }, []);

  const getContacts = () => {
    getNotifyChannels().then((data: Array<ContactsItem>) => {
      setContactsList(data);
    });
  };

  const getUserInfoDetail = (id: string) => {
    getUserInfo(id).then((data: User) => {
      setInitialValues(
        Object.assign({}, data, {
          contacts: _.map(data.contacts, (value, key) => {
            return {
              key,
              value,
            };
          }),
        }),
      );
      setLoading(false);
    });
  };

  return !loading ? (
    <Form layout='vertical' form={form} initialValues={initialValues} preserve={false}>
      {!userId && (
        <Form.Item
          label={t('account:profile.username')}
          name='username'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
      )}
      <Form.Item label={t('account:profile.nickname')} name='nickname'>
        <Input />
      </Form.Item>
      {!userId && (
        <>
          <Form.Item
            name='password'
            label={t('account:password.name')}
            rules={[
              {
                required: true,
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name='confirm'
            label={t('account:password.confirm')}
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(new Error(t('account:password.notMatch')));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </>
      )}
      <Form.Item
        label={t('account:profile.role')}
        name='roles'
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select mode='multiple'>
          {roleList.map((item, index) => (
            <Option value={item.name} key={index}>
              <div>
                <div>{item.name}</div>
                <div style={{ color: '#8c8c8c' }}>{item.note}</div>
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label={t('account:profile.email')} name='email'>
        <Input />
      </Form.Item>
      <Form.Item label={t('account:profile.phone')} name='phone'>
        <Input />
      </Form.Item>
      <Form.Item
        label={
          <Space>
            {t('account:profile.contact')}
            <Link to='/help/notification-settings?tab=contacts' target='_blank'>
              {t('account:profile.contactLinkToSetting')}
            </Link>
          </Space>
        }
      >
        <Form.List name='contacts'>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Space
                  key={key}
                  style={{
                    display: 'flex',
                  }}
                  align='baseline'
                >
                  <Form.Item
                    style={{
                      width: '180px',
                    }}
                    {...restField}
                    name={[name, 'key']}
                    rules={[
                      {
                        required: true,
                        message: 'is required',
                      },
                    ]}
                  >
                    <Select suffixIcon={<CaretDownOutlined />} placeholder={t('account:profile.contactPlaceholder')}>
                      {_.map(contactsList, (item, index) => (
                        <Option value={item.key} key={index} disabled={_.includes(_.map(contacts, 'key'), item.key)}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    style={{
                      width: '240px',
                    }}
                    name={[name, 'value']}
                    rules={[
                      {
                        required: true,
                        message: 'is required',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <MinusCircleOutlined className='control-icon-normal' onClick={() => remove(name)} />
                </Space>
              ))}
              <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
            </>
          )}
        </Form.List>
      </Form.Item>
    </Form>
  ) : null;
});
export default UserForm;
