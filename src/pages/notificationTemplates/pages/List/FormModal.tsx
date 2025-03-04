import React, { useEffect, useState } from 'react';
import { Modal, Input, Form, Button, message, Select, Radio, Space } from 'antd';
import { SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getTeamInfoList } from '@/services/manage';
import { getItems as getNotificationChannels, ChannelItem } from '@/pages/notificationChannels/services';

import { NS } from '../../constants';
import { Item } from '../../types';
import { postItems, putItem } from '../../services';

interface IProps {
  mode: 'add' | 'edit';
  data?: Item;
  onOk: () => void;
}

function FormModal(props: IProps & ModalWrapProps) {
  const { t } = useTranslation(NS);
  const { mode, visible, destroy, onOk, data } = props;
  const [form] = Form.useForm();
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const [notifyChannels, setNotifyChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchNotificationChannels = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    form.setFieldsValue(data);
    getTeamInfoList()
      .then((res) => {
        setUserGroups(res.dat ?? []);
      })
      .catch(() => {
        setUserGroups([]);
      });
    fetchNotificationChannels();
  }, []);

  return (
    <Modal
      title={t(`${mode}_title`)}
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      footer={null}
    >
      <Form layout='vertical' form={form}>
        <Form.Item name='id' hidden>
          <div />
        </Form.Item>
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
              <Link to='/notification-channels' target='_blank'>
                <SettingOutlined />
              </Link>
              <SyncOutlined
                spin={loading}
                onClick={(e) => {
                  fetchNotificationChannels();
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
            optionFilterProp='label'
            options={_.map(notifyChannels, (item) => {
              return {
                label: item.name,
                value: item.ident,
              };
            })}
          />
        </Form.Item>
        <Form.Item label={t('private.title')} name='private' initialValue={0}>
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
                if (mode === 'add') {
                  const channelRequestType = _.find(notifyChannels, { ident: values.notify_channel_ident })?.request_type;
                  if (channelRequestType === 'smtp') {
                    values.content = {
                      subject: '',
                      content: '',
                    };
                  }
                  postItems([values]).then(() => {
                    message.success(t('common:success.add'));
                    destroy();
                    onOk();
                  });
                } else if (mode === 'edit') {
                  putItem(values).then(() => {
                    message.success(t('common:success.edit'));
                    destroy();
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

export default ModalHOC<IProps>(FormModal);
