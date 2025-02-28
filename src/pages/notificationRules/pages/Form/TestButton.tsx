import React, { useState } from 'react';
import { Modal, Button, Space, Tooltip, Form, message } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import Events from '@/pages/notificationTemplates/pages/List/Form/PreviewModal/Events';

import { NS } from '../../constants';
import { notifyRuleTest } from '../../services';

interface Props {
  field: FormListFieldData;
}

export default function TestButton(props: Props) {
  const { t } = useTranslation(NS);
  const { field } = props;
  const [visible, setVisible] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>();
  const notify_config = Form.useWatch(['notify_configs', field.name]);

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
        onCancel={() => {
          setVisible(false);
          setSelectedEventIds([]);
        }}
        onOk={() => {
          if (selectedEventIds && notify_config) {
            notifyRuleTest({
              event_ids: selectedEventIds,
              notify_config,
            }).then(() => {
              message.success(t('notification_configuration.run_test_request_success'));
              setVisible(false);
            });
          }
        }}
      >
        <Events selectedEventIds={selectedEventIds} setSelectedEventIds={setSelectedEventIds} />
      </Modal>
    </>
  );
}
