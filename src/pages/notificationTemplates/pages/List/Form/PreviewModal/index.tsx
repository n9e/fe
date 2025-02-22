import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { NS } from '../../../../constants';
import { preview } from '../../../../services';
import HTML from '../../Editor/HTML';
import Markdown from '../../Editor/Markdown';
import Events from './Events';

interface Props {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  content: {
    [index: string]: string;
  };
  notify_channel_request_type?: string;
}

export default function PreviewModal(props: Props) {
  const { t } = useTranslation(NS);
  const { visible, setVisible, content, notify_channel_request_type } = props;
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>();
  const [previewData, setPreviewData] = useState<{ [index: string]: string }>();

  useEffect(() => {
    if (resultModalVisible && selectedEventIds && content) {
      preview({
        event_ids: selectedEventIds,
        tpl: {
          content,
        },
      }).then((res) => {
        setPreviewData(res);
      });
    }
  }, [resultModalVisible, _.join(selectedEventIds)]);

  return (
    <>
      <Modal
        visible={visible}
        title={t('preview.select_events')}
        width='80%'
        onCancel={() => {
          setVisible(false);
          setSelectedEventIds([]);
        }}
        onOk={() => {
          setVisible(false);
          setResultModalVisible(true);
        }}
      >
        <Events selectedEventIds={selectedEventIds} setSelectedEventIds={setSelectedEventIds} />
      </Modal>
      <Modal
        visible={resultModalVisible}
        title={t('preview.result')}
        width='80%'
        onCancel={() => {
          setResultModalVisible(false);
          setSelectedEventIds([]);
        }}
        footer={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {_.map(previewData, (v, k) => {
            if (notify_channel_request_type === 'smtp') {
              return <HTML key={k} label={k} previewResultStr={v} />;
            }
            return <Markdown key={k} label={k} previewResultStr={v} />;
          })}
        </div>
      </Modal>
    </>
  );
}
