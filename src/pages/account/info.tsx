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
import { Form, Input, Button, Modal, Row, Col, message, Space, Select } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { getNotifyChannels } from '@/services/manage';
import { ContactsItem } from '@/store/manageInterface';
import { CommonStateContext } from '@/App';
import { UpdateProfile } from '@/services/account';

const { Option } = Select;
export default function Info() {
  const { t } = useTranslation('account');
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [contactsList, setContactsList] = useState<ContactsItem[]>([]);
  const { profile, setProfile } = useContext(CommonStateContext);
  const [selectAvatar, setSelectAvatar] = useState<string>(profile.portrait || '/image/avatar1.png');
  const [customAvatar, setCustomAvatar] = useState('');
  const contacts = Form.useWatch('contacts', form);

  useEffect(() => {
    const { nickname, email, phone, contacts, portrait } = profile;
    form.setFieldsValue({
      nickname,
      email,
      phone,
      contacts: _.map(contacts, (value, key) => {
        return {
          key,
          value,
        };
      }),
    });
    if (portrait?.startsWith('http')) {
      setCustomAvatar(portrait);
    }
  }, [profile]);
  useEffect(() => {
    getNotifyChannels().then((data: Array<ContactsItem>) => {
      setContactsList(data);
    });
  }, []);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      updateProfile();
    } catch (err) {
      console.log(err);
    }
  };

  const handleOk = () => {
    if (customAvatar) {
      if (!customAvatar.startsWith('http')) {
        message.error(t('pictureMsg'));
        return;
      }

      fetch(customAvatar, { mode: 'no-cors' })
        .then(() => {
          setIsModalVisible(false);
          handleSubmit();
        })
        .catch((err) => {
          message.error(err);
        });
    } else {
      setIsModalVisible(false);
      handleSubmit();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const updateProfile = () => {
    const { nickname, email, phone, contacts } = form.getFieldsValue();

    const newData = {
      ...profile,
      portrait: customAvatar || selectAvatar,
      nickname,
      email,
      phone,
      contacts: _.mapValues(_.keyBy(contacts, 'key'), 'value'),
    };

    UpdateProfile(newData).then(() => {
      setProfile(newData);
      message.success(t('common:success.modify'));
    });
  };

  const avatarList = new Array(8).fill(0).map((_, i) => i + 1);

  const handleImgClick = (i) => {
    setSelectAvatar(`/image/avatar${i}.png`);
  };

  return (
    <>
      <Form form={form} layout='vertical'>
        <Row
          gutter={16}
          style={{
            marginBottom: '24px',
          }}
        >
          <Col span={20}>
            <Row
              gutter={16}
              style={{
                marginBottom: '24px',
              }}
            >
              <Col span={4}>
                <div>
                  <label>{t('profile.username')}：</label>
                  <span>{profile.username}</span>
                </div>
              </Col>
              <Col span={4}>
                <div>
                  <label>{t('profile.role')}：</label>
                  <span>{profile.roles?.join(', ')}</span>
                </div>
              </Col>
            </Row>
            <Form.Item label={<span>{t('profile.nickname')}：</span>} name='nickname'>
              <Input />
            </Form.Item>
            <Form.Item label={<span>{t('profile.email')}：</span>} name='email'>
              <Input />
            </Form.Item>
            <Form.Item label={<span>{t('profile.phone')}：</span>} name='phone'>
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
                            width: '390px',
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

            <Form.Item>
              <Button type='primary' onClick={handleSubmit}>
                {t('save')}
              </Button>
            </Form.Item>
          </Col>
          <Col span={4}>
            <div className='avatar'>
              <img src={profile.portrait || '/image/avatar1.png'} />
              <Button type='primary' className='update-avatar' onClick={() => setIsModalVisible(true)}>
                {t('editPicture')}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
      <Modal title={t('editPicture')} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} wrapClassName='avatar-modal'>
        <div className='avatar-content'>
          {avatarList.map((i) => {
            return (
              <div key={i} className={`/image/avatar${i}.png` === selectAvatar ? 'avatar active' : 'avatar'} onClick={() => handleImgClick(i)}>
                <img src={`/image/avatar${i}.png`} />
              </div>
            );
          })}
        </div>
        <Input addonBefore={<span>{t('pictureURL')}:</span>} onChange={(e) => setCustomAvatar(e.target.value)} value={customAvatar} />
      </Modal>
    </>
  );
}
