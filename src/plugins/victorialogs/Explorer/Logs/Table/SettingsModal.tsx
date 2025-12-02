import React, { useEffect } from 'react';
import { Modal, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NAME_SPACE } from '../../../constants';

import { Settings } from './index';
import CheckboxList from './CheckboxList';

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

  useEffect(() => {
    if (settingsModalVisible) {
      form.setFieldsValue(settings);
    }
  }, [settingsModalVisible]);

  return (
    <Modal
      title={t('explorer.table_view_settings.title')}
      visible={settingsModalVisible}
      destroyOnClose
      onCancel={() => setSettingsModalVisible(false)}
      onOk={() => {
        form.validateFields().then((values) => {
          setSettings({
            ...settings,
            ...values,
          });
          setSettingsModalVisible(false);
        });
      }}
    >
      <Form layout='vertical' form={form}>
        <Form.Item name='customize_columns' label={t('explorer.table_view_settings.customize_columns')}>
          <CheckboxList fields={fields} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
