import React, { useEffect, useState } from 'react';
import { Modal, Segmented, Alert, Space } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import EventsTable from '@/pages/eventPipeline/pages/Form/TestModal/EventsTable';
import MockEventPanel, { MockEventState } from '@/pages/eventPipeline/pages/Form/TestModal/MockEventPanel';

import { NS } from '../../../../constants';
import { preview, PreviewFieldResult } from '../../../../services';
import HTML from '../../Editor/HTML';
import Text from '../../Editor/Text';
import Markdown from '../../Editor/Markdown';

interface Props {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  content: {
    [index: string]: string;
  };
  isEmailType: boolean;
}

type PreviewMode = 'history' | 'mock';

const DEFAULT_MOCK_EVENT: MockEventState = { severity: 2, isRecovered: false };

export default function PreviewModal(props: Props) {
  const { t } = useTranslation(NS);
  const { visible, setVisible, content, isEmailType } = props;
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [mode, setMode] = useState<PreviewMode>('history');
  const [mockEvent, setMockEvent] = useState<MockEventState>(DEFAULT_MOCK_EVENT);
  const [historyTotal, setHistoryTotal] = useState<number>();
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>();
  const [previewData, setPreviewData] = useState<{ [index: string]: PreviewFieldResult }>();

  const canPreview = mode === 'mock' || !_.isEmpty(selectedEventIds);

  useEffect(() => {
    if (!resultModalVisible || !content) return;
    if (mode === 'history' && _.isEmpty(selectedEventIds)) return;

    preview({
      ...(mode === 'mock'
        ? { use_mock_event: true as const, mock_severity: mockEvent.severity, mock_is_recovered: mockEvent.isRecovered }
        : { event_ids: selectedEventIds as number[] }),
      tpl: {
        content,
      },
    })
      .then((res) => {
        setPreviewData(res);
      })
      .catch((err) => {
        console.error(err);
        setPreviewData(undefined);
      });
  }, [resultModalVisible, mode, _.join(selectedEventIds), mockEvent.severity, mockEvent.isRecovered]);

  const closeResult = () => {
    setResultModalVisible(false);
    setSelectedEventIds([]);
    // 上一次的结果必须清掉，否则下次打开会先闪一屏旧内容再被新结果替换
    setPreviewData(undefined);
  };

  const closeSelect = () => {
    setVisible(false);
    setSelectedEventIds([]);
  };

  const renderField = (key: string, result?: PreviewFieldResult) => {
    // 模板语法错误必须走纯文本：Go 的报错里带 <.Foo> 这类片段，
    // 交给 dompurify / ReactMarkdown 会被当成非法标签剥掉，用户只看到一句被截断的怪话
    if (result && !result.success) {
      return (
        <Alert
          key={key}
          type='error'
          showIcon
          message={<span className='font-bold'>{key}</span>}
          description={<pre className='mb-0 whitespace-pre-wrap break-all text-[12px]'>{result.message}</pre>}
        />
      );
    }
    const str = result?.content ?? '';
    if (isEmailType) {
      if (key === 'subject') {
        return <Text key={key} label={key} previewResultStr={str} />;
      }
      return <HTML key={key} label={key} previewResultStr={str} />;
    }
    return <Markdown key={key} label={key} previewResultStr={str} />;
  };

  return (
    <>
      <Modal
        visible={visible}
        title={t('preview.select_events')}
        width='80%'
        onCancel={closeSelect}
        okButtonProps={{ disabled: !canPreview }}
        onOk={() => {
          setVisible(false);
          setResultModalVisible(true);
        }}
      >
        <Segmented
          className='mb-4'
          value={mode}
          onChange={(val) => {
            setMode(val as PreviewMode);
          }}
          options={[
            { label: t('preview.mode.history'), value: 'history' },
            { label: t('preview.mode.mock'), value: 'mock' },
          ]}
        />
        {/* 两个面板常驻、靠 display 切换：EventsTable 卸载会丢掉已选中的事件和翻页位置 */}
        <div style={{ display: mode === 'history' ? undefined : 'none' }}>
          {historyTotal === 0 && (
            <Alert
              className='mb-2'
              type='info'
              showIcon
              message={
                <Space>
                  {t('preview.empty_alert')}
                  <a
                    onClick={() => {
                      setMode('mock');
                    }}
                  >
                    {t('preview.switch_btn')}
                  </a>
                </Space>
              }
            />
          )}
          <EventsTable selectedEventIds={selectedEventIds} onChange={setSelectedEventIds} onTotalChange={setHistoryTotal} />
        </div>
        <div style={{ display: mode === 'mock' ? undefined : 'none' }}>
          <MockEventPanel value={mockEvent} onChange={setMockEvent} />
        </div>
      </Modal>
      <Modal visible={resultModalVisible} title={t('preview.result')} width='80%' onCancel={closeResult} footer={null}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 按编辑器里的字段顺序渲染：后端返回的是 map，JSON 序列化后键名是字母序，
              直接遍历响应会让预览顺序和用户编辑的顺序对不上 */}
          {_.map(_.keys(content), (key) => renderField(key, previewData?.[key]))}
        </div>
      </Modal>
    </>
  );
}
