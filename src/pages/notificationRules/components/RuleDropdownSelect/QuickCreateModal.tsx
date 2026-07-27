import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Form, Input, Modal, Select, message } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { getTeamInfoList } from '@/services/manage';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { getNotificationChannelTypes } from '@/pages/notificationChannels/constants';

import { NS } from '../../constants';
import { tryParseWebhookInput, suggestQuickRuleName, quickCreateNotifyRule, QuickCreateError } from './quickCreate';

const channelTypes = getNotificationChannelTypes() as Record<string, { logo?: string }>;

interface Props {
  visible: boolean;
  onCancel: () => void;
  /** 创建或复用成功后回调，父级负责刷新列表并选中该规则 */
  onSuccess: (ruleId: number, reused: boolean) => void;
}

export default function QuickCreateModal(props: Props) {
  const { t } = useTranslation(NS);
  const { visible, onCancel, onSuccess } = props;
  const [form] = Form.useForm();
  const [teams, setTeams] = useState<{ id: number; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // 名称自动生成：仅当名称为空或仍是上次自动生成值时覆盖，用户手动改过则不再干预
  const lastAutoNameRef = useRef<string>();

  const canReadChannels = useIsAuthorized(['/notification-channels']);
  const canCreateChannels = useIsAuthorized(['/notification-channels/add']);

  const urlValue = Form.useWatch('url', form);
  const parseResult = useMemo(() => {
    const trimmed = _.trim(urlValue || '');
    if (!trimmed) return undefined;
    return tryParseWebhookInput(trimmed);
  }, [urlValue]);

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    lastAutoNameRef.current = undefined;
    getTeamInfoList().then((res) => {
      const list = res.dat ?? [];
      setTeams(list);
      // 预填第一个团队：后端要求非管理员创建时授权团队须含自己所在团队
      if (list.length > 0 && _.isEmpty(form.getFieldValue('user_group_ids'))) {
        form.setFieldsValue({ user_group_ids: [list[0].id] });
      }
    });
  }, [visible]);

  const handleUrlChange = (value: string) => {
    const suggestion = suggestQuickRuleName(value);
    if (!suggestion) return;
    const current = form.getFieldValue('name');
    if (current && current !== lastAutoNameRef.current) return;
    form.setFieldsValue({ name: suggestion });
    lastAutoNameRef.current = suggestion;
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const result = tryParseWebhookInput(_.trim(values.url));
      if (!result.ok) return;
      setSubmitting(true);
      quickCreateNotifyRule({
        parsed: result.parsed,
        name: _.trim(values.name),
        userGroupIds: values.user_group_ids,
        canReadChannels,
        canCreateChannels,
      })
        .then(({ ruleId, reused }) => {
          message.success(reused ? t('rule_select.quick_create.reused_rule') : t('rule_select.quick_create.created'));
          onSuccess(ruleId, reused);
          onCancel();
        })
        .catch((e) => {
          // 接口层错误由 utils/request 统一弹 notification，这里只提示快捷创建自身的业务错误
          if (e instanceof QuickCreateError && e.message) {
            message.error(e.message);
          }
        })
        .finally(() => {
          setSubmitting(false);
        });
    });
  };

  const detectedHint = (() => {
    if (!parseResult || !parseResult.ok) return null;
    const { ident, channelName, token } = parseResult.parsed;
    const logo = channelTypes[ident]?.logo;
    const displayName = t(`notification-channels:types.${ident}`, { defaultValue: channelName });
    return (
      <div className='mt-1 flex items-center gap-1 text-success'>
        <CheckCircleFilled />
        {logo && <img src={logo} alt={ident} height={14} />}
        <span>{t('rule_select.quick_create.detected', { channel: displayName, suffix: token.length >= 4 ? token.slice(-4) : token })}</span>
      </div>
    );
  })();

  return (
    <Modal
      title={t('rule_select.quick_create.title')}
      visible={visible}
      width={560}
      destroyOnClose
      maskClosable={!submitting}
      confirmLoading={submitting}
      okText={t('rule_select.quick_create.submit')}
      onOk={handleSubmit}
      onCancel={() => {
        if (submitting) return;
        onCancel();
      }}
    >
      <div className='text-soft mb-4'>{t('rule_select.quick_create.hint')}</div>
      <Form form={form} layout='vertical'>
        <Form.Item
          label={t('rule_select.quick_create.url_label')}
          name='url'
          validateFirst
          rules={[
            { required: true, message: t('rule_select.quick_create.url_required') },
            {
              validator: (_rule, value) => {
                const trimmed = _.trim(value || '');
                if (!trimmed) return Promise.resolve();
                const result = tryParseWebhookInput(trimmed);
                return result.ok ? Promise.resolve() : Promise.reject(new Error(result.error));
              },
            },
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} placeholder={t('rule_select.quick_create.url_placeholder')} onChange={(e) => handleUrlChange(e.target.value)} />
        </Form.Item>
        {detectedHint}
        <Form.Item label={t('rule_select.quick_create.name_label')} name='name' className='mt-4' rules={[{ required: true, message: t('rule_select.quick_create.name_required') }]}>
          <Input placeholder={t('rule_select.quick_create.name_placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('user_group_ids')}
          name='user_group_ids'
          tooltip={t('user_group_ids_tip')}
          rules={[{ required: true, message: t('rule_select.quick_create.user_group_required') }]}
        >
          <Select
            mode='multiple'
            showSearch
            optionFilterProp='label'
            options={_.map(teams, (team) => ({ label: team.name, value: team.id }))}
            placeholder={t('rule_select.quick_create.user_group_placeholder')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
