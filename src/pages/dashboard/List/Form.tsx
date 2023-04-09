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
import _ from 'lodash';
import { Form, Modal, Input, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { updateDashboard, createDashboard, updateDashboardConfigs, getDashboard } from '@/services/dashboardV2';
import { JSONParse } from '../utils';
import '../locale';

interface IProps {
  mode: 'create' | 'edit';
  initialValues?: any;
  busiId: number;
  refreshList: () => void;
}

const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
};

function FormCpt(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('dashboard');
  const { mode, initialValues = {}, visible, busiId, refreshList, destroy } = props;
  const [form] = Form.useForm();
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let result;

      if (mode === 'edit') {
        result = await updateDashboard(initialValues.id, {
          name: values.name,
          ident: values.ident,
          tags: _.join(values.tags, ' '),
        });
        message.success(t('common:success.edit'));
      } else if (mode === 'create') {
        result = await createDashboard(busiId, {
          name: values.name,
          ident: values.ident,
          tags: _.join(values.tags, ' '),
          configs: JSON.stringify({
            var: [],
            panels: [],
            version: '3.0.0',
          }),
        });
        message.success(t('common:success.create'));
      }
      if (result) {
        const configs = JSONParse(result.configs);
        await updateDashboardConfigs(result.id, {
          configs: JSON.stringify({
            ...configs,
            datasourceValue: values.datasourceValue,
          }),
        });
      }
      refreshList();
      destroy();
    } catch (error) {
      message.error('操作失败');
    }
  };

  useEffect(() => {
    if (initialValues.id) {
      getDashboard(initialValues.id).then((res) => {
        const configs = JSONParse(res.configs);
        form.setFieldsValue({
          datasourceValue: configs.datasourceValue,
        });
      });
    }
  }, [initialValues.id]);

  return (
    <Modal
      title={t(`${mode}_title`)}
      visible={visible}
      onOk={handleOk}
      onCancel={() => {
        destroy();
      }}
      destroyOnClose
    >
      <Form {...layout} form={form} preserve={false} initialValues={initialValues}>
        <Form.Item
          label={t('name')}
          name='name'
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}
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
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}
          rules={[
            {
              pattern: /^[a-zA-Z0-9\-]*$/,
              message: t('ident_msg'),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}
          label={t('tags')}
          name='tags'
        >
          <Select
            mode='tags'
            dropdownStyle={{
              display: 'none',
            }}
          />
        </Form.Item>
        {/* <Form.Item
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}
          label='默认关联数据源'
          name='datasourceValue'
        >
          <Select>
            {_.map([], (item) => {
              return (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item> */}
        <Form.Item name='id' hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC(FormCpt);
