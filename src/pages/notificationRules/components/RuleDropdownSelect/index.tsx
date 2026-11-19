import React, { useMemo, useState } from 'react';
import { Form, Dropdown, Button, Input, Space, Drawer, Spin, Tooltip, Popover, message } from 'antd';
import { PlusOutlined, PlusCircleOutlined, SyncOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Rule } from 'antd/lib/form';
import { Check, ExternalLink, Eye, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import { getNotificationChannelTypes } from '@/pages/notificationChannels/constants';
import { getSimplifiedItems as getNotificationChannels, SIMPLIFIED_ITEMS_CACHE_KEY, ChannelItem } from '@/pages/notificationChannels/services';
import { getItems as getNotificationTemplates } from '@/pages/notificationTemplates/services';
import { DrawerFooterContext, useDrawerFooter } from '@/components/DrawerFooterContext';

import { getItem as getNotificationRule, putItem as putNotificationRule, postItems as createNotificationRules, RuleItem } from '../../services';
import { NS, CN, OPTIONS_CACHE_STALE_TIME } from '../../constants';
import NotificationRuleForm from '../../pages/Form';
import { normalizeInitialValues } from '../../utils/normalizeValues';
import QuickCreateModal from './QuickCreateModal';
import useNotificationRules from './useNotificationRules';

const channelTypes = getNotificationChannelTypes();

type NotifyConfig = {
  channel_id: number;
  channel?: string;
  channel_ident?: string;
  template_id?: number;
  params?: Record<string, any>;
  user_group_names?: string[];
  user_names?: string[];
};

export type RuleItemData = {
  id: number;
  name: string;
  enable?: boolean;
  notify_configs?: NotifyConfig[];
};

function isZeroSummaryValue(value: unknown) {
  return value === 0 || value === '0';
}

/** 模板名称优先，取不到时退回模板 ID，保证摘要和详情不会出现空值。 */
function getTemplateLabel(templateId: number, templatesById: Record<string, { name: string }>) {
  const templateName = templatesById[templateId]?.name;
  return templateName && !isZeroSummaryValue(templateName) ? templateName : String(templateId);
}

/** 取单条通知配置的摘要；模板放在现有摘要字段之前。 */
function getNotifyConfigSummary(config: NotifyConfig, templatesById: Record<string, { name: string }>) {
  const parts: string[] = [];
  if (config.template_id != null && !isZeroSummaryValue(config.template_id)) {
    parts.push(getTemplateLabel(config.template_id, templatesById));
  }

  const userNamesAndUserGroups = _.compact(_.concat(config.user_names, config.user_group_names)).filter((value) => !isZeroSummaryValue(value));
  if (userNamesAndUserGroups.length > 0) {
    parts.push(...userNamesAndUserGroups);
  } else {
    const params = config.params || {};
    if (params.bot_name && !isZeroSummaryValue(params.bot_name)) {
      parts.push(params.bot_name);
    } else if (params.callback_url && !isZeroSummaryValue(params.callback_url)) {
      parts.push(params.callback_url);
    }
  }

  return parts.join(' · ');
}

/** 根据通知媒介 ident 获取图标 */
function getRuleIcon(ident?: string) {
  if (!ident) return null;

  const configuredType = (channelTypes as Record<string, { logo?: string }>)[ident];
  const typeConfig = configuredType || (isDutyChannel(ident) ? channelTypes.flashduty : undefined);

  if (typeConfig?.logo) {
    return <img src={typeConfig.logo} alt={ident} height={14} className='block h-[14px] w-auto shrink-0' />;
  }

  return null;
}

function isDutyChannel(ident?: string) {
  const normalizedIdent = ident?.toLowerCase();
  return Boolean(normalizedIdent && (normalizedIdent === 'flashduty' || /(?:^|[-_])duty$/.test(normalizedIdent)));
}

type NotifyConfigPopoverField = { key: string; value: string };

/** 取单条通知配置的可读详情，字段范围与第二行摘要保持一致。 */
function getNotifyConfigPopoverFields(config: NotifyConfig, templatesById: Record<string, { name: string }>, channelNamesById: Record<number, string>, t: (key: string) => string) {
  const fields: NotifyConfigPopoverField[] = [];

  const channelName = config.channel?.trim() || channelNamesById[config.channel_id];
  if (channelName) {
    fields.push({ key: t('notification_configuration.channel'), value: channelName });
  }

  if (config.template_id != null && !isZeroSummaryValue(config.template_id)) {
    fields.push({
      key: t('notification_configuration.template'),
      value: getTemplateLabel(config.template_id, templatesById),
    });
  }

  const userNames = _.compact(config.user_names).filter((value) => !isZeroSummaryValue(value));
  const userGroupNames = _.compact(config.user_group_names).filter((value) => !isZeroSummaryValue(value));
  if (userNames.length > 0 || userGroupNames.length > 0) {
    if (userNames.length > 0) {
      fields.push({ key: t('notification_configuration.user_info.user_ids'), value: userNames.join(' · ') });
    }
    if (userGroupNames.length > 0) {
      fields.push({ key: t('notification_configuration.user_info.user_group_ids'), value: userGroupNames.join(' · ') });
    }
  } else {
    const params = config.params || {};
    if (params.bot_name && !isZeroSummaryValue(params.bot_name)) {
      fields.push({ key: t('notification_configuration.summary_fields.bot_name'), value: params.bot_name });
    } else if (params.callback_url && !isZeroSummaryValue(params.callback_url)) {
      fields.push({ key: t('notification_configuration.callback_url'), value: params.callback_url });
    }
  }

  return fields;
}

interface NotificationRuleItemProps {
  rule: RuleItemData;
  templatesById: Record<string, { name: string }>;
  channelNamesById: Record<number, string>;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  showViewButton?: 'hover' | 'always';
  onView?: (ruleId: number) => void;
  onRemove?: () => void;
  className?: string;
}

function NotificationRuleItem({
  rule,
  templatesById,
  channelNamesById,
  showCheckbox,
  isSelected,
  onClick,
  showViewButton = 'hover',
  onView,
  onRemove,
  className = '',
}: NotificationRuleItemProps) {
  const { t } = useTranslation(NS);
  const configCount = rule.notify_configs?.length ?? 0;
  const summaryConfigs = (rule.notify_configs ?? [])
    .map((config) => {
      return {
        icon: getRuleIcon(config.channel_ident),
        subtitle: getNotifyConfigSummary(config, templatesById),
        config,
      };
    })
    .filter(({ icon, subtitle }) => Boolean(icon || subtitle));
  const popoverConfigs = (rule.notify_configs ?? [])
    .map((config, index) => ({
      key: `${config.channel_id}-${index}`,
      icon: getRuleIcon(config.channel_ident),
      fields: getNotifyConfigPopoverFields(config, templatesById, channelNamesById, t),
    }))
    .filter(({ fields }) => fields.length > 0);

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
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-1'>
          <span className='font-bold leading-[1.4] max-w-[500px] truncate'>{rule.name}</span>
          {rule.enable === false && <span className='px-1 py-0 rounded text-[10px] bg-error/10 text-error shrink-0'>{t('common:disabled')}</span>}
          {configCount > 1 && <span className='px-1 py-0 rounded text-[10px] bg-primary/10 text-primary shrink-0'>{t('rule_select.total', { total: configCount })}</span>}
        </div>
        {summaryConfigs.length > 0 && (
          <Popover
            placement='right'
            mouseEnterDelay={0.5}
            zIndex={1060}
            overlayStyle={{ maxWidth: 600 }}
            content={
              <div className='max-w-[600px] whitespace-normal break-words space-y-1'>
                {popoverConfigs.map(({ key, icon, fields }) => (
                  <div key={key} className='flex items-start gap-2'>
                    {icon && <span className='mt-[3px] inline-flex shrink-0 items-center'>{icon}</span>}
                    <div className='min-w-0'>
                      {fields.map((field, index) => (
                        <React.Fragment key={field.key}>
                          {index > 0 && <span className='mx-1'>·</span>}
                          <span className='text-soft'>{field.key}: </span>
                          <span>{field.value}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <div className='mt-0.5 inline-flex min-w-0 max-w-full cursor-help items-center overflow-hidden whitespace-nowrap leading-[1.4] text-soft'>
              {summaryConfigs.map(({ config, icon, subtitle }, index) => {
                return (
                  <span key={`${config.channel_id}-${index}`} className='flex min-w-0 items-center gap-1 py-0.5'>
                    {(index > 0 || icon) && (
                      <span className='inline-flex shrink-0 items-center'>
                        {index > 0 && <span className='mx-2 shrink-0 text-[10px] leading-none'>|</span>}
                        {icon}
                      </span>
                    )}
                    {subtitle && <span className='min-w-0 truncate'>{subtitle}</span>}
                  </span>
                );
              })}
            </div>
          </Popover>
        )}
      </div>
      {showViewButton === 'always' && (
        <Button
          type='text'
          size='small'
          className='flex items-center gap-1 shrink-0 ml-2 text-soft'
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
          className='opacity-0 group-hover:opacity-100 flex items-center gap-1 text-soft'
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
          className='shrink-0 ml-1 text-soft flex items-center'
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

  const { data: notificationChannels = [] } = useRequest<ChannelItem[], []>(getNotificationChannels, {
    cacheKey: SIMPLIFIED_ITEMS_CACHE_KEY,
    staleTime: OPTIONS_CACHE_STALE_TIME,
  });
  const channelNamesById = useMemo(() => _.mapValues(_.keyBy(notificationChannels, 'id'), (channel) => channel.name), [notificationChannels]);

  const templateChannelIds = useMemo(() => {
    const ids = notificationRules
      .flatMap((rule) => rule.notify_configs ?? [])
      .filter((config) => config.template_id != null && !isZeroSummaryValue(config.template_id))
      .map((config) => config.channel_id);
    return _.uniq(ids).sort((a, b) => a - b);
  }, [notificationRules]);
  const templateChannelIdsKey = templateChannelIds.join(',');
  const { data: templateLookup } = useRequest(
    () =>
      getNotificationTemplates(templateChannelIdsKey, { silence: true }).then((items) => ({
        channelIds: templateChannelIdsKey,
        items,
      })),
    {
      ready: templateChannelIds.length > 0,
      refreshDeps: [templateChannelIdsKey],
      onError: () => {},
    },
  );
  const templatesById = useMemo(() => {
    const items = templateLookup && templateLookup.channelIds === templateChannelIdsKey ? templateLookup.items : [];
    return _.keyBy(items, 'id');
  }, [templateLookup, templateChannelIdsKey]);

  const [searchText, setSearchText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [viewDrawerData, setViewDrawerData] = useState<RuleItem>();
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [quickCreateVisible, setQuickCreateVisible] = useState(false);
  const { footer: viewFooter, context: viewFooterContext } = useDrawerFooter();
  const { footer: createFooter, context: createFooterContext } = useDrawerFooter();
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

  const handleQuickCreate = () => {
    setDropdownOpen(false);
    setQuickCreateVisible(true);
  };

  /** 创建/复用成功后把规则追加进已选列表，避免用户再手动勾选 */
  const selectRule = (ruleId: number) => {
    if (_.includes(selectedIds, ruleId)) return;
    onChange?.([...selectedIds, ruleId]);
  };

  const handleQuickCreateSuccess = (ruleId: number) => {
    refresh?.();
    selectRule(ruleId);
  };

  const handleDropdownVisibleChange = (visible: boolean) => {
    if (visible && (viewDrawerVisible || createDrawerVisible || quickCreateVisible)) return;
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
              templatesById={templatesById}
              channelNamesById={channelNamesById}
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
              <>
                <Button type='link' size='small' icon={<ThunderboltOutlined />} onClick={handleQuickCreate}>
                  {t('rule_select.quick_create.action')}
                </Button>
                <Button type='link' size='small' icon={<PlusOutlined />} onClick={handleCreateRule}>
                  {t('rule_select.create')}
                </Button>
              </>
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
          {isAuthorized && (
            <Tooltip title={t('rule_select.create')}>
              <PlusCircleOutlined className='cursor-pointer' onClick={handleCreateRule} />
            </Tooltip>
          )}
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
          {isAuthorized && (
            <a onClick={handleQuickCreate}>
              <ThunderboltOutlined className='mr-1' />
              {t('rule_select.quick_create.action')}
            </a>
          )}
        </Space>
      </div>
      {selectedRules.length > 0 && (
        <div className='mb-2 space-y-1'>
          {selectedRules.map((rule) => (
            <NotificationRuleItem
              key={rule.id}
              rule={rule}
              templatesById={templatesById}
              channelNamesById={channelNamesById}
              showViewButton='always'
              onView={handleViewRule}
              onRemove={() => toggleRule(rule.id)}
              className='fc-border rounded'
            />
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
        footer={viewFooter}
        className='n9e-antd-drawer'
      >
        <DrawerFooterContext.Provider value={viewFooterContext}>
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
        </DrawerFooterContext.Provider>
      </Drawer>
      <Drawer
        title={t('title')}
        placement='right'
        width='80%'
        destroyOnClose
        afterVisibleChange={handleDrawerAfterVisibleChange}
        onClose={handleCloseCreateDrawer}
        visible={createDrawerVisible}
        footer={createFooter}
        className='n9e-antd-drawer'
      >
        <DrawerFooterContext.Provider value={createFooterContext}>
          <div className={`n9e ${CN}`}>
            <NotificationRuleForm
              disabled={createSaving}
              onOk={(values) => {
                setCreateSaving(true);
                createNotificationRules([values])
                  .then((dat) => {
                    message.success(t('common:success.add'));
                    handleCloseCreateDrawer();
                    refresh?.();
                    // 自动选中新建的规则，免去用户再去下拉里手动勾选
                    const first = Array.isArray(dat) ? dat[0] : undefined;
                    const newId = typeof first === 'object' ? Number(first?.id) : Number(first);
                    if (Number.isFinite(newId) && newId > 0) {
                      selectRule(newId);
                    }
                  })
                  .finally(() => {
                    setCreateSaving(false);
                  });
              }}
              onCancel={handleCloseCreateDrawer}
            />
          </div>
        </DrawerFooterContext.Provider>
      </Drawer>
      <QuickCreateModal visible={quickCreateVisible} onCancel={() => setQuickCreateVisible(false)} onSuccess={handleQuickCreateSuccess} />
    </>
  );
}

interface Props {
  name?: string | (string | number)[];
  label?: React.ReactNode;
  rules?: Rule[];
  className?: string;
  notificationRules?: RuleItemData[];
  loading?: boolean;
  refresh?: () => void;
  isAuthorized?: boolean;
}

export default function RuleDropdownSelect(props: Props) {
  const { t } = useTranslation(NS);
  const { name = 'notify_rule_ids', label = t('rule_select.label'), rules, className, notificationRules, loading, refresh, isAuthorized } = props;
  const shouldFetchNotificationRules = notificationRules === undefined;
  const fetchedNotificationRules = useNotificationRules(shouldFetchNotificationRules);
  const required = _.some(rules, (rule) => (rule as { required?: boolean })?.required);

  return (
    <Form.Item name={name} rules={rules} className={className}>
      <Content
        label={label}
        required={required}
        notificationRules={notificationRules ?? fetchedNotificationRules.notificationRules}
        loading={shouldFetchNotificationRules ? fetchedNotificationRules.loading : loading}
        refresh={shouldFetchNotificationRules ? fetchedNotificationRules.refresh : refresh}
        isAuthorized={shouldFetchNotificationRules ? fetchedNotificationRules.isAuthorized : isAuthorized}
      />
    </Form.Item>
  );
}
