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
import { Form, Input, Button, message } from 'antd';
import { UpdatePwd } from '@/services/login';
import { useTranslation } from 'react-i18next';
import { getRSAConfig } from '@/services/login';
import { RsaEncry } from '@/utils/rsa';

export default function ChangePassword() {
  const { t } = useTranslation('account');
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      modifyPassword();
    } catch (e) {
      console.log(e);
    }
  };

  const modifyPassword = () => {
    const { oldpass, newpass } = form.getFieldsValue();
    getRSAConfig().then((res) => {
      const { OpenRSA, RSAPublicKey } = res.dat || {};
      const authOldpass = OpenRSA ? RsaEncry(oldpass, RSAPublicKey) : oldpass;
      const authNewpass = OpenRSA ? RsaEncry(newpass, RSAPublicKey) : newpass;
      UpdatePwd(authOldpass, authNewpass).then(() => {
        message.success(t('password.changeSuccess'));
      });
    });
  };

  return (
    <Form form={form} layout='vertical' requiredMark={true}>
      <Form.Item
        label={<span>{t('password.old')}:</span>}
        required
        name='oldpass'
        rules={[
          {
            required: true,
            message: t('password.oldMsg'),
          },
        ]}
      >
        <Input placeholder={t('password.oldMsg')} type='password' />
      </Form.Item>
      <Form.Item
        label={<span>{t('password.new')}:</span>}
        required
        name='newpass'
        hasFeedback
        validateTrigger='onChange'
        rules={[
          {
            required: true,
            message: t('password.newMsg'),
          },
          {
            pattern: /^(?![a-z]+$)(?![A-Z]+$)(?![0-9]+$)(?![#?!@$%^&*-]+$).{6,20}$/,
            message: t('password.ruleMsg'),
          },
        ]}
      >
        <Input
          placeholder={t('password.newMsg')}
          type='password'
          onChange={() => {
            form.validateFields(['newpassagain']);
          }}
        />
      </Form.Item>
      <Form.Item
        label={<span>{t('password.confirm')}: </span>}
        required
        name='newpassagain'
        hasFeedback
        validateTrigger='onChange'
        rules={[
          {
            required: true,
            message: t('password.confirmMsg'),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newpass') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(t('password.notMatch')));
            },
          }),
        ]}
      >
        <Input placeholder={t('password.confirmMsg')} type='password' />
      </Form.Item>

      <Form.Item>
        <Button type='primary' onClick={handleSubmit}>
          {t('save')}
        </Button>
      </Form.Item>
    </Form>
  );
}
