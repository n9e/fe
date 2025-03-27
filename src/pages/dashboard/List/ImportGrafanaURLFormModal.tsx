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
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { updateDashboard, getDashboard, updateDashboardConfigs } from '@/services/dashboardV2';
import { IDashboard, IDashboardConfig } from '../types';
import { JSONParse } from '../utils';

interface Props {
  initialValues?: IDashboard;
  onOk?: () => void;
}

function index(props: Props & ModalWrapProps) {
  const { t } = useTranslation('dashboard');
  const { visible, destroy, initialValues, onOk } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues?.id) {
      getDashboard(initialValues.id).then((res) => {
        let configs = {} as IDashboardConfig;
        try {
          configs = JSONParse(res.configs);
        } catch (e) {
          console.warn(e);
        }
        form.setFieldsValue({
          graphTooltip: configs.graphTooltip,
          graphZoom: configs.graphZoom,
        });
      });
    }
  }, [initialValues?.id]);

  return (
    <Modal
      destroyOnClose
      title={t('edit_title')}
      visible={visible}
      onCancel={destroy}
      onOk={() => {
        if (initialValues?.id) {
          form.validateFields().then(async (values) => {
            const result = await updateDashboard(initialValues.id, {
              name: values.name,
              ident: values.ident,
              tags: _.join(values.tags, ' '),
            });
            message.success(t('common:success.edit'));
            if (result) {
              const configs = JSONParse(result.configs);
              await updateDashboardConfigs(result.id, {
                configs: JSON.stringify({
                  ...configs,
                  iframe_url: values.iframe_url,
                }),
              });
            }
            if (onOk) {
              onOk();
            }
            destroy();
          });
        }
      }}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          name: initialValues?.name,
          ident: initialValues?.ident,
          tags: initialValues?.tags ? _.split(initialValues.tags, ' ') : undefined,
          iframe_url: initialValues?.configs?.iframe_url,
        }}
      >
        <Form.Item
          label={t('name')}
          name='name'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('ident')}
          name='ident'
          rules={[
            {
              pattern: /^[a-zA-Z0-9\-]*$/,
              message: t('ident_msg'),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={t('tags')} name='tags'>
          <Select mode='tags' tokenSeparators={[' ']} open={false} />
        </Form.Item>
        <Form.Item
          label={t('batch.import_grafana_url_label')}
          name='iframe_url'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 2 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<Props>(index);
