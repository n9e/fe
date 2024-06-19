import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal, Form, Space, Input, Button } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { Record } from './types';
import { setEmbeddedDashboards } from './services';

interface Props {
  initialValues?: Record[];
  onOk: (data: Record[]) => void;
}

function FormModal(props: Props & ModalWrapProps) {
  const { t } = useTranslation('embeddedDashboards');
  const { visible, destroy, initialValues, onOk } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      width={750}
      title={t('edit_title')}
      visible={visible}
      onOk={() => {
        form.validateFields().then((values) => {
          setEmbeddedDashboards(values.data);
          onOk(values.data);
          destroy();
        });
      }}
      onCancel={destroy}
    >
      <Form
        layout='vertical'
        initialValues={{
          data: initialValues,
        }}
        form={form}
      >
        <Form.List name={'data'}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => {
                return (
                  <>
                    <Form.Item {...restField} name={[name, 'id']} hidden>
                      <div />
                    </Form.Item>
                    <Space
                      key={key}
                      style={{
                        alignItems: 'flex-start',
                      }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[
                          {
                            required: true,
                            message: t('name_msg'),
                          },
                        ]}
                      >
                        <Input placeholder={t('name')} style={{ width: 192 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'url']}
                        rules={[
                          {
                            required: true,
                            message: t('url_msg'),
                          },
                        ]}
                      >
                        <Input style={{ width: 460 }} placeholder={t('url')} />
                      </Form.Item>
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          remove(name);
                        }}
                      />
                    </Space>
                  </>
                );
              })}
              <Button
                type='dashed'
                style={{ width: '100%', marginBottom: 10 }}
                onClick={() => {
                  add({
                    id: uuidv4(),
                  });
                }}
              >
                <PlusOutlined /> {t('common:btn.add')}
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

export default ModalHOC<Props>(FormModal);
