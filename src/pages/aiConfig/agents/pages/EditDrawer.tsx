import React from 'react';
import { Button, Drawer, Form, Space, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';

import { NS } from '../constants';
import { getItem, putItem } from '../services';
import FormCpt from './Form';

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
        form.setFieldsValue(data);
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
            type='primary'
            onClick={() => {
              if (!id) return;
              form.validateFields().then((values) => {
                putItem(id, values).then(() => {
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
