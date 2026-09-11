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
import React from 'react';
import { Alert, Form, Modal, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { deleteAlertMutes } from '@/services/shield';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  gids?: string;
}

export default function DeleteMutesModal(props: Props) {
  const { t } = useTranslation('alertMutes');
  const { visible, onCancel, onOk, gids } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      destroyOnClose
      title={t('delete_mutes.title')}
      visible={visible}
      onCancel={onCancel}
      onOk={() => {
        Modal.confirm({
          title: t('delete_mutes.alert_message'),
          onOk() {
            form.validateFields().then((values) => {
              const group_ids = gids && gids !== '-2' ? gids.split(',').map((id) => Number(id)) : undefined;
              deleteAlertMutes({
                group_ids,
                timestamp: moment().subtract(values.month, 'months').unix(),
              }).then((res) => {
                if (typeof res.dat === 'string') {
                  message.success(res.dat);
                }
                onOk();
              });
            });
          },
        });
      }}
    >
      <Alert className='mb-4' message={t('delete_mutes.alert_message')} type='warning' showIcon />
      <Form form={form} layout='vertical'>
        <Form.Item label={t('delete_mutes.timestamp')} name='month' initialValue={3} rules={[{ required: true }]}>
          <Select
            options={[
              {
                label: t('delete_mutes.timestamp_options.1'),
                value: 1,
              },
              {
                label: t('delete_mutes.timestamp_options.3'),
                value: 3,
              },
              {
                label: t('delete_mutes.timestamp_options.6'),
                value: 6,
              },
              {
                label: t('delete_mutes.timestamp_options.12'),
                value: 12,
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
