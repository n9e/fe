import React from 'react';
import { Button, Form, Modal, Space } from 'antd';
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

  const [testLoading, setTestLoading] = React.useState(false);

  return (
    <Modal
      width={600}
      title={t('form.add_title')}
      visible={visible}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>{t('common:btn.cancel')}</Button>
          <Button
            loading={testLoading}
            onClick={() => {
              form.validateFields().then((values) => {
                setTestLoading(true);
                testConnection(adjustSubmitValues(values))
                  .then((res) => {
                    if (res.error) {
                      Modal.error({
                        title: t('form.test_connection_failure'),
                        content: (
                          <div>
                            <div>Duration: {res.duration_ms} ms</div>
                            <div>Error: {typeof res.error === 'string' ? res.error : JSON.stringify(res.error)}</div>
                          </div>
                        ),
                      });
                    } else {
                      Modal.success({
                        title: t('form.test_connection_success'),
                        content: (
                          <div>
                            <div>Duration: {res.duration_ms} ms</div>
                          </div>
                        ),
                      });
                    }
                  })
                  .finally(() => {
                    setTestLoading(false);
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
    </Modal>
  );
}
