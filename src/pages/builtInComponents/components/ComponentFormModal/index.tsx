import React from 'react';
import _ from 'lodash';
import { Modal, Form, Input, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { postComponents, putComponent, Component } from '../../services';
import LogoPicker from '../LogoPicker';

interface Props {
  components: Component[];
  action: 'create' | 'edit';
  initialValues?: any;
  onOk: (values: any) => void;
}

function index(props: Props & ModalWrapProps) {
  const { t } = useTranslation('builtInComponents');
  const { components, action, initialValues, onOk, visible, destroy } = props;
  const [form] = Form.useForm();
  const logo = Form.useWatch('logo', form);

  return (
    <Modal
      width={600}
      title={t(`componentFormModal.${action}`)}
      visible={visible}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            if (action === 'edit') {
              putComponent(values).then(() => {
                message.success(t('common:success.modify'));
                destroy();
                onOk(values);
              });
            } else if (action === 'create') {
              postComponents([values]).then((res) => {
                if (_.isEmpty(res)) {
                  message.success(t('common:success.create'));
                  destroy();
                  onOk(values);
                } else {
                  let msg = '';
                  _.forEach(res, (v, k) => {
                    msg += `${k}: ${v}; `;
                  });
                  message.error(msg);
                }
              });
            }
          })
          .catch((e) => {
            console.error(e);
          });
      }}
      onCancel={() => {
        destroy();
      }}
    >
      <Form form={form} initialValues={initialValues} layout='vertical'>
        <Form.Item name='id' hidden>
          <div />
        </Form.Item>
        <Form.Item
          label={t('ident')}
          name='ident'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={
            <Space>
              {t('logo')}
              <LogoPicker components={components} onSelect={(logoURL) => form.setFieldsValue({ logo: logoURL })}>
                <a>{t('select_builtin_logos')}</a>
              </LogoPicker>
            </Space>
          }
          name='logo'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        {logo && <img src={logo} className='mb2' style={{ height: 42, maxWidth: '60%' }} />}
        <Form.Item label={t('readme')} name='readme'>
          <Input.TextArea autoSize={{ minRows: 2 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<Props>(index);
