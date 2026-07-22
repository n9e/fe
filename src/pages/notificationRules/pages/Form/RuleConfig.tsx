import React, { useState, useEffect } from 'react';
import { Space, Row, Col, Form, Checkbox, Tooltip, TimePicker, Select } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, QuestionCircleOutlined, CopyOutlined, UpCircleOutlined, DownCircleOutlined, DownOutlined } from '@ant-design/icons';
import { ListFilter } from 'lucide-react';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { SIZE, daysOfWeek } from '@/utils/constant';
import { KVTags } from '@/components/KVTagSelect';
import { ChannelItem } from '@/pages/notificationChannels/services';

import { NS, DEFAULT_VALUES_TIME_RANGE } from '../../constants';
import getValuePropsWithTimeFormItem from '../../utils/getValuePropsWithTimeFormItem';
import ChannelSelect from './ChannelSelect';
import TemplateSelect from './TemplateSelect';
import ChannelParams from './ChannelParams';
import Attributes from './Attributes';
import TestButton from './TestButton';

interface Props {
  disabled?: boolean;
  fields: FormListFieldData[];
  field: FormListFieldData;
  activeIndex?: number;
  setActiveIndex: (index?: number) => void;
  add: (defaultValue?: any, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
  eventKeys: string[];
  // 校验失败时父级下发的信号：indices 中包含本条目索引时展开筛选条件面板
  expandFiltersSignal?: { indices: number[]; ts: number } | null;
}

// 筛选条件是否偏离默认值（默认：三个级别全选且无时段/标签/属性限制）
function hasCustomFilters(config: any) {
  const severities = config?.severities;
  const severitiesCustomized = _.isArray(severities) && _.size(severities) !== 3;
  return severitiesCustomized || !_.isEmpty(config?.time_ranges) || !_.isEmpty(config?.label_keys) || !_.isEmpty(config?.attributes);
}

export default function NotifyConfig(props: Props) {
  const { t } = useTranslation(NS);
  const { disabled, fields, field, activeIndex, setActiveIndex, add, remove, move, eventKeys, expandFiltersSignal } = props;
  const [channelItem, setChannelItem] = useState<ChannelItem>();
  const form = Form.useFormInstance();
  const ruleConfig = Form.useWatch(['notify_configs', field.name]);

  // 默认折叠筛选条件；已配置过非默认筛选时初始展开，避免隐藏生效中的条件
  const [filtersCollapsed, setFiltersCollapsed] = useState(() => {
    return !hasCustomFilters(form.getFieldValue(['notify_configs', field.name]));
  });

  // 校验失败时展开包含错误项的筛选面板
  useEffect(() => {
    if (expandFiltersSignal && _.includes(expandFiltersSignal.indices, field.name)) {
      setFiltersCollapsed(false);
    }
  }, [expandFiltersSignal]);

  const filtersSummary = (() => {
    const severities = ruleConfig?.severities;
    const parts: string[] = [];
    if (_.isEmpty(severities)) {
      parts.push(t('notification_configuration.filters.severities_none'));
    } else if (_.size(severities) === 3) {
      parts.push(t('notification_configuration.filters.severities_all'));
    } else {
      parts.push(_.map(_.sortBy(severities), (item) => `S${item}`).join('/'));
    }
    const extraParts: string[] = [];
    if (!_.isEmpty(ruleConfig?.time_ranges)) {
      extraParts.push(t('notification_configuration.filters.time_ranges_count', { count: _.size(ruleConfig.time_ranges) }));
    }
    if (!_.isEmpty(ruleConfig?.label_keys)) {
      extraParts.push(t('notification_configuration.filters.label_keys_count', { count: _.size(ruleConfig.label_keys) }));
    }
    if (!_.isEmpty(ruleConfig?.attributes)) {
      extraParts.push(t('notification_configuration.filters.attributes_count', { count: _.size(ruleConfig.attributes) }));
    }
    if (_.isEmpty(extraParts)) {
      extraParts.push(t('notification_configuration.filters.no_extra'));
    }
    return _.concat(parts, extraParts).join(' · ');
  })();

  return (
    <div key={field.key} className='mb-3 rounded-lg fc-border bg-fc-100 overflow-hidden'>
      <div className='flex items-center gap-2 px-4 py-2 bg-fc-150'>
        <span className='font-bold text-title'>
          {t('notification_configuration.item_title')} {field.name + 1}
        </span>
        {channelItem?.name && <span className='text-[12px] text-soft truncate'>{channelItem.name}</span>}
        {!disabled && (
          <Space className='ml-auto'>
            <CopyOutlined
              className='text-soft hover:text-title cursor-pointer'
              onClick={() => {
                add(ruleConfig, field.name + 1);
              }}
            />
            {fields.length > 1 && (
              <>
                {field.name !== 0 && (
                  <UpCircleOutlined
                    className='text-soft hover:text-title cursor-pointer'
                    onClick={() => {
                      move(field.name, field.name - 1);
                    }}
                  />
                )}
                {field.name !== fields.length - 1 && (
                  <DownCircleOutlined
                    className='text-soft hover:text-title cursor-pointer'
                    onClick={() => {
                      move(field.name, field.name + 1);
                    }}
                  />
                )}
              </>
            )}
            <MinusCircleOutlined
              className='text-soft hover:text-title cursor-pointer'
              onClick={() => {
                remove(field.name);
              }}
            />
          </Space>
        )}
      </div>
      <div className='p-4'>
        <Row gutter={SIZE}>
          <Col span={channelItem?.request_type !== 'flashduty' && channelItem?.request_type !== 'pagerduty' && channelItem?.ident !== 'callback' ? 12 : 24}>
            <ChannelSelect
              prefixNamePath={['notify_configs']}
              field={field}
              onChange={(_val, item) => {
                setChannelItem(item);
              }}
            />
          </Col>
          {channelItem?.request_type !== 'flashduty' && channelItem?.request_type !== 'pagerduty' && channelItem?.ident !== 'callback' && (
            <Col span={12}>
              <TemplateSelect prefixNamePath={['notify_configs']} field={field} />
            </Col>
          )}
        </Row>
        <ChannelParams prefixNamePath={['notify_configs']} field={field} channelItem={channelItem} />
        <div className='rounded-lg fc-border overflow-hidden mb-4'>
          <div
            className='flex items-center gap-2 px-3 py-2 cursor-pointer select-none bg-fc-150'
            onClick={() => {
              setFiltersCollapsed(!filtersCollapsed);
            }}
          >
            <ListFilter size={13} className='text-soft shrink-0' />
            <span className='font-medium'>{t('notification_configuration.filters.title')}</span>
            <Tooltip className='n9e-ant-from-item-tooltip' title={t('notification_configuration.filters.tip')}>
              <QuestionCircleOutlined className='text-soft' />
            </Tooltip>
            <span className='flex-1 min-w-0 truncate text-right text-[12px] text-soft'>{filtersSummary}</span>
            <DownOutlined className='text-soft text-[10px] transition-transform duration-200' style={{ transform: filtersCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }} />
          </div>
          <div className='p-3' style={{ display: filtersCollapsed ? 'none' : undefined }}>
            <div className='p-3 pb-0 mb-2 rounded bg-fc-150 flex'>
              <Form.Item {...field} label={t('notification_configuration.severities')} tooltip={t('notification_configuration.severities_tip')} name={[field.name, 'severities']}>
                <Checkbox.Group disabled={disabled}>
                  <Checkbox value={1}>{t('common:severity.1')}</Checkbox>
                  <Checkbox value={2}>{t('common:severity.2')}</Checkbox>
                  <Checkbox value={3}>{t('common:severity.3')}</Checkbox>
                </Checkbox.Group>
              </Form.Item>
            </div>
            <div className='p-3 mb-2 rounded bg-fc-150'>
              <Form.List {..._.omit(field, 'key')} name={[field.name, 'time_ranges']}>
                {(fields, { add, remove }) => (
                  <>
                    <Space className={fields.length ? 'mb-2' : ''}>
                      <div style={{ width: 450 }}>
                        <Space align='baseline' size={4}>
                          {t('notification_configuration.time_ranges')}
                          <Tooltip className='n9e-ant-from-item-tooltip' title={t('notification_configuration.time_ranges_tip')}>
                            <QuestionCircleOutlined />
                          </Tooltip>
                          {!disabled && <PlusCircleOutlined onClick={() => add(DEFAULT_VALUES_TIME_RANGE)} />}
                        </Space>
                      </div>
                      {fields.length ? <div style={{ width: 110 }}>{t('notification_configuration.effective_time_start')}</div> : null}
                      {fields.length ? <div style={{ width: 110 }}>{t('notification_configuration.effective_time_end')}</div> : null}
                    </Space>
                    {fields.map(({ key, name, ...restField }) => {
                      return (
                        <div key={`time_ranges-${key}`}>
                          <Space align='baseline'>
                            <Form.Item
                              {...restField}
                              name={[name, 'week']}
                              style={{ width: 450 }}
                              rules={[
                                {
                                  required: true,
                                  message: t('notification_configuration.effective_time_week_msg'),
                                },
                              ]}
                            >
                              <Select
                                mode='multiple'
                                options={_.map(daysOfWeek, (item) => {
                                  return {
                                    label: t(`common:time.weekdays.${item}`),
                                    value: item,
                                  };
                                })}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'start']}
                              style={{ width: 110 }}
                              rules={[
                                {
                                  required: true,
                                  message: t('notification_configuration.effective_time_start_msg'),
                                },
                              ]}
                              getValueProps={getValuePropsWithTimeFormItem}
                            >
                              <TimePicker format='HH:mm' />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'end']}
                              style={{ width: 110 }}
                              rules={[
                                {
                                  required: true,
                                  message: t('notification_configuration.effective_time_end_msg'),
                                },
                              ]}
                              getValueProps={getValuePropsWithTimeFormItem}
                            >
                              <TimePicker format='HH:mm' />
                            </Form.Item>
                            {!disabled && <MinusCircleOutlined onClick={() => remove(name)} />}
                          </Space>
                        </div>
                      );
                    })}
                  </>
                )}
              </Form.List>
            </div>
            <div className='p-3 mb-2 rounded bg-fc-150'>
              <KVTags
                disabled={disabled}
                field={field}
                fullName={['notify_configs']}
                name={[field.name, 'label_keys']}
                keyLabel={t('notification_configuration.label_keys')}
                keyLabelTootip={t('notification_configuration.label_keys_tip')}
                funcName='op'
              />
            </div>
            <div className='p-3 rounded bg-fc-150'>
              <Attributes disabled={disabled} field={field} fullName={['notify_configs']} keyOptions={['group_name', 'cluster', 'is_recovered', 'rule_id', 'target_group']} />
            </div>
          </div>
        </div>
        {!disabled && <TestButton field={field} />}
      </div>
    </div>
  );
}
