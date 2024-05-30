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
import { Button, Input, message, Row, Modal, Table, Space } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { useAntdTable } from 'ahooks';
import PageLayout from '@/components/pageLayout';
import UserInfoModal from './component/createModal';
import { getUserInfoList, deleteUser } from '@/services/manage';
import { User, UserType, ActionType } from '@/store/manageInterface';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import Tags from './component/Tags';
import './index.less';
import './locale';

const { confirm } = Modal;

const Resource: React.FC = () => {
  const { t, i18n } = useTranslation('user');
  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [userId, setUserId] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [range, setRange] = useState<IRawTimeRange>();
  const { profile } = useContext(CommonStateContext);
  const pagination = usePagination({ PAGESIZE_KEY: 'users' });
  const userColumn: ColumnsType<User> = [
    {
      title: t('account:profile.username'),
      dataIndex: 'username',
      ellipsis: true,
    },
    {
      title: t('account:profile.nickname'),
      dataIndex: 'nickname',
      ellipsis: true,
      render: (text: string, record) => record.nickname || '-',
    },
    {
      title: t('account:profile.email'),
      dataIndex: 'email',
      render: (text: string, record) => record.email || '-',
    },
    {
      title: t('account:profile.phone'),
      dataIndex: 'phone',
      render: (text: string, record) => record.phone || '-',
    },
  ];
  const userColumns: ColumnsType<User> = [
    ...userColumn,
    {
      title: t('account:profile.role'),
      dataIndex: 'roles',
      render: (text: []) => text.join(', '),
    },
    {
      title: t('user.busi_groups'),
      dataIndex: 'busi_groups',
      render: (value) => {
        return (
          <Tags
            data={value}
            tagLinkTo={(item) => {
              return {
                pathname: '/busi-groups',
                search: `?id=${item.id}`,
              };
            }}
          />
        );
      },
    },
    {
      title: t('user.user_groups'),
      dataIndex: 'user_groups',
      render: (value) => {
        return (
          <Tags
            data={value}
            tagLinkTo={(item) => {
              return {
                pathname: '/user-groups',
                search: `?id=${item.id}`,
              };
            }}
          />
        );
      },
    },
    {
      title: t('common:table.create_at'),
      dataIndex: 'create_at',
      render: (text) => {
        return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
      },
      sorter: true,
    },
    {
      title: t('user.last_active_time'),
      dataIndex: 'last_active_time',
      render: (text) => {
        if (!text) {
          return '-';
        }
        return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
      },
      sorter: true,
    },
    {
      title: t('common:table.operations'),
      width: i18n.language === 'en_US' ? 200 : 160,
      render: (text: string, record) => (
        <>
          <Button className='oper-name' type='link' onClick={() => handleClick(ActionType.EditUser, record.id)}>
            {t('common:btn.edit')}
          </Button>
          <Button className='oper-name' type='link' onClick={() => handleClick(ActionType.Reset, record.id)}>
            {t('account:password.reset')}
          </Button>
          <a
            style={{
              color: 'red',
              marginLeft: '16px',
            }}
            onClick={() => {
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
            }}
          >
            {t('common:btn.delete')}
          </a>
        </>
      ),
    },
  ];

  if (!profile.roles?.includes('Admin')) {
    userColumns.pop(); //普通用户不展示操作列
  }

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
    <PageLayout title={t('user.title')} icon={<UserOutlined />}>
      <div className='user-manage-content'>
        <div className='user-content'>
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
                />
              </Space>
            </div>
            <div className='event-table-search-right'>
              {profile.roles?.includes('Admin') && (
                <div className='user-manage-operate'>
                  <Button type='primary' onClick={() => handleClick(ActionType.CreateUser)}>
                    {t('common:btn.add')}
                  </Button>
                </div>
              )}
            </div>
          </Row>
          <Table
            className='mt8'
            size='small'
            rowKey='id'
            columns={userColumns}
            {...tableProps}
            pagination={{
              ...tableProps.pagination,
              ...pagination,
            }}
          />
        </div>
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
