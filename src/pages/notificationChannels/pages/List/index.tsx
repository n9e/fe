import React, { useState, useEffect, useMemo } from 'react';
import { Space, Button, Switch, Modal, Input, message } from 'antd';
import { NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';

import usePagination from '@/components/usePagination';
import PageLayout from '@/components/pageLayout';
import { Import, Export } from '@/components/ExportImport';
import EnhancedTable, { getEnabledStatusColumn } from '@/components/EnhancedTable';
import { updateByColumn } from '@/components/EnhancedTable/columns';

import { getItems, putItem, deleteItems, postItems } from '../../services';
import { NS } from '../../constants';
import { ChannelItem } from '../../types';

export default function List() {
  const { t } = useTranslation(NS);
  const pagination = usePagination({ PAGESIZE_KEY: 'notification-channels-pagesize' });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<{
    search: string;
  }>();
  const [data, setData] = useState<ChannelItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<ChannelItem[]>([]);
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
        setData(res);
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
  }, []);

  return (
    <PageLayout title={<Space>{t('title')}</Space>} icon={<NotificationOutlined />} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usecase/media/'>
      <div className='n9e'>
        <div className='pb-4 flex justify-between'>
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
            <Button
              onClick={() => {
                Import({
                  title: t('common:btn.import'),
                  onOk: (data) => {
                    try {
                      const newData = JSON.parse(data);
                      postItems(newData).then(() => {
                        fetchData();
                        message.success(t('common:success.import'));
                      });
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
              }}
            >
              {t('common:btn.import')}
            </Button>
            <Button
              onClick={() => {
                if (selectedRows.length) {
                  Export({
                    title: t('common:btn.export'),
                    data: JSON.stringify(selectedRows, null, 4),
                  });
                } else {
                  message.warning(t('common:batch.not_select'));
                }
              }}
            >
              {t('common:btn.export')}
            </Button>
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
                      pathname: `/${NS}/edit/${record.id}`,
                    }}
                  >
                    {val}
                  </Link>
                );
              },
            },
            {
              title: t('request_type'),
              dataIndex: 'request_type',
              render: (val) => {
                return (
                  <div className='flex items-center gap-2'>
                    <img height={16} src={`/image/notification/${val}.png`} alt={val} />
                    {t(`${val}_request_config.title`)}
                  </div>
                );
              },
            },
            updateByColumn({
              title: t('common:table.update_by'),
              dataIndex: 'update_by',
            }),
            {
              title: t('common:table.update_at'),
              dataIndex: 'update_at',
              render: (val) => {
                return moment.unix(val).format('YYYY-MM-DD HH:mm:ss');
              },
            },
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
            inline: [
              {
                key: 'clone',
                icon: 'copy',
                text: t('common:btn.clone'),
                onClick: () => {
                  window.open(`/${NS}/edit/${record.id}?mode=clone`, '_blank');
                },
              },
              {
                key: 'delete',
                icon: 'delete',
                text: t('common:btn.delete'),
                danger: true,
                disabled: record.enable === true,
                tooltip: record.enable === true ? t('common:delete_disable_first') : undefined,
                onClick: () => {
                  Modal.confirm({
                    title: t('common:confirm.delete'),
                    onOk: () => {
                      deleteItems([record.id]).then(() => {
                        message.success(t('common:success.delete'));
                        fetchData();
                      });
                    },
                  });
                },
              },
            ],
          })}
          actionColumn={{ title: t('common:table.operations'), width: 64 }}
          rowSelection={{
            selectedRowKeys: _.map(selectedRows, 'id'),
            onChange: (_selectedRowKeys, selectedRows: ChannelItem[]) => {
              setSelectedRows(selectedRows);
            },
          }}
          pagination={pagination}
        />
      </div>
    </PageLayout>
  );
}
