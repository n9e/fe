import React, { useEffect, useState } from 'react';
import { Form, Select, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { getItems as getNotificationTemplates } from '@/pages/notificationTemplates/services';

import { NS } from '../../constants';

interface Props {
  field: FormListFieldData;
}

export default function TemplateSelect(props: Props) {
  const { t } = useTranslation(NS);
  const { field } = props;
  const [options, setOptions] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const form = Form.useFormInstance();
  const channel_id = Form.useWatch(['notify_configs', field.name, 'channel_id']);
  const template_id = Form.useWatch(['notify_configs', field.name, 'template_id']);
  const fetchData = (channel_id) => {
    if (channel_id) {
      setLoading(true);
      getNotificationTemplates(channel_id)
        .then((res) => {
          setOptions(
            _.map(res, (item) => {
              return {
                label: item.name,
                value: item.id,
              };
            }),
          );
          // 如果 template_id 不存在，且返回的模板列表不为空，则设置第一个模板为默认值
          if (res.length > 0 && template_id === undefined) {
            const formValues = _.cloneDeep(form.getFieldsValue());
            _.set(formValues, ['notify_configs', field.name, 'template_id'], res[0].id);
            form.setFieldsValue(formValues);
          }
        })
        .catch(() => {
          setOptions([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setOptions([]);
    }
  };

  useEffect(() => {
    fetchData(channel_id);
  }, [channel_id]);

  return (
    <Form.Item
      {...field}
      label={
        <Space size={4}>
          {t('notification_configuration.template')}
          <Tooltip className='n9e-ant-from-item-tooltip' title={t('notification_configuration.template_tip')}>
            <QuestionCircleOutlined />
          </Tooltip>
          <Link to='/notification-templates' target='_blank'>
            <SettingOutlined />
          </Link>
          <SyncOutlined
            spin={loading}
            onClick={(e) => {
              fetchData(channel_id);
              e.preventDefault();
            }}
          />
        </Space>
      }
      name={[field.name, 'template_id']}
      rules={[{ required: true }]}
    >
      <Select options={options} showSearch optionFilterProp='label' />
    </Form.Item>
  );
}
