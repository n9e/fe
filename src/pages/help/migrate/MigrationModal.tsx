import React, { useState, useContext } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Form, Input, Select, Space, message } from 'antd';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { CommonStateContext } from '@/App';
import { convertDashboardV2ToV3 } from './utils';

interface MigrationModalProps {
  boards: any[];
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onOk: () => void;
}

export default function MigrationModal(props: MigrationModalProps) {
  const { t } = useTranslation('migrationDashboard');
  const { boards, visible, setVisible, onOk } = props;
  const [migrating, setMigrating] = useState(false);
  const [form] = Form.useForm();
  const { groupedDatasourceList } = useContext(CommonStateContext);

  return (
    <Modal
      title={t('modal.title')}
      destroyOnClose
      maskClosable={false}
      closable={false}
      visible={visible}
      footer={[
        <Button
          key='back'
          loading={migrating}
          onClick={() => {
            setVisible(false);
          }}
        >
          {t('common:btn.cancel')}
        </Button>,
        <Button
          key='submit'
          type='primary'
          loading={migrating}
          onClick={() => {
            form.validateFields().then((values) => {
              setMigrating(true);
              const requests = _.map(boards, (board) => {
                try {
                  return convertDashboardV2ToV3(board, values);
                } catch (e) {
                  console.error(e);
                  return Promise.resolve();
                }
              });
              Promise.all(requests).then(() => {
                setVisible(false);
                setMigrating(false);
                message.success(t('modal.success'));
                onOk();
              });
            });
          }}
        >
          {t('migrate')}
        </Button>,
      ]}
    >
      <Form form={form}>
        <div style={{ marginBottom: 10 }}>{t('modal.datasource_variable')}</div>
        <div>
          <InputGroupWithFormItem label={t('modal.variable_name')}>
            <Form.Item name='name' rules={[{ required: true, message: t('modal.variable_name_required') }]} initialValue='datasource'>
              <Input />
            </Form.Item>
          </InputGroupWithFormItem>
        </div>
        <div>
          <Space>
            <InputGroupWithFormItem label={t('modal.datasource_type')}>
              <Form.Item>
                <Input disabled value='Prometheus' />
              </Form.Item>
            </InputGroupWithFormItem>
            <InputGroupWithFormItem label={t('modal.datasource_default')}>
              <Form.Item name='datasourceDefaultValue'>
                <Select allowClear style={{ width: 168 }}>
                  {_.map(groupedDatasourceList.prometheus, (item) => {
                    return (
                      <Select.Option key={item.id} value={item.id}>
                        {item.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </InputGroupWithFormItem>
          </Space>
        </div>
      </Form>
    </Modal>
  );
}
