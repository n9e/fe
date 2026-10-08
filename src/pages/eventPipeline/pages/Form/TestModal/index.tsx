import React, { useState } from 'react';
import { Modal, Button, Spin, Alert, Divider, Segmented, Space, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import DetailNG from '@/pages/event/DetailNG';

import { NS, MOCK_EVENT_DEFAULT_SEVERITY } from '../../../constants';
import { eventProcessorTryrun, eventPipelineTryrun, TryrunEventSource } from '../../../services';
import NodeResultsSteps, { NodeResult } from '../../../components/NodeResultsSteps';
import humanizeProcessorMessage from '../../../utils/humanizeProcessorMessage';
import EventsTable from './EventsTable';
import MockEventPanel, { MockEventState } from './MockEventPanel';

interface Props {
  type: 'processor' | 'pipeline';
  config: any;
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
  /**
   * 打开弹窗前的校验。由 Form 提供，reject 表示本次不该打开——
   * 校验失败的反馈（展开出错分区、滚动定位）已经在里面做完了，这里不必再处理。
   */
  onBeforeOpen?: () => Promise<unknown>;
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

type TestMode = 'history' | 'mock';

const DEFAULT_MOCK_EVENT: MockEventState = { severity: MOCK_EVENT_DEFAULT_SEVERITY, isRecovered: false };

export default function TestModal(props: Props) {
  const { t } = useTranslation(NS);
  const { type, config, size, disabled, onBeforeOpen } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [eventID, setEventID] = useState<number>();
  const [mode, setMode] = useState<TestMode>('history');
  const [mockEvent, setMockEvent] = useState<MockEventState>(DEFAULT_MOCK_EVENT);
  // 历史事件命中数：为 0 时提示可以改用样例事件，避免新环境卡在「暂无数据 + 按钮置灰」
  const [historyTotal, setHistoryTotal] = useState<number>();
  const [view, setView] = useState<'settings' | 'result'>('settings');
  const [result, setResult] = useState<TryrunResult>();
  const [loading, setLoading] = useState<boolean>(false);

  // 回到选择事件视图：EventsTable 会重新挂载并丢掉选中行，此时必须一并清掉 eventID，
  // 否则界面上没有任何勾选、试跑按钮却仍可点，点下去是静默拿上一次的事件再跑一遍。
  // mode 与样例事件参数刻意保留，用户多半是想微调级别再跑一次。
  const backToSettings = () => {
    setView('settings');
    setResult(undefined);
    setEventID(undefined);
  };

  // 关闭弹窗要把试跑相关状态全部还原：Modal 虽有 destroyOnClose，但被销毁的是弹窗内容，
  // TestModal 自身不会卸载，残留的 mode / 样例参数会在下次打开时回显
  const reset = () => {
    setVisible(false);
    setMode('history');
    setMockEvent(DEFAULT_MOCK_EVENT);
    setHistoryTotal(undefined);
    backToSettings();
  };

  // 试跑按钮：历史事件模式必须先选中一条；样例事件由后端合成，随时可跑
  const testDisabled = mode === 'history' && !eventID;

  const runTest = () => {
    if (testDisabled) return;
    setLoading(true);
    const eventSource: TryrunEventSource =
      mode === 'mock'
        ? { use_mock_event: true, mock_severity: mockEvent.severity, mock_is_recovered: mockEvent.isRecovered }
        : { event_id: eventID as number };
    const request =
      type === 'processor'
        ? eventProcessorTryrun({ ...eventSource, processor_config: normalizeProcessorConfig(config) })
        : eventPipelineTryrun({
            ...eventSource,
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
  // 处理器级试跑只返回 {event, result} 而没有 node_results，这条 message 是用户唯一的线索，
  // 所以要展示；但「丢弃事件失败」这种原文得先翻成人话（与逐节点结果共用同一套映射）
  const resultText = humanizeProcessorMessage(result?.result, t);

  return (
    <>
      <Button
        disabled={disabled}
        size={size}
        onClick={() => {
          // 没有 catch 的话，校验失败会变成一条未捕获的 rejection：弹窗不开、没有任何提示，
          // 出错项还可能藏在折叠分区里，用户看到的就是「点了没反应」
          (onBeforeOpen?.() ?? Promise.resolve())
            .then(() => setVisible(true))
            .catch(() => {
              /* 反馈已在 onBeforeOpen 内完成 */
            });
        }}
      >
        {t('common:btn.test')}
      </Button>
      <Modal title={t(`test_modal.title.${view}`)} visible={visible} footer={null} onCancel={reset} width='80%' destroyOnClose>
        <Spin spinning={loading}>
          {view === 'settings' && (
            <>
              <Segmented
                className='mb-4'
                value={mode}
                onChange={(val) => setMode(val as TestMode)}
                options={[
                  { label: t('test_modal.mode.history'), value: 'history' },
                  { label: t('test_modal.mode.mock'), value: 'mock' },
                ]}
              />
              {/* 两个面板都常驻、靠 display 切换：EventsTable 卸载会丢掉已选中的事件和翻页位置 */}
              <div style={{ display: mode === 'history' ? undefined : 'none' }}>
                {historyTotal === 0 && (
                  <Alert
                    className='mb-2'
                    type='info'
                    showIcon
                    message={
                      <Space>
                        {t('test_modal.mock.empty_alert')}
                        <a onClick={() => setMode('mock')}>{t('test_modal.mock.switch_btn')}</a>
                      </Space>
                    }
                  />
                )}
                {visible && (
                  <EventsTable
                    rowSelectionType='radio'
                    selectedEventIds={eventID ? [eventID] : []}
                    onChange={(ids) => setEventID(ids[0])}
                    onTotalChange={setHistoryTotal}
                  />
                )}
              </div>
              <div style={{ display: mode === 'mock' ? undefined : 'none' }}>
                <MockEventPanel value={mockEvent} onChange={setMockEvent} />
              </div>
              <Button className='mt-4' type='primary' disabled={testDisabled} onClick={runTest}>
                {t('common:btn.test')}
              </Button>
            </>
          )}
          {view === 'result' && result && (
            <>
              <div className='mb-3 flex items-center justify-between'>
                <Button size='small' icon={<LeftOutlined />} onClick={backToSettings}>
                  {t(mode === 'mock' ? 'test_modal.back_btn_mock' : 'test_modal.back_btn')}
                </Button>
              </div>
              {dropped ? (
                <Alert className='mb-4' type='warning' showIcon message={resultText || t('test_modal.dropped')} />
              ) : (
                <Alert
                  className='mb-4'
                  type={failed ? 'error' : 'success'}
                  showIcon
                  message={failed ? t('test_modal.result_failed') : t('test_modal.result_success')}
                  description={resultText}
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
              <Alert className='mt-4' type='info' showIcon message={t(mode === 'mock' ? 'test_modal.fidelity_note_mock' : 'test_modal.fidelity_note')} />
            </>
          )}
        </Spin>
      </Modal>
    </>
  );
}
