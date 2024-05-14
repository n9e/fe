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
import { Modal, Form, Table, Button, Divider, message, Select } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { boardsClones } from '@/services/dashboardV2';

interface IProps {
  board_ids: number[];
  busiGroups: any[];
}

function BatchClone(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('dashboard');
  const { visible, destroy, board_ids, busiGroups } = props;
  const [importResult, setImportResult] = useState<{ name: string; msg: string }[]>();

  return (
    <Modal
      className='dashboard-import-modal'
      title={t('common:btn.batch_clone')}
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      footer={null}
    >
      <Form
        layout='vertical'
        onFinish={async (vals) => {
          boardsClones({
            board_ids,
            bgids: vals.bgids,
          })
            .then((res) => {
              const { dat } = res;
              const dataSource = _.map(dat, (val, key) => {
                return {
                  name: key,
                  msg: val,
                };
              });
              setImportResult(dataSource);
              if (_.every(dataSource, (item) => !item.msg)) {
                message.success(t('common:success.clone'));
                destroy();
              }
            })
            .catch((error) => {
              message.error(t('common:error.clone') + error);
            });
        }}
      >
        <Form.Item label={t('common:business_group')} name='bgids'>
          <Select
            mode='multiple'
            options={_.map(busiGroups, (item) => {
              return {
                label: item.name,
                value: item.id,
              };
            })}
            showSearch
            optionFilterProp='label'
          />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            {t('common:btn.batch_clone')}
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
                title: t('batch.clone.name'),
                dataIndex: 'name',
              },
              {
                title: t('batch.clone.result'),
                dataIndex: 'msg',
                render: (data) => {
                  return !data ? <CheckCircleOutlined style={{ color: '#389e0d', fontSize: '18px' }} /> : <CloseCircleOutlined style={{ color: '#d4380d', fontSize: '18px' }} />;
                },
              },
              {
                title: t('batch.clone.errmsg'),
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

export default ModalHOC(BatchClone);
