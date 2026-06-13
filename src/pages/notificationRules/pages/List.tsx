import React, { useState, useEffect, useMemo } from 'react';
import { Space, Button, Switch, Modal, Input } from 'antd';
import { NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link, useHistory } from 'react-router-dom';

import { IS_PLUS } from '@/utils/constant';
import PageLayout from '@/components/pageLayout';
import EnhancedTable, { getEnabledStatusColumn } from '@/components/EnhancedTable';
import { userColumn, dateColumn } from '@/components/EnhancedTable/columns';
import Tags from '@/components/TableTags/Tags';
import { getSimplifiedItems as getNotificationChannels } from '@/pages/notificationChannels/services';
import { getTeamInfoList } from '@/services/manage';
import usePagination from '@/components/usePagination';

import { getItems, putItem, deleteItems } from '../services';
import { NS, CN, TABLE_PAGINATION_CACHE_KEY } from '../constants';
import { RuleItem } from '../types';

interface Filter {
  search?: string;
}

const FILTER_SESSION_STORAGE_KEY = 'notification-rules-filter';

export default function List() {
  const { t } = useTranslation(NS);
  const history = useHistory();
  const pagination = usePagination({ PAGESIZE_KEY: TABLE_PAGINATION_CACHE_KEY });
  const [loading, setLoading] = useState(false);
  let defaultFilter = {} as Filter;
  try {
    defaultFilter = JSON.parse(window.sessionStorage.getItem(FILTER_SESSION_STORAGE_KEY) || '{}');
  } catch (e) {
    console.error(e);
  }
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const saveFilter = (f: Filter) => window.sessionStorage.setItem(FILTER_SESSION_STORAGE_KEY, JSON.stringify(f));
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
    <PageLayout
      title={<Space>{t('title')}</Space>}
      icon={<NotificationOutlined />}
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/notify-rules/'
    >
      <div className={`n9e ${CN}`}>
        <div className='pb-4 flex justify-between'>
          <Space>
            <Input
              placeholder={t('common:search_placeholder')}
              style={{ width: 200 }}
              value={filter?.search}
              onChange={(e) => {
                const newFilter = {
                  ...filter,
                  search: e.target.value,
                };
                setFilter(newFilter);
                saveFilter(newFilter);
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
        <EnhancedTable
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
                      pathname: IS_PLUS ? `/${NS}/detail/${record.id}` : `/${NS}/edit/${record.id}`,
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
              render: (val: { channel_id: number; channel?: string }[]) => {
                return (
                  <Tags
                    type='outline'
                    maxWidth={180}
                    data={val}
                    getKey={(item) => item.channel_id}
                    getLabel={(item) => item.channel ?? String(item.channel_id)}
                    getTooltipTitle={(item) => (typeof item === 'string' ? undefined : item.channel ? undefined : t('channel_invalid_tip'))}
                  />
                );
              },
            },
            {
              title: t('user_group_ids'),
              dataIndex: 'user_group_ids',
              render: (val: number[]) => {
                return (
                  <Tags
                    type='outline'
                    maxWidth={180}
                    data={val}
                    getKey={(item) => item}
                    getLabel={(item) => {
                      const id = typeof item === 'number' ? item : Number(item);
                      return _.find(userGroups, { id })?.name ?? String(item);
                    }}
                    getTooltipTitle={(item) => {
                      const id = typeof item === 'number' ? item : Number(item);
                      return _.find(userGroups, { id })?.name ? undefined : t('user_group_id_invalid_tip');
                    }}
                  />
                );
              },
            },
            userColumn({ title: t('common:table.update_by'), dataIndex: 'update_by', nickname: 'update_by_nickname' }),
            dateColumn({ title: t('common:table.update_at'), dataIndex: 'update_at', unix: true }),
            {
              ...getEnabledStatusColumn({
                title: t('common:table.enabled'),
                dataIndex: 'enable',
                enabledText: t('common:table.enabled'),
                disabledText: t('disabled'),
                enabledValue: true,
                disabledValue: false,
              }),
              width: 100,
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
          ]}
          rowActions={(record) => ({
            menu: [
              { key: 'edit', icon: 'edit', text: t('common:btn.edit'), onClick: () => history.push({ pathname: `/${NS}/edit/${record.id}` }) },
              { key: 'clone', icon: 'copy', text: t('common:btn.clone'), onClick: () => window.open(`/${NS}/edit/${record.id}?mode=clone`) },
              {
                key: 'delete',
                icon: 'delete',
                text: t('common:btn.delete'),
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: t('common:confirm.delete'),
                    onOk: () => {
                      deleteItems([record.id]).then(() => {
                        fetchData();
                      });
                    },
                  });
                },
              },
            ],
          })}
          actionColumn={{ title: t('common:table.operations'), width: 64 }}
          pagination={pagination}
        />
      </div>
    </PageLayout>
  );
}
