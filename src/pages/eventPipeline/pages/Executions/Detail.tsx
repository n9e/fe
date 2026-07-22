import React from 'react';
import { Spin, Descriptions, Tag, Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import moment from 'moment';

import AutoRefresh from '@/components/TimeRangePicker/AutoRefresh';

import { NS } from '../../constants';
import { getExecutionById } from '../../services';
import formatMsToHuman from '../../utils/formatMsToHuman';
import NodeResultsSteps from '../../components/NodeResultsSteps';

interface Props {
  id: string;
}

const format = 'YYYY-MM-DD HH:mm:ss';

export default function ItemDetaildrawer(props: Props) {
  const { t } = useTranslation(NS);
  const { id } = props;

  const { data, loading, run } = useRequest(
    () => {
      return getExecutionById(id);
    },
    {
      refreshDeps: [id],
      ready: !!id,
    },
  );

  const statusMap = {
    running: <Tag color='purple'>{t('executions.status.running')}</Tag>,
    success: <Tag color='green'>{t('executions.status.success')}</Tag>,
    failed: <Tag color='red'>{t('executions.status.failed')}</Tag>,
  };

  return (
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
        {data?.error_node && <Descriptions.Item label={t('executions.error_node')}>{data?.error_node}</Descriptions.Item>}
        {data?.error_message && (
          <Descriptions.Item label={t('executions.error_message')} span={2}>
            <div className='text-error'>{data?.error_message}</div>
          </Descriptions.Item>
        )}
        {data?.inputs_snapshot && (
          <Descriptions.Item label={t('executions.inputs_snapshot')} span={2}>
            <pre className='whitespace-pre-wrap mb-0'>{data.inputs_snapshot}</pre>
          </Descriptions.Item>
        )}
      </Descriptions>
      <Card title={t('executions.node_results_parsed_title')}>
        <NodeResultsSteps data={data?.node_results_parsed} />
      </Card>
    </Spin>
  );
}
