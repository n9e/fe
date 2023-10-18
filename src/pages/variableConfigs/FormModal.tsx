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
import { Form, Input, Modal, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { RsaEncry } from '@/utils/rsa';
import { VariableConfig, RASConfig } from './types';
import Password from './components/Password';

interface Props {
  data?: VariableConfig;
  title: string;
  rsaConfig: RASConfig;
  onOk: (data: VariableConfig) => Promise<void>;
}

function FormModal(props: Props & ModalWrapProps) {
  const { t } = useTranslation('variableConfigs');
  const { visible, destroy, data, title, rsaConfig, onOk } = props;
  const [form] = Form.useForm();
  const encrypted = Form.useWatch('encrypted', form);

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      onOk={() => {
        form.validateFields().then((values) => {
          const toBeEncrypted = values.toBeEncrypted;
          values.encrypted = values.encrypted ? 1 : 0;
          delete values.toBeEncrypted;
          if (toBeEncrypted && values.encrypted === 1) {
            values.cval = RsaEncry(values.cval, rsaConfig.RSAPublicKey);
          }
          onOk(values).then(() => {
            destroy();
          });
        });
      }}
    >
      <Form form={form} initialValues={data} layout='vertical'>
        <Form.Item
          name='ckey'
          label={t('ckey')}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name='toBeEncrypted' hidden>
          <div />
        </Form.Item>
        <Form.Item name='encrypted' label={t('isEncrypted')} valuePropName='checked'>
          <Switch
            onChange={() => {
              form.setFieldsValue({
                cval: undefined,
              });
            }}
          />
        </Form.Item>
        {encrypted ? (
          <Form.Item
            name='cval'
            label={t('cval')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Password
              disabled={!!data}
              onChange={() => {
                form.setFieldsValue({
                  toBeEncrypted: true,
                });
              }}
            />
          </Form.Item>
        ) : (
          <Form.Item
            name='cval'
            label={t('cval')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
        )}
        <Form.Item name='note' label={t('common:table.note')}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<Props>(FormModal);
