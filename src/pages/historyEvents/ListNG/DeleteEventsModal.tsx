import React from 'react';
import { Alert, Form, Modal, Checkbox, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';

import { deleteEvents } from '../services';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export default function DeleteEventsModal(props: Props) {
  const { t } = useTranslation('AlertHisEvents');
  const { visible, onCancel, onOk } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      destroyOnClose
      title={t('delete_events.title')}
      visible={visible}
      onCancel={onCancel}
      onOk={() => {
        Modal.confirm({
          title: t('delete_events.alert_message'),
          onOk() {
            form.validateFields().then((values) => {
              deleteEvents({
                severities: values.severities,
                timestamp: moment().subtract(values.month, 'months').unix(),
              }).then((res) => {
                if (typeof res.dat === 'string') {
                  message.success(res.dat);
                }
                onOk();
              });
            });
          },
        });
      }}
    >
      <Alert className='mb-4' message={t('delete_events.alert_message')} type='warning' showIcon />
      <Form form={form} layout='vertical'>
        <Form.Item label={t('delete_events.severities')} name='severities' initialValue={[1, 2, 3]} rules={[{ required: true }]}>
          <Checkbox.Group
            options={[
              {
                label: t('common:severity.1'),
                value: 1,
              },
              {
                label: t('common:severity.2'),
                value: 2,
              },
              {
                label: t('common:severity.3'),
                value: 3,
              },
            ]}
          />
        </Form.Item>
        <Form.Item label={t('delete_events.timestamp')} name='month' initialValue={3} rules={[{ required: true }]}>
          <Select
            options={[
              {
                label: t('delete_events.timestamp_options.1'),
                value: 1,
              },
              {
                label: t('delete_events.timestamp_options.3'),
                value: 3,
              },
              {
                label: t('delete_events.timestamp_options.6'),
                value: 6,
              },
              {
                label: t('delete_events.timestamp_options.12'),
                value: 12,
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
