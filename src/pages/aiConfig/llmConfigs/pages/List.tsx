import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Space, Switch, Modal, Tag, Alert, message, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';

import PageLayout from '@/components/pageLayout';
import usePagination from '@/components/usePagination';
import EnhancedTable, { getEnabledStatusColumn } from '@/components/EnhancedTable';
import EllipsisText from '@/components/EllipsisText';

import { NS } from '../constants';
import { getList, deleteItem, putItem } from '../services';
import AddDrawer from './AddDrawer';
import EditDrawer from './EditDrawer';

function trimTrailingZero(value: string) {
  return value.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

function formatContextLength(value?: number) {
  if (value === undefined || value === null || !Number.isFinite(value) || value < 0) {
    return {
      compact: '-',
      exact: undefined,
    };
  }

  const exact = `${value.toLocaleString()} tokens`;

  if (value >= 1_000_000) {
    return {
      compact: `${trimTrailingZero((value / 1_000_000).toFixed(2))}M`,
      exact,
    };
  }

  if (value >= 1_000) {
    return {
      compact: `${trimTrailingZero((value / 1_000).toFixed(2))}K`,
      exact,
    };
  }

  return {
    compact: value.toString(),
    exact,
  };
}

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
                  inline: [
                    {
                      key: 'edit',
                      icon: 'edit',
                      text: t('common:btn.edit'),
                      onClick: () => setEditDrawerState({ visible: true, id: record.id }),
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
                actionColumn={{ title: t('common:table.operations'), width: 80 }}
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
                    dataIndex: ['extra_config', 'context_length'],
                    title: t('form.context_length'),
                    width: 120,
                    render: (val) => {
                      const contextLength = formatContextLength(val);

                      if (!contextLength.exact) {
                        return contextLength.compact;
                      }

                      return <Tooltip title={contextLength.exact}>{contextLength.compact}</Tooltip>;
                    },
                  },
                  {
                    ...getEnabledStatusColumn({
                      title: t('enabled'),
                      dataIndex: 'enabled',
                      enabledText: t('enabled'),
                      disabledText: t('disabled'),
                      enabledValue: true,
                      disabledValue: false,
                    }),
                    width: 100,
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
