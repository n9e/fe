import React, { useState } from 'react';
import _ from 'lodash';
import { Button, Modal, Form, Select, Space, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { name } from './';
import EventsModal from './EventsModal';
import { relabelTest } from './services';

export default function TestModal() {
  const { t } = useTranslation('alertRules');
  const eventRelabelConfig = Form.useWatch(name);
  const [visible, setVisible] = useState(false);
  const alertRuleForm = Form.useFormInstance();
  const [form] = Form.useForm();
  const tags = Form.useWatch('tags', form);
  const [result, setResult] = useState<string[]>();

  return (
    <>
      <Button
        ghost
        type='primary'
        className='mt2'
        disabled={_.isEmpty(eventRelabelConfig)}
        onClick={() => {
          const validateNamePaths = _.map(eventRelabelConfig, (item, index) => {
            if (item.action !== 'replace') {
              return [...name, index, 'regex'];
            }
            return [];
          });
          alertRuleForm.validateFields(validateNamePaths).then(() => {
            setVisible(true);
          });
        }}
      >
        {t('relabel.test_btn')}
      </Button>
      <Modal
        width={800}
        title={t('relabel.test.title')}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        footer={null}
      >
        <Form layout='vertical' form={form}>
          <Form.Item
            label={
              <Space>
                {t('relabel.test.label')}
                <EventsModal
                  onOk={(tags) => {
                    form.setFieldsValue({ tags: tags });
                    setResult(undefined);
                  }}
                />
              </Space>
            }
            name='tags'
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              mode='tags'
              tokenSeparators={[' ']}
              open={false}
              placeholder={t('relabel.source_labels_tip_placeholder')}
              onChange={() => {
                setResult(undefined);
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type='primary'
              onClick={() => {
                relabelTest({
                  configs: eventRelabelConfig,
                  tags: tags,
                }).then((res) => {
                  setResult(res);
                });
              }}
            >
              {t('relabel.test.btn')}
            </Button>
          </Form.Item>
          {result !== undefined && (
            <Form.Item label={t('relabel.test.result')}>
              {_.map(result, (item) => {
                return <Tag key={item}>{item}</Tag>;
              })}
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}
