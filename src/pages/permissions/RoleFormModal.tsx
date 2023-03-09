import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, message } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { postRoles, putRoles } from './services';
import { RoleType } from './types';

interface IProps {
  action: 'post' | 'put';
  initialValues?: RoleType;
  onOk: (values?: RoleType) => void;
}

const titleMap = {
  post: '添加角色',
  put: '修改角色',
};

function CateFormModal(props: ModalWrapProps & IProps) {
  const { t } = useTranslation('permissions');
  const { visible, destroy, action, initialValues, onOk } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      title={t(`edit_title.${action}`)}
      visible={visible}
      onCancel={destroy}
      onOk={() => {
        form.validateFields().then((values) => {
          if (action === 'post') {
            postRoles(values).then(() => {
              onOk();
              message.success('common:success.add');
            });
          } else if (action === 'put') {
            putRoles({ ...initialValues, ...values }).then(() => {
              onOk({ ...initialValues, ...values });
              message.success('common:success.edit');
            });
          }
          destroy();
        });
      }}
    >
      <Form form={form} layout='vertical'>
        <Form.Item label={t('common:table.name')} name='name' required initialValue={initialValues?.name}>
          <Input />
        </Form.Item>
        <Form.Item label={t('common:table.note')} name='note' initialValue={initialValues?.note}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<IProps>(CateFormModal);
