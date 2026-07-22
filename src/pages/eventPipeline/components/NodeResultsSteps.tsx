import React from 'react';
import { Steps, Tag, Space } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';

import { NS } from '../constants';
import formatMsToHuman from '../utils/formatMsToHuman';

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

  const statusMap = {
    running: <Tag color='purple'>{t('executions.status.running')}</Tag>,
    success: <Tag color='green'>{t('executions.status.success')}</Tag>,
    failed: <Tag color='red'>{t('executions.status.failed')}</Tag>,
  };
  const iconMap = {
    running: <LoadingOutlined />,
    success: <CheckCircleOutlined className='text-success' />,
    failed: <CloseCircleOutlined className='text-error' />,
  };

  return (
    <Steps direction='vertical' size='small' current={_.size(data)}>
      {_.map(data, (node) => {
        return (
          <Steps.Step
            status='finish'
            key={node.node_id}
            icon={iconMap[node.status]}
            title={
              <Space>
                <strong>{node.node_name}</strong>
                <div className='children:mr-0'>
                  <Tag>{node.node_type}</Tag>
                </div>
                {node.status ? statusMap[node.status] : '-'}
                {node.duration_ms ? <span>{formatMsToHuman(node.duration_ms)}</span> : null}
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
                      <pre className='whitespace-pre-wrap'>{node.message}</pre>
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
