import React from 'react';
import { Modal, Form, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';

import { NS } from '../constants';
import { getItem, putItem } from '../services';
import { adjustSubmitValues } from '../utils/adjustFormValues';
import FormCpt from './Form';

interface Props {
  id?: number;

  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export default function EditModal(props: Props) {
  const { t } = useTranslation(NS);
  const { id, visible, onCancel, onOk } = props;
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
    <Modal
      width={800}
      visible={visible}
      onCancel={onCancel}
      onOk={() => {
        if (id) {
          form.validateFields().then((values) => {
            putItem(id, adjustSubmitValues(values)).then(() => {
              onOk();
            });
          });
        }
      }}
      title={t('edit_title')}
    >
      <Spin spinning={loading}>
        <FormCpt form={form} />
      </Spin>
    </Modal>
  );
}
