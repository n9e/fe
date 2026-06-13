import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Switch, Modal, message } from 'antd';
import { useRequest } from 'ahooks';

import PageLayout from '@/components/pageLayout';
import usePagination from '@/components/usePagination';
import EnhancedTable from '@/components/EnhancedTable';
import EllipsisText from '@/components/EllipsisText';

import { NS } from '../constants';
import { getList, deleteItem, putItem } from '../services';
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
                {/* <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setAddDrawerState({
                      visible: true,
                    });
                  }}
                >
                  {t('add_btn')}
                </Button> */}
              </Space>
            </div>
            <div className='min-h-0 flex-shrink-0'>
              <EnhancedTable
                rowKey='id'
                size='small'
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
                    ellipsis: { showTitle: false },
                    render: (val) => <EllipsisText text={val} />,
                  },
                  {
                    dataIndex: 'llm_config_name',
                    title: t('llm_config_name'),
                  },
                  {
                    dataIndex: 'use_case',
                    title: t('use_case'),
                  },
                  {
                    dataIndex: 'enabled',
                    title: t('enabled'),
                    sorter: (a, b) => Number(a.enabled) - Number(b.enabled),
                    filters: [
                      { text: t('enabled'), value: true },
                      { text: t('disabled'), value: false },
                    ],
                    onFilter: (value, record) => record.enabled === value,
                    render: (val, record) => {
                      return (
                        <Switch
                          size='small'
                          checked={val}
                          onChange={(checked) => {
                            putItem(record.id, {
                              ...record,
                              enabled: checked,
                            }).then(() => {
                              message.success(t('common:success.modify'));
                              run();
                            });
                          }}
                        />
                      );
                    },
                  },
                ]}
                rowActions={(record) => ({
                  menu: [
                    {
                      key: 'edit',
                      icon: 'edit',
                      text: t('common:btn.edit'),
                      onClick: () => {
                        setEditDrawerState({
                          visible: true,
                          id: record.id,
                        });
                      },
                    },
                    {
                      key: 'delete',
                      icon: 'delete',
                      text: t('common:btn.delete'),
                      danger: true,
                      disabled: record.enabled === true,
                      tooltip: record.enabled === true ? t('cannot_delete_when_enabled') : undefined,
                      onClick: () => {
                        Modal.confirm({
                          title: t('common:confirm.delete'),
                          onOk: () => {
                            deleteItem(record.id).then(() => {
                              message.success(t('common:success.delete'));
                              run();
                            });
                          },
                        });
                      },
                    },
                  ],
                })}
                actionColumn={{ title: t('common:table.operations'), width: 64 }}
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
