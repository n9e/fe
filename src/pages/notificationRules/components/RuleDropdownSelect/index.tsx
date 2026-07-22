import React, { useMemo, useState } from 'react';
import { Form, Dropdown, Button, Input, Space, Drawer, Spin, message } from 'antd';
import { PlusOutlined, PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Rule } from 'antd/lib/form';
import { Bell, Check, ExternalLink, Eye, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { getNotificationChannelTypes } from '@/pages/notificationChannels/constants';

import { getItem as getNotificationRule, putItem as putNotificationRule, postItems as createNotificationRules, RuleItem } from '../../services';
import { NS, CN } from '../../constants';
import NotificationRuleForm from '../../pages/Form';
import { normalizeInitialValues } from '../../utils/normalizeValues';

const channelTypes = getNotificationChannelTypes();

type NotifyConfig = { channel_id: number; channel_ident?: string; params?: Record<string, any>; user_group_names?: string[]; user_names?: string[] };

export type RuleItemData = {
  id: number;
  name: string;
  notify_configs?: NotifyConfig[];
};

/** 取通知规则第一条通知媒介配置的副标题 */
function getRuleSubtitle(rule: RuleItemData) {
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

interface NotificationRuleItemProps {
  rule: RuleItemData;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  showViewButton?: 'hover' | 'always';
  onView?: (ruleId: number) => void;
  onRemove?: () => void;
  className?: string;
}

function NotificationRuleItem({ rule, showCheckbox, isSelected, onClick, showViewButton = 'hover', onView, onRemove, className = '' }: NotificationRuleItemProps) {
  const { t } = useTranslation(NS);
  const subtitle = getRuleSubtitle(rule);
  const configCount = rule.notify_configs?.length ?? 0;
  const firstIdent = rule.notify_configs?.[0]?.channel_ident;
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
          {configCount > 1 && <span className='px-1 py-0 rounded text-[10px] bg-primary/10 text-primary shrink-0'>{t('rule_select.total', { total: configCount })}</span>}
        </div>
        {subtitle && <div className='leading-[1.4] text-soft mt-0.5 truncate'>{subtitle}</div>}
      </div>
      {showViewButton === 'always' && (
        <Button
          type='text'
          size='small'
          className='flex items-center gap-1 shrink-0 ml-2'
          onClick={(e) => {
            e.stopPropagation();
            onView?.(rule.id);
          }}
        >
          <Eye size={12} />
          {t('rule_select.view')}
        </Button>
      )}
      {showViewButton === 'hover' && (
        <Button
          type='text'
          size='small'
          className='opacity-0 group-hover:opacity-100 flex items-center gap-1'
          onClick={(e) => {
            e.stopPropagation();
            onView?.(rule.id);
          }}
        >
          <Eye size={12} />
          {t('rule_select.view')}
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

interface ContentProps {
  value?: number[];
  onChange?: (value: number[]) => void;
  label?: React.ReactNode;
  required?: boolean;
  notificationRules: RuleItemData[];
  loading?: boolean;
  refresh?: () => void;
  isAuthorized?: boolean;
}

function Content(props: ContentProps) {
  const { t } = useTranslation(NS);
  const { value, onChange, label, required, notificationRules, loading, refresh, isAuthorized } = props;
  const selectedIds = value ?? [];

  const [searchText, setSearchText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [viewDrawerData, setViewDrawerData] = useState<RuleItem>();
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [shouldRestoreDropdownAfterDrawerClose, setShouldRestoreDropdownAfterDrawerClose] = useState(false);

  const filteredRules = useMemo(() => {
    if (!searchText) return notificationRules;
    return _.filter(notificationRules, (item) => {
      return item.name.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [notificationRules, searchText]);

  const selectedRules = useMemo(() => {
    return _.filter(notificationRules, (rule) => _.includes(selectedIds, rule.id));
  }, [notificationRules, selectedIds]);

  const toggleRule = (id: number) => {
    const current = [...selectedIds];
    const idx = current.indexOf(id);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(id);
    }
    onChange?.(current);
  };

  const handleOpenDrawer = () => {
    setShouldRestoreDropdownAfterDrawerClose(dropdownOpen);
    setDropdownOpen(false);
  };

  const handleCloseViewDrawer = () => {
    setViewDrawerVisible(false);
    setViewDrawerData(undefined);
  };

  const handleCloseCreateDrawer = () => {
    setCreateDrawerVisible(false);
  };

  const handleDrawerAfterVisibleChange = (visible: boolean) => {
    if (visible || !shouldRestoreDropdownAfterDrawerClose) return;
    setShouldRestoreDropdownAfterDrawerClose(false);
    setDropdownOpen(true);
  };

  const handleViewRule = (ruleId: number) => {
    handleOpenDrawer();
    setViewDrawerVisible(true);
    getNotificationRule(ruleId)
      .then((res) => {
        setViewDrawerData(normalizeInitialValues(res));
      })
      .catch(() => {
        handleCloseViewDrawer();
      });
  };

  const handleCreateRule = () => {
    handleOpenDrawer();
    setCreateDrawerVisible(true);
  };

  const handleDropdownVisibleChange = (visible: boolean) => {
    if (visible && (viewDrawerVisible || createDrawerVisible)) return;
    setDropdownOpen(visible);
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
          const isSelected = _.includes(selectedIds, rule.id);
          return (
            <NotificationRuleItem
              key={rule.id}
              rule={rule}
              showCheckbox
              isSelected={isSelected}
              onClick={() => toggleRule(rule.id)}
              showViewButton='hover'
              onView={handleViewRule}
              className={`group transition-colors duration-200 hover:bg-[var(--fc-violet-1)] ${isSelected ? ' bg-[var(--fc-violet-2)]' : ''}`}
            />
          );
        })}
        {filteredRules.length === 0 && (
          <div className='px-3 py-6 text-center'>
            <div className='text-soft'>{t('common:nodata')}</div>
            {isAuthorized && !searchText && (
              <Button type='link' size='small' icon={<PlusOutlined />} onClick={handleCreateRule}>
                {t('rule_select.create')}
              </Button>
            )}
          </div>
        )}
      </div>
      <div
        className='px-3 py-2 flex justify-between items-center'
        style={{
          borderTop: '1px solid var(--fc-border-color)',
          fontSize: '11px',
        }}
      >
        <span className='text-soft'>{t('rule_select.footer_total', { total: filteredRules.length })}</span>
        <Link to={`/${NS}`} target='_blank'>
          {t('rule_select.manage')} <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <div className='mb-2'>
        <Space>
          <span>
            {required && <span className='text-error mr-1'>*</span>}
            {label}
          </span>
          {isAuthorized && <PlusCircleOutlined className='cursor-pointer' onClick={handleCreateRule} />}
          {isAuthorized && refresh && (
            <SyncOutlined
              spin={loading}
              className='cursor-pointer'
              onClick={(e) => {
                refresh();
                e.preventDefault();
              }}
            />
          )}
        </Space>
      </div>
      {selectedRules.length > 0 && (
        <div className='mb-2 space-y-1'>
          {selectedRules.map((rule) => (
            <NotificationRuleItem key={rule.id} rule={rule} showViewButton='always' onView={handleViewRule} onRemove={() => toggleRule(rule.id)} className='fc-border rounded' />
          ))}
        </div>
      )}
      <Dropdown overlay={overlay} trigger={['click']} placement='bottomLeft' visible={dropdownOpen} onVisibleChange={handleDropdownVisibleChange}>
        <Button type='dashed' icon={<PlusOutlined />} className='w-full justify-start text-left'>
          {t('rule_select.select')}
        </Button>
      </Dropdown>
      <Drawer
        title={t('title')}
        placement='right'
        width='80%'
        destroyOnClose
        afterVisibleChange={handleDrawerAfterVisibleChange}
        onClose={handleCloseViewDrawer}
        visible={viewDrawerVisible}
      >
        <div className={`n9e ${CN}`}>
          {viewDrawerData ? (
            <NotificationRuleForm
              initialValues={viewDrawerData}
              onOk={(values) => {
                putNotificationRule(values).then(() => {
                  message.success(t('common:success.edit'));
                  handleCloseViewDrawer();
                  refresh?.();
                });
              }}
              onCancel={handleCloseViewDrawer}
            />
          ) : (
            <Spin spinning />
          )}
        </div>
      </Drawer>
      <Drawer
        title={t('title')}
        placement='right'
        width='80%'
        destroyOnClose
        afterVisibleChange={handleDrawerAfterVisibleChange}
        onClose={handleCloseCreateDrawer}
        visible={createDrawerVisible}
      >
        <div className={`n9e ${CN}`}>
          <NotificationRuleForm
            disabled={createSaving}
            onOk={(values) => {
              setCreateSaving(true);
              createNotificationRules([values])
                .then(() => {
                  message.success(t('common:success.add'));
                  handleCloseCreateDrawer();
                  refresh?.();
                })
                .finally(() => {
                  setCreateSaving(false);
                });
            }}
            onCancel={handleCloseCreateDrawer}
          />
        </div>
      </Drawer>
    </>
  );
}

interface Props {
  name?: string | (string | number)[];
  label?: React.ReactNode;
  rules?: Rule[];
  className?: string;
  notificationRules: RuleItemData[];
  loading?: boolean;
  refresh?: () => void;
  isAuthorized?: boolean;
}

export default function RuleDropdownSelect(props: Props) {
  const { t } = useTranslation(NS);
  const { name = 'notify_rule_ids', label = t('rule_select.label'), rules, className, notificationRules, loading, refresh, isAuthorized } = props;
  const required = _.some(rules, (rule) => (rule as { required?: boolean })?.required);

  return (
    <Form.Item name={name} rules={rules} className={className}>
      <Content label={label} required={required} notificationRules={notificationRules} loading={loading} refresh={refresh} isAuthorized={isAuthorized} />
    </Form.Item>
  );
}
