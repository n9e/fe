import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Menu, Form, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import RecordingRuleForm, { ActionButtons } from '@/plus/pages/recordingRules/components/OperateForm';

import { NAME_SPACE } from '../../constants';

export default function AddTo() {
  const { t } = useTranslation(NAME_SPACE);
  const form = Form.useFormInstance();

  const [recordingRuleForm] = Form.useForm();
  const [addToRecordingRuleModalState, setAddToRecordingRuleModalState] = useState<{
    visible: boolean;
  }>({
    visible: false,
  });

  return (
    <>
      <Dropdown
        placement='bottomRight'
        overlay={
          <Menu
            items={[
              {
                label: t('query.add_to.recording_rule'),
                key: 'recording_rule',
              },
            ]}
            onClick={({ key }) => {
              if (key === 'recording_rule') {
                setAddToRecordingRuleModalState({
                  visible: true,
                });
              }
            }}
          />
        }
      >
        <Button size='small' type='primary' icon={<PlusOutlined />}>
          {t('query.add_to.btn')}
        </Button>
      </Dropdown>
      <Drawer
        title={t('query.add_to.add_recording_rule_title')}
        width='80%'
        visible={addToRecordingRuleModalState.visible}
        onClose={() => {
          setAddToRecordingRuleModalState({
            visible: false,
          });
        }}
        footer={
          <ActionButtons
            form={recordingRuleForm}
            onOk={() => {
              setAddToRecordingRuleModalState({
                visible: false,
              });
            }}
            onCancel={() => {
              setAddToRecordingRuleModalState({
                visible: false,
              });
            }}
          />
        }
      >
        {addToRecordingRuleModalState.visible && (
          <RecordingRuleForm
            form={recordingRuleForm}
            initialValues={{
              cron_pattern: '@every 60s',
              query_configs: [
                {
                  exp: '$A',
                  queries: [
                    {
                      cate: 'doris',
                      datasource_queries: [{ match_type: 0, op: 'in', values: [form.getFieldValue(['datasourceValue'])] }],
                      config: {
                        ref: 'A',
                        sql: form.getFieldValue(['query', 'sql']),
                        keys: {
                          valueKey: form.getFieldValue(['query', 'keys', 'valueKey']),
                          labelKey: form.getFieldValue(['query', 'keys', 'labelKey']),
                        },
                      },
                    },
                  ],
                },
              ],
            }}
          />
        )}
      </Drawer>
    </>
  );
}
