import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Space, Switch, Table, Tooltip, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';

import PageLayout from '@/components/pageLayout';
import usePagination from '@/components/usePagination';

import { NS } from '../constants';
import { getList, deleteItem } from '../services';
import AddDrawer from './AddDrawer';
import EditDrawer from './EditDrawer';

export default function List() {
  const { t } = useTranslation(NS);
  const pagination = usePagination({ PAGESIZE_KEY: NS });
  const [addDrawerState, setAddDrawerState] = useState({
    visible: false,
  });
  const [editDrawerState, setEditDrawerState] = useState<{
    visible: boolean;
    id?: number;
  }>({
    visible: false,
  });

  const { data, loading, run } = useRequest(getList, {
    refreshDeps: [],
  });

  return (
    <>
      <PageLayout title={t('title')}>
        <div className='fc-page n9e'>
          <div className='flex flex-col gap-2'>
            <div className='fc-toolbar flex flex-wrap items-center justify-between gap-2'>
              <div />
              <Space>
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setAddDrawerState({
                      visible: true,
                    });
                  }}
                >
                  {t('add_btn')}
                </Button>
              </Space>
            </div>
            <div className='min-h-0 flex-shrink-0'>
              <Table
                className='fc-table'
                size='small'
                rowKey='id'
                pagination={pagination}
                loading={loading}
                dataSource={data}
                columns={[
                  {
                    dataIndex: 'name',
                    title: t('name'),
                  },
                  {
                    dataIndex: 'description',
                    title: t('description'),
                  },
                  {
                    dataIndex: 'llm_config',
                    title: t('llm_config'),
                    render: (val) => val?.name,
                  },
                  {
                    dataIndex: 'use_case',
                    title: t('use_case'),
                  },
                  {
                    dataIndex: 'enabled',
                    title: t('enabled'),
                    render: (val) => {
                      return <Switch size='small' checked={val} />;
                    },
                  },
                  {
                    title: t('common:table.operations'),
                    width: 100,
                    render: (record) => {
                      return (
                        <Space size={2}>
                          <Button
                            size='small'
                            type='text'
                            className='p-0'
                            icon={<EditOutlined />}
                            onClick={() => {
                              setEditDrawerState({
                                visible: true,
                                id: record.id,
                              });
                            }}
                          />
                          <Tooltip title={record.enable === true ? t('cannot_delete_when_enabled') : undefined}>
                            <Button
                              size='small'
                              type='text'
                              className='p-0'
                              icon={<DeleteOutlined />}
                              disabled={record.enable === true}
                              onClick={() => {
                                Modal.confirm({
                                  title: t('common:confirm.delete'),
                                  onOk: () => {
                                    deleteItem(record.id).then(() => {
                                      message.success(t('common:success.delete'));
                                      run();
                                    });
                                  },
                                });
                              }}
                            />
                          </Tooltip>
                        </Space>
                      );
                    },
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </PageLayout>
      <AddDrawer
        visible={addDrawerState.visible}
        onOk={() => {
          setAddDrawerState({ visible: false });
          run();
        }}
        onClose={() => setAddDrawerState({ visible: false })}
      />
      <EditDrawer
        id={editDrawerState.id}
        visible={editDrawerState.visible}
        onOk={() => {
          setEditDrawerState({ visible: false });
          run();
        }}
        onClose={() => setEditDrawerState({ visible: false })}
      />
    </>
  );
}
