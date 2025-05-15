import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Table, Button, Tag, Input, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import usePagination from '@/components/usePagination';

import PageLayout from '@/components/pageLayout';

import { NS } from '../constants';
import { Item, getList, deleteItems } from '../services';

export default function List() {
  const { t } = useTranslation(NS);
  const [filter, setFilter] = useState<{
    search: string;
  }>();
  const [data, setData] = useState<{
    list: Item[];
    loading: boolean;
  }>({
    list: [],
    loading: false,
  });

  const pagination = usePagination({ PAGESIZE_KEY: 'event-pipelines-pagesize' });

  const featchData = () => {
    setData((prev) => ({ ...prev, loading: true }));
    getList()
      .then((res) => {
        setData({ list: res, loading: false });
      })
      .catch(() => {
        setData((prev) => ({ ...prev, loading: false }));
      });
  };

  useEffect(() => {
    featchData();
  }, []);

  return (
    <PageLayout title={t('title')}>
      <div className='n9e'>
        <div className='flex justify-between items-center pb-2'>
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
          rowKey='id'
          columns={[
            {
              title: t('common:table.name'),
              dataIndex: 'name',
              render: (val, item) => {
                return (
                  <Link
                    to={{
                      pathname: `/${NS}/edit/${item.id}`,
                    }}
                  >
                    {val}
                  </Link>
                );
              },
            },
            {
              title: t('common:table.note'),
              dataIndex: 'description',
            },
            {
              title: t('teams'),
              dataIndex: 'team_names',
              render: (val) => {
                return _.map(val, (item) => {
                  return <Tag key={item}>{item}</Tag>;
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
              title: t('common:table.operations'),
              width: 200,
              render: (item) => {
                return (
                  <Space>
                    <Link
                      to={{
                        pathname: `/${NS}/edit/${item.id}`,
                      }}
                    >
                      {t('common:btn.edit')}
                    </Link>
                    <Button
                      type='link'
                      size='small'
                      style={{
                        padding: 0,
                      }}
                      danger
                      onClick={() => {
                        Modal.confirm({
                          title: t('common:confirm.delete'),
                          onOk: () => {
                            deleteItems([item.id]).then(() => {
                              featchData();
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
          dataSource={_.filter(data.list, (item) => {
            if (filter?.search) {
              return _.includes(item.name, filter.search);
            }
            return true;
          })}
          loading={data.loading}
          pagination={pagination}
        />
      </div>
    </PageLayout>
  );
}
