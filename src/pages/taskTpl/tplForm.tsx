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
import React, { useEffect, useContext } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Button, Form, Input, InputNumber, Select, Space, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import Editor from './editor';
import hostsFilterModal from './hostsFilterModal';
import './style.less';

const FormItem = Form.Item;
const { TextArea } = Input;

const TplForm = (props) => {
  const { t } = useTranslation('common');
  const [form] = Form.useForm();
  const { businessGroup } = useContext(CommonStateContext);
  const hosts = Form.useWatch('hosts', form);

  useEffect(() => {
    // 获取服务列表
  });

  const handleSubmit = (values) => {
    props.onSubmit({
      ...values,
      hosts: _.split(values.hosts, '\n'),
    });
  };

  const { initialValues, type } = props;

  return (
    <div className='job-tpl-form'>
      <Form onFinish={handleSubmit} form={form} layout='vertical'>
        <Form.Item name='group_id' initialValue={initialValues.group_id} hidden>
          <div />
        </Form.Item>
        <FormItem
          label={
            <>
              <strong>Title:</strong>
              {type === 'tpl' ? t('tpl.title.tpl.help') : t('tpl.title.task.help')}
            </>
          }
          name='title'
          initialValue={initialValues.title}
          rules={[{ required: true, message: '必填项！' }]}
        >
          <Input />
        </FormItem>
        {type === 'tpl' ? (
          <FormItem
            label={
              <>
                <strong>Tags:</strong>
                {t('tpl.tags.help')}
              </>
            }
            name='tags'
            initialValue={initialValues.tags}
          >
            <Select mode='tags' open={false} style={{ width: '100%' }} />
          </FormItem>
        ) : null}
        <FormItem
          label={
            <>
              <strong>Account:</strong>
              {t('tpl.account.help')}
            </>
          }
          name='account'
          initialValue={initialValues.account}
          rules={[{ required: true, message: '必填项！' }]}
        >
          <Input />
        </FormItem>
        <FormItem
          label={
            <>
              <strong>Batch:</strong>
              {t('tpl.batch.help')}
            </>
          }
          name='batch'
          initialValue={initialValues.batch}
          rules={[{ required: true, message: '必填项！' }]}
        >
          <InputNumber min={0} />
        </FormItem>
        <FormItem
          label={
            <>
              <strong>Tolerance:</strong>
              {t('tpl.tolerance.help')}
            </>
          }
          name='tolerance'
          initialValue={initialValues.tolerance}
          rules={[{ required: true, message: '必填项！' }]}
        >
          <InputNumber min={0} />
        </FormItem>
        <FormItem
          label={
            <>
              <strong>Timeout:</strong>
              {t('tpl.timeout.help')}
            </>
          }
          name='timeout'
          initialValue={initialValues.timeout}
        >
          <InputNumber min={0} />
        </FormItem>
        <FormItem
          label={
            <>
              <strong>Host:</strong>
              <Space>
                {t('tpl.host.help')}
                <Button
                  type='link'
                  style={{ padding: 0 }}
                  onClick={() => {
                    hostsFilterModal({
                      group_id: businessGroup.id!,
                      onOk: (hosts) => {
                        form.setFieldsValue({
                          hosts: _.join(_.map(hosts, 'ident'), '\n'),
                        });
                      },
                    });
                  }}
                >
                  {t('tpl.host.filter_btn')}
                </Button>
                <Tag color='orange'>{t('tpl.host.help2')}</Tag>
              </Space>
            </>
          }
          name='hosts'
          initialValue={_.join(initialValues.hosts, '\n')}
          rules={[{ required: type !== 'tpl', message: '必填项！' }]}
        >
          <TextArea autoSize={{ minRows: 3, maxRows: 8 }} />
        </FormItem>
        <FormItem
          label={
            <span>
              <strong>Pause:</strong>
              {t('tpl.pause.help')}
            </span>
          }
          name='pause'
          initialValue={initialValues.pause ? _.split(initialValues.pause, ',') : []}
        >
          <Select
            mode='multiple'
            options={
              hosts
                ? _.map(_.split(hosts, '\n'), (item) => {
                    return { label: item, value: item };
                  })
                : []
            }
          />
        </FormItem>
        <FormItem
          label={
            <>
              <strong>Script:</strong>
              {t('tpl.script.help')}
            </>
          }
          name='script'
          initialValue={initialValues.script}
          rules={[{ required: true, message: '必填项！' }]}
        >
          <Editor />
        </FormItem>
        <FormItem
          label={
            <span>
              <strong>Args:</strong>
              {t('tpl.args.help')}
            </span>
          }
          name='args'
          initialValue={initialValues.args}
        >
          <Input />
        </FormItem>
        <FormItem>{props.footer}</FormItem>
      </Form>
    </div>
  );
};

TplForm.defaultProps = {
  type: 'tpl', // tpl || task
  initialValues: {
    title: '',
    batch: 0,
    tolerance: 0,
    timeout: 30,
    pause: '',
    script: '#!/bin/bash\n# e.g.\nexport PATH=/usr/local/bin:/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/sbin:~/bin\nss -tln',
    args: '',
    tags: undefined,
    account: 'root',
    hosts: [],
    treeData: [],
  },
  onSubmit: () => {},
};

export default withRouter(TplForm);
