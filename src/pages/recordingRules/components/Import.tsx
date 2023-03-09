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
import { addOrEditRecordingRule } from '@/services/recording';

interface IProps {
  busiId: number;
  refreshList: () => void;
}

function Import(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('recordingRules');
  const { visible, destroy, busiId, refreshList } = props;
  const [importResult, setImportResult] = useState<{ name: string; msg: string }[]>();

  return (
    <Modal
      className='dashboard-import-modal'
      title={`${t('batch.import.title')} JSON`}
      visible={visible}
      onCancel={() => {
        refreshList();
        destroy();
      }}
      footer={null}
    >
      <Form
        layout='vertical'
        onFinish={async (vals) => {
          try {
            const importData = JSON.parse(vals.import);
            const { dat } = await addOrEditRecordingRule(importData, busiId, 'Post');
            const dataSource = _.map(dat, (val, key) => {
              return {
                name: key,
                msg: val,
              };
            });
            setImportResult(dataSource);
            if (_.every(dataSource, (item) => !item.msg)) {
              message.success(t('common:success.import'));
              refreshList();
              destroy();
            }
          } catch (error) {
            message.error(t('common:error.import') + error);
          }
        }}
      >
        <Form.Item
          label={`${t('batch.import.name')} JSON`}
          name='import'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input.TextArea className='code-area' rows={16} />
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
