import React, { useState, useEffect } from 'react';
import { Space, Modal, Input, List, Form, message } from 'antd';
import { NotificationOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import PageLayout from '@/components/pageLayout';
import { getItem as getNotificationChannel } from '@/pages/notificationChannels/services';

import { getItems, deleteItem } from '../../services';
import { NS, CN } from '../../constants';
import { Item } from '../../types';
import FormModal from './FormModal';
import FormCpt from './Form';

import './style.less';

export default function ListCpt() {
  const { t } = useTranslation(NS);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<Item[]>([]);
  const [active, setActive] = useState<
    Item & {
      notify_channel_name?: string;
      notify_channel_request_type?: string;
    }
  >();
  const [form] = Form.useForm();

  const fetchData = () => {
    getItems()
      .then((res) => {
        setData(res);
        const firstItem = res[0];
        const formValues = form.getFieldsValue();
        if (formValues.content === undefined) {
          setActive(firstItem);
        } else {
          const findActive = _.find(res, { id: active?.id });
          if (findActive) {
            setActive({
              ...findActive,
              notify_channel_name: active?.notify_channel_name,
              notify_channel_request_type: active?.notify_channel_request_type,
            });
          } else {
            setActive(firstItem);
          }
        }
      })
      .catch(() => {
        setData([]);
      });
  };

  useEffect(() => {
    if (active) {
      if (active.notify_channel_id) {
        getNotificationChannel(active.notify_channel_id).then((res) => {
          setActive({
            ...active,
            notify_channel_name: res.name,
            notify_channel_request_type: res.request_type,
          });
        });
      }
      // 将 content: {[key:string]: string} 转换为 content: {key: string, value: string}[]
      const content = _.map(active.content, (value, key) => {
        return {
          key,
          value,
        };
      });
      form.setFieldsValue({ content });
    }
  }, [active?.id]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageLayout title={<Space>{t('title')}</Space>} icon={<NotificationOutlined />}>
      <div className='n9e'>
        <div className={CN}>
          <div className={`${CN}-sidebar`}>
            <div className={`${CN}-sidebar-header`}>
              {t('title')}
              <a
                onClick={() => {
                  FormModal({ mode: 'add', onOk: () => fetchData() });
                }}
              >
                {t('common:btn.add')}
              </a>
            </div>
            <div className='mt1 mb1'>
              <Input
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </div>

            <List
              className={`${CN}-sidebar-list`}
              dataSource={_.filter(data, (item) => {
                return _.upperCase(item.name).indexOf(_.upperCase(search)) > -1;
              })}
              size='small'
              renderItem={(item: any) => (
                <List.Item
                  key={item.id}
                  className={active?.id === item.id ? 'is-active' : ''}
                  onClick={() => {
                    const activeOrigin = _.find(data, { id: active?.id });
                    if (activeOrigin && active && !_.isEqual(activeOrigin.content, active?.content)) {
                      Modal.confirm({
                        title: t('content.prompt'),
                        onOk: () => {
                          setActive(item);
                        },
                      });
                    } else {
                      setActive(item);
                    }
                  }}
                >
                  {item.name}
                </List.Item>
              )}
            />
          </div>
          <div className={`${CN}-main`}>
            <div className={`${CN}-main-header`}>
              <Space
                style={{
                  fontSize: 14,
                }}
              >
                <span>{active?.name}</span>
                <EditOutlined
                  onClick={() => {
                    if (active) {
                      FormModal({ mode: 'edit', data: active, onOk: () => fetchData() });
                    }
                  }}
                />
                {active?.create_by !== 'system' && (
                  <DeleteOutlined
                    onClick={() => {
                      Modal.confirm({
                        title: t('common:confirm.delete'),
                        onOk: () => {
                          if (active?.id) {
                            deleteItem([active.id]).then(() => {
                              message.success(t('common:success.delete'));
                              fetchData();
                            });
                          }
                        },
                        onCancel: () => {},
                      });
                    }}
                  />
                )}
              </Space>
              <div>
                <Space>
                  <span>
                    {t('common:table.ident')}：{active?.ident ?? '-'}
                  </span>
                  <span>
                    {t('notify_channel_id')}：{active?.notify_channel_name ?? '-'}
                  </span>
                </Space>
              </div>
            </div>
            <FormCpt form={form} notify_channel_request_type={active?.notify_channel_request_type} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
