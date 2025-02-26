import React, { useState, useEffect, useMemo } from 'react';
import { Table, Space, Button, Switch, Modal, Input, Tag, Tooltip } from 'antd';
import { NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';

import PageLayout from '@/components/pageLayout';
import { getItems as getNotificationChannels } from '@/pages/notificationChannels/services';
import { getTeamInfoList } from '@/services/manage';

import { getItems, putItem, deleteItems } from '../services';
import { NS } from '../constants';
import { RuleItem } from '../types';

export default function List() {
  const { t } = useTranslation(NS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<{
    search: string;
  }>();
  const [data, setData] = useState<RuleItem[]>([]);
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const filteredData = useMemo(() => {
    return _.filter(data, (item) => {
      if (filter?.search) {
        return _.includes(item.name, filter.search);
      }
      return true;
    });
  }, [JSON.stringify(data), JSON.stringify(filter)]);
  const fetchData = () => {
    setLoading(true);
    getItems()
      .then((res) => {
        getNotificationChannels()
          .then((channels) => {
            const newData = _.map(res, (item) => {
              const notify_configs = _.map(item.notify_configs, (notify_config) => {
                const channel = _.find(channels, { id: notify_config.channel_id });
                return {
                  ...notify_config,
                  channel: channel?.name,
                };
              });
              return {
                ...item,
                notify_configs,
              };
            });
            setData(newData);
          })
          .catch(() => {
            setData(res);
          });
      })
      .catch(() => {
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    getTeamInfoList().then((res) => {
      setUserGroups(res.dat ?? []);
    });
  }, []);

  return (
    <PageLayout title={<Space>{t('title')}</Space>} icon={<NotificationOutlined />}>
      <div className='n9e'>
        <div className='pb2 n9e-flex n9e-justify-between'>
          <Space>
            <Input
              placeholder={t('common:search_placeholder')}
              style={{ width: 200 }}
              value={filter?.search}
              onChange={(e) => {
                setFilter({
                  ...filter,
                  search: e.target.value,
                });
              }}
              prefix={<SearchOutlined />}
            />
          </Space>
          <Space>
            <Link to={`/${NS}/add`}>
              <Button type='primary'>{t('common:btn.add')}</Button>
            </Link>
          </Space>
        </div>
        <Table
          size='small'
          loading={loading}
          rowKey='id'
          dataSource={filteredData}
          columns={[
            {
              title: t('common:table.name'),
              dataIndex: 'name',
              render: (val, record) => {
                return (
                  <Link
                    to={{
                      pathname: `/${NS}/edit/${record.id}`,
                    }}
                  >
                    {val}
                  </Link>
                );
              },
            },
            {
              title: t('notification_configuration.channel'),
              dataIndex: 'notify_configs',
              render: (val) => {
                return _.map(val, (item) => {
                  return (
                    <Tooltip key={item.channel_id} title={!item.channel ? t('channel_invalid_tip') : undefined}>
                      <Tag color={!item.channel ? 'warning' : undefined}>{item.channel ?? item.channel_id}</Tag>
                    </Tooltip>
                  );
                });
              },
            },
            {
              title: t('user_group_ids'),
              dataIndex: 'user_group_ids',
              render: (val) => {
                return _.map(val, (item) => {
                  const name = _.find(userGroups, { id: item })?.name;
                  return (
                    <Tooltip key={item} title={!name ? t('user_group_id_invalid_tip') : undefined}>
                      <Tag color={!name ? 'warning' : undefined}>{name ?? item}</Tag>
                    </Tooltip>
                  );
                });
              },
            },
            {
              title: t('common:table.update_by'),
              dataIndex: 'update_by',
            },
            {
              title: t('common:table.update_at'),
              dataIndex: 'update_at',
              render: (val) => {
                return moment.unix(val).format('YYYY-MM-DD HH:mm:ss');
              },
            },
            {
              title: t('common:table.enabled'),
              width: 100,
              dataIndex: 'enable',
              render: (val, record) => (
                <Switch
                  checked={val}
                  size='small'
                  onChange={(checked) => {
                    putItem({
                      ...record,
                      enable: checked,
                    }).then(() => {
                      const newData = _.map(data, (item) => {
                        if (item.id === record.id) {
                          return {
                            ...item,
                            enable: checked,
                          };
                        }
                        return item;
                      });
                      setData(newData);
                    });
                  }}
                />
              ),
            },
            {
              title: t('common:table.operations'),
              width: 100,
              render: (record) => {
                return (
                  <Space>
                    <Link
                      className='table-operator-area-normal'
                      to={{
                        pathname: `/${NS}/edit/${record.id}?mode=clone`,
                      }}
                      target='_blank'
                    >
                      {t('common:btn.clone')}
                    </Link>
                    <Button
                      size='small'
                      type='link'
                      danger
                      style={{
                        padding: 0,
                      }}
                      onClick={() => {
                        Modal.confirm({
                          title: t('common:confirm.delete'),
                          onOk: () => {
                            deleteItems([record.id]).then(() => {
                              fetchData();
                            });
                          },
                        });
                      }}
                    >
                      {t('common:btn.delete')}
                    </Button>
                  </Space>
                );
              },
            },
          ]}
        />
      </div>
    </PageLayout>
  );
}
