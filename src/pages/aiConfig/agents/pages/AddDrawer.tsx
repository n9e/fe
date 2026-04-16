import React from 'react';
import { Button, Drawer, Form, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../constants';
import { postItem } from '../services';
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
      width={600}
      title={t('form.add_title')}
      placement='right'
      visible={visible}
      onClose={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>{t('common:btn.cancel')}</Button>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((values) => {
                postItem(values).then(() => {
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
