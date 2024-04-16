/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Modal, Input, Form, Table, Button, Divider, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { postMetrics } from '../services';

interface IProps {
  onOk: () => void;
}

function Import(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('metricsBuiltin');
  const { visible, destroy, onOk } = props;
  const [importResult, setImportResult] = useState<{ name: string; msg: string }[]>();

  return (
    <Modal
      title={`${t('batch.import.title')}`}
      visible={visible}
      onCancel={() => {
        onOk();
        destroy();
      }}
      footer={null}
    >
      <Form
        layout='vertical'
        onFinish={async (vals) => {
          try {
            const importData = JSON.parse(vals.import);
            const result = await postMetrics(importData);
            const importResult = _.map(result, (val, key) => {
              return {
                name: key,
                msg: val,
              };
            });
            setImportResult(importResult);
            if (_.every(importResult, (item) => !item.msg)) {
              message.success(t('common:success.import'));
              onOk();
              destroy();
            }
          } catch (error) {
            message.error(t('common:error.import') + error);
          }
        }}
        initialValues={{
          cate: 'prometheus',
          datasource_ids: [0],
          enabled: false,
        }}
      >
        <Form.Item
          label='JSON'
          name='import'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input.TextArea rows={16} />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            {t('common:btn.import')}
          </Button>
        </Form.Item>
      </Form>
      {importResult && (
        <>
          <Divider />
          <Table
            className='samll_table'
            dataSource={importResult}
            columns={[
              {
                title: t('batch.import.name'),
                dataIndex: 'name',
              },
              {
                title: t('batch.import.result'),
                dataIndex: 'msg',
                render: (data) => {
                  return !data ? <CheckCircleOutlined style={{ color: '#389e0d', fontSize: '18px' }} /> : <CloseCircleOutlined style={{ color: '#d4380d', fontSize: '18px' }} />;
                },
              },
              {
                title: t('batch.import.errmsg'),
                dataIndex: 'msg',
              },
            ]}
            pagination={false}
            size='small'
          />
        </>
      )}
    </Modal>
  );
}

export default ModalHOC(Import);
