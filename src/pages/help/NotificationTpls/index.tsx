import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { List, Input, Space, Button, Modal, message } from 'antd';
import { SoundOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageLayout, { HelpLink } from '@/components/pageLayout';
import { getNotifyTpls, deleteNotifyTpl } from './services';
import { NotifyTplsType } from './types';
import HTML from './Editor/HTML';
import Markdown from './Editor/Markdown';
import FormModal from './FormModal';
import { putNotifyTplContent } from './services';
import './style.less';
import './locale';

export default function index() {
  const { t } = useTranslation('notificationTpls');
  const [search, setSearch] = useState<string>('');
  const [data, setData] = useState<NotifyTplsType[]>([]);
  const [active, setActive] = useState<NotifyTplsType>();
  const fetchData = () => {
    getNotifyTpls().then((res) => {
      setData(res);
      if (!active) {
        setActive(res[0]);
      } else {
        setActive(_.find(res, { id: active.id }) || res[0]);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageLayout
      title={
        <Space>
          {t('title')}
          <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/system-configuration/notification-template/' />
        </Space>
      }
      icon={<SoundOutlined />}
    >
      <div>
        <div className='n9e-notification-tpls user-manage-content'>
          <div className='n9e-notification-tpls-sidebar left-tree-area'>
            <div className='sub-title'>
              {t('list')}
              <Button
                size='small'
                type='link'
                onClick={() => {
                  FormModal({ mode: 'post', onOk: () => fetchData() });
                }}
              >
                {t('common:btn.add')}
              </Button>
            </div>
            <div style={{ display: 'flex', margin: '5px 0px 12px' }}>
              <Input
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </div>

            <List
              style={{
                marginBottom: '12px',
                flex: 1,
                overflow: 'auto',
              }}
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
                        title: t('content_prompt'),
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
          <div className='n9e-notification-tpls-main resource-table-content'>
            <div className='team-info'>
              <Space
                style={{
                  fontSize: 14,
                }}
              >
                <span>{active?.name}</span>
                <EditOutlined
                  onClick={() => {
                    if (active) {
                      FormModal({ mode: 'update', data: active, onOk: () => fetchData() });
                    }
                  }}
                />
                {!active?.built_in && (
                  <DeleteOutlined
                    onClick={() => {
                      Modal.confirm({
                        title: t('common:confirm.delete'),
                        onOk: () => {
                          if (active?.id) {
                            deleteNotifyTpl(active.id).then(() => {
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
                    {t('channel')}：{active?.channel || '-'}
                  </span>
                </Space>
              </div>
            </div>
            <div
              style={{
                height: 'calc(100% - 135px)',
                marginBottom: 10,
              }}
            >
              {active?.channel === 'email' ? (
                <HTML
                  key={active?.id}
                  value={active?.content}
                  record={active}
                  onChange={(value) => {
                    setActive({ ...active, content: value });
                  }}
                />
              ) : (
                active && (
                  <Markdown
                    key={active?.id}
                    value={active?.content}
                    record={active}
                    onChange={(value) => {
                      setActive({ ...active, content: value });
                    }}
                  />
                )
              )}
            </div>
            <Button
              type='primary'
              onClick={() => {
                if (active) {
                  putNotifyTplContent(active).then(() => {
                    message.success(t('common:success.save'));
                    fetchData();
                  });
                }
              }}
            >
              {t('common:btn.save')}
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
