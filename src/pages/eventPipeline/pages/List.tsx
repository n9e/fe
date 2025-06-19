import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Table, Button, Tag, Input, Modal, Drawer } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import usePagination from '@/components/usePagination';

import { NS } from '../constants';
import { Item, getList, deleteItems } from '../services';
import Add from './Add';
import Edit from './Edit';

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

  const [eventPipelineDrawerState, setEventPipelineDrawerState] = useState<{
    visible: boolean;
    action: 'add' | 'edit';
    id?: number;
  }>({
    visible: false,
    action: 'add',
  });

  const resetEventPipelineDrawerState = () => {
    setEventPipelineDrawerState({
      visible: false,
      action: 'add',
      id: undefined,
    });
  };

  useEffect(() => {
    featchData();
  }, []);

  return (
    <>
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
          <Button
            type='primary'
            onClick={() => {
              setEventPipelineDrawerState({
                visible: true,
                action: 'add',
              });
            }}
          >
            {t('common:btn.add')}
          </Button>
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
                <a
                  onClick={() => {
                    setEventPipelineDrawerState({
                      visible: true,
                      action: 'edit',
                      id: item.id,
                    });
                  }}
                >
                  {val}
                </a>
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
                  <a
                    onClick={() => {
                      setEventPipelineDrawerState({
                        visible: true,
                        action: 'edit',
                        id: item.id,
                      });
                    }}
                  >
                    {t('common:btn.edit')}
                  </a>
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
      <Drawer
        title={t(`${NS}:title_${eventPipelineDrawerState.action}`)}
        visible={eventPipelineDrawerState.visible}
        onClose={resetEventPipelineDrawerState}
        width='80%'
        destroyOnClose
      >
        {eventPipelineDrawerState.action === 'add' && (
          <Add
            onOk={() => {
              resetEventPipelineDrawerState();
              featchData();
            }}
            onCancel={() => {
              resetEventPipelineDrawerState();
            }}
          />
        )}
        {eventPipelineDrawerState.action === 'edit' && eventPipelineDrawerState?.id && (
          <Edit
            id={eventPipelineDrawerState.id}
            onOk={() => {
              resetEventPipelineDrawerState();
              featchData();
            }}
            onCancel={() => {
              resetEventPipelineDrawerState();
            }}
          />
        )}
      </Drawer>
    </>
  );
}
