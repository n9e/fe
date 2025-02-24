import React, { useState, useEffect, useMemo } from 'react';
import { Table, Space, Button, Switch, Modal, Input, message } from 'antd';
import { NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import PageLayout from '@/components/pageLayout';

import { getItems, putItem, deleteItems } from '../services';
import { NS } from '../constants';
import { ChannelItem } from '../types';

export default function List() {
  const { t } = useTranslation(NS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<{
    search: string;
  }>();
  const [data, setData] = useState<ChannelItem[]>([]);
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
        />
      </div>
    </PageLayout>
  );
}
