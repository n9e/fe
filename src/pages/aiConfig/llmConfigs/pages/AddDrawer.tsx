import React from 'react';
import { Button, Drawer, Form, message, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../constants';
import { postItem, testConnection } from '../services';
import { adjustSubmitValues } from '../utils/adjustFormValues';
import FormCpt from './Form';

interface Props {
  visible: boolean;
  onOk: () => void;
  onClose: () => void;
}

export default function AddDrawer(props: Props) {
  const { t } = useTranslation(NS);
  const { visible, onOk, onClose } = props;
  const [form] = Form.useForm();

  return (
    <Drawer
      width={700}
      title={t('form.add_title')}
      placement='right'
      visible={visible}
      onClose={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>{t('common:btn.cancel')}</Button>
          <Button
            onClick={() => {
              form.validateFields().then((values) => {
                testConnection(adjustSubmitValues(values))
                  .then(() => {
                    message.success(t('form.test_connection_success'));
                  })
                  .catch((res) => {
                    if (typeof res.err === 'string') {
                      message.error(`${t('form.test_connection_failure')}: ${res.err}`);
                    }
                  });
              });
            }}
          >
            {t('form.test_connection')}
          </Button>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((values) => {
                postItem(adjustSubmitValues(values)).then(() => {
                  onOk();
                });
              });
            }}
          >
            {t('common:btn.save')}
          </Button>
        </Space>
      }
    >
      <FormCpt form={form} />
    </Drawer>
  );
}
