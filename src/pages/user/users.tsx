/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useContext } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Button, Input, message, Row, Modal, Space } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { useAntdTable } from 'ahooks';
import PageLayout from '@/components/pageLayout';
import EnhancedTable from '@/components/EnhancedTable';
import Tags from '@/components/TableTags/Tags';
import UserInfoModal from './component/createModal';
import { getUserInfoList, deleteUser } from '@/services/manage';
import { User, UserType, ActionType } from '@/store/manageInterface';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import TableColumnSelect, { getDefaultColumnsConfigs, setDefaultColumnsConfigs, buildColumnOptions } from '@/components/TableColumnSelect';
import { defaultColumnsConfigs, LOCAL_STORAGE_KEY } from './constants';
import './index.less';
import './locale';

const { confirm } = Modal;

const Resource: React.FC = () => {
  const { t } = useTranslation('user');
  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [userId, setUserId] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [range, setRange] = useState<IRawTimeRange>();
  const { perms } = useContext(CommonStateContext);
  const pagination = usePagination({ PAGESIZE_KEY: 'users' });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => getDefaultColumnsConfigs(defaultColumnsConfigs, LOCAL_STORAGE_KEY));
  const columnOptions = buildColumnOptions(defaultColumnsConfigs, t);

  const userColumns: ColumnsType<User> = [
    {
      title: t('account:profile.username'),
      dataIndex: 'username',
      width: 180,
      ellipsis: true,
      sorter: true,
    },
    {
      title: t('account:profile.nickname'),
      dataIndex: 'nickname',
      width: 180,
      ellipsis: true,
      sorter: true,
      render: (text: string) => <span>{text || '-'}</span>,
    },
    {
      title: t('account:profile.email'),
      dataIndex: 'email',
      width: 180,
      ellipsis: true,
    },
    {
      title: t('account:profile.role'),
      dataIndex: 'roles',
      width: 120,
      render: (text: []) => text.join(', '),
    },
    {
      title: t('user.busi_groups'),
      dataIndex: 'busi_groups',
      width: 160,
      render: (value: { id: number; name: string }[]) => {
        return (
          <Tags
            data={value}
            maxWidth={220}
            getKey={(item) => item.id}
            getLabel={(item) => item.name}
            onTagClick={(item) => {
              if (typeof item !== 'string') window.open(`/busi-groups?id=${item.id}`, '_blank');
            }}
          />
        );
      },
    },
    {
      title: t('user.user_groups'),
      dataIndex: 'user_groups',
      width: 160,
      render: (value: { id: number; name: string }[]) => {
        return (
          <Tags
            data={value}
            maxWidth={220}
            getKey={(item) => item.id}
            getLabel={(item) => item.name}
            onTagClick={(item) => {
              if (typeof item !== 'string') window.open(`/user-groups?id=${item.id}`, '_blank');
            }}
          />
        );
      },
    },
    {
      title: t('common:table.create_at'),
      dataIndex: 'create_at',
      width: 170,
      render: (text) => {
        return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
      },
      sorter: true,
    },
    {
      title: t('user.last_active_time'),
      dataIndex: 'last_active_time',
      width: 170,
      render: (text) => {
        if (!text) {
          return '-';
        }
        return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
      },
      sorter: true,
    },
  ];

  const hasRowActions = _.includes(perms, '/users/put') || _.includes(perms, '/users/del');

  const handleClick = (type: ActionType, id?: string, memberId?: string) => {
    if (id) {
      setUserId(id);
    } else {
      setUserId('');
    }

    if (memberId) {
      setMemberId(memberId);
    } else {
      setMemberId('');
    }

    setAction(type);
    setVisible(true);
  };

  // 弹窗关闭回调
  const handleClose = () => {
    setVisible(false);
    setRefreshFlag(_.uniqueId('refresh_flag'));
  };

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setQuery(val);
  };

  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_flag'));
  const getTableData = ({ current, pageSize, sorter }): Promise<any> => {
    const params: any = {
      p: current,
      limit: pageSize,
      order: sorter?.field,
      desc: sorter?.order === 'descend' ? 'true' : undefined,
    };
    if (range) {
      const parsedRange = parseRange(range);
      params.stime = moment(parsedRange.start).unix();
      params.etime = moment(parsedRange.end).unix();
    }

    return getUserInfoList({
      ...params,
      query,
    }).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };
  const { tableProps } = useAntdTable(getTableData, {
    defaultPageSize: pagination.pageSize,
    refreshDeps: [query, refreshFlag, range],
  });

  return (
    <PageLayout
      title={<Space>{t('user.title')}</Space>}
      icon={<UserOutlined />}
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/personnel-permissions/user-management/'
    >
      <div className='user-manage-content n9e'>
        <Row className='event-table-search'>
          <div className='event-table-search-left'>
            <Space>
              <Input className={'searchInput'} prefix={<SearchOutlined />} onPressEnter={onSearchQuery} placeholder={t('user.search_placeholder')} />
              <TimeRangePicker
                allowClear
                placeholder={t('user.last_active_time')}
                value={range}
                onChange={(newVal) => {
                  setRange(newVal);
                }}
                onClear={() => {
                  setRange(undefined);
                }}
              />
            </Space>
          </div>
          <div className='event-table-search-right'>
            <Space>
              {_.includes(perms, '/users/add') && (
                <div className='user-manage-operate'>
                  <Button type='primary' onClick={() => handleClick(ActionType.CreateUser)}>
                    {t('common:btn.add')}
                  </Button>
                </div>
              )}
              <TableColumnSelect
                options={columnOptions}
                value={visibleColumns}
                onChange={(vals) => {
                  setVisibleColumns(vals);
                  setDefaultColumnsConfigs(vals, LOCAL_STORAGE_KEY);
                }}
                sortable={false}
                showAll
                buttonSize='middle'
              />
            </Space>
          </div>
        </Row>
        <EnhancedTable
          className='mt-2'
          size='small'
          rowKey='id'
          columns={userColumns.filter((col) => {
            if (!('dataIndex' in col)) return true;
            if (col.dataIndex === 'operator') return true;
            return visibleColumns.includes(col.dataIndex as string);
          })}
          rowActions={
            hasRowActions
              ? (record) => ({
                  menu: _.compact([
                    _.includes(perms, '/users/put')
                      ? { key: 'edit', icon: 'edit', text: t('common:btn.edit'), onClick: () => handleClick(ActionType.EditUser, record.id) }
                      : undefined,
                    _.includes(perms, '/users/put')
                      ? { key: 'reset', icon: 'settings', text: t('account:password.reset'), onClick: () => handleClick(ActionType.Reset, record.id) }
                      : undefined,
                    _.includes(perms, '/users/del')
                      ? {
                          key: 'delete',
                          icon: 'delete',
                          text: t('common:btn.delete'),
                          danger: true,
                          onClick: () => {
                            confirm({
                              title: t('common:confirm.delete'),
                              onOk: () => {
                                deleteUser(record.id).then((_) => {
                                  message.success(t('common:success.delete'));
                                  handleClose();
                                });
                              },
                              onCancel: () => {},
                            });
                          },
                        }
                      : undefined,
                  ]),
                })
              : undefined
          }
          actionColumn={{ title: t('common:table.operations'), width: 64 }}
          {...tableProps}
          pagination={{
            ...tableProps.pagination,
            ...pagination,
          }}
        />
        <UserInfoModal
          visible={visible}
          action={action as ActionType}
          width={500}
          userType={UserType.User}
          onClose={handleClose}
          userId={userId}
          teamId={undefined}
          memberId={memberId}
        />
      </div>
    </PageLayout>
  );
};

export default Resource;
