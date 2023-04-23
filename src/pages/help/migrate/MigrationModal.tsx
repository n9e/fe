import React, { useState, useContext } from 'react';
import _ from 'lodash';
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
  const { boards, visible, setVisible, onOk } = props;
  const [migrating, setMigrating] = useState(false);
  const [form] = Form.useForm();
  const { groupedDatasourceList } = useContext(CommonStateContext);

  return (
    <Modal
      title='迁移设置'
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
          取消
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
                message.success('迁移成功');
                onOk();
              });
            });
          }}
        >
          迁移
        </Button>,
      ]}
    >
      <Form form={form}>
        <div style={{ marginBottom: 10 }}>数据源变量设置</div>
        <div>
          <InputGroupWithFormItem label='变量名称'>
            <Form.Item name='name' rules={[{ required: true, message: '请填写变量名称' }]} initialValue='datasource'>
              <Input />
            </Form.Item>
          </InputGroupWithFormItem>
        </div>
        <div>
          <Space>
            <InputGroupWithFormItem label='数据源类型'>
              <Form.Item>
                <Input disabled value='Prometheus' />
              </Form.Item>
            </InputGroupWithFormItem>
            <InputGroupWithFormItem label='数据源默认值'>
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
