import React, { useMemo, useState } from 'react';
import { Form, Dropdown, Button, Input, Space } from 'antd';
import { PlusOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { Bell, Check, ExternalLink, Eye, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { getNotificationChannelTypes } from '@/pages/notificationChannels/constants';
import { useFormNGData } from '../context';

const channelTypes = getNotificationChannelTypes();

/** 取通知规则第一条通知媒介配置的副标题 */
function getRuleSubtitle(rule: { notify_configs?: { channel_id: number; params?: Record<string, any>; user_group_names?: string[]; user_names?: string[] }[] }) {
  const firstConfig = rule.notify_configs?.[0];
  if (!firstConfig) return '';

  const separator = '、';
  const userGroupsAndUserNames = _.join(_.compact(_.concat(firstConfig.user_group_names, firstConfig.user_names)), separator);

  if (userGroupsAndUserNames) return userGroupsAndUserNames;

  const params = firstConfig.params || {};
  if (params.bot_name) return params.bot_name;
  if (params.callback_url) return params.callback_url;

  return '';
}

/** 根据通知媒介 ident 获取图标 */
function getRuleIcon(ident?: string) {
  if (!ident) return null;

  const typeConfig = (channelTypes as Record<string, { logo?: string }>)[ident];

  if (typeConfig?.logo) {
    return <img src={typeConfig.logo} alt={ident} height={16} className='mr-3 shrink-0' />;
  }

  return null;
}

type NotifyConfig = { channel_id: number; ident?: string; params?: Record<string, any>; user_group_names?: string[]; user_names?: string[] };

type RuleItemData = {
  id: number;
  name: string;
  notify_configs?: NotifyConfig[];
};

interface NotificationRuleItemProps {
  rule: RuleItemData;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  showViewButton?: 'hover' | 'always';
  onRemove?: () => void;
  className?: string;
}

function NotificationRuleItem({ rule, showCheckbox, isSelected, onClick, showViewButton = 'hover', onRemove, className = '' }: NotificationRuleItemProps) {
  const { t } = useTranslation('alertRules');
  const subtitle = getRuleSubtitle(rule);
  const configCount = rule.notify_configs?.length ?? 0;
  const firstIdent = rule.notify_configs?.[0]?.ident;
  const icon = getRuleIcon(firstIdent);

  return (
    <div className={`flex items-center px-3 py-2 ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
      {showCheckbox &&
        (isSelected ? (
          <div className='w-[14px] h-[14px] rounded-full bg-[var(--fc-violet-11)] flex items-center justify-center mr-3 shrink-0'>
            <Check size={10} className='text-white' strokeWidth={3} />
          </div>
        ) : (
          <div className='w-[14px] h-[14px] rounded-full border border-[var(--fc-violet-11)] mr-3 shrink-0' />
        ))}
      {icon || <Bell size={16} className='mr-3 shrink-0 text-soft' />}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-1'>
          <span className='font-bold leading-[1.4] max-w-[500px] truncate'>{rule.name}</span>
          {configCount > 1 && <span className='px-1 py-0 rounded text-[10px] bg-primary/10 text-primary shrink-0'>{t('notify_rule_total', { total: configCount })}</span>}
        </div>
        {subtitle && <div className='leading-[1.4] text-soft mt-0.5 truncate'>{subtitle}</div>}
      </div>
      {showViewButton === 'always' && (
        <Button
          type='text'
          size='small'
          className='flex items-center gap-1 shrink-0 ml-2'
          target='_blank'
          href={`/notification-rules/edit/${rule.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Eye size={12} />
          {t('notify_rule_view')}
        </Button>
      )}
      {showViewButton === 'hover' && (
        <Button
          type='text'
          size='small'
          className='opacity-0 group-hover:opacity-100 flex items-center gap-1'
          target='_blank'
          href={`/notification-rules/edit/${rule.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Eye size={12} />
          {t('notify_rule_view')}
        </Button>
      )}
      {onRemove && (
        <Button
          type='text'
          size='small'
          className='shrink-0 ml-1 text-soft hover:text-title flex items-center'
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
}

interface Props {
  label?: React.ReactNode;
}

export default function NotificationRuleDropdownSelect(props: Props) {
  const { t } = useTranslation('alertRules');
  const { permissions, notificationRules, notificationRulesLoading, refreshNotificationRules } = useFormNGData();
  const isAuthorized = permissions.notificationRules;

  const form = Form.useFormInstance();
  const selectedIds = Form.useWatch('notify_rule_ids') || [];

  const [searchText, setSearchText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredRules = useMemo(() => {
    if (!searchText) return notificationRules;
    return _.filter(notificationRules, (item) => {
      return item.name.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [notificationRules, searchText]);

  const selectedRules = useMemo(() => {
    return notificationRules.filter((rule) => selectedIds.includes(rule.id));
  }, [notificationRules, selectedIds]);

  const toggleRule = (id: number) => {
    const current = [...selectedIds];
    const idx = current.indexOf(id);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(id);
    }
    form.setFieldsValue({ notify_rule_ids: current });
  };

  const overlay = (
    <div className='min-w-[500px] max-h-[480px] flex flex-col rounded bg-fc-100 fc-border n9e-base-shadow'>
      <div
        className='px-3 py-2'
        style={{
          borderBottom: '1px solid var(--fc-border-color)',
        }}
      >
        <Input.Search placeholder={t('common:search_placeholder')} value={searchText} onChange={(e) => setSearchText(e.target.value)} onSearch={() => {}} allowClear />
      </div>
      <div className='flex-1 overflow-y-auto max-h-[320px]'>
        {filteredRules.map((rule) => {
          const isSelected = selectedIds.includes(rule.id);
          return (
            <NotificationRuleItem
              key={rule.id}
              rule={rule}
              showCheckbox
              isSelected={isSelected}
              onClick={() => toggleRule(rule.id)}
              showViewButton='hover'
              className={`group transition-colors duration-200 hover:bg-[var(--fc-violet-1)] ${isSelected ? ' bg-[var(--fc-violet-2)]' : ''}`}
            />
          );
        })}
        {filteredRules.length === 0 && <div className='px-3 py-6 text-center'>{t('common:nodata')}</div>}
      </div>
      <div
        className='px-3 py-2 flex justify-between items-center'
        style={{
          borderTop: '1px solid var(--fc-border-color)',
          fontSize: '11px',
        }}
      >
        <span className='text-soft'>{t('notify_rule_footer_total', { total: filteredRules.length })}</span>
        <Link to='/notification-rules' target='_blank'>
          {t('notify_rule_manage')} <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <Form.Item name='notify_rule_ids' hidden />
      <div className='mb-2'>
        <Space>
          {t('notify_rule_ids')}
          {isAuthorized && (
            <Link to='/notification-rules' target='_blank'>
              <SettingOutlined />
            </Link>
          )}
          {isAuthorized && (
            <SyncOutlined
              spin={notificationRulesLoading}
              onClick={(e) => {
                refreshNotificationRules();
                e.preventDefault();
              }}
            />
          )}
        </Space>
      </div>
      {selectedRules.length > 0 && (
        <div className='mb-2 space-y-1'>
          {selectedRules.map((rule) => (
            <NotificationRuleItem key={rule.id} rule={rule} showViewButton='always' onRemove={() => toggleRule(rule.id)} className='fc-border rounded' />
          ))}
        </div>
      )}
      <Dropdown overlay={overlay} trigger={['click']} placement='bottomLeft' visible={dropdownOpen} onVisibleChange={setDropdownOpen}>
        <Button type='dashed' icon={<PlusOutlined />} className='w-full justify-start text-left mb-4'>
          {t('notify_rule_select')}
        </Button>
      </Dropdown>
    </>
  );
}
