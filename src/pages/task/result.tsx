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
import React, { useContext, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Table, Divider, Tag, Row, Col, Button, Card } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import FieldCopy from './FieldCopy';
import request from '@/utils/request';
import api from '@/utils/api';
import { CommonStateContext } from '@/App';
import AutoRefresh from '@/components/TimeRangePicker/AutoRefresh';

interface HostItem {
  host: string;
  status: string;
}

const index = (props: any) => {
  const taskResultCls = 'job-task-result';
  const history = useHistory();
  const { businessGroup } = useContext(CommonStateContext);
  const curBusiId = businessGroup.id!;
  const { params } = props.match;
  const taskId = params.id;
  const { t, i18n } = useTranslation('common');
  const [activeStatus, setActiveStatus] = useState<string[]>();
  const [data, setData] = useState({} as any);
  const [hosts, setHosts] = useState<HostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const getTableData = () => {
    setLoading(true);
    return request(`${api.task(curBusiId)}/${params.id}`)
      .then((data) => {
        setData({
          ...data.dat.meta,
          action: data.dat.action,
        });
        setHosts(data.dat.hosts);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    getTableData();
  }, []);
  let filteredHosts = _.cloneDeep(hosts);
  if (activeStatus) {
    filteredHosts = _.filter(filteredHosts, (item: any) => {
      return _.includes(activeStatus, item.status);
    });
  }

  const handleHostAction = (host: string, action: string) => {
    request(`${api.task(curBusiId)}/${taskId}/host/${host}/action`, {
      method: 'PUT',
      body: JSON.stringify({
        action,
      }),
    }).then(() => {
      getTableData();
    });
  };

  const handleTaskAction = (action: string) => {
    request(`${api.task(curBusiId)}/${taskId}/action`, {
      method: 'PUT',
      body: JSON.stringify({
        action,
      }),
    }).then(() => {
      getTableData();
    });
  };

  const renderHostStatusFilter = () => {
    const groupedHosts = _.groupBy(hosts, 'status');
    return _.map(groupedHosts, (chosts, status) => {
      return {
        text: `${status} (${chosts.length})`,
        value: status,
      };
    });
  };

  const columns: ColumnProps<HostItem>[] = [
    {
      title: <FieldCopy dataIndex='host' hasSelected={false} data={filteredHosts} />,
      dataIndex: 'host',
    },
    {
      title: t('task.status'),
      dataIndex: 'status',
      filters: renderHostStatusFilter(),
      onFilter: (value: string, record) => {
        return record.status === value;
      },
      render: (text) => {
        if (text === 'success') {
          return <Tag color='#87d068'>{text}</Tag>;
        } else if (text === 'cancelled' || text === 'ignored') {
          return <Tag color='#ec971f'>{text}</Tag>;
        } else if (text === 'failed' || text === 'killfailed' || text === 'timeout') {
          return <Tag color='#f50'>{text}</Tag>;
        }
        return <Tag>{text}</Tag>;
      },
    },
    {
      title: t('task.output'),
      render: (_text, record) => {
        return (
          <span>
            <Link to={`/job-task/${curBusiId}/output/${params.id}/${record.host}/stdout`} target='_blank'>
              stdout
            </Link>
            <Divider type='vertical' />
            <a href={`/job-task/${curBusiId}/output/${params.id}/${record.host}/stderr`} target='_blank'>
              stderr
            </a>
          </span>
        );
      },
    },
  ];
  if (!data.done) {
    columns.push({
      title: t('table.operations'),
      render: (_text, record) => {
        return (
          <span>
            <a onClick={() => handleHostAction(record.host, 'ignore')}>ignore</a>
            <Divider type='vertical' />
            <a onClick={() => handleHostAction(record.host, 'redo')}>redo</a>
            <Divider type='vertical' />
            <a onClick={() => handleHostAction(record.host, 'kill')}>kill</a>
          </span>
        );
      },
    });
  }

  return (
    <PageLayout
      title={
        <>
          <RollbackOutlined className='back' onClick={() => history.push('/job-tasks')} />
          {t('task')}
        </>
      }
    >
      <div style={{ padding: 10 }} className={taskResultCls}>
        <Card
          title={data.title}
          extra={
            <AutoRefresh
              onRefresh={() => {
                getTableData();
              }}
            />
          }
        >
          <Row style={{ marginBottom: 20 }}>
            <Col span={18}>
              <div>
                <a href={`/job-task/${curBusiId}/output/${taskId}/stdout`} target='_blank'>
                  stdouts
                </a>
                <Divider type='vertical' />
                <a href={`/job-task/${curBusiId}/output/${taskId}/stderr`} target='_blank'>
                  stderrs
                </a>
                <Divider type='vertical' />
                <Link to={{ pathname: `/job-tasks/${taskId}/detail` }}>{t('task.meta')}</Link>
                <Divider type='vertical' />
                <Link to={{ pathname: '/job-tasks/add', search: `task=${taskId}` }}>{t('task.clone')}</Link>
              </div>
            </Col>
            <Col span={6} className='textAlignRight'>
              {!data.done ? (
                <span>
                  {data.action === 'start' ? (
                    <Button className='success-btn' onClick={() => handleTaskAction('pause')}>
                      Pause
                    </Button>
                  ) : (
                    <Button className='success-btn' onClick={() => handleTaskAction('start')}>
                      Start
                    </Button>
                  )}
                  <Button className='ml10 warning-btn' onClick={() => handleTaskAction('cancel')}>
                    Cancel
                  </Button>
                  <Button className='ml10 danger-btn' onClick={() => handleTaskAction('kill')}>
                    Kill
                  </Button>
                </span>
              ) : null}
            </Col>
          </Row>
          <Table
            size='small'
            rowKey='host'
            columns={columns as any}
            dataSource={hosts}
            loading={loading}
            pagination={
              {
                showSizeChanger: true,
                pageSizeOptions: ['10', '50', '100', '500', '1000'],
                showTotal: (total) => {
                  return i18n.language == 'en' ? `Total ${total} items` : `共 ${total} 条`;
                },
              } as any
            }
            onChange={(pagination, filters, sorter, extra) => {
              setActiveStatus(filters.status as string[]);
            }}
          />
        </Card>
      </div>
    </PageLayout>
  );
};

export default index;
