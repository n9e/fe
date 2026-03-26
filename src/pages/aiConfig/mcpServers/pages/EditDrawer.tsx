import React from 'react';
import { Button, Drawer, Form, Space, Spin, Modal } from 'antd';
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

  const [testLoading, setTestLoading] = React.useState(false);

  return (
    <Drawer
      width={600}
      title={t('form.edit_title')}
      visible={visible}
      onClose={onClose}
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
        <FormCpt id={id} form={form} />
      </Spin>
    </Drawer>
  );
}
