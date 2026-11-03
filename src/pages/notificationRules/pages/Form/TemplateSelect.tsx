import React, { useEffect, useMemo } from 'react';
import { Form, Select, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { getItems as getNotificationTemplates } from '@/pages/notificationTemplates/services';
import type { Item } from '@/pages/notificationTemplates/services';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { PERM } from '@/pages/notificationTemplates/constants';

import { NS } from '../../constants';

interface Props {
  prefixNamePath?: (string | number)[];
  field: FormListFieldData;
}

export default function TemplateSelect(props: Props) {
  const { t } = useTranslation(NS);
  const { prefixNamePath = [], field } = props;
  const restField = _.omit(field, ['key', 'name']);
  const form = Form.useFormInstance();
  const watchedChannelId = Form.useWatch([...prefixNamePath, field.name, 'channel_id']);
  const channelId = typeof watchedChannelId === 'number' ? watchedChannelId : undefined;
  const template_id = Form.useWatch([...prefixNamePath, field.name, 'template_id']);
  const isAuthorized = useIsAuthorized([PERM]);
  const cacheKey = channelId != null ? `notify-rule-message-templates-${channelId}` : undefined;
  const { data, loading, error, refresh } = useRequest<{ channelId?: number; items: Item[] }, []>(
    () => {
      if (channelId == null) return Promise.resolve({ items: [] });
      return getNotificationTemplates(String(channelId)).then((items) => ({ channelId, items }));
    },
    {
      ready: channelId != null,
      refreshDeps: [channelId],
      cacheKey,
      // 同一媒介配置行共享请求；staleTime 为 0，保留手动刷新和重新打开时的最新数据语义。
      staleTime: 0,
      onError: () => {},
    },
  );
  const currentTemplates = useMemo(() => (data && data.channelId === channelId ? data.items : []), [data, channelId]);
  const options = useMemo(
    () =>
      _.map(error ? [] : currentTemplates, (item) => {
        return {
          label: item.name,
          value: item.id,
        };
      }),
    [currentTemplates, error],
  );

  useEffect(() => {
    // 仅使用当前媒介的模板列表设置默认值，避免写入其他媒介的模板 ID。
    const firstOption = options[0];
    if (!loading && !error && firstOption && template_id === undefined) {
      const formValues = _.cloneDeep(form.getFieldsValue());
      _.set(formValues, [...prefixNamePath, field.name, 'template_id'], firstOption.value);
      form.setFieldsValue(formValues);
    }
  }, [error, field.name, form, loading, options, template_id]);

  return (
    <Form.Item
      {...restField}
      label={
        <Space size={4}>
          {t('notification_configuration.template')}
          <Tooltip className='n9e-ant-from-item-tooltip' title={t('notification_configuration.template_tip')}>
            <QuestionCircleOutlined />
          </Tooltip>
          {isAuthorized && (
            <Link to='/notification-templates' target='_blank'>
              <SettingOutlined />
            </Link>
          )}
          <SyncOutlined
            spin={loading}
            onClick={(e) => {
              refresh();
              e.preventDefault();
            }}
          />
        </Space>
      }
      name={[field.name, 'template_id']}
      // rules={[{ required: true, message: t('notification_configuration.template_msg') }]}
    >
      <Select
        options={_.map(options, (item) => {
          return {
            label: (
              <Space>
                {item.label}
                {isAuthorized && (
                  <Link
                    to={{
                      pathname: '/notification-templates',
                      search: `id=${item.value}`,
                    }}
                    target='_blank'
                  >
                    {t('common:btn.view')}
                  </Link>
                )}
              </Space>
            ),
            optionLabel: item.label,
            value: item.value,
          };
        })}
        optionLabelProp='optionLabel'
        showSearch
        optionFilterProp='optionLabel'
      />
    </Form.Item>
  );
}
