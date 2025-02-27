import React, { useState, useEffect, useMemo } from 'react';
import { Table, Space, Button, Switch, Modal, Input, message } from 'antd';
import { NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';

import PageLayout from '@/components/pageLayout';
import { Import, Export } from '@/components/ExportImport';

import { getItems, putItem, deleteItems, postItems } from '../../services';
import { NS } from '../../constants';
import { ChannelItem } from '../../types';

export default function List() {
  const { t } = useTranslation(NS);
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
              title: t('request_type'),
              dataIndex: 'request_type',
              render: (val) => {
                return (
                  <div className='n9e-flex n9e-items-center n9e-gap-1'>
                    <img height={16} src={`/image/notification/${val}.png`} alt={val} />
                    {t(`${val}_request_config.title`)}
                  </div>
                );
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
                              message.success(t('common:success.delete'));
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
          rowSelection={{
            selectedRowKeys: _.map(selectedRows, 'id'),
            onChange: (_selectedRowKeys, selectedRows: ChannelItem[]) => {
              setSelectedRows(selectedRows);
            },
          }}
        />
      </div>
    </PageLayout>
  );
}
