import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { List, Input, Space, Button, Modal, message } from 'antd';
import { SoundOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import { getNotifyTpls, deleteNotifyTpl } from './services';
import { NotifyTplsType } from './types';
import HTML from './Editor/HTML';
import Markdown from './Editor/Markdown';
import FormModal from './FormModal';
import { putNotifyTplContent } from './services';
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
    <PageLayout title={t('title')} icon={<SoundOutlined />}>
      <div className='user-manage-content'>
        <div style={{ display: 'flex', height: '100%' }}>
          <div className='left-tree-area'>
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
                    console.log(data, active);
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
          <div className='resource-table-content'>
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
                height: 'calc(100% - 115px)',
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
