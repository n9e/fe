import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Space, Switch, Modal, message, Tag } from 'antd';
import { PlusOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import PageLayout from '@/components/pageLayout';
import usePagination from '@/components/usePagination';
import EnhancedTable, { getEnabledStatusColumn } from '@/components/EnhancedTable';
import EllipsisText from '@/components/EllipsisText';

import { NS } from '../constants';
import { getList, deleteItem, putItem } from '../services';
import useUserGroups from '../useUserGroups';
import AddDrawer, { View } from './AddDrawer';
import EditDrawer from './EditDrawer';

export default function List() {
  const { t } = useTranslation(NS);
  const pagination = usePagination({ PAGESIZE_KEY: NS });
  const [addDrawerState, setAddDrawerState] = useState<{ visible: boolean; defaultView?: View }>({ visible: false });
  const [editDrawerState, setEditDrawerState] = useState<{ visible: boolean; id?: number }>({ visible: false });

  const { data, loading, run } = useRequest(getList, { refreshDeps: [] });
  const { options: userGroupOptions } = useUserGroups();
  const groupNameMap = useMemo(() => new Map(userGroupOptions.map((o) => [o.value, o.label])), [userGroupOptions]);

  return (
    <>
      <PageLayout title={t('title')}>
        <div className='fc-page n9e'>
          <div className='flex flex-col gap-2'>
            <div className='fc-toolbar flex flex-wrap items-center justify-between gap-2'>
              <div />
              <Space>
                <Button icon={<AppstoreOutlined />} onClick={() => setAddDrawerState({ visible: true, defaultView: 'template' })}>
                  {t('use_template')}
                </Button>
                <Button type='primary' icon={<PlusOutlined />} onClick={() => setAddDrawerState({ visible: true, defaultView: 'form' })}>
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
                rowActions={(record) => {
                  const noManagePerm = record.can_manage === false;
                  // 删除禁用原因：启用中优先，其次无管理权限；有原因即禁用并作为 tooltip 提示
                  const deleteDisabledReason = record.enabled === true ? t('cannot_delete_when_enabled') : noManagePerm ? t('no_manage_perm') : undefined;
                  return {
                    menu: [
                      {
                        key: 'edit',
                        icon: 'edit',
                        text: t('common:btn.edit'),
                        disabled: noManagePerm,
                        tooltip: noManagePerm ? t('no_manage_perm') : undefined,
                        onClick: () => setEditDrawerState({ visible: true, id: record.id }),
                      },
                      {
                        key: 'delete',
                        icon: 'delete',
                        text: t('common:btn.delete'),
                        danger: true,
                        disabled: !!deleteDisabledReason,
                        tooltip: deleteDisabledReason,
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
                  };
                }}
                actionColumn={{ title: t('common:table.operations'), width: 64 }}
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
                    dataIndex: 'url',
                    title: t('url'),
                  },
                  {
                    dataIndex: 'private',
                    title: t('scope.title'),
                    width: 90,
                    render: (val) => <Tag color={val === 0 ? 'green' : 'default'}>{val === 0 ? t('scope.public') : t('scope.private')}</Tag>,
                  },
                  {
                    dataIndex: 'user_group_ids',
                    title: t('scope.teams'),
                    render: (ids: number[]) => (_.isEmpty(ids) ? '-' : _.map(ids, (id) => <Tag key={id}>{groupNameMap.get(id) ?? `#${id}`}</Tag>)),
                  },
                  {
                    dataIndex: 'oauth_connected',
                    title: t('form.oauth_connection'),
                    width: 90,
                    // 仅 OAuth 鉴权的 Server 有连接状态：让「已保存但未授权」的记录在列表中一目了然
                    render: (val, record) =>
                      record.auth_mode === 'oauth' ? <Tag color={val ? 'success' : 'warning'}>{val ? t('form.oauth_connected') : t('form.oauth_not_connected')}</Tag> : '-',
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

                    render: (val, record) => (
                      <Switch
                        size='small'
                        checked={val}
                        disabled={record.can_manage === false}
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
        defaultView={addDrawerState.defaultView}
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
