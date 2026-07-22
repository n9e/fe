/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import { Form, Card, Select, Col, Button, Row, message, Checkbox, Radio, Modal, Space, InputNumber, Input, Switch, Tag, Alert } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { ListFilter } from 'lucide-react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import { addSubscribe, editSubscribe, deleteSubscribes, alertSubscribesTryrun } from '@/services/subscribe';
import { getNotifiesList, getTeamInfoList } from '@/services/manage';
import { subscribeItem } from '@/store/warningInterface/subscribe';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import VersionSwitch from '@/pages/alertRules/Form/Notify/VersionSwitch';
import SectionCard, { SectionItem } from '@/pages/alertRules/FormNG/components/SectionCard';
import RuleDropdownSelect from '@/pages/notificationRules/components/RuleDropdownSelect';
import { getItems as getNotificationRules, RuleItem as NotificationRuleItem } from '@/pages/notificationRules/services';
import { PERM as notificationRulesPerm } from '@/pages/notificationRules/constants';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { CommonStateContext } from '@/App';
import { DatasourceCateSelect } from '@/components/DatasourceSelect';
import { allCates, getCateDisplayLabel } from '@/components/AdvancedWrap/utils';
import { scrollToFirstError } from '@/utils';
import AlertEventRuleTesterWithButton from '@/components/AlertEventRuleTesterWithButton';
import AffixWrapper from '@/components/AffixWrapper';
import { KVTags } from '@/components/KVTagSelect';

import RuleModal from './ruleModal';
import ScenarioTips from './ScenarioTips';
import BusiGroupsTagItem from './BusiGroupsTagItem';
import { DOC_URL } from '../constants';
import { processFormValues } from './utils';
import { buildAutoName } from './buildAutoName';
import '../index.less';

// @ts-ignore
import NotifyExtra from 'plus:/parcels/AlertSubscribes/Extra';
// @ts-ignore
import NotifyChannelsTpl from 'plus:/parcels/AlertRule/NotifyChannelsTpl';

const { Option } = Select;

interface Props {
  detail?: subscribeItem;
  type?: number; // 1:编辑; 2:克隆
}

const SEVERITIES = [1, 2, 3];

// 校验失败时，把出错字段映射到所在分区，展开后错误项才可见、才能被滚动定位。
// 没登记在这里的字段（如 plus 侧的 extra_config）会走全展开兜底，见 expandErrorSections
const FIELD_SECTION_MAP: Record<string, string> = {
  cate: 'filter',
  datasource_ids: 'filter',
  severities: 'filter',
  busi_groups: 'filter',
  tags: 'filter',
  for_duration: 'filter',
  notify_rule_ids: 'notify',
  user_group_ids: 'notify',
  new_severity: 'notify',
  new_channels: 'notify',
  webhooks: 'notify',
  note: 'basic',
};

const OperateForm: React.FC<Props> = ({ detail = {} as subscribeItem, type }) => {
  const { t, i18n } = useTranslation('alertSubscribes');
  const [form] = Form.useForm(null as any);
  const history = useHistory();
  const { groupedDatasourceList, isPlus, businessGroup } = useContext(CommonStateContext);
  const curBusiId = detail.group_id || businessGroup.id!; // 修改和克隆是用 detail.group_id , 新增用 businessGroup.id
  const [ruleModalShow, setRuleModalShow] = useState<boolean>(false);
  const [selectedRules, setSelectedRules] = useState<any[]>([]); // 选中的规则
  const [contactList, setInitContactList] = useState([]);
  const [notifyGroups, setNotifyGroups] = useState<any[]>([]);
  const [notificationRules, setNotificationRules] = useState<NotificationRuleItem[]>([]);
  const [notificationRulesLoading, setNotificationRulesLoading] = useState(false);
  const notificationRulesAuthorized = useIsAuthorized([notificationRulesPerm]);
  const cate = Form.useWatch('cate', form);
  const redefineSeverity = Form.useWatch(['redefine_severity'], form);
  const redefineChannels = Form.useWatch(['redefine_channels'], form);
  const redefineWebhooks = Form.useWatch(['redefine_webhooks'], form);
  const new_channels = Form.useWatch(['new_channels'], form);
  const notify_version = Form.useWatch(['notify_version'], form);
  const busiGroupsValue = Form.useWatch('busi_groups', form);
  const tagsValue = Form.useWatch('tags', form);
  const severitiesValue = Form.useWatch('severities', form);
  const forDurationValue = Form.useWatch('for_duration', form);
  const notifyRuleIdsValue = Form.useWatch('notify_rule_ids', form);
  const userGroupIdsValue = Form.useWatch('user_group_ids', form);
  const noteValue = Form.useWatch('note', form);
  const disabledValue = Form.useWatch('disabled', form);

  const sections = useMemo(() => {
    const items: SectionItem[] = [
      {
        key: 'filter',
        title: t('filter_configs'),
        description: t('filter_configs_desc'),
        tag: 'core',
        icon: <ListFilter size={14} />,
        helpDoc: {
          documentPath: DOC_URL,
        },
      },
      {
        key: 'notify',
        title: t('notify_configs'),
        description: t('notify_configs_desc'),
        tag: 'core',
      },
      {
        key: 'basic',
        title: t('basic_configs'),
        description: t('basic_configs_desc'),
        tag: 'default',
      },
    ];
    return items;
  }, [i18n.language]);
  // 分区序号由配置表顺序推导，调用处按 key 取，避免下标和序号两处硬编码不同步
  const sectionKeys = useMemo(() => _.map(sections, 'key'), [sections]);
  const sectionMap = useMemo(() => _.keyBy(sections, 'key') as Record<string, SectionItem>, [sections]);
  const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>(() =>
    _.zipObject(
      sectionKeys,
      _.map(sectionKeys, () => false),
    ),
  );

  // GET /notify-rules 后端带 perm("/notification-rules")，无权限时不发这个注定 403 的请求
  useEffect(() => {
    if (!notificationRulesAuthorized) return;
    fetchNotificationRules();
  }, [notificationRulesAuthorized]);

  useEffect(() => {
    getNotifyChannel();
    getGroups('');
    setSelectedRules(
      _.map(detail.rule_ids, (id, idx) => {
        return {
          id,
          name: detail.rule_names[idx],
        };
      }),
    );
  }, []);

  // 已选中但不在当前搜索结果里的接收组也要保留，否则回显会丢
  const notifyGroupList = (detail.user_groups ? detail.user_groups.filter((item) => !notifyGroups.find((i) => item.id === i.id)) : []).concat(notifyGroups);
  const notifyGroupsOptions = notifyGroupList.map((ng: any) => (
    <Option value={String(ng.id)} key={ng.id}>
      {ng.name}
    </Option>
  ));

  const getNotifyChannel = async () => {
    const res = await getNotifiesList();
    let contactList = res || [];
    setInitContactList(contactList);
  };

  const getGroups = async (str) => {
    const res = await getTeamInfoList({ query: str });
    const data = res.dat || res;
    setNotifyGroups(data || []);
  };

  const fetchNotificationRules = () => {
    setNotificationRulesLoading(true);
    getNotificationRules()
      .then((res) => {
        setNotificationRules(res);
      })
      .catch((error) => {
        console.error(error);
        setNotificationRules([]);
      })
      .finally(() => {
        setNotificationRulesLoading(false);
      });
  };

  const debounceFetcher = useCallback(_.debounce(getGroups, 800), []);

  const cateLabel = useMemo(() => {
    if (cate === 'host') return 'Host';
    const cateItem = _.find(allCates, { value: cate });
    return cateItem ? getCateDisplayLabel(cateItem, i18n.language) : undefined;
  }, [cate, i18n.language]);

  // 接收方名称：新版取通知规则名，旧版取接收组名；自动命名和分区摘要共用
  const receiverNames = useMemo(() => {
    if (notify_version === 1) {
      return _.compact(_.map(notifyRuleIdsValue, (id) => _.find(notificationRules, { id })?.name));
    }
    return _.compact(_.map(userGroupIdsValue, (id) => _.find(notifyGroupList, (item) => _.toString(item.id) === _.toString(id))?.name));
  }, [notify_version, notifyRuleIdsValue, notificationRules, userGroupIdsValue, notifyGroupList]);

  // 自动命名：仅当名称为空或仍是上次自动生成值时覆盖，用户手动改过则不再干预
  const lastAutoNameRef = useRef<string>();
  useEffect(() => {
    const suggestion = buildAutoName(
      {
        ruleNames: _.map(selectedRules, 'name'),
        busiGroups: busiGroupsValue,
        tags: tagsValue,
        cateLabel,
        severities: severitiesValue,
        forDuration: forDurationValue,
        receiverNames,
      },
      {
        joiner: t('name_auto.joiner'),
        separator: t('name_auto.separator'),
        all: t('name_auto.all'),
        escalation: t('name_auto.escalation'),
      },
    );
    if (!suggestion) return;
    const current = form.getFieldValue('note');
    if (current && current !== lastAutoNameRef.current) return;
    if (current !== suggestion) {
      form.setFieldsValue({ note: suggestion });
    }
    lastAutoNameRef.current = suggestion;
  }, [
    i18n.language,
    cateLabel,
    forDurationValue,
    JSON.stringify(receiverNames),
    JSON.stringify(_.map(selectedRules, 'name')),
    JSON.stringify(busiGroupsValue),
    JSON.stringify(tagsValue),
    JSON.stringify(severitiesValue),
  ]);

  // 生效中的筛选条件条数，摘要与「无筛选条件」提示共用
  const filterCounts = useMemo(() => {
    return {
      rules: _.size(selectedRules),
      busiGroups: _.size(_.filter(busiGroupsValue, (item: any) => !_.isEmpty(_.compact(_.castArray(item?.value))))),
      tags: _.size(_.filter(tagsValue, (item: any) => !!item?.key)),
    };
  }, [selectedRules, busiGroupsValue, tagsValue]);

  // 级别未全选也是一种筛选，全选（默认值）时才算没收敛
  const hasSeverityFilter = !_.isEmpty(severitiesValue) && _.size(severitiesValue) < _.size(SEVERITIES);

  // 一条筛选条件都没有时，订阅会命中全部告警事件，这里给出提示避免误配
  const hasAnyFilter = hasSeverityFilter || !!cate || !!filterCounts.rules || !!filterCounts.busiGroups || !!filterCounts.tags || !!forDurationValue;

  // 分区折叠后仍能看到里面配了什么
  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (_.isEmpty(severitiesValue)) {
      parts.push(t('section_summary.severities_none'));
    } else if (_.size(severitiesValue) === _.size(SEVERITIES)) {
      parts.push(t('section_summary.severities_all'));
    } else {
      parts.push(_.map(_.sortBy(severitiesValue), (item) => `S${item}`).join('/'));
    }
    const extraParts: string[] = [];
    if (cateLabel) extraParts.push(cateLabel);
    if (filterCounts.rules) extraParts.push(t('section_summary.rules_count', { count: filterCounts.rules }));
    if (filterCounts.busiGroups) extraParts.push(t('section_summary.busi_groups_count', { count: filterCounts.busiGroups }));
    if (filterCounts.tags) extraParts.push(t('section_summary.tags_count', { count: filterCounts.tags }));
    if (forDurationValue) extraParts.push(t('section_summary.for_duration', { count: forDurationValue }));
    if (_.isEmpty(extraParts)) extraParts.push(t('section_summary.no_extra'));
    return _.concat(parts, extraParts).join(' · ');
  }, [i18n.language, severitiesValue, cateLabel, filterCounts, forDurationValue]);

  const notifySummary = useMemo(() => {
    if (!_.isEmpty(receiverNames)) return receiverNames.join(t('name_auto.separator'));
    return notify_version === 1 ? t('section_summary.notify_rules_none') : t('section_summary.user_groups_none');
  }, [i18n.language, receiverNames, notify_version]);

  const basicSummary = useMemo(() => {
    return [noteValue || t('section_summary.unnamed'), disabledValue === 1 ? t('section_summary.disabled') : t('section_summary.enabled')].join(' · ');
  }, [i18n.language, noteValue, disabledValue]);

  const onFinish = (values) => {
    const params = processFormValues(values, selectedRules);
    if (type === 1) {
      editSubscribe([{ ...params, id: detail.id }], curBusiId).then((_) => {
        message.success(t('common:success.edit'));
        history.push('/alert-subscribes');
      });
    } else {
      addSubscribe(params, curBusiId).then((_) => {
        message.success(t('common:success.add'));
        history.push('/alert-subscribes');
      });
    }
  };

  const expandErrorSections = (errorFields?: { name: (string | number)[] }[]) => {
    const sectionOfField = _.map(errorFields, ({ name }) => FIELD_SECTION_MAP[_.toString(name?.[0])]);
    // 出错字段没登记在映射表里时宁可全展开，否则错误项会留在 display:none 的分区里，用户只看到「提交没反应」
    const keys = _.some(sectionOfField, _.isUndefined) ? sectionKeys : _.compact(sectionOfField);
    if (keys.length) {
      setSectionCollapsed((prev) => ({
        ...prev,
        ..._.zipObject(
          keys,
          _.map(keys, () => false),
        ),
      }));
    }
  };

  const subscribeRule = (val) => {
    setSelectedRules(val);
    setRuleModalShow(false);
  };

  return (
    <main
      className='p-4 subscription-rules-form'
      style={{
        overflow: 'hidden auto',
      }}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => {
          expandErrorSections(errorFields);
          scrollToFirstError();
        }}
        initialValues={{
          notify_version: 1, // v8-beta.6 默认通知版本为1，旧版本为 0
          ...detail,
          note: type === 2 && detail.note ? `${detail.note}${t('name_auto.clone_suffix')}` : detail.note,
          disabled: detail.disabled ?? 0,
          busi_groups: _.map(detail.busi_groups || [], (item) => {
            return {
              ...item,
              value: _.includes(['in', 'not in'], item.func) ? item.value.split(' ') : item.value,
            };
          }),
          severities: detail.severities || [...SEVERITIES],
          redefine_severity: detail?.redefine_severity ? true : false,
          redefine_channels: detail?.redefine_channels ? true : false,
          redefine_webhooks: detail?.redefine_webhooks ? true : false,
          user_group_ids: detail?.user_group_ids ? detail?.user_group_ids?.split(' ') : [],
          new_channels: detail?.new_channels ? detail?.new_channels?.split(' ') : [],
        }}
      >
        <div className='w-full max-w-[1200px] mx-auto'>
          {/* 只在新建时讲场景，编辑/克隆的用户已经知道这是什么 */}
          {!type && <ScenarioTips />}

          <SectionCard
            item={sectionMap.filter}
            index={sectionKeys.indexOf('filter')}
            summary={filterSummary}
            collapsed={sectionCollapsed.filter}
            setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, filter: collapsed }))}
          >
            {!hasAnyFilter && <Alert className='mb-4' type='warning' showIcon message={t('no_filter_warning')} />}
            <Row gutter={10}>
              <Col span={!cate || cate === 'host' ? 24 : 12}>
                <Form.Item label={t('common:datasource.type')} name='cate'>
                  <DatasourceCateSelect
                    allowClear
                    scene='alert'
                    filterCates={(cates) => {
                      return _.concat(
                        [
                          {
                            label: 'Host',
                            value: 'host',
                            logo: '/image/logos/host.png',
                          } as any,
                        ],
                        _.filter(cates, (item) => {
                          return !!item.alertRule && (item.alertPro ? isPlus : true);
                        }),
                      );
                    }}
                    onChange={() => {
                      form.setFieldsValue({
                        datasource_ids: [],
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              {cate && cate !== 'host' && (
                <Col span={12}>
                  <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
                    {({ getFieldValue, setFieldsValue }) => {
                      const cate = getFieldValue('cate');
                      return (
                        <DatasourceValueSelect required={false} mode='multiple' setFieldsValue={setFieldsValue} cate={cate} datasourceList={groupedDatasourceList[cate] || []} />
                      );
                    }}
                  </Form.Item>
                </Col>
              )}
            </Row>
            <div className='filter-settings-row'>
              <div className='filter-settings-row-connector'>
                <div className='filter-settings-row-connector-line' />
                <div className='filter-settings-row-connector-text-container'>
                  <div className='filter-settings-row-connector-text'>{t('and')}</div>
                </div>
              </div>
              <div className='filter-settings-row-content'>
                <Form.Item label={t('severities')} name='severities' rules={[{ required: true, message: t('severities_msg') }]}>
                  <Checkbox.Group options={_.map(SEVERITIES, (item) => ({ label: t(`common:severity.${item}`), value: item }))} />
                </Form.Item>
              </div>
            </div>
            <div className='filter-settings-row'>
              <div className='filter-settings-row-connector'>
                <div className='filter-settings-row-connector-line' />
                <div className='filter-settings-row-connector-text-container'>
                  <div className='filter-settings-row-connector-text'>{t('and')}</div>
                </div>
              </div>
              <div className='filter-settings-row-content'>
                <Form.Item label={t('sub_rule_name')}>
                  <Space wrap>
                    {_.map(selectedRules, (item) => (
                      <Tag
                        color='purple'
                        key={item.id}
                        closable
                        onClose={() => {
                          setSelectedRules(selectedRules.filter((row) => row.id !== item.id));
                        }}
                      >
                        <Link to={`/alert-rules/edit/${item.id}`} target='_blank'>
                          {item.name}
                        </Link>
                      </Tag>
                    ))}
                    <Button
                      type='dashed'
                      size='small'
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setRuleModalShow(true);
                      }}
                    >
                      {t('sub_rule_select')}
                    </Button>
                  </Space>
                </Form.Item>
              </div>
            </div>
            <div className='filter-settings-row'>
              <div className='filter-settings-row-connector'>
                <div className='filter-settings-row-connector-line' />
                <div className='filter-settings-row-connector-text-container'>
                  <div className='filter-settings-row-connector-text'>{t('and')}</div>
                </div>
              </div>
              <div className='filter-settings-row-content'>
                <Form.List name='busi_groups'>
                  {(fields, { add, remove }, { errors }) => (
                    <>
                      <Row gutter={10}>
                        <Col flex='auto'>
                          <Row gutter={10} className='mb-2'>
                            <Col span={8}>
                              <Space>
                                <span>{t('group.key.label')}</span>
                                <PlusCircleOutlined
                                  onClick={() =>
                                    add({
                                      key: 'groups',
                                    })
                                  }
                                />
                              </Space>
                            </Col>
                            {fields.length ? <Col span={4}>{t('group.func.label')}</Col> : null}
                            {fields.length ? <Col span={12}>{t('group.value.label')}</Col> : null}
                          </Row>
                        </Col>
                        <Col flex='32px' />
                      </Row>
                      {fields.map((field, index) => (
                        <BusiGroupsTagItem key={index} field={field} fields={fields} index={index} remove={remove} add={add} form={form} />
                      ))}
                      <Form.ErrorList errors={errors} />
                    </>
                  )}
                </Form.List>
              </div>
            </div>
            <div className='filter-settings-row'>
              <div className='filter-settings-row-connector'>
                <div className='filter-settings-row-connector-line' />
                <div className='filter-settings-row-connector-text-container'>
                  <div className='filter-settings-row-connector-text'>{t('and')}</div>
                </div>
              </div>
              <div className='filter-settings-row-content'>
                <KVTags name={['tags']} keyLabel={t('tag.key.label')} keyLabelTootip={t('tag.key.tip')} funcName='func' />
              </div>
            </div>
            <div className='filter-settings-row'>
              <div className='filter-settings-row-connector'>
                <div className='filter-settings-row-connector-text-container'>
                  <div className='filter-settings-row-connector-text'>{t('and')}</div>
                </div>
              </div>
              <div className='filter-settings-row-content'>
                <Form.Item label={t('for_duration')} tooltip={t('for_duration_tip')} name='for_duration' className='mb-0'>
                  <InputNumber min={0} style={{ width: '100%' }} placeholder={t('for_duration_placeholder')} />
                </Form.Item>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            className='mt-4'
            item={sectionMap.notify}
            index={sectionKeys.indexOf('notify')}
            summary={notifySummary}
            collapsed={sectionCollapsed.notify}
            setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, notify: collapsed }))}
          >
            <div className='mb-4'>
              <VersionSwitch />
            </div>
            <div
              style={{
                display: notify_version === 0 ? 'block' : 'none',
              }}
            >
              <Form.Item label={t('user_group_ids')} name='user_group_ids'>
                <Select mode='multiple' showSearch optionFilterProp='children' filterOption={false} onSearch={(e) => debounceFetcher(e)} onBlur={() => getGroups('')}>
                  {notifyGroupsOptions}
                </Select>
              </Form.Item>
              <div>
                <Space>
                  {t('redefine_severity')}
                  <Form.Item name='redefine_severity' valuePropName='checked' noStyle>
                    <Switch />
                  </Form.Item>
                </Space>
                <div
                  style={{
                    display: redefineSeverity ? 'block' : 'none',
                    marginTop: 10,
                  }}
                >
                  <Form.Item name='new_severity' noStyle initialValue={2}>
                    <Radio.Group>
                      <Radio value={1}>{t('common:severity.1')}</Radio>
                      <Radio value={2}>{t('common:severity.2')}</Radio>
                      <Radio value={3}>{t('common:severity.3')}</Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>
              </div>
              <div className='mt-4 mb-4'>
                <Space>
                  {t('redefine_channels')}
                  <Form.Item name='redefine_channels' valuePropName='checked' noStyle>
                    <Switch />
                  </Form.Item>
                </Space>
                <div
                  style={{
                    display: redefineChannels ? 'block' : 'none',
                    marginTop: 10,
                  }}
                >
                  <Form.Item name='new_channels' noStyle>
                    <Checkbox.Group>
                      {_.map(contactList, (item: any) => {
                        return (
                          <Checkbox value={item.key} key={item.label}>
                            {item.label}
                          </Checkbox>
                        );
                      })}
                    </Checkbox.Group>
                  </Form.Item>
                  <div className='mt-4'>
                    <NotifyChannelsTpl contactList={contactList} notify_channels={new_channels} name={['extra_config', 'custom_notify_tpl']} />
                  </div>
                </div>
              </div>
              <div className='mb-4'>
                <Space>
                  {t('redefine_webhooks')}
                  <Form.Item name='redefine_webhooks' valuePropName='checked' noStyle>
                    <Switch />
                  </Form.Item>
                </Space>
                <div
                  style={{
                    display: redefineWebhooks ? 'block' : 'none',
                    marginTop: 10,
                  }}
                >
                  <Form.List name='webhooks' initialValue={[]}>
                    {(fields, { add, remove }) => (
                      <>
                        <Row gutter={10} style={{ marginBottom: '8px' }}>
                          <Col span={5}>
                            <Space align='baseline'>
                              <span>{t('webhooks')}</span>
                              <PlusCircleOutlined onClick={() => add()} />
                            </Space>
                          </Col>
                        </Row>
                        {fields.map((field, index) => (
                          <Row gutter={10}>
                            <Col flex='auto'>
                              <Form.Item name={[field.name]} key={index} rules={[{ required: true, message: t('webhooks_msg') }]}>
                                <Input />
                              </Form.Item>
                            </Col>
                            <Col flex='32px'>
                              <MinusCircleOutlined style={{ marginTop: '8px' }} onClick={() => remove(field.name)} />
                            </Col>
                          </Row>
                        ))}
                      </>
                    )}
                  </Form.List>
                </div>
              </div>
            </div>
            <div
              style={{
                display: notify_version === 1 ? 'block' : 'none',
              }}
            >
              <RuleDropdownSelect
                className='mb-0'
                label={t('notify_rule_ids')}
                notificationRules={notificationRules}
                loading={notificationRulesLoading}
                refresh={fetchNotificationRules}
                isAuthorized={notificationRulesAuthorized}
                rules={notify_version === 1 ? [{ required: true, message: t('notify_rule_ids_msg') }] : []}
              />
            </div>
          </SectionCard>

          <SectionCard
            className='mt-4'
            item={sectionMap.basic}
            index={sectionKeys.indexOf('basic')}
            summary={basicSummary}
            collapsed={sectionCollapsed.basic}
            setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, basic: collapsed }))}
          >
            <Row gutter={10}>
              <Col flex='auto'>
                <Form.Item label={t('note')} tooltip={t('name_auto.tip')} name='note' rules={[{ required: true, message: t('note_msg') }]} className='mb-0'>
                  <Input />
                </Form.Item>
              </Col>
              <Col flex='none'>
                <Form.Item
                  label={t('common:table.enabled')}
                  name='disabled'
                  className='mb-0'
                  getValueProps={(value) => ({ checked: value === 0 })}
                  normalize={(checked) => (checked ? 0 : 1)}
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>

          <NotifyExtra />
        </div>
        <AffixWrapper>
          <Card size='small' className='affix-bottom-shadow max-w-[1200px] mx-auto mt-4'>
            <Space>
              <Button type='primary' htmlType='submit'>
                {type === 1 ? t('common:btn.save') : type === 2 ? t('common:btn.clone') : t('common:btn.create')}
              </Button>
              {type === 1 && (
                <Button
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: t('common:confirm.delete'),
                      onOk: () => {
                        detail?.id &&
                          deleteSubscribes({ ids: [detail.id] }, curBusiId).then(() => {
                            message.success(t('common:success.delete'));
                            history.push('/alert-subscribes');
                          });
                      },

                      onCancel() {},
                    });
                  }}
                >
                  {t('common:btn.delete')}
                </Button>
              )}
              <AlertEventRuleTesterWithButton
                onClick={() => {
                  return form.validateFields();
                }}
                onTest={(eventID) => {
                  return form.validateFields().then((values: any) => {
                    return alertSubscribesTryrun({
                      event_id: eventID,
                      config: processFormValues(values, selectedRules),
                    });
                  });
                }}
              />
              <Button onClick={() => window.history.back()}>{t('common:btn.cancel')}</Button>
            </Space>
          </Card>
        </AffixWrapper>
      </Form>
      <RuleModal
        visible={ruleModalShow}
        ruleModalClose={() => {
          setRuleModalShow(false);
        }}
        subscribe={subscribeRule}
        selectedRules={selectedRules}
      />
    </main>
  );
};

export default OperateForm;
