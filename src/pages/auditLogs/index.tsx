import React, { useState, useEffect } from 'react';
import moment from 'moment';
import PageLayout from '@/components/pageLayout';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { Space, Button, Form, Select, DatePicker, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { useAntdTable } from 'ahooks';
import { AuditLog } from './type';
import { getAuditLogList, getAuditEventList } from './service';
import { getUserInfoList } from '@/services/manage';
import usePagination from '@/components/usePagination';
import './locale';

export default function index() {
  const { t } = useTranslation('auditLogs');
  const [username, setUsername] = useState<string>('');
  const [event, setEvent] = useState<string>('');
  const [start_time, setStartTime] = useState<moment.Moment>(moment().startOf('day'))
  const [end_time, setEndTime] = useState<moment.Moment>(moment())
  const [userList, setUserList] = useState<{ nickname: string, username: string }[]>([])
  // const [eventList, setEventList] = useState<{ event: string, name: string }[]>([])
  const [eventDesc, setEventDesc] = useState<{}>({})
  const pagination = usePagination({ PAGESIZE_KEY: 'auditlogs' });
  const { RangePicker } = DatePicker;
  const dateFormat = 'YYYY-MM-DD HH:mm:ss';

  useEffect(() => {
    getUserList();
  }, []);

  const getUserList = () => {
    getUserInfoList().then((data) => {
      setUserList(data.dat.list || [])
    });
  };

  useEffect(() => {
    getEventDesc();
  }, []);

  const getEventDesc = () => {
    getAuditEventList().then((data) => {
      setEventDesc(data.dat || {})
    });
  };

  const logColumn: ColumnsType<AuditLog> = [
    {
      title: t('username'),
      dataIndex: 'username',
      render: (_, log) => log.username || '-',
    },
    {
      title: t('event'),
      dataIndex: 'event',
      render: (_, log) => eventDesc[log.event] || '-',
    },
    {
      title: t('comment'),
      dataIndex: 'comment',
      render: (_, log) => log.comment || '-',
    },
    {
      title: t('create_at'),
      dataIndex: 'create_at',
      render: (_, log) => {
        return moment.unix(log.create_at).format(dateFormat);
      },
      sorter: (a, b) => a.create_at - b.create_at,
    },
  ];
  const getTableData = ({ current, pageSize }): Promise<any> => {
    const params = {
      p: current,
      limit: pageSize,
      start_time: start_time.unix(),
      end_time: end_time.unix(),
    };

    return getAuditLogList({
      ...params,
      username,
      event
    }).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };

  const { tableProps, search } = useAntdTable(getTableData, {
    defaultPageSize: pagination.pageSize,
    refreshDeps: [username, event],
  });

  return (
    <PageLayout title={t('title')}>
      <div className="audit-logs">
        <div className="search-params">
          <Space align='center' size='middle'>
            <InputGroupWithFormItem label={t('username')}>
              <Form.Item name='username' noStyle>
                <Select
                  placeholder="请选择用户名"
                  showSearch
                  allowClear
                  style={{ minWidth: 120 }}
                  onChange={(val) => {
                    setUsername(val)
                  }}
                >
                  {userList.map((item) => (
                    <Select.Option key={item.username} value={item.username}>
                      {item.username}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </InputGroupWithFormItem>
            <InputGroupWithFormItem label={t('event')}>
              <Form.Item name='event' noStyle>
                <Select
                  placeholder="请选择事件名称"
                  allowClear
                  style={{ minWidth: 120 }}
                  onChange={(val) => {
                    setEvent(val);
                  }}
                >
                  { Object.keys(eventDesc).map((event) => (
                    <Select.Option key={event} value={event}>
                      {eventDesc[event]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </InputGroupWithFormItem>
            <RangePicker
              ranges={{
                '今天': [moment().startOf('day'), moment()],
                '昨天': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                '过去一周': [moment().subtract(1, 'weeks').startOf('day'), moment()],
              }}
              showTime={true}
              format={dateFormat}
              defaultValue={[start_time, end_time]}
              onChange={(dates: [moment.Moment, moment.Moment]) => {
                setStartTime(dates[0]);
                setEndTime(dates[1])
              }}
            >
            </RangePicker>
            <Button type='primary' onClick={search.submit}>
              {t('btn.search')}
            </Button>
          </Space>
        </div>
        <div className="list">
          <Table
            size='small'
            rowKey='id'
            columns={logColumn}
            {...tableProps}
            pagination={{
              ...tableProps.pagination,
              ...pagination,
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
}