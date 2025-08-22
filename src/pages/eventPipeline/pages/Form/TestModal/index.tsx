import React, { useState } from 'react';
import { Modal, Button, Spin, Form, message } from 'antd';
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
  const [loading, setLoading] = useState<boolean>(false);
  const form = Form.useFormInstance();

  return (
    <>
      <Button
        onClick={() => {
          form.validateFields().then(() => {
            setVisible(true);
          });
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
        <Spin spinning={loading}>
          {data.type === 'settings' && (
            <>
              {visible && (
                <EventsTable
                  rowSelectionType='radio'
                  onChange={(ids) => {
                    setEventID(ids[0]);
                  }}
                />
              )}
              <Button
                type='primary'
                disabled={!eventID}
                onClick={async () => {
                  if (eventID) {
                    if (type === 'processor') {
                      setLoading(true);
                      eventProcessorTryrun({
                        event_id: eventID,
                        processor_config: {
                          ...config,
                          config: {
                            ...config.config,
                            header: config.config.header ? _.fromPairs(_.map(config.config.header as any[], (headerItem) => [headerItem.key, headerItem.value])) : undefined,
                            custom_params: config.config.custom_params ? _.fromPairs(_.map(config.config.custom_params as any[], (item) => [item.key, item.value])) : undefined,
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
                        .finally(() => {
                          setLoading(false);
                        });
                    } else if (type === 'pipeline') {
                      setLoading(true);
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
                                custom_params: item.config.custom_params ? _.fromPairs(_.map(item.config.custom_params as any[], (item) => [item.key, item.value])) : undefined,
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
                        .finally(() => {
                          setLoading(false);
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
        </Spin>
      </Modal>
    </>
  );
}
