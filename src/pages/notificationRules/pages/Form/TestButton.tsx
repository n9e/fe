import React, { useState } from 'react';
import { Modal, Button, Space, Tooltip, Form, Alert, Segmented, Tag } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import EventsTable from '@/pages/eventPipeline/pages/Form/TestModal/EventsTable';

import { NS } from '../../constants';
import { notifyRuleTest } from '../../services';

interface Props {
  field: FormListFieldData;
}

type TestMode = 'history' | 'mock';

export default function TestButton(props: Props) {
  const { t } = useTranslation(NS);
  const { field } = props;
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<TestMode>('history');
  const [historyTotal, setHistoryTotal] = useState<number>();
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>();
  const notify_config = Form.useWatch(['notify_configs', field.name]);

  const mockSeverity = _.isEmpty(notify_config?.severities) ? 2 : _.min(notify_config.severities);

  const buildNotifyConfigPayload = () => {
    return {
      ...notify_config,
      time_ranges: _.map(notify_config.time_ranges, (time_range) => {
        return {
          ...time_range,
          start: time_range.start.format('HH:mm'),
          end: time_range.end.format('HH:mm'),
        };
      }),
    };
  };

  const handleTest = () => {
    if (!notify_config) return;
    if (mode === 'history' && _.isEmpty(selectedEventIds)) return;

    notifyRuleTest({
      ...(mode === 'mock' ? { use_mock_event: true } : { event_ids: selectedEventIds }),
      notify_config: buildNotifyConfigPayload(),
    }).then((res) => {
      let msg = res.dat;
      try {
        msg = JSON.stringify(JSON.parse(res), null, 2);
      } catch (e) {}

      Modal.info({
        title: t('notification_configuration.run_test_request_result'),
        content: <div>{msg}</div>,
      });
      handleClose();
    });
  };

  const handleClose = () => {
    setVisible(false);
    setSelectedEventIds([]);
    setMode('history');
    setHistoryTotal(undefined);
  };

  return (
    <>
      <Button
        ghost
        type='primary'
        onClick={() => {
          setVisible(true);
        }}
      >
        <Space size={4}>
          {t('notification_configuration.run_test_btn')}
          <Tooltip className='n9e-ant-from-item-tooltip' title={t('notification_configuration.run_test_btn_tip')}>
            <QuestionCircleOutlined />
          </Tooltip>
        </Space>
      </Button>
      <Modal
        visible={visible}
        title={t('notification_configuration.run_test_btn')}
        width='80%'
        onCancel={handleClose}
        okButtonProps={{
          disabled: mode === 'history' && _.isEmpty(selectedEventIds),
        }}
        onOk={handleTest}
      >
        <Segmented
          className='mb-4'
          value={mode}
          onChange={(val) => {
            setMode(val as TestMode);
          }}
          options={[
            { label: t('notification_configuration.test_mode.history'), value: 'history' },
            { label: t('notification_configuration.test_mode.mock'), value: 'mock' },
          ]}
        />
        <div style={{ display: mode === 'history' ? undefined : 'none' }}>
          {historyTotal === 0 && (
            <Alert
              className='mb-2'
              type='info'
              showIcon
              message={
                <Space>
                  {t('notification_configuration.mock_test.empty_alert')}
                  <a
                    onClick={() => {
                      setMode('mock');
                    }}
                  >
                    {t('notification_configuration.mock_test.switch_btn')}
                  </a>
                </Space>
              }
            />
          )}
          <EventsTable selectedEventIds={selectedEventIds} onChange={setSelectedEventIds} onTotalChange={setHistoryTotal} />
        </div>
        <div style={{ display: mode === 'mock' ? undefined : 'none' }}>
          <Alert className='mb-4' type='info' showIcon message={t('notification_configuration.mock_test.desc')} />
          <div className='p-4 rounded-lg fc-border bg-fc-150'>
            <div className='font-bold mb-2'>{t('notification_configuration.mock_test.preview_title')}</div>
            <div className='mb-2'>
              <span className='text-soft mr-2'>{t('notification_configuration.mock_test.preview_rule_name')}:</span>
              {t('notification_configuration.mock_test.rule_name')}
            </div>
            <div className='mb-2'>
              <span className='text-soft mr-2'>{t('notification_configuration.mock_test.preview_severity')}:</span>
              {t(`common:severity.${mockSeverity}`)}
            </div>
            <div>
              <span className='text-soft mr-2'>{t('notification_configuration.mock_test.preview_tags')}:</span>
              <Tag>ident=mock-host-01</Tag>
              <Tag>source=notify-rule-test</Tag>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
