import React, { useState, useEffect, useMemo, useRef } from 'react';
import _ from 'lodash';
import { Form, Card, Space, Input, Select, Switch, Button, Row, Col, Affix } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getTeamInfoList } from '@/services/manage';
import { getBusiGroupsAlertRules } from '@/services/warning';
import { SIZE } from '@/utils/constant';
import { scrollToFirstError } from '@/utils';
import SectionCard, { SectionItem } from '@/pages/alertRules/FormNG/components/SectionCard';
import { ChannelItem, getSimplifiedItems as getNotificationChannels } from '@/pages/notificationChannels/services';

// @ts-ignore
import ExtraConfig from 'plus:/parcels/notificationRules/ExtraConfig';

import { NS, DEFAULT_VALUES } from '../../constants';
import { RuleItem } from '../../types';
import { normalizeFormValues } from '../../utils/normalizeValues';
import { getEventTags } from '../../services';
import RuleConfig from './RuleConfig';
import EventPipelineConfigs from './EventPipelineConfigs';
import { useGlobalState } from './Attributes/globalState';

interface Props {
  disabled?: boolean;
  initialValues?: RuleItem;
  onOk?: (values: RuleItem) => void;
  onCancel?: () => void;
}

const MAIN_SECTION_KEYS = ['notify', 'basic', 'pipeline'];

// 根据第 1 条通知配置生成规则名称：媒介名-接收团队（最多 2 个），无团队时仅媒介名
function buildAutoName(channelName: string | undefined, notifyConfig: any, teams: { id: number; name: string }[], separator: string) {
  if (!channelName) return undefined;
  const teamNames = _.compact(_.map(notifyConfig?.params?.user_group_ids, (id) => _.find(teams, { id })?.name));
  if (teamNames.length) {
    return `${channelName}-${_.take(teamNames, 2).join(separator)}`;
  }
  return channelName;
}

export default function FormCpt(props: Props) {
  const { t, i18n } = useTranslation(NS);
  const { disabled, initialValues, onOk, onCancel } = props;
  const [form] = Form.useForm();
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>();
  const [eventKeys, setEventKeys] = useState<string[]>([]);
  const [, setAlertRules] = useGlobalState('alertRules');

  const sections = useMemo(() => {
    const items: SectionItem[] = [
      {
        key: 'notify',
        title: t('notification_configuration.title'),
        description: t('notification_configuration.section_desc'),
        tag: 'core',
        helpDoc: {
          documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/notify-rules/',
        },
      },
      {
        key: 'basic',
        title: t('basic_configuration'),
        description: t('basic_configuration_desc'),
        tag: 'default',
      },
      {
        key: 'pipeline',
        title: t('pipeline_configuration.title'),
        description: t('pipeline_configuration.section_desc'),
        tag: 'optional',
      },
    ];
    return items;
  }, [i18n.language]);

  const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>(() => {
    const hasPipeline = _.some(initialValues?.pipeline_configs, (item: any) => !!item?.pipeline_id);
    return {
      basic: false,
      notify: false,
      pipeline: !hasPipeline,
    };
  });
  const [toggleAllSignal, setToggleAllSignal] = useState<{ action: 'expand' | 'collapse'; ts: number } | null>(null);
  // 校验失败时通知对应通知配置展开筛选条件面板，否则 display:none 的错误项无法被滚动定位
  const [expandFiltersSignal, setExpandFiltersSignal] = useState<{ indices: number[]; ts: number } | null>(null);
  const allExpanded = MAIN_SECTION_KEYS.every((key) => sectionCollapsed[key] === false);

  // 备注默认收起，编辑已有备注时展开
  const [noteVisible, setNoteVisible] = useState(() => !!initialValues?.description);

  // 媒介列表，按第 1 条通知配置的 channel_id 反查媒介名，用于自动生成规则名称
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const lastAutoNameRef = useRef<string>();
  const firstNotifyConfig = Form.useWatch(['notify_configs', 0], form);

  useEffect(() => {
    getTeamInfoList().then((res) => {
      const teams = res.dat ?? [];
      setUserGroups(teams);
      // 新建时若只有一个可见团队，默认选中，减少新人输入
      if (!disabled && !initialValues && teams.length === 1 && _.isEmpty(form.getFieldValue('user_group_ids'))) {
        form.setFieldsValue({ user_group_ids: [teams[0].id] });
      }
    });
    getEventTags().then((res) => {
      setEventKeys(res ?? []);
    });
    getBusiGroupsAlertRules().then((res) => {
      setAlertRules(_.map(res.dat, (item) => ({ id: item.id, name: item.name })));
    });
    getNotificationChannels()
      .then((res) => {
        setChannels(res);
      })
      .catch((error) => {
        console.error(error);
        setChannels([]);
      });
  }, []);

  // 自动命名：仅当名称为空或仍是上次自动生成值时覆盖，用户手动改过则不再干预
  useEffect(() => {
    if (disabled) return;
    const channelName = _.find(channels, { id: firstNotifyConfig?.channel_id })?.name;
    const suggestion = buildAutoName(channelName, firstNotifyConfig, userGroups, t('name_auto_separator'));
    if (!suggestion) return;
    const current = form.getFieldValue('name');
    if (current && current !== lastAutoNameRef.current) return;
    if (current !== suggestion) {
      form.setFieldsValue({ name: suggestion });
    }
    lastAutoNameRef.current = suggestion;
  }, [disabled, channels, userGroups, firstNotifyConfig?.channel_id, JSON.stringify(firstNotifyConfig?.params?.user_group_ids)]);

  // 校验失败时展开包含错误项的分区/面板，否则被 display:none 隐藏的错误项滚动不可见，保存表现为"没反应"
  const expandErrorSections = (errorFields?: { name: (string | number)[] }[]) => {
    const sectionKeys: string[] = [];
    const filterIndices: number[] = [];
    let hasExtraConfigError = false;
    _.forEach(errorFields, ({ name }) => {
      const root = name?.[0];
      if (root === 'notify_configs') {
        sectionKeys.push('notify');
        // 筛选条件面板内的字段出错时，还需展开对应条目的筛选面板
        if (_.isNumber(name?.[1]) && _.includes(['severities', 'time_ranges', 'label_keys', 'attributes'], name?.[2])) {
          filterIndices.push(name[1] as number);
        }
      } else if (root === 'pipeline_configs') {
        sectionKeys.push('pipeline');
      } else if (root === 'extra_config') {
        hasExtraConfigError = true;
      } else {
        sectionKeys.push('basic');
      }
    });
    if (sectionKeys.length) {
      setSectionCollapsed((prev) => ({ ...prev, ..._.zipObject(sectionKeys, _.map(sectionKeys, () => false)) }));
    }
    if (filterIndices.length) {
      setExpandFiltersSignal({ indices: _.uniq(filterIndices), ts: Date.now() });
    }
    // 升级/聚合分区在 plus 侧内部管理折叠状态，借助展开全部信号展开
    if (hasExtraConfigError) {
      setToggleAllSignal({ action: 'expand', ts: Date.now() });
    }
  };

  return (
    <Form form={form} layout='vertical' initialValues={initialValues ?? DEFAULT_VALUES} disabled={disabled}>
      <Form.Item name='id' hidden>
        <Input />
      </Form.Item>
      <div className='w-full max-w-[1200px] mx-auto'>
        <div className='flex items-center justify-end mb-4'>
          <Button
            onClick={() => {
              const anyCollapsed = MAIN_SECTION_KEYS.some((key) => sectionCollapsed[key] === true);
              const action = anyCollapsed ? 'expand' : 'collapse';
              setSectionCollapsed((prev) => {
                const next = { ...prev };
                for (const key of MAIN_SECTION_KEYS) {
                  next[key] = action === 'collapse';
                }
                return next;
              });
              setToggleAllSignal({ action, ts: Date.now() });
            }}
            className='flex items-center gap-1'
            size='small'
            icon={allExpanded ? <ChevronsDownUp size={12} /> : <ChevronsUpDown size={12} />}
          >
            {allExpanded ? t('alertRules:form_ng.collapse_collapse_all') : t('alertRules:form_ng.collapse_expand_all')}
          </Button>
        </div>

        <SectionCard
          item={sections[0]}
          index={0}
          collapsed={sectionCollapsed.notify}
          setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, notify: collapsed }))}
        >
          <Form.List name='notify_configs'>
            {(fields, { add, remove, move }) => (
              <>
                {fields.map((field) => (
                  <RuleConfig
                    key={field.key}
                    disabled={disabled}
                    fields={fields}
                    field={field}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                    add={add}
                    remove={remove}
                    move={move}
                    eventKeys={eventKeys}
                    expandFiltersSignal={expandFiltersSignal}
                  />
                ))}
                {!disabled && (
                  <Button className='w-full' type='dashed' onClick={() => add(DEFAULT_VALUES.notify_configs[0])} icon={<PlusOutlined />}>
                    {t('notification_configuration.add_btn')}
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </SectionCard>

        <SectionCard
          className='mt-4'
          item={sections[1]}
          index={1}
          collapsed={sectionCollapsed.basic}
          setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, basic: collapsed }))}
        >
          <Row gutter={SIZE}>
            <Col flex='auto'>
              <Row gutter={SIZE}>
                <Col span={12}>
                  <Form.Item label={t('common:table.name')} tooltip={t('name_auto_tip')} name='name' rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={t('user_group_ids')} tooltip={t('user_group_ids_tip')} name='user_group_ids' rules={[{ required: true }]}>
                    <Select
                      showSearch
                      optionFilterProp='label'
                      mode='multiple'
                      options={_.map(userGroups, (item) => {
                        return {
                          label: item.name,
                          value: item.id,
                        };
                      })}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col flex='none'>
              <Form.Item label={t('common:table.enabled')} tooltip={t('enabled_tip')} name='enable' valuePropName='checked'>
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: noteVisible ? undefined : 'none' }}>
            <Form.Item label={t('common:table.note')} tooltip={t('note_tip')} name='description' className='mb-0'>
              <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
            </Form.Item>
          </div>
          {!noteVisible && (
            <Button
              type='link'
              size='small'
              className='p-0'
              icon={<PlusOutlined />}
              onClick={() => {
                setNoteVisible(true);
              }}
            >
              {t('add_note_btn')}
            </Button>
          )}
        </SectionCard>

        <EventPipelineConfigs
          item={sections[2]}
          index={2}
          collapsed={sectionCollapsed.pipeline}
          setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, pipeline: collapsed }))}
        />

        <ExtraConfig eventKeys={eventKeys} baseIndex={3} toggleAllSignal={toggleAllSignal} />
      </div>
      {!disabled && (
        <Affix offsetBottom={0}>
          <Card size='small' className='affix-bottom-shadow max-w-[1200px] mx-auto mt-4'>
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  form
                    .validateFields()
                    .then(async (values) => {
                      onOk && onOk(normalizeFormValues(values));
                    })
                    .catch((err) => {
                      console.error(err);
                      expandErrorSections(err?.errorFields);
                      scrollToFirstError();
                    });
                }}
              >
                {t('common:btn.save')}
              </Button>
              {onCancel ? (
                <Button onClick={onCancel}>{t('common:btn.cancel')}</Button>
              ) : (
                <Link to={`/${NS}`}>
                  <Button>{t('common:btn.cancel')}</Button>
                </Link>
              )}
            </Space>
          </Card>
        </Affix>
      )}
    </Form>
  );
}
