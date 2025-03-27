import React, { useEffect } from 'react';
import { Form, Modal, Row, Col, Input, Select, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import HostSelect from '@/components/DeviceSelect/HostSelect';
import NetworkDeviceSelect from '@/components/DeviceSelect/NetworkDeviceSelect';
import { IS_PLUS } from '@/utils/constant';

interface Props {
  visible: boolean;
  data: {
    name: string;
    param_type: string;
    query: any;
  };
  onOk: (data: any) => void;
  onCancel: () => void;
  nameAndTypeDisabled?: boolean;
}

export default function EditModal(props: Props) {
  const { t } = useTranslation('alertRules');
  const { visible, data, onOk, onCancel, nameAndTypeDisabled } = props;
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
      <Form form={form} layout='vertical' preserve={false}>
        <Form.Item name='id' hidden>
          <Input />
        </Form.Item>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item
              label={t('var_config.name')}
              name='name'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input disabled={nameAndTypeDisabled} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('var_config.type')}
              name='param_type'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                options={_.concat(
                  [
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
                  ],
                  IS_PLUS
                    ? [
                        {
                          label: t('var_config.device'),
                          value: 'device',
                        },
                      ]
                    : [],
                )}
                onChange={() => {
                  form.setFieldsValue({ query: undefined });
                }}
                disabled={nameAndTypeDisabled}
              />
            </Form.Item>
          </Col>
        </Row>
        {param_type === 'threshold' && (
          <Form.Item
            label={t('var_config.threshold_value')}
            name='query'
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        )}
        {param_type === 'enum' && (
          <Form.Item
            label={t('var_config.enum_value')}
            name='query'
            // TODO: beta.5 关闭校验，不填则代表所有
            // rules={[
            //   {
            //     required: true,
            //   },
            // ]}
          >
            <Select mode='tags' open={false} tokenSeparators={[' ']} />
          </Form.Item>
        )}
        {param_type === 'host' && <HostSelect prefixName={['query']} />}
        {param_type === 'device' && IS_PLUS && <NetworkDeviceSelect prefixName={['query']} />}
      </Form>
    </Modal>
  );
}
