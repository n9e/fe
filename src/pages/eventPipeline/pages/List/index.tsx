import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Table, Button, Tag, Input, Modal, Drawer, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import usePagination from '@/components/usePagination';

import { NS } from '../../constants';
import { Item, getList, deleteItems } from '../../services';
import Add from '../Add';
import Edit from '../Edit';
import MoreOperations from './MoreOperations';

export default function List() {
  const { t } = useTranslation(NS);
  const [filter, setFilter] = useState<{
    search?: string;
    disabled?: boolean;
  }>();
  const [data, setData] = useState<{
    list: Item[];
    loading: boolean;
  }>({
    list: [],
    loading: false,
  });
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);

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
    action: 'add' | 'edit' | 'clone';
    id?: number;
    data?: any;
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

  const disabledMap = {
    false: <Tag color='green'>{t('disabled.false')}</Tag>,
    true: <Tag color='red'>{t('disabled.true')}</Tag>,
  };

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
          <Select
            allowClear
            placeholder={t('disabled.label')}
            options={[
              {
                label: t('disabled.false'),
                value: false,
              },
              {
                label: t('disabled.true'),
                value: true,
              },
            ]}
            value={filter?.disabled}
            onChange={(value) => setFilter((prev) => ({ ...prev, disabled: value }))}
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
          <MoreOperations selectedRows={selectedRows} />
        </Space>
      </div>
      <Table
        size='small'
        rowKey='id'
        columns={[
          {
            title: t('common:table.name'),
            dataIndex: 'name',
            render: (val, item: Item) => {
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
            title: t('disabled.label'),
            dataIndex: 'disabled',
            key: 'disabled',
            width: 100,
            render: (value) => {
              return disabledMap[value] || value;
            },
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
            render: (item: Item) => {
              return (
                <Space>
                  <a
                    onClick={() => {
                      setEventPipelineDrawerState({
                        visible: true,
                        action: 'clone',
                        data: _.omit(item, 'id'),
                      });
                    }}
                  >
                    {t('common:btn.clone')}
                  </a>
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
                  <Link to={`/event-pipelines-executions?pipeline_id=${item.id}`}>{t('executions.title')}</Link>
                </Space>
              );
            },
          },
        ]}
        dataSource={_.filter(data.list, (item) => {
          let pass = true;
          if (filter?.search) {
            if (!_.includes(item.name, filter.search)) {
              pass = false;
            }
          }
          if (filter?.disabled !== undefined) {
            if (item.disabled !== filter.disabled) {
              pass = false;
            }
          }
          return pass;
        })}
        loading={data.loading}
        pagination={pagination}
        rowSelection={{
          selectedRowKeys: selectedRows.map((item) => item.id),
          onChange: (_selectedRowKeys: React.Key[], selectedRows: Item[]) => {
            setSelectedRows(selectedRows);
          },
        }}
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
        {eventPipelineDrawerState.action === 'clone' && eventPipelineDrawerState?.data && (
          <Add
            initialValues={eventPipelineDrawerState.data}
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
