import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Form, Input } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { getSelfTokenList, postSelfToken, deleteSelfToken } from './services';

export default function index() {
  const { t } = useTranslation('account');
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const fetchData = () => {
    getSelfTokenList().then((res) => {
      setData(res);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div
        className='mb2'
        style={{
          textAlign: 'right',
        }}
      >
        <Button
          type='primary'
          onClick={() => {
            setModalVisible(true);
          }}
        >
          {t('token.createToken')}
        </Button>
      </div>
      <Table
        size='small'
        rowKey='id'
        columns={[
          {
            dataIndex: 'token_name',
            title: t('token.tokenName'),
          },
          {
            dataIndex: 'token',
            title: 'Token',
          },
          {
            dataIndex: 'create_at',
            title: t('common:table.create_at'),
            render: (text) => moment.unix(text).format('YYYY-MM-DD HH:mm:ss'),
          },
          {
            title: t('common:table.operations'),
            render: (record) => {
              return (
                <Button
                  type='link'
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: t('common:confirm.delete'),
                      onOk: () => {
                        deleteSelfToken(record.id).then(() => {
                          fetchData();
                        });
                      },
                    });
                  }}
                >
                  {t('common:btn.delete')}
                </Button>
              );
            },
          },
        ]}
        dataSource={data}
      />
      <Modal
        title={t('token.createToken')}
        visible={modalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            postSelfToken(values).then(() => {
              fetchData();
              setModalVisible(false);
            });
          });
        }}
        onCancel={() => {
          setModalVisible(false);
        }}
      >
        <Form form={form} layout='vertical'>
          <Form.Item label={t('token.tokenName')} name='token_name' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
