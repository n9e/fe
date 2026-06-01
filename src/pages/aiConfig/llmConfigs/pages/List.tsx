import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Space, Switch, Tooltip, Modal, Tag, Alert, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Trash2 } from 'lucide-react';
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
  const [addDrawerState, setAddDrawerState] = useState({ visible: false });
  const [editDrawerState, setEditDrawerState] = useState<{ visible: boolean; id?: number }>({ visible: false });

  const { data, loading, run } = useRequest(getList, { refreshDeps: [] });

  return (
    <>
      <PageLayout title={t('title')} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/ai-config/llm-configs/'>
        <div className='fc-page n9e'>
          <div className='flex flex-col gap-2'>
            <div className='fc-toolbar flex flex-wrap items-center justify-between gap-2'>
              <Alert message={t('help')} type='info' showIcon />
              <Space>
                <Button type='primary' icon={<PlusOutlined />} onClick={() => setAddDrawerState({ visible: true })}>
                  {t('add_btn')}
                </Button>
              </Space>
            </div>
            <div className='min-h-0 flex-shrink-0'>
              <EnhancedTable
                size='small'
                rowKey='id'
                pagination={pagination}
                loading={loading}
                dataSource={data}
                rowActions={(record) => ({
                  menu: [
                    {
                      key: 'edit',
                      icon: 'edit',
                      text: t('common:btn.edit'),
                      onClick: () => setEditDrawerState({ visible: true, id: record.id }),
                    },
                    {
                      key: 'delete',
                      danger: true,
                      disabled: record.enabled === true,
                      node: (
                        <Tooltip title={record.enabled === true ? t('cannot_delete_when_enabled') : undefined}>
                          <Button
                            type='link'
                            className='fc-table-action-menu-btn is-danger'
                            disabled={record.enabled === true}
                            icon={<Trash2 className='fc-table-action-menu-icon' />}
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
                          >
                            {t('common:btn.delete')}
                          </Button>
                        </Tooltip>
                      ),
                    },
                  ],
                })}
                actionColumn={{ title: t('common:table.operations'), width: 64 }}
                columns={[
                  {
                    dataIndex: 'id',
                    title: t('id'),
                    width: 80,
                  },
                  {
                    dataIndex: 'name',
                    title: t('name'),
                    render: (val, record) => (
                      <Space>
                        <span>{val}</span>
                        {record.is_default && <Tag color='purple'>{t('is_default')}</Tag>}
                      </Space>
                    ),
                  },
                  {
                    dataIndex: 'description',
                    title: t('description'),
                    ellipsis: { showTitle: false },
                    render: (val) => <EllipsisText text={val} />,
                  },
                  {
                    dataIndex: 'api_type',
                    title: t('api_type'),
                  },
                  {
                    dataIndex: 'model',
                    title: t('model'),
                  },
                  {
                    dataIndex: 'enabled',
                    title: t('enabled'),
                    render: (val, record) => (
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
                    ),
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
