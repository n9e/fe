import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
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
  const [testing, setTesting] = useState<boolean>(false);

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
              loading={testing}
              onClick={() => {
                if (eventID) {
                  if (type === 'processor') {
                    setTesting(true);
                    eventProcessorTryrun({
                      event_id: eventID,
                      processor_config: {
                        ...config,
                        config: {
                          ...config.config,
                          header: config.config.header ? _.fromPairs(_.map(config.config.header as any[], (headerItem) => [headerItem.key, headerItem.value])) : undefined,
                        },
                      },
                    })
                      .then((res) => {
                        if (res.err) {
                          message.error(res.err);
                        } else if (res.dat?.result) {
                          message.info(res.dat.result);
                        } else if (res.dat?.event) {
                          setData({
                            type: 'result',
                            data: res.dat.event,
                          });
                        }
                      })
                      .catch((res) => {
                        message.error(res?.message || t('test_modal.error'));
                      })
                      .finally(() => {
                        setTesting(false);
                      });
                  } else if (type === 'pipeline') {
                    setTesting(true);
                    eventPipelineTryrun({
                      event_id: eventID,
                      pipeline_config: {
                        ...config,
                        processors: _.map(config.processors, (item) => {
                          return {
                            ...item,
                            config: {
                              ...item.config,
                              header: item.config.header ? _.fromPairs(_.map(item.config.header as any[], (headerItem) => [headerItem.key, headerItem.value])) : undefined,
                            },
                          };
                        }),
                      },
                    })
                      .then((res) => {
                        if (res.err) {
                          message.error(res.err);
                        } else if (res.dat?.result) {
                          message.info(res.dat.result);
                        } else if (res.dat?.event) {
                          setData({
                            type: 'result',
                            data: res.dat.event,
                          });
                        }
                      })
                      .catch((res) => {
                        message.error(res?.message || t('test_modal.error'));
                      })
                      .finally(() => {
                        setTesting(false);
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
