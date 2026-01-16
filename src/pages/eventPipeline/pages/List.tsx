import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Table, Button, Tag, Input, Modal, Drawer, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import usePagination from '@/components/usePagination';

import { NS } from '../constants';
import { Item, getList, deleteItems } from '../services';
import Add from './Add';
import Edit from './Edit';
import { Link } from 'react-router-dom';

export default function List() {
  const { t } = useTranslation(NS);
  const [filter, setFilter] = useState<{
    search?: string;
    use_case?: string;
    trigger_mode?: string;
    disabled?: boolean;
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
            dropdownMatchSelectWidth={false}
            placeholder={t('use_case.label')}
            options={[
              {
                label: t('use_case.firemap'),
                value: 'firemap',
              },
              {
                label: t('use_case.event_pipeline'),
                value: 'event_pipeline',
              },
            ]}
            value={filter?.use_case}
            onChange={(value) => setFilter((prev) => ({ ...prev, use_case: value }))}
          />
          <Select
            allowClear
            placeholder={t('trigger_mode.label')}
            dropdownMatchSelectWidth={false}
            options={[
              {
                label: t('trigger_mode.event'),
                value: 'event',
              },
              {
                label: t('trigger_mode.api'),
                value: 'api',
              },
            ]}
            value={filter?.trigger_mode}
            onChange={(value) => setFilter((prev) => ({ ...prev, trigger_mode: value }))}
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
            title: t('use_case.label'),
            dataIndex: 'use_case',
            width: 100,
            render: (value) => {
              return <Tag>{t(`use_case.${value}`)}</Tag>;
            },
          },
          {
            title: t('trigger_mode.label'),
            dataIndex: 'trigger_mode',
            width: 100,
            render: (value) => {
              return <Tag>{t(`trigger_mode.${value}`)}</Tag>;
            },
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
          if (filter?.use_case) {
            if (item.use_case !== filter.use_case) {
              pass = false;
            }
          }
          if (filter?.trigger_mode) {
            if (item.trigger_mode !== filter.trigger_mode) {
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
