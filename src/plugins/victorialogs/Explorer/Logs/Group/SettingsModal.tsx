import React, { useEffect } from 'react';
import { Modal, Form, Select, Input } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';

import { NAME_SPACE, UNGROUPED_VALUE, DEFAULT_DISPLAY_FIELD } from '../../../constants';

import { Settings } from './index';

interface Props {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  settingsModalVisible: boolean;
  setSettingsModalVisible: (visible: boolean) => void;
  fields: string[];
}

export default function SettingsModal(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { settings, setSettings, settingsModalVisible, setSettingsModalVisible, fields } = props;
  const [form] = Form.useForm();
  const date_format = Form.useWatch('date_format', form);

  useEffect(() => {
    if (settingsModalVisible) {
      form.setFieldsValue(settings);
    }
  }, [settingsModalVisible]);

  return (
    <Modal
      title={t('explorer.group_view_settings.title')}
      visible={settingsModalVisible}
      destroyOnClose
      onCancel={() => setSettingsModalVisible(false)}
      onOk={() => {
        form.validateFields().then((values) => {
          setSettings({
            ...settings,
            ...values,
            display_default_field_changed: !_.isEqual(values.display_fields, [DEFAULT_DISPLAY_FIELD]),
          });
          setSettingsModalVisible(false);
        });
      }}
    >
      <Form layout='vertical' form={form}>
        <Form.Item name='group_by_field' label={t('explorer.group_view_settings.group_by_field')} help={t('explorer.group_view_settings.group_by_field_help')} className='mb-4'>
          <Select
            options={_.map(_.concat(UNGROUPED_VALUE, fields), (item) => {
              return {
                label: item === UNGROUPED_VALUE ? t('explorer.group_view_settings.ungrouped') : item,
                value: item,
              };
            })}
            showSearch
            optionFilterProp='label'
          />
        </Form.Item>
        <Form.Item name='display_fields' label={t('explorer.group_view_settings.display_fields')} help={t('explorer.group_view_settings.display_fields_help')} className='mb-4'>
          <Select
            mode='multiple'
            options={_.map(fields, (item) => {
              return {
                label: item,
                value: item,
              };
            })}
            showSearch
            optionFilterProp='label'
            onChange={(val) => {
              if (val.length === 0) {
                form.setFieldsValue({
                  display_fields: [DEFAULT_DISPLAY_FIELD],
                });
              }
            }}
          />
        </Form.Item>
        <Form.Item
          name='date_format'
          label={t('explorer.group_view_settings.date_format')}
          help={
            <div>
              <div>
                <Trans
                  ns={NAME_SPACE}
                  i18nKey={`${NAME_SPACE}:explorer.group_view_settings.date_format_help01`}
                  components={{ a: <a href='https://day.js.org/docs/en/display/format' target='_blank' /> }}
                />
              </div>
              <div>
                {t('explorer.group_view_settings.date_format_help02', {
                  dateFormat: moment().format(date_format),
                })}
              </div>
            </div>
          }
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
