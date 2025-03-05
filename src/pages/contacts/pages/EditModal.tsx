import React from 'react';
import { Modal, Form, Input, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';

import { ContactType } from '../types';
import { NS } from '../constants';

interface IProps {
  initialValues?: ContactType;
  onOk: (values: ContactType) => void;
}

function EditModal(props: ModalWrapProps & IProps) {
  const { t } = useTranslation(NS);
  const { visible, destroy, initialValues } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      title={t('edit_title')}
      visible={visible}
      onCancel={destroy}
      onOk={() => {
        form.validateFields().then((values) => {
          const hide = !values.enabled;
          props.onOk({
            ..._.omit(values, 'enabled'),
            hide,
          } as ContactType);
          destroy();
        });
      }}
    >
      <Form
        layout='vertical'
        form={form}
        initialValues={{
          ...initialValues,
          enabled: !initialValues?.hide,
        }}
      >
        <Form.Item
          label={t('common:table.name')}
          name='name'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('common:table.ident')}
          name='ident'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input disabled={initialValues?.built_in} />
        </Form.Item>
        <Form.Item label={t('common:table.enabled')} name='enabled' valuePropName='checked'>
          <Switch />
        </Form.Item>
        <Form.Item name='built_in' hidden noStyle initialValue={false}>
          <div />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<IProps>(EditModal);
