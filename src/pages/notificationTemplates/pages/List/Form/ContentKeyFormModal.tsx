import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Modal, Input, Button, Alert } from 'antd';

import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';

import { NS } from '../../../constants';

interface Props {
  mode: 'add' | 'edit';
  contentKey?: string;
  onOk: (contentKey: string) => void;
}

function ContentKeyFormModal(props: Props & ModalWrapProps) {
  const { t } = useTranslation(NS);
  const { mode, contentKey, visible, destroy, onOk } = props;
  const [form] = Form.useForm();
  const contentKeyVal = Form.useWatch('contentKey', form);

  return (
    <Modal
      title={t(`content.${mode}_title`)}
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      footer={null}
    >
      <Form layout='vertical' form={form}>
        <Form.Item
          label={t('content.contentKey')}
          name='contentKey'
          rules={[
            {
              required: true,
            },
          ]}
          initialValue={contentKey}
        >
          <Input />
        </Form.Item>
        <Alert
          className='mb2'
          type='info'
          message={t('content.tip', {
            contentKey: contentKeyVal ?? 'contentKey',
          })}
        />
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            onClick={() => {
              form.validateFields().then((values) => {
                onOk(values.contentKey);
                destroy();
              });
            }}
          >
            {t('common:btn.save')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<Props>(ContentKeyFormModal);
