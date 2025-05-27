import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import DetailNG from '@/pages/event/DetailNG';

import { NS } from '../../../constants';
import { eventProcessorTryrun, eventPipelineTryrun } from '../../../services';
import EventsTable from './EventsTable';

interface Props {
  type: 'processor' | 'pipeline';
  config: any;
}

export default function TestModal(props: Props) {
  const { t } = useTranslation(NS);
  const { type, config } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [eventID, setEventID] = useState<number>();
  const [data, setData] = useState<{
    type: 'settings' | 'result';
    data?: any;
    errMsg?: string;
  }>({
    type: 'settings',
  });

  return (
    <>
      <Button
        onClick={() => {
          setVisible(true);
        }}
      >
        {t('common:btn.test')}
      </Button>
      <Modal
        title={t(`test_modal.title.${data.type}`)}
        visible={visible}
        footer={null}
        onCancel={() => {
          setVisible(false);
          setData({
            type: 'settings',
          });
        }}
        width='80%'
        destroyOnClose
      >
        {data.type === 'settings' && (
          <>
            {visible && (
              <EventsTable
                onChange={(eventID) => {
                  setEventID(eventID);
                }}
              />
            )}
            <Button
              type='primary'
              disabled={!eventID}
              onClick={() => {
                if (eventID) {
                  if (type === 'processor') {
                    eventProcessorTryrun({
                      event_id: eventID,
                      processor_config: {
                        ...config,
                        config: {
                          ...config.config,
                          header: _.fromPairs(_.map(config.config.header as any[], (headerItem) => [headerItem.key, headerItem.value])),
                        },
                      },
                    })
                      .then((res) => {
                        setData({
                          type: 'result',
                          data: res,
                        });
                      })
                      .catch((res) => {
                        setData({
                          type: 'result',
                          errMsg: res?.message,
                        });
                      });
                  } else if (type === 'pipeline') {
                    eventPipelineTryrun({
                      event_id: eventID,
                      pipeline_config: {
                        ...config,
                        processors: _.map(config.processors, (item) => {
                          return {
                            ...item,
                            config: {
                              ...item.config,
                              header: _.fromPairs(_.map(item.config.header as any[], (headerItem) => [headerItem.key, headerItem.value])),
                            },
                          };
                        }),
                      },
                    })
                      .then((res) => {
                        setData({
                          type: 'result',
                          data: res,
                        });
                      })
                      .catch((res) => {
                        setData({
                          type: 'result',
                          errMsg: res?.message,
                        });
                      });
                  }
                }
              }}
            >
              {t('common:btn.test')}
            </Button>
          </>
        )}
        {data.type === 'result' && <DetailNG data={data.data} />}
      </Modal>
    </>
  );
}
