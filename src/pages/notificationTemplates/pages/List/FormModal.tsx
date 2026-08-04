import React, { useEffect, useState } from 'react';
import { Modal, Input, Form, Button, message, Select, Radio, Space } from 'antd';
import { SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { getTeamInfoList } from '@/services/manage';
import {
  getSimplifiedItems as getNotificationChannels,
  getItemsIdents as getNotificationChannelsIdents,
  getItem as getNotificationChannelById,
  ChannelItem,
} from '@/pages/notificationChannels/services';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { PERM } from '@/pages/notificationChannels/constants';

import { NS } from '../../constants';
import { Item } from '../../types';
import { postItems, putItem } from '../../services';
import { buildStarterContent, StarterTexts } from '../../utils/tplKeys';

interface IProps {
  visible: boolean;
  mode: 'add' | 'edit' | 'clone';
  data?: Item;
  /** 新建时回传新模板的 ident，供列表页选中刚建好的这条 */
  onOk: (createdIdent?: string) => void;
  onCancel: () => void;
}

export default function FormModal(props: IProps) {
  const { t } = useTranslation(NS);
  const { mode, visible, onOk, onCancel, data } = props;

  const starterTexts: StarterTexts = {
    ruleName: t('starter.rule_name'),
    severity: t('starter.severity'),
    status: t('starter.status'),
    firing: t('starter.firing'),
    recovered: t('starter.recovered'),
    tags: t('starter.tags'),
    triggerValue: t('starter.trigger_value'),
    time: t('starter.time'),
    detail: t('starter.detail'),
  };

  /**
   * 起步内容要从媒介出站 body 里的 {{$tpl.X}} 反推字段名，因此必须拿到完整 request_config。
   *
   * 两个接口都拿不到：列表用的 simplified 接口压根不返回 request_config；
   * 按 ident 查的 /notify-channel-config 会在返回前把 ParamConfig/RequestConfig 显式置空
   * （router_notify_channel.go:186-187）。只有按 id 查的 /notify-channel-config/:id 是完整的。
   *
   * 无查看权限时不发这个注定 403 的请求，退回用 simplified 里的 request_type——
   * smtp 仍能拿到固定字段，http 则只能给空内容。
   */
  const buildStarterContentByIdent = async (ident?: string) => {
    if (!ident) return {};
    const simplified = _.find(notifyChannels, { ident });
    if (!simplified) return {};

    if (!isAuthorized || !simplified.id) {
      return buildStarterContent(simplified, starterTexts);
    }

    try {
      const channel = await getNotificationChannelById(simplified.id);
      return buildStarterContent(channel, starterTexts);
    } catch (err) {
      // 拿不到完整配置不该挡住新建，退回按 request_type 能推出多少算多少
      console.error(err);
      return buildStarterContent(simplified, starterTexts);
    }
  };

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
        <Form.Item label={t('common:table.ident')} name='ident' hidden>
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
              form
                .validateFields()
                .then(async (values) => {
                  if (mode === 'add' || mode === 'clone') {
                    values.ident = uuidv4(); // 2025-06-06 Generate a new unique identifier for the template
                    // 新建时按媒介期望的字段名种一份起步内容，避免落到空白编辑器从零手写 Go template；
                    // 克隆必须保留被克隆的正文——此前这里对 smtp 无条件覆写，把内容静默清空了
                    if (mode === 'add') {
                      values.content = await buildStarterContentByIdent(values.notify_channel_ident);
                    }
                    await postItems([values]);
                    message.success(t('common:success.add'));
                    // 回传 ident 让列表页选中刚建好的这条：中间栏若仍为空，
                    // 用户点侧栏新条目是没有反应的（ItemDetail 未挂载，ref 为 null）
                    onOk(values.ident);
                  } else if (mode === 'edit') {
                    await putItem(values);
                    message.success(t('common:success.edit'));
                    onOk();
                  }
                })
                .catch((err) => {
                  // 校验失败由 antd 自行标红，其余异常不能跟着一起静默掉
                  if (!err?.errorFields) {
                    console.error(err);
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
