import React, { useEffect, useRef, useState } from 'react';
import { Alert, Form, Input, Modal, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';

import { getDashboard } from '@/services/dashboardV2';
import { getComponents, postPayloads } from '@/pages/builtInComponents/services';
import { Component, TypeEnum } from '@/pages/builtInComponents/types';
import { exportDataStringify } from './utils';
import BuiltinDashboardTags from './BuiltinDashboardTags';
import { mergeSnmpTemplateTags, splitSnmpTemplateTags } from './snmpTemplateTags';

interface Props {
  dashboard: { id: number; name: string; tags?: string; note?: string };
  onClose: () => void;
}

interface FormValues {
  component_id: number;
  name: string;
  tags?: string[];
  note?: string;
}

export default function SaveToBuiltinModal({ dashboard, onClose }: Props) {
  const { t } = useTranslation('dashboard');
  const [form] = Form.useForm<FormValues>();
  const componentId = Form.useWatch('component_id', form);
  const [components, setComponents] = useState<Component[]>([]);
  const [componentsLoading, setComponentsLoading] = useState(true);
  const [componentsLoadFailed, setComponentsLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const active = useRef(true);
  const submitting = useRef(false);
  const isSnmp = components.some((component) => component.id === componentId && component.ident.toLowerCase() === 'snmp');

  useEffect(() => {
    let cancelled = false;
    active.current = true;
    getComponents()
      .then((data) => {
        if (cancelled) return;
        const availableComponents: Component[] = Array.isArray(data) ? data : [];
        setComponents(availableComponents);
        const hasCollectTags = (dashboard.tags || '').split(/\s+/).some((tag) => tag === '__collect__' || tag.startsWith('__collect__:'));
        if (hasCollectTags && form.getFieldValue('component_id') == null) {
          const snmp = availableComponents.find((component) => component.ident.toLowerCase() === 'snmp');
          if (snmp) form.setFieldsValue({ component_id: snmp.id });
        }
      })
      .catch(() => {
        if (!cancelled) setComponentsLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setComponentsLoading(false);
      });
    return () => {
      cancelled = true;
      active.current = false;
      form.resetFields();
    };
  }, [form, dashboard.tags]);

  const unavailable = componentsLoading || componentsLoadFailed || components.length === 0;
  const close = () => {
    if (submitting.current) return;
    form.resetFields();
    onClose();
  };

  const save = async (values: FormValues) => {
    if (submitting.current || unavailable || !active.current) return;
    submitting.current = true;
    setSaving(true);
    setSaveError(undefined);
    try {
      let detail;
      try {
        detail = await getDashboard(dashboard.id);
      } catch {
        if (active.current) setSaveError(t('load_failed'));
        return;
      }
      if (!active.current) return;

      // The export helper tolerates malformed JSON; saving a template must not silently discard its configuration.
      try {
        const configs: unknown = JSON.parse(detail.configs);
        if (configs == null || typeof configs !== 'object' || Array.isArray(configs)) throw new Error('Invalid dashboard configs');
      } catch {
        setSaveError(t('save_builtin.invalid_configs'));
        return;
      }

      const name = values.name.trim();
      const { normalTags, templateNames } = splitSnmpTemplateTags(values.tags);
      const tags = (isSnmp ? mergeSnmpTemplateTags(normalTags, templateNames[0]) : values.tags || []).join(' ');
      const note = values.note || '';
      const uuid = Date.now() * 1000;
      const errors: Record<string, string> = await postPayloads([
        {
          type: TypeEnum.dashboard,
          component_id: values.component_id,
          cate: '',
          name,
          tags,
          uuid,
          content: exportDataStringify({ ...detail, name, tags, note, uuid }),
        },
      ]);
      if (!active.current) return;
      if (errors && Object.keys(errors).length > 0) {
        setSaveError(Object.values(errors).join('\n'));
        return;
      }
      message.success(t('save_builtin.success'));
      form.resetFields();
      onClose();
    } catch {
      if (active.current) setSaveError(t('save_builtin.failed'));
    } finally {
      submitting.current = false;
      if (active.current) setSaving(false);
    }
  };

  return (
    <Modal
      visible
      width={520}
      title={t('save_builtin.title')}
      okText={t('common:btn.save')}
      confirmLoading={saving}
      okButtonProps={{ disabled: unavailable }}
      cancelButtonProps={{ disabled: saving }}
      closable={!saving}
      maskClosable={!saving}
      keyboard={!saving}
      onOk={() => form.submit()}
      onCancel={close}
    >
      {(componentsLoadFailed || (!componentsLoading && components.length === 0)) && (
        <Alert
          showIcon
          type={componentsLoadFailed ? 'error' : 'info'}
          message={t(componentsLoadFailed ? 'save_builtin.components_load_failed' : 'save_builtin.no_components')}
          style={{ marginBottom: 16 }}
        />
      )}
      {saveError && <Alert showIcon type='error' message={saveError} style={{ marginBottom: 16, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }} />}
      <Form
        form={form}
        layout='vertical'
        initialValues={{ name: dashboard.name, tags: (dashboard.tags || '').split(/\s+/).filter(Boolean), note: dashboard.note || '' }}
        disabled={saving || unavailable}
        onFinish={save}
        preserve={false}
      >
        <Form.Item name='component_id' label={t('save_builtin.component')} rules={[{ required: true, message: t('save_builtin.component_required') }]}>
          <Select
            showSearch
            loading={componentsLoading}
            optionFilterProp='label'
            placeholder={t('save_builtin.component_required')}
            options={components.map((item) => ({
              value: item.id,
              label: item.disabled === 1 ? t('save_builtin.disabled_component', { name: item.ident }) : item.ident,
            }))}
          />
        </Form.Item>
        <Form.Item name='name' label={t('name')} rules={[{ required: true, whitespace: true, message: t('save_builtin.name_required') }]}>
          <Input />
        </Form.Item>
        <Form.Item name='tags' noStyle>
          <BuiltinDashboardTags isSnmp={isSnmp} />
        </Form.Item>
        <Form.Item name='note' label={t('common:table.note')}>
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
