import React from 'react';
import { Modal, Form, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';

import { NS } from '../constants';
import { getItem, putItem } from '../services';
import { adjustSubmitValues } from '../utils/adjustFormValues';
import { resolveSubmitPrivate } from '../utils/permission';
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
      if (!id || !visible) {
        return Promise.resolve(null);
      }
      return getItem(id);
    },
    {
      refreshDeps: [id, visible],
      onSuccess(data) {
        if (data) {
          form.resetFields();
          form.setFieldsValue(data);
        }
      },
    },
  );

  return (
    <Modal
      width={800}
      visible={visible}
      destroyOnClose
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => {
        if (id) {
          form.validateFields().then((values) => {
            // 非 admin 未挂载「可见范围」字段，validateFields 不含 private；其当前值已由
            // setFieldsValue(data) 存进 form store，用 getFieldValue 取出沿用，避免编辑改变可见性。
            putItem(id, adjustSubmitValues({ ...values, private: resolveSubmitPrivate(values.private, form.getFieldValue('private')) })).then(() => {
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
