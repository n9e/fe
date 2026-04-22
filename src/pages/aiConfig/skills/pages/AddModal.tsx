import React from 'react';
import { Modal, Form } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../constants';
import { postItem } from '../services';
import { adjustSubmitValues } from '../utils/adjustFormValues';
import FormCpt from './Form';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export default function AddModal(props: Props) {
  const { t } = useTranslation(NS);
  const { visible, onCancel, onOk } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      width={800}
      visible={visible}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          postItem(adjustSubmitValues(values)).then(() => {
            onOk();
          });
        });
      }}
      title={t('write_skill')}
    >
      <FormCpt form={form} />
    </Modal>
  );
}
