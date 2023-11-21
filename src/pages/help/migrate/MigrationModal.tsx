import React, { useState, useContext } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Form, Input, Select, message } from 'antd';
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
      title={t('settings')}
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
                message.success(t('success_migrate'));
                onOk();
              });
            });
          }}
        >
          {t('migrate')}
        </Button>,
      ]}
    >
      <Form form={form} layout='vertical'>
        <div style={{ marginBottom: 10 }}>{t('datasource_variable')}</div>
        <Form.Item label={t('variable_name')} name='name' rules={[{ required: true }]} initialValue='datasource'>
          <Input />
        </Form.Item>
        <Form.Item label={t('common:datasource.type')}>
          <Input disabled value='Prometheus' />
        </Form.Item>
        <Form.Item name='datasourceDefaultValue' label={t('datasource_default')}>
          <Select allowClear style={{ width: '100%' }}>
            {_.map(groupedDatasourceList.prometheus, (item) => {
              return (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
