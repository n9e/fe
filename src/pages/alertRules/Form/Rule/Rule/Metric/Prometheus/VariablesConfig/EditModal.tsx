import React, { useEffect } from 'react';
import { Form, Modal, Row, Col, Input, Select, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import HostSelect from '@/components/DeviceSelect/HostSelect';
import NetworkDeviceSelect from '@/components/DeviceSelect/NetworkDeviceSelect';

interface Props {
  visible: boolean;
  data: {
    name: string;
    param_type: string;
    query: any;
  };
  onOk: (data: any) => void;
  onCancel: () => void;
}

export default function EditModal(props: Props) {
  const { t } = useTranslation('alertRules');
  const { visible, data, onOk, onCancel } = props;
  const [form] = Form.useForm();
  const param_type = Form.useWatch(['param_type'], form);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(data);
    } else {
      form.resetFields();
    }
  }, [visible]);

  return (
    <Modal
      width={800}
      visible={visible}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          onOk(values);
        });
      }}
    >
      <Form form={form} layout='vertical'>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label={t('var_config.name')} name='name'>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('var_config.type')} name='param_type'>
              <Select
                options={[
                  {
                    label: t('var_config.threshold'),
                    value: 'threshold',
                  },
                  {
                    label: t('var_config.enum'),
                    value: 'enum',
                  },
                  {
                    label: t('var_config.host'),
                    value: 'host',
                  },
                  {
                    label: t('var_config.device'),
                    value: 'device',
                  },
                ]}
                onChange={() => {
                  form.setFieldsValue({ query: undefined });
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        {param_type === 'threshold' && (
          <Form.Item label={t('var_config.threshold_value')} name='query'>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        )}
        {param_type === 'enum' && (
          <Form.Item label={t('var_config.enum_value')} name='query'>
            <Select mode='tags' open={false} tokenSeparators={[' ']} />
          </Form.Item>
        )}
        {param_type === 'host' && <HostSelect prefixName={['query']} />}
        {param_type === 'device' && <NetworkDeviceSelect prefixName={['query']} />}
      </Form>
    </Modal>
  );
}
