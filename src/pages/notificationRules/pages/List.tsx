import React, { useState, useEffect, useMemo } from 'react';
import { Table, Space, Button, Switch, Modal, Input, Tag, Tooltip, Dropdown, Menu } from 'antd';
import { NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';

import { IS_PLUS } from '@/utils/constant';
import PageLayout from '@/components/pageLayout';
import { getSimplifiedItems as getNotificationChannels } from '@/pages/notificationChannels/services';
import { getTeamInfoList } from '@/services/manage';
import usePagination from '@/components/usePagination';

import { getItems, putItem, deleteItems } from '../services';
import { NS, CN, TABLE_PAGINATION_CACHE_KEY } from '../constants';
import { RuleItem } from '../types';
import { TableActionButton, TableActionLink, TableActionTrigger } from '@/components/TableActionDropdown';

interface Filter {
  search?: string;
}

const FILTER_SESSION_STORAGE_KEY = 'notification-rules-filter';

export default function List() {
  const { t } = useTranslation(NS);
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
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v8/quickstart/notify-rules/'
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
              width: 64,
              fixed: 'right' as const,
              render: (record) => {
                return (
                  <Dropdown
                    trigger={['click']}
                    align={{ points: ['tr', 'tl'], offset: [-2, 0] }}
                    overlayClassName='fc-table-action-dropdown'
                    overlay={
                      <Menu>
                        <Menu.Item>
                          <TableActionLink actionIcon='edit' to={{ pathname: `/${NS}/edit/${record.id}` }}>
                            {t('common:btn.edit')}
                          </TableActionLink>
                        </Menu.Item>
                        <Menu.Item>
                          <TableActionLink actionIcon='copy' to={{ pathname: `/${NS}/edit/${record.id}?mode=clone` }} target='_blank'>
                            {t('common:btn.clone')}
                          </TableActionLink>
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item>
                          <TableActionButton
                            actionIcon='delete'
                            danger
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
                          </TableActionButton>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <TableActionTrigger />
                  </Dropdown>
                );
              },
            },
          ]}
          scroll={{ x: 'max-content' }}
          pagination={pagination}
        />
      </div>
    </PageLayout>
  );
}
