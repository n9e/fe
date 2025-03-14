import React, { useEffect, useState } from 'react';
import { Modal, Input, Form, Button, message, Select, Radio, Space } from 'antd';
import { SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { getTeamInfoList } from '@/services/manage';
import { getSimplifiedItems as getNotificationChannels, getItemsIdents as getNotificationChannelsIdents, ChannelItem } from '@/pages/notificationChannels/services';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { PERM } from '@/pages/notificationChannels/constants';

import { NS } from '../../constants';
import { Item } from '../../types';
import { postItems, putItem } from '../../services';

interface IProps {
  visible: boolean;
  mode: 'add' | 'edit' | 'clone';
  data?: Item;
  onOk: () => void;
  onCancel: () => void;
}

export default function FormModal(props: IProps) {
  const { t } = useTranslation(NS);
  const { mode, visible, onOk, onCancel, data } = props;
  const [form] = Form.useForm();
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const [notifyChannels, setNotifyChannels] = useState<ChannelItem[]>([]);
  const [notifyChannelsIdents, setNotifyChannelsIdents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const isAuthorized = useIsAuthorized([PERM]);
  const fetchNotificationChannelsIdents = () => {
    setLoading(true);
    getNotificationChannelsIdents()
      .then((res) => {
        setNotifyChannelsIdents(res);
      })
      .catch(() => {
        setNotifyChannelsIdents([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getTeamInfoList()
      .then((res) => {
        setUserGroups(res.dat ?? []);
      })
      .catch(() => {
        setUserGroups([]);
      });

    getNotificationChannels()
      .then((res) => {
        setNotifyChannels(res);
      })
      .catch(() => {
        setNotifyChannels([]);
      })
      .finally(() => {
        setLoading(false);
      });
    fetchNotificationChannelsIdents();
  }, []);

  useEffect(() => {
    if (visible && _.includes(['edit', 'clone'], mode)) {
      form.setFieldsValue(data);
    }
  }, [visible]);

  return (
    <Modal title={t(`${mode}_title`)} visible={visible} onCancel={onCancel} footer={null} destroyOnClose>
      <Form layout='vertical' form={form} preserve={false}>
        {mode === 'edit' && (
          <Form.Item name='id' hidden>
            <div />
          </Form.Item>
        )}
        <Form.Item name='content' hidden>
          <div />
        </Form.Item>
        <Form.Item
          label={t('common:table.name')}
          name='name'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('common:table.ident')}
          name='ident'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input disabled={mode === 'edit'} />
        </Form.Item>
        <Form.Item
          label={t('user_group_ids')}
          name='user_group_ids'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            showSearch
            optionFilterProp='label'
            mode='multiple'
            options={_.map(userGroups, (item) => {
              return {
                label: item.name,
                value: item.id,
              };
            })}
          />
        </Form.Item>
        <Form.Item
          label={
            <Space>
              {t('notify_channel_ident')}
              {isAuthorized && (
                <Link to='/notification-channels' target='_blank'>
                  <SettingOutlined />
                </Link>
              )}
              <SyncOutlined
                spin={loading}
                onClick={(e) => {
                  fetchNotificationChannelsIdents();
                  e.preventDefault();
                }}
              />
            </Space>
          }
          name='notify_channel_ident'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            showSearch
            optionFilterProp='optionLabel'
            optionLabelProp='optionLabel'
            options={_.map(notifyChannelsIdents, (item) => {
              return {
                label: item,
                optionLabel: item,
                value: item,
              };
            })}
          />
        </Form.Item>
        <Form.Item label={t('private.title')} name='private' initialValue={1}>
          <Radio.Group>
            <Radio value={0}>{t('private.0')}</Radio>
            <Radio value={1}>{t('private.1')}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            onClick={() => {
              form.validateFields().then((values) => {
                if (mode === 'add' || mode === 'clone') {
                  const channelRequestType = _.find(notifyChannels, { ident: values.notify_channel_ident })?.request_type;
                  if (channelRequestType === 'smtp') {
                    values.content = {
                      subject: '',
                      content: '',
                    };
                  }
                  postItems([values]).then(() => {
                    message.success(t('common:success.add'));
                    onOk();
                  });
                } else if (mode === 'edit') {
                  putItem(values).then(() => {
                    message.success(t('common:success.edit'));
                    onOk();
                  });
                }
              });
            }}
          >
            {t('common:btn.save')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
