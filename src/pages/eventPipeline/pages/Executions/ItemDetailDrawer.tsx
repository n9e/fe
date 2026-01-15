import React from 'react';
import { Drawer, Spin, Descriptions, Tag, Card, Steps, Space } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import moment from 'moment';
import _ from 'lodash';

import AutoRefresh from '@/components/TimeRangePicker/AutoRefresh';

import { NS } from '../../constants';
import { getExecutionById } from '../../services';
import formatMsToHuman from '../../utils/formatMsToHuman';

interface Props {
  id: number | null;
  visible: boolean;
  onClose: () => void;
}

const format = 'YYYY-MM-DD HH:mm:ss';

export default function ItemDetaildrawer(props: Props) {
  const { t } = useTranslation(NS);
  const { id, visible, onClose } = props;

  const { data, loading, run } = useRequest(
    () => {
      if (id && visible) {
        return getExecutionById(id);
      }
      return Promise.resolve(null);
    },
    {
      refreshDeps: [visible, id],
      ready: visible,
    },
  );

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
    <Drawer width='80%' title={<Space>{t('executions.detail_title')}</Space>} placement='right' onClose={onClose} visible={visible}>
      <Spin spinning={loading}>
        <div className='mb-4'>
          <AutoRefresh
            onRefresh={() => {
              run();
            }}
          />
        </div>
        <Descriptions className='mb-4' title={t('executions.detail_basic_info')} bordered column={2}>
          <Descriptions.Item
            labelStyle={{
              whiteSpace: 'nowrap',
            }}
            label={t('executions.pipeline_name')}
          >
            {data?.pipeline_name}
          </Descriptions.Item>
          <Descriptions.Item label={t('executions.id')}>{data?.id}</Descriptions.Item>
          <Descriptions.Item label={t('executions.mode')}>
            <Tag color='green'>{t(`trigger_mode.${data?.mode}`)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('executions.status.label')}>{data?.status ? statusMap[data?.status] : '-'}</Descriptions.Item>
          <Descriptions.Item label={t('executions.created_at')}>{data?.created_at ? moment.unix(data?.created_at).format(format) : '-'}</Descriptions.Item>
          <Descriptions.Item label={t('executions.finished_at')}>{data?.finished_at ? moment.unix(data?.finished_at).format(format) : '-'}</Descriptions.Item>
          <Descriptions.Item label={t('executions.duration_ms')}>{data?.duration_ms ? formatMsToHuman(data?.duration_ms) : '-'}</Descriptions.Item>
          <Descriptions.Item label={t('executions.trigger_by')}>{data?.trigger_by}</Descriptions.Item>
          {data?.error_message && (
            <Descriptions.Item label={t('executions.error_message')} span={2}>
              <div className='text-error'>{data?.error_message}</div>
            </Descriptions.Item>
          )}
        </Descriptions>
        <Card title={t('executions.node_results_parsed_title')}>
          <Steps direction='vertical' size='small' current={1}>
            {_.map(data?.node_results_parsed, (node) => {
              return (
                <Steps.Step
                  key={node.node_id}
                  icon={iconMap[node.status]}
                  title={
                    <Space>
                      <strong>{node.node_name}</strong>
                      <div className='children:mr-0'>
                        <Tag>{node.node_type}</Tag>
                      </div>
                      {node.status ? statusMap[node.status] : '-'}
                      {node.duration_ms ? <span>{formatMsToHuman(node.duration_ms)}</span> : '-'}
                    </Space>
                  }
                  description={
                    <div className='mt-4'>
                      <div>
                        {node.error && <div className='mb-2 text-error '>{node.error}</div>}
                        {node.message && <div className='mb-2 text-main'>{node.message}</div>}
                      </div>
                      <div>
                        <Space className='text-soft'>
                          {moment.unix(node.started_at).format('HH:mm:ss')}
                          <span>-</span>
                          <span>{node.finished_at ? moment.unix(node.finished_at).format('HH:mm:ss') : 'N/A'}</span>
                        </Space>
                      </div>
                    </div>
                  }
                />
              );
            })}
          </Steps>
        </Card>
      </Spin>
    </Drawer>
  );
}
