import React from 'react';
import { Steps, Tag, Space } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, StopOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';

import { NS } from '../constants';
import formatMsToHuman from '../utils/formatMsToHuman';
import humanizeProcessorMessage from '../utils/humanizeProcessorMessage';

export interface NodeResult {
  node_id: string;
  node_name: string;
  node_type: string;
  status: string;
  message?: string;
  error?: string;
  started_at?: number;
  finished_at?: number;
  duration_ms?: number;
}

interface Props {
  data?: NodeResult[];
}

/** 逐节点执行结果时间线：执行记录详情与工作流试跑结果共用 */
export default function NodeResultsSteps({ data }: Props) {
  const { t } = useTranslation(NS);

  // 后端节点状态除 running/success/failed 外，还有 terminated（事件被丢弃/抑制，执行引擎
  // engine.go 里 drop 走的正是这条）、skipped、streaming；漏掉它们会让「把事件丢掉的那一步」
  // 看起来和正常完成的步骤毫无区别，而这恰好是试跑最需要看清的信息
  const statusMap = {
    running: <Tag color='purple'>{t('executions.status.running')}</Tag>,
    streaming: <Tag color='blue'>{t('executions.status.streaming')}</Tag>,
    success: <Tag color='green'>{t('executions.status.success')}</Tag>,
    failed: <Tag color='red'>{t('executions.status.failed')}</Tag>,
    terminated: <Tag color='orange'>{t('executions.status.terminated')}</Tag>,
    skipped: <Tag>{t('executions.status.skipped')}</Tag>,
  };
  const iconMap = {
    running: <LoadingOutlined />,
    streaming: <LoadingOutlined />,
    success: <CheckCircleOutlined className='text-success' />,
    failed: <CloseCircleOutlined className='text-error' />,
    terminated: <StopOutlined className='text-warning' />,
    skipped: <MinusCircleOutlined className='text-soft' />,
  };
  // Step 的 status 决定连接线与文字色，不能统一写死 finish（否则失败节点也呈现为已完成）
  const stepStatusMap: Record<string, 'finish' | 'error' | 'process' | 'wait'> = {
    failed: 'error',
    running: 'process',
    streaming: 'process',
    skipped: 'wait',
  };

  return (
    <Steps direction='vertical' size='small' current={_.size(data)}>
      {_.map(data, (node) => {
        return (
          <Steps.Step
            status={stepStatusMap[node.status] ?? 'finish'}
            key={node.node_id}
            icon={iconMap[node.status]}
            title={
              <Space>
                <strong>{node.node_name}</strong>
                <div className='children:mr-0'>
                  <Tag>{node.node_type}</Tag>
                </div>
                {node.status ? statusMap[node.status] : '-'}
                {/* 0ms 的节点同样要显示耗时，否则一排步骤里只有它没有时间，看起来像没跑 */}
                {node.duration_ms == null ? null : <span>{formatMsToHuman(node.duration_ms)}</span>}
              </Space>
            }
            description={
              <div className='mt-4'>
                <div>
                  {node.error && (
                    <div className='mb-2 text-error '>
                      <pre className='whitespace-pre-wrap'>{node.error}</pre>
                    </div>
                  )}
                  {node.message && (
                    <div className='mb-2 text-main'>
                      {/* 后端的 "drop event failed | no-change" 之类原文要先翻成人话，
                          否则「条件没命中」这个最常见的正常结果会被读成「出错了」 */}
                      <pre className='whitespace-pre-wrap'>{humanizeProcessorMessage(node.message, t)}</pre>
                    </div>
                  )}
                </div>
                {node.started_at ? (
                  <div>
                    <Space className='text-soft'>
                      {moment.unix(node.started_at).format('HH:mm:ss')}
                      <span>-</span>
                      <span>{node.finished_at ? moment.unix(node.finished_at).format('HH:mm:ss') : 'N/A'}</span>
                    </Space>
                  </div>
                ) : null}
              </div>
            }
          />
        );
      })}
    </Steps>
  );
}
