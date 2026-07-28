import React, { useState } from 'react';
import { Modal, Button, Spin, Form, Alert, Divider, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import DetailNG from '@/pages/event/DetailNG';

import { NS } from '../../../constants';
import { eventProcessorTryrun, eventPipelineTryrun } from '../../../services';
import NodeResultsSteps, { NodeResult } from '../../../components/NodeResultsSteps';
import EventsTable from './EventsTable';

interface Props {
  type: 'processor' | 'pipeline';
  config: any;
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
  namePath?: (string | number)[];
}

// 后端 tryrun 返回：{ event, result, status, node_results }
interface TryrunResult {
  event?: any;
  result?: string;
  status?: string;
  node_results?: NodeResult[];
}

// header / custom_params 在表单里是数组，试跑接口要对象形式
const toPairsObject = (arr?: { key: string; value: string }[]) => (arr ? _.fromPairs(_.map(arr, (item) => [item.key, item.value])) : undefined);

const normalizeProcessorConfig = (processor: any) => ({
  ...processor,
  config: {
    ...processor?.config,
    header: toPairsObject(processor?.config?.header),
    custom_params: toPairsObject(processor?.config?.custom_params),
  },
});

export default function TestModal(props: Props) {
  const { t } = useTranslation(NS);
  const { type, config, size, disabled, namePath } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [eventID, setEventID] = useState<number>();
  const [view, setView] = useState<'settings' | 'result'>('settings');
  const [result, setResult] = useState<TryrunResult>();
  const [loading, setLoading] = useState<boolean>(false);
  const form = Form.useFormInstance();

  // 回到选择事件视图：EventsTable 会重新挂载并丢掉选中行，此时必须一并清掉 eventID，
  // 否则界面上没有任何勾选、试跑按钮却仍可点，点下去是静默拿上一次的事件再跑一遍
  const backToSettings = () => {
    setView('settings');
    setResult(undefined);
    setEventID(undefined);
  };

  const reset = () => {
    setVisible(false);
    backToSettings();
  };

  const runTest = () => {
    if (!eventID) return;
    setLoading(true);
    const request =
      type === 'processor'
        ? eventProcessorTryrun({ event_id: eventID, processor_config: normalizeProcessorConfig(config) })
        : eventPipelineTryrun({
            event_id: eventID,
            pipeline_config: {
              ...config,
              processors: _.map(config.processors, normalizeProcessorConfig),
            },
          });

    request
      .then((res) => {
        if (res.err) {
          message.error(res.err);
          return;
        }
        setResult(res.dat ?? {});
        setView('result');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const failed = result?.status === 'failed';
  // 执行成功但没有 event，才说明事件在某个环节被丢弃 / 抑制。
  // 执行失败时后端同样不会返回 event，不排掉 failed 会把「跑挂了」说成「被你的丢弃条件命中」
  const dropped = view === 'result' && !!result && !result.event && !failed;

  return (
    <>
      <Button
        disabled={disabled}
        size={size}
        onClick={() => {
          if (namePath) {
            // 在 4.21.0 不支持按 namePath 校验，等于直接打开弹窗
            setVisible(true);
          } else {
            form.validateFields().then(() => {
              setVisible(true);
            });
          }
        }}
      >
        {t('common:btn.test')}
      </Button>
      <Modal title={t(`test_modal.title.${view}`)} visible={visible} footer={null} onCancel={reset} width='80%' destroyOnClose>
        <Spin spinning={loading}>
          {view === 'settings' && (
            <>
              {visible && <EventsTable rowSelectionType='radio' selectedEventIds={eventID ? [eventID] : []} onChange={(ids) => setEventID(ids[0])} />}
              <Button type='primary' disabled={!eventID} onClick={runTest}>
                {t('common:btn.test')}
              </Button>
            </>
          )}
          {view === 'result' && result && (
            <>
              <div className='mb-3 flex items-center justify-between'>
                <Button size='small' icon={<LeftOutlined />} onClick={backToSettings}>
                  {t('test_modal.back_btn')}
                </Button>
              </div>
              {dropped ? (
                <Alert className='mb-4' type='warning' showIcon message={result.result || t('test_modal.dropped')} />
              ) : (
                <Alert
                  className='mb-4'
                  type={failed ? 'error' : 'success'}
                  showIcon
                  message={failed ? t('test_modal.result_failed') : t('test_modal.result_success')}
                  // 处理器级试跑只返回 {event, result}，没有 node_results 兜住这条 message，
                  // 不在这里展示的话，event_drop 条件不命中时用户只看到「执行成功」，看不到 "drop event failed"
                  description={result.result || undefined}
                />
              )}
              {!_.isEmpty(result.node_results) && (
                <div className='mb-4'>
                  <div className='font-bold mb-2'>{t('test_modal.steps_title')}</div>
                  <NodeResultsSteps data={result.node_results} />
                </div>
              )}
              {result.event && (
                <>
                  <Divider className='my-3' orientation='left'>
                    {t('test_modal.event_preview_title')}
                  </Divider>
                  <DetailNG data={result.event} />
                </>
              )}
              <Alert className='mt-4' type='info' showIcon message={t('test_modal.fidelity_note')} />
            </>
          )}
        </Spin>
      </Modal>
    </>
  );
}
