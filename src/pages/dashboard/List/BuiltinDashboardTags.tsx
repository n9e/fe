import React, { useEffect, useState } from 'react';
import { Button, Form, Select, Space, Tag, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { mergeSnmpTemplateTags, splitSnmpTemplateTags } from './snmpTemplateTags';

interface CollectTemplate {
  id: number;
  name: string;
  device_type?: string;
  brand?: string;
  models?: string[];
}

interface CollectTemplateSelectProps {
  id: string;
  value?: string;
  onChange: (name?: string) => void;
}

function CollectTemplateSelect({ id, value, onChange }: CollectTemplateSelectProps) {
  const { t } = useTranslation('dashboard');
  const canReadTemplates = useIsAuthorized(['/collect-tpls']);
  const [templates, setTemplates] = useState<CollectTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!canReadTemplates) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    request('/api/n9e-plus/collect-tpls', { method: RequestMethod.Get })
      .then((response) => {
        if (!cancelled) setTemplates(Array.isArray(response.dat) ? response.dat : []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canReadTemplates, retry]);

  return (
    <>
      <Tooltip title={!canReadTemplates ? t('save_builtin.collect_templates_no_permission') : undefined}>
        <Select
          id={id}
          showSearch
          allowClear
          value={value}
          onChange={onChange}
          loading={canReadTemplates && loading}
          disabled={!canReadTemplates || failed ? true : undefined}
          placeholder={t('save_builtin.collect_templates_placeholder')}
          optionFilterProp='search'
          optionLabelProp='label'
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ minWidth: 0, maxWidth: 'calc(100vw - 32px)' }}
        >
          {(canReadTemplates ? templates : []).map((item) => (
            <Select.Option key={item.id} value={item.name} label={item.name} search={[item.name, item.device_type, item.brand, ...(item.models || [])].join(' ')}>
              <div
                title={[item.name, item.device_type, item.brand, item.models?.join(', ')].filter(Boolean).join(' · ')}
                style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 4, minWidth: 0, whiteSpace: 'nowrap', overflowX: 'auto' }}
              >
                <span title={item.name} style={{ minWidth: 0, maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </span>
                {[
                  { key: 'device_type', text: item.device_type },
                  { key: 'brand', text: item.brand },
                  { key: 'models', text: item.models?.join(', ') },
                ].map(({ key, text }) =>
                  text ? (
                    <Tag
                      key={key}
                      title={text}
                      style={key === 'models' ? { marginRight: 0, minWidth: 0, flexShrink: 10, overflow: 'hidden', textOverflow: 'ellipsis' } : { marginRight: 0, flexShrink: 0 }}
                    >
                      {t(`collect-tpls:${key}`)}: {key === 'models' && text.length > 40 ? `${text.slice(0, 40)}...` : text}
                    </Tag>
                  ) : null,
                )}
              </div>
            </Select.Option>
          ))}
        </Select>
      </Tooltip>
      {canReadTemplates && failed && (
        <Space role='alert'>
          <span>{t('save_builtin.collect_templates_failed')}</span>
          <Button type='link' size='small' onClick={() => setRetry((current) => current + 1)}>
            {t('common:btn.reload')}
          </Button>
        </Space>
      )}
    </>
  );
}

interface Props {
  id?: string;
  value?: string[];
  onChange?: (tags: string[]) => void;
  isSnmp: boolean;
}

export default function BuiltinDashboardTags({ id = 'tags', value = [], onChange, isSnmp }: Props) {
  const { t } = useTranslation('dashboard');
  const { normalTags, templateNames } = splitSnmpTemplateTags(value);

  return (
    <>
      {isSnmp && (
        <Form.Item label={t('save_builtin.collect_templates')} htmlFor={`${id}_collect_templates`}>
          <CollectTemplateSelect id={`${id}_collect_templates`} value={templateNames[0]} onChange={(name) => onChange?.(mergeSnmpTemplateTags(normalTags, name))} />
        </Form.Item>
      )}
      <Form.Item label={t('save_builtin.tags')} htmlFor={id}>
        <Select
          id={id}
          mode='tags'
          tokenSeparators={[' ']}
          open={false}
          allowClear
          value={isSnmp ? normalTags : value}
          onChange={(tags: string[]) => onChange?.(isSnmp ? mergeSnmpTemplateTags(tags, templateNames[0]) : tags)}
        />
      </Form.Item>
    </>
  );
}
