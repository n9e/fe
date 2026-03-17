import React from 'react';
import { Button, Drawer, Form, Space, Spin, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';

import { NS } from '../constants';
import { getItem, putItem, testConnection } from '../services';
import FormCpt from './Form';
import { adjustFormValues, adjustSubmitValues } from '../utils/adjustFormValues';

interface Props {
  id?: number;

  visible: boolean;
  onOk: () => void;
  onClose: () => void;
}

export default function EditDrawer(props: Props) {
  const { t } = useTranslation(NS);
  const { visible, onOk, onClose, id } = props;
  const [form] = Form.useForm();

  const { loading } = useRequest(
    () => {
      if (!id) {
        return Promise.resolve(null);
      }
      return getItem(id);
    },
    {
      refreshDeps: [id],
      onSuccess(data) {
        if (data) {
          form.setFieldsValue(adjustFormValues(data));
        }
      },
    },
  );

  return (
    <Drawer
      width={600}
      title={t('form.edit_title')}
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
              if (!id) return;
              form.validateFields().then((values) => {
                putItem(id, adjustSubmitValues(values)).then(() => {
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
      <Spin spinning={loading}>
        <FormCpt form={form} />
      </Spin>
    </Drawer>
  );
}
