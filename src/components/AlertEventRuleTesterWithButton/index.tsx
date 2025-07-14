import React, { useState } from 'react';
import { Button, message, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

// TODO 暂时用 eventPipeline 里的 EventsTable 后面可以抽离出来
import EventsTable from '@/pages/eventPipeline/pages/Form/TestModal/EventsTable';

interface Props {
  onClick: () => Promise<void>;
  onTest: (eventID: number) => Promise<{
    err?: string;
    dat?: string;
  }>;
}

export default function index<T>(props: Props) {
  const { t } = useTranslation();
  const { onClick, onTest } = props;
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [eventID, setEventID] = useState<number>();

  return (
    <>
      <Button
        onClick={() => {
          onClick().then(() => {
            setEventsModalVisible(true);
          });
        }}
      >
        {t('common:btn.test')}
      </Button>
      <Modal
        title={t('common:select_event')}
        footer={null}
        width='80%'
        destroyOnClose
        visible={eventsModalVisible}
        onCancel={() => {
          setEventsModalVisible(false);
        }}
      >
        <EventsTable
          rowSelectionType='radio'
          onChange={(ids) => {
            setEventID(ids[0]);
          }}
        />
        <Button
          type='primary'
          disabled={!eventID}
          onClick={() => {
            if (eventID) {
              onTest(eventID).then((res) => {
                setEventsModalVisible(false);
                if (res.err) {
                  message.error(res.err);
                } else if (res.dat) {
                  message.info(res.dat);
                }
              });
            }
          }}
        >
          {t('common:btn.test')}
        </Button>
      </Modal>
    </>
  );
}
