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
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Divider, Tag, Row, Col, Button, Card, Modal, message } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import classnames from 'classnames';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import request from '@/utils/request';
import api from '@/utils/api';
import AutoRefresh from '@/components/TimeRangePicker/AutoRefresh';
import EnhancedTable from '@/components/EnhancedTable';

import FieldCopy from '../FieldCopy';
import OutputDrawer from '../OutputDrawer';
import MetaDrawer from '../MetaDrawer';

interface HostItem {
  host: string;
  status: string;
}

interface Props {
  taskId: string;
  busiId: number;
  hideCloneTask?: boolean;
  metaAlias?: string;
  initialOutputMode?: { outputType: 'stdout' | 'stderr'; host?: string };
  onOutputOpen?: (info: { outputType: 'stdout' | 'stderr'; host?: string }) => void;
  onOutputClose?: (info: { outputType: 'stdout' | 'stderr'; host?: string }) => void;
}

const taskResultCls = 'job-task-result';

const FAILED_STATUSES = ['failed', 'killfailed', 'timeout'];

// 一键重试的单批并发数，批与批之间串行
const RETRY_BATCH_SIZE = 10;

// 主机状态标签色：成功 / 中性（取消、忽略）/ 失败，供状态列与概况条共用
function statusColor(status: string): string {
  if (status === 'success') return '#87d068';
  if (status === 'cancelled' || status === 'ignored') return '#ec971f';
  if (_.includes(FAILED_STATUSES, status)) return '#f50';
  return '';
}

const ResultContent: React.FC<Props> = ({ taskId, busiId, hideCloneTask, metaAlias, initialOutputMode, onOutputOpen, onOutputClose }) => {
  const { t } = useTranslation('common');
  const { t: tsh } = useTranslation('alertSelfHealing');
  const [activeStatus, setActiveStatus] = useState<string[]>();
  const [data, setData] = useState({} as any);
  const [hosts, setHosts] = useState<HostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const AutoRefreshRef = React.useRef<any>(null);
  const [outputDrawer, setOutputDrawer] = useState<{
    visible: boolean;
    host?: string;
    outputType: 'stdout' | 'stderr';
  }>({ visible: false, outputType: 'stdout' });
  const [metaDrawerVisible, setMetaDrawerVisible] = useState(false);

  const getTableData = () => {
    setLoading(true);
    return request(`${api.task(busiId)}/${taskId}`)
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
  }, [taskId, busiId]);

  useEffect(() => {
    if (initialOutputMode) {
      setOutputDrawer({ visible: true, host: initialOutputMode.host, outputType: initialOutputMode.outputType });
    }
  }, []);

  useEffect(() => {
    if (data.done && AutoRefreshRef.current?.closeRefresh) {
      AutoRefreshRef.current?.closeRefresh();
    }
  }, [data.done]);

  let filteredHosts = _.cloneDeep(hosts);
  if (activeStatus) {
    filteredHosts = _.filter(filteredHosts, (item: any) => {
      return _.includes(activeStatus, item.status);
    });
  }

  const handleHostAction = (host: string, action: string) => {
    request(`${api.task(busiId)}/${taskId}/host/${host}/action`, {
      method: 'PUT',
      body: JSON.stringify({
        action,
      }),
    }).then(() => {
      getTableData();
    });
  };

  // 单机强杀前二次确认，其余动作直接执行
  const confirmHostAction = (host: string, action: string) => {
    if (action === 'kill') {
      Modal.confirm({
        title: t('task.confirm.host.kill'),
        okButtonProps: { danger: true },
        okText: t('task.action.kill'),
        cancelText: t('common:btn.cancel'),
        onOk: () => handleHostAction(host, action),
      });
      return;
    }
    handleHostAction(host, action);
  };

  const handleTaskAction = (action: string) => {
    request(`${api.task(busiId)}/${taskId}/action`, {
      method: 'PUT',
      body: JSON.stringify({
        action,
      }),
    }).then(() => {
      getTableData();
    });
  };

  // 取消执行 / 强制终止会影响正在运行的任务，执行前二次确认
  const confirmTaskAction = (action: string) => {
    if (action === 'cancel' || action === 'kill') {
      Modal.confirm({
        title: action === 'kill' ? t('task.confirm.kill') : t('task.confirm.cancel'),
        okButtonProps: { danger: true },
        okText: action === 'kill' ? t('task.action.kill') : t('task.action.cancel'),
        cancelText: t('common:btn.cancel'),
        onOk: () => handleTaskAction(action),
      });
      return;
    }
    handleTaskAction(action);
  };

  const groupedHosts = _.groupBy(hosts, 'status');
  const failedHosts = _.filter(hosts, (h) => _.includes(FAILED_STATUSES, h.status));

  // 一键重试所有失败 / 超时的主机，避免逐台点 redo
  const retryFailedHosts = () => {
    if (_.isEmpty(failedHosts)) {
      message.info(tsh('result.no_failed'));
      return;
    }
    Modal.confirm({
      title: tsh('result.retry_failed_confirm', { count: failedHosts.length }),
      onOk: async () => {
        let failedCount = 0;
        // 主机列表是全量返回的（可达上千台），分批串行发起，避免一次点击打爆浏览器连接池；
        // 批内用 allSettled：单台 redo 失败不应吞掉其余已成功的重试
        for (const chunk of _.chunk(failedHosts, RETRY_BATCH_SIZE)) {
          const results = await Promise.allSettled(
            _.map(chunk, (h) =>
              request(`${api.task(busiId)}/${taskId}/host/${h.host}/action`, {
                method: 'PUT',
                body: JSON.stringify({ action: 'redo' }),
              }),
            ),
          );
          failedCount += _.filter(results, (r) => r.status === 'rejected').length;
        }
        if (failedCount > 0) {
          message.error(tsh('result.retry_partial_failed', { count: failedCount }));
        }
        getTableData();
      },
    });
  };

  // 点击概况条上的状态徽标，切换表格按该状态过滤（再次点击取消）
  const toggleStatusFilter = (status: string) => {
    setActiveStatus((prev) => (prev?.length === 1 && prev[0] === status ? undefined : [status]));
  };

  const renderHostStatusFilter = () => {
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
      filteredValue: activeStatus ?? null,
      onFilter: (value: string, record) => {
        return record.status === value;
      },
      render: (text) => {
        const color = statusColor(text);
        return color ? <Tag color={color}>{text}</Tag> : <Tag>{text}</Tag>;
      },
    },
    {
      title: t('task.output'),
      render: (_text, record) => {
        return (
          <span>
            <a
              onClick={() => {
                setOutputDrawer({ visible: true, host: record.host, outputType: 'stdout' });
                onOutputOpen?.({ outputType: 'stdout', host: record.host });
              }}
            >
              stdout
            </a>
            <Divider type='vertical' />
            <a
              onClick={() => {
                setOutputDrawer({ visible: true, host: record.host, outputType: 'stderr' });
                onOutputOpen?.({ outputType: 'stderr', host: record.host });
              }}
            >
              stderr
            </a>
          </span>
        );
      },
    },
  ];

  return (
    <>
      <div className={`${taskResultCls} p-4`}>
        <Card
          title={data.title}
          extra={
            <AutoRefresh
              ref={AutoRefreshRef}
              disabled={data.done}
              // 任务未完成时默认 10s 自动刷新，完成后置 0 停止（另有 data.done effect 兜底关闭）
              intervalSeconds={data.done ? 0 : 10}
              onRefresh={() => {
                getTableData();
              }}
            />
          }
        >
          {!_.isEmpty(hosts) && (
            <div className='mb-4 flex flex-wrap items-center gap-2'>
              <span className='text-soft'>{tsh('result.status_bar')}：</span>
              {_.map(groupedHosts, (list, status) => {
                const color = statusColor(status);
                const active = activeStatus?.length === 1 && activeStatus[0] === status;
                return (
                  <Tag
                    key={status}
                    color={active ? color || undefined : undefined}
                    className={classnames('cursor-pointer m-0', active && 'ring-2 ring-offset-1')}
                    style={!active && color ? { borderColor: color, color } : undefined}
                    onClick={() => toggleStatusFilter(status)}
                  >
                    {status} {list.length}
                  </Tag>
                );
              })}
              {!data.done && failedHosts.length > 0 && (
                <Button size='small' onClick={retryFailedHosts}>
                  {tsh('result.retry_failed')}
                </Button>
              )}
            </div>
          )}
          <Row style={{ marginBottom: 20 }}>
            <Col span={18}>
              <div>
                <a
                  onClick={() => {
                    setOutputDrawer({ visible: true, outputType: 'stdout' });
                    onOutputOpen?.({ outputType: 'stdout' });
                  }}
                >
                  stdouts
                </a>
                <Divider type='vertical' />
                <a
                  onClick={() => {
                    setOutputDrawer({ visible: true, outputType: 'stderr' });
                    onOutputOpen?.({ outputType: 'stderr' });
                  }}
                >
                  stderrs
                </a>
                <Divider type='vertical' />
                <a onClick={() => setMetaDrawerVisible(true)}>{metaAlias ?? t('task.meta')}</a>
                {!hideCloneTask && <Divider type='vertical' />}
                {!hideCloneTask && <Link to={{ pathname: '/job-tasks/add', search: `task=${taskId}&gid=${busiId}` }}>{t('task.clone')}</Link>}
              </div>
            </Col>
            <Col span={6} className='textAlignRight'>
              {!data.done ? (
                <span>
                  {data.action === 'start' ? (
                    <Button type='primary' onClick={() => handleTaskAction('pause')}>
                      {t('task.action.pause')}
                    </Button>
                  ) : (
                    <Button type='primary' onClick={() => handleTaskAction('start')}>
                      {t('task.action.start')}
                    </Button>
                  )}
                  <Button className='ml-2' onClick={() => confirmTaskAction('cancel')}>
                    {t('task.action.cancel')}
                  </Button>
                  <Button className='ml-2' danger onClick={() => confirmTaskAction('kill')}>
                    {t('task.action.kill')}
                  </Button>
                </span>
              ) : null}
            </Col>
          </Row>
          <EnhancedTable
            size='small'
            rowKey='host'
            columns={columns as any}
            dataSource={hosts}
            loading={loading}
            {...(!data.done
              ? {
                  rowActions: (record) => ({
                    inline: [
                      { key: 'ignore', icon: 'default', text: t('task.action.ignore'), onClick: () => handleHostAction(record.host, 'ignore') },
                      { key: 'redo', icon: 'run', text: t('task.action.redo'), onClick: () => handleHostAction(record.host, 'redo') },
                      { key: 'kill', icon: 'delete', text: t('task.action.kill'), danger: true, onClick: () => confirmHostAction(record.host, 'kill') },
                    ],
                  }),
                  actionColumn: { title: t('table.operations'), width: 110 },
                }
              : {})}
            pagination={
              {
                showSizeChanger: true,
                pageSizeOptions: ['10', '50', '100', '500', '1000'],
                showTotal: (total) => {
                  return t('common:table.total', { total });
                },
              } as any
            }
            onChange={(pagination, filters, sorter, extra) => {
              setActiveStatus(filters.status as string[]);
            }}
          />
        </Card>
      </div>
      <OutputDrawer
        visible={outputDrawer.visible}
        onClose={() => {
          setOutputDrawer({ visible: false, outputType: 'stdout' });
        }}
        busiId={busiId}
        taskId={taskId}
        host={outputDrawer.host}
        outputType={outputDrawer.outputType}
        title={`${data.title} - ${outputDrawer.host ? `${outputDrawer.host} - ` : ''}${outputDrawer.outputType}`}
        onOutputClose={onOutputClose}
      />
      <MetaDrawer visible={metaDrawerVisible} onClose={() => setMetaDrawerVisible(false)} data={data} hosts={hosts} taskId={taskId} busiId={busiId} hideCloneTask={hideCloneTask} />
    </>
  );
};

export default ResultContent;
