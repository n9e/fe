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
import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { Form, Input, Card, Select, Col, Button, Row, message, DatePicker, Tooltip, Space, Radio, TimePicker, Checkbox, Alert } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ListFilter, BellOff, FileText } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';

import { addShield, editShield, alertMuteTryrun } from '@/services/shield';
import { shieldItem } from '@/store/warningInterface';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import { CommonStateContext } from '@/App';
import { DatasourceCateSelect } from '@/components/DatasourceSelect';
import { allCates, getCateDisplayLabel } from '@/components/AdvancedWrap/utils';
import { scrollToFirstError } from '@/utils';
import AlertEventRuleTesterWithButton from '@/components/AlertEventRuleTesterWithButton';
import { KVTags } from '@/components/KVTagSelect';
import Markdown from '@/components/Markdown';
import AffixWrapper from '@/components/AffixWrapper';
import SectionCard, { SectionItem } from '@/pages/alertRules/FormNG/components/SectionCard';

import { processFormValues, buildMuteScopeText, formatMuteTag, formatSeverities, formatDuration, isMuteScopeUnlimited } from './utils';
import DaysOfWeekSelect from './DaysOfWeekSelect';
import PreviewMutedEvents from './PreviewMutedEvents';
import '../index.less';

const { TextArea } = Input;

const DOC_PATH = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-mute/';
// 高频屏蔽时长，点击后按开始时间推算结束时间
const QUICK_DURATIONS = ['30m', '1h', '2h', '6h', '12h', '1d', '3d', '7d', '30d'];
// 超过该时长给出提醒，避免配置了长期屏蔽后忘记解除
const LONG_DURATION_DAYS = 30;

const parseDuration = (val: string) => {
  const unit = val.charAt(val.length - 1);
  const num = _.toNumber(val.substring(0, val.length - 1));
  return { unit, num };
};

interface Props {
  detail?: shieldItem;
  type?: number; // 1:编辑; 2:克隆 3:新增
}

const OperateForm: React.FC<Props> = ({ detail = {}, type }: any) => {
  const { t, i18n } = useTranslation('alertMutes');
  const btimeDefault = new Date().getTime();
  const etimeDefault = new Date().getTime() + 1 * 60 * 60 * 1000; // 默认时长1h
  const [form] = Form.useForm(null as any);
  const history = useHistory();
  const { groupedDatasourceList, busiGroups, isPlus, businessGroupOnChange } = useContext(CommonStateContext);

  const cate = Form.useWatch('cate', form);
  const datasourceIds = Form.useWatch('datasource_ids', form);
  const severities = Form.useWatch('severities', form);
  const tags = Form.useWatch('tags', form);
  const muteTimeType = Form.useWatch('mute_time_type', form);
  const muteType = Form.useWatch('mute_type', form);
  const btime = Form.useWatch('btime', form);
  const etime = Form.useWatch('etime', form);
  const periodicMutes = Form.useWatch('periodic_mutes', form);

  const sections = useMemo<SectionItem[]>(() => {
    return [
      {
        key: 'filter',
        title: t('filter_configs'),
        description: t('filter_configs_desc'),
        tag: 'core',
        icon: <ListFilter size={14} />,
        helpDoc: {
          documentPath: DOC_PATH,
        },
      },
      {
        key: 'mute',
        title: t('mute_configs'),
        description: t('mute_configs_desc'),
        tag: 'core',
        icon: <BellOff size={14} />,
      },
      {
        key: 'basic',
        title: t('basic_configs'),
        description: t('basic_configs_desc'),
        tag: 'default',
        icon: <FileText size={14} />,
      },
    ];
  }, [i18n.language]);

  // 分区序号由 sections 的书写顺序推导，调用点按 key 取值，避免插入/隐藏分区时漏改序号
  const sectionKeys = useMemo(() => _.map(sections, 'key'), [sections]);
  const sectionMap = useMemo(() => _.keyBy(sections, 'key') as Record<string, SectionItem | undefined>, [sections]);

  const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>({
    filter: false,
    mute: false,
    basic: false,
  });

  const cateLabel = getCateDisplayLabel(_.find(allCates, { value: cate }), i18n.language);
  const datasourceNames = _.compact(
    _.map(datasourceIds, (id) => {
      if (id === 0) return '';
      return _.find(groupedDatasourceList[cate], { id })?.name;
    }),
  );

  // 自动生成规则标题：仅当标题为空或仍是上次自动生成值时覆盖，用户手动改过则不再干预
  const lastAutoNameRef = useRef<string>();
  useEffect(() => {
    const scope = buildMuteScopeText({
      tags,
      severities,
      datasourceNames,
      cateLabel,
      separator: t('name_auto_separator'),
      fallbackText: t('name_auto_all_alerts'),
    });
    const suggestion = t('name_auto_template', { scope });
    const current = form.getFieldValue('note');
    if (current && current !== lastAutoNameRef.current) return;
    if (current !== suggestion) {
      form.setFieldsValue({ note: suggestion });
    }
    lastAutoNameRef.current = suggestion;
  }, [cateLabel, JSON.stringify(datasourceNames), JSON.stringify(severities), JSON.stringify(tags)]);

  const scopeUnlimited = isMuteScopeUnlimited({ tags, datasource_ids: datasourceIds });
  const durationText = formatDuration(btime, etime);
  const isExpired = muteTimeType === 0 && etime && moment(etime).isBefore(moment());
  const isLongDuration = muteTimeType === 0 && btime && etime && moment(etime).diff(moment(btime), 'days') >= LONG_DURATION_DAYS;
  const activeQuickDuration = useMemo(() => {
    if (!btime || !etime) return undefined;
    const diff = moment(etime).valueOf() - moment(btime).valueOf();
    return _.find(QUICK_DURATIONS, (item) => {
      const { unit, num } = parseDuration(item);
      return moment.duration(num, unit as any).asMilliseconds() === diff;
    });
  }, [btime, etime]);

  const filterSummary = _.compact([
    _.isEmpty(datasourceNames) ? cateLabel : `${cateLabel} / ${_.take(datasourceNames, 2).join(', ')}`,
    formatSeverities(severities) || t('summary.severities_all'),
    _.isEmpty(_.compact(_.map(tags, formatMuteTag))) ? t('summary.tags_none') : t('summary.tags_count', { count: _.size(_.compact(_.map(tags, formatMuteTag))) }),
  ]).join(' · ');

  const muteSummary = (() => {
    const methodText = t(`mute_method.${muteType ?? 0}`);
    if (muteTimeType === 1) {
      return `${t('mute_type.1')} · ${t('summary.periodic_count', { count: _.size(periodicMutes) })} · ${methodText}`;
    }
    if (!btime || !etime) return methodText;
    return `${moment(btime).format('MM-DD HH:mm')} ~ ${moment(etime).format('MM-DD HH:mm')}${durationText ? ` (${durationText})` : ''} · ${methodText}`;
  })();

  const onFinish = (values) => {
    const params = processFormValues(values);
    const curBusiItemId = form.getFieldValue('group_id');
    const historyPushOptions = {
      pathname: '/alert-mutes',
      search: `?ids=${curBusiItemId}&isLeaf=true`,
    };
    if (type == 1) {
      editShield(params, curBusiItemId, detail.id).then((_) => {
        message.success(t('common:success.edit'));
        history.push(historyPushOptions);
      });
    } else {
      businessGroupOnChange(_.toString(curBusiItemId));
      addShield(params, curBusiItemId).then((_) => {
        message.success(t('common:success.add'));
        history.push(historyPushOptions);
      });
    }
  };

  // 点击快捷时长：保留用户已设置的开始时间，只推算结束时间
  const quickDurationChange = (val: string) => {
    const { unit, num } = parseDuration(val);
    const start = form.getFieldValue('btime') || moment();
    form.setFieldsValue({
      btime: moment(start),
      etime: moment(start).add({ [unit]: num }),
    });
    form.validateFields(['etime']);
  };

  // 校验失败时展开包含错误项的分区，否则被 display:none 隐藏的错误项滚动不可见，保存表现为"没反应"
  const expandErrorSections = (errorFields?: { name: (string | number)[] }[]) => {
    const errorSectionKeys: string[] = [];
    _.forEach(errorFields, ({ name }) => {
      const root = name?.[0];
      if (_.includes(['btime', 'etime', 'periodic_mutes'], root)) {
        errorSectionKeys.push('mute');
      } else if (_.includes(['note', 'cause'], root)) {
        errorSectionKeys.push('basic');
      } else {
        errorSectionKeys.push('filter');
      }
    });
    if (errorSectionKeys.length) {
      setSectionCollapsed((prev) => ({
        ...prev,
        ..._.zipObject(
          errorSectionKeys,
          _.map(errorSectionKeys, () => false),
        ),
      }));
    }
  };

  const validateFields = () => {
    return form.validateFields().catch((err) => {
      expandErrorSections(err?.errorFields);
      scrollToFirstError();
      return Promise.reject(err);
    });
  };

  return (
    <div className='operate-form-index' style={{ background: 'none' }}>
      <Form
        form={form}
        layout='vertical'
        className='operate-form'
        onFinish={onFinish}
        initialValues={{
          ...detail,
          prod: detail.prod || 'metric',
          cate: detail.cate || 'prometheus',
          severities: detail.severities || [1, 2, 3],
          btime: detail?.btime ? moment(detail.btime * 1000) : moment(btimeDefault),
          etime: detail?.etime ? moment(detail.etime * 1000) : moment(etimeDefault),
          mute_time_type: detail?.mute_time_type || 0,
          mute_type: detail?.mute_type || 0,
          periodic_mutes: detail?.periodic_mutes
            ? _.map(detail?.periodic_mutes, (item) => {
                return {
                  enable_days_of_week: _.split(item.enable_days_of_week, ' '),
                  enable_stime: moment(item.enable_stime, 'HH:mm'),
                  enable_etime: moment(item.enable_etime, 'HH:mm'),
                };
              })
            : [
                {
                  enable_days_of_week: ['1', '2', '3', '4', '5', '6', '0'],
                  enable_stime: moment('00:00', 'HH:mm'),
                  enable_etime: moment('00:00', 'HH:mm'),
                },
              ],
        }}
      >
        <div className='w-full max-w-[1200px] mx-auto'>
          <SectionCard
            item={sectionMap.filter!}
            index={sectionKeys.indexOf('filter')}
            collapsed={sectionCollapsed.filter}
            setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, filter: collapsed }))}
            summary={filterSummary}
          >
            <Form.Item label={t('common:business_group')} name='group_id' extra={t('alert_content')} rules={[{ required: true }]}>
              <Select
                disabled={type == 1}
                options={_.map(busiGroups, (item) => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                })}
                showSearch
                optionFilterProp='label'
              />
            </Form.Item>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item label={t('common:datasource.type')} name='cate'>
                  <DatasourceCateSelect
                    scene='alert'
                    filterCates={(cates) => {
                      return _.filter(cates, (item) => {
                        return !!item.alertRule && (item.alertPro ? isPlus : true);
                      });
                    }}
                    onChange={() => {
                      form.setFieldsValue({
                        datasource_ids: [],
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
                  {({ getFieldValue, setFieldsValue }) => {
                    const cate = getFieldValue('cate');
                    return (
                      <DatasourceValueSelect mode='multiple' setFieldsValue={setFieldsValue} cate={cate} datasourceList={groupedDatasourceList[cate] || []} required={false} />
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={t('severities')} name='severities' tooltip={t('severities_tip')} rules={[{ required: true, message: t('severities_msg') }]}>
              <Checkbox.Group
                options={[
                  {
                    label: t('common:severity.1'),
                    value: 1,
                  },
                  {
                    label: t('common:severity.2'),
                    value: 2,
                  },
                  {
                    label: t('common:severity.3'),
                    value: 3,
                  },
                ]}
              />
            </Form.Item>
            <KVTags
              name={['tags']}
              keyLabel={t('tag.key.label')}
              keyLabelTootip={
                <div className='pt-2 px-1'>
                  <Markdown content={t('tag.key.tip')} inTooltip />
                </div>
              }
            />
            {scopeUnlimited && <Alert className='mt-3' type='warning' showIcon message={t('scope_unlimited_tip')} />}
          </SectionCard>

          <SectionCard
            className='mt-4'
            item={sectionMap.mute!}
            index={sectionKeys.indexOf('mute')}
            collapsed={sectionCollapsed.mute}
            setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, mute: collapsed }))}
            summary={muteSummary}
          >
            <Form.Item label={t('mute_method.label')} name='mute_type' tooltip={t('mute_method.tip')}>
              <Radio.Group>
                <Radio value={0}>
                  {t('mute_method.0')}
                  <span className='text-soft ml-1'>{t('mute_method.0_desc')}</span>
                </Radio>
                <Radio value={1}>
                  {t('mute_method.1')}
                  <span className='text-soft ml-1'>{t('mute_method.1_desc')}</span>
                </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label={t('mute_type.label')} name='mute_time_type'>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value={0}>{t('mute_type.0')}</Radio.Button>
                <Radio.Button value={1}>{t('mute_type.1')}</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <div style={{ display: muteTimeType === 1 ? 'none' : 'block' }}>
              <Form.Item label={t('duration_quick')} tooltip={t('duration_quick_tip')}>
                <Radio.Group
                  optionType='button'
                  size='small'
                  value={activeQuickDuration}
                  onChange={(e) => {
                    quickDurationChange(e.target.value);
                  }}
                  options={_.map(QUICK_DURATIONS, (item) => ({ label: item, value: item }))}
                />
              </Form.Item>
              <Row gutter={10}>
                <Col span={12}>
                  {/* 开始时间变化后同步复校验结束时间，避免残留的先后关系报错 */}
                  <Form.Item label={t('btime')} name='btime' rules={[{ required: muteTimeType !== 1, message: t('btime_msg') }]}>
                    <DatePicker
                      showTime
                      onChange={() => {
                        form.validateFields(['etime']);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('etime')}
                    name='etime'
                    dependencies={['btime']}
                    rules={[
                      { required: muteTimeType !== 1, message: t('etime_msg') },
                      ({ getFieldValue }) => ({
                        validator(_rule, value) {
                          const start = getFieldValue('btime');
                          if (getFieldValue('mute_time_type') === 1 || !value || !start) return Promise.resolve();
                          if (moment(value).valueOf() <= moment(start).valueOf()) {
                            return Promise.reject(new Error(t('etime_before_btime_msg')));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <DatePicker showTime />
                  </Form.Item>
                </Col>
              </Row>
              {durationText && (
                <div className='text-soft'>
                  {t('duration')}: {durationText}
                </div>
              )}
              {isExpired && <Alert className='mt-3' type='warning' showIcon message={t('expired_tip')} />}
              {isLongDuration && <Alert className='mt-3' type='info' showIcon message={t('long_duration_tip', { days: LONG_DURATION_DAYS })} />}
            </div>
            <div style={{ display: muteTimeType === 1 ? 'block' : 'none' }}>
              <Form.List name='periodic_mutes'>
                {(fields, { add, remove }) => (
                  <>
                    <Space>
                      <div style={{ width: 450 }}>
                        <Space align='baseline'>
                          {t('mute_type.days_of_week')}
                          <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
                        </Space>
                      </div>
                      <div style={{ width: 110 }}>
                        <Space>
                          {t('mute_type.start')}
                          <Tooltip title={t('alertRules:effective_time_tip')}>
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      </div>
                      <div style={{ width: 110 }}>
                        <Space>
                          {t('mute_type.end')}
                          <Tooltip title={t('alertRules:effective_time_tip')}>
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      </div>
                    </Space>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space
                        key={key}
                        style={{
                          display: 'flex',
                          marginBottom: 8,
                        }}
                        align='baseline'
                      >
                        <Form.Item
                          {...restField}
                          name={[name, 'enable_days_of_week']}
                          style={{ width: 450 }}
                          rules={[
                            {
                              required: true,
                              message: t('mute_type.days_of_week_msg'),
                            },
                          ]}
                        >
                          <DaysOfWeekSelect />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'enable_stime']}
                          style={{ width: 110 }}
                          rules={[
                            {
                              required: true,
                              message: t('mute_type.start_msg'),
                            },
                          ]}
                        >
                          <TimePicker format='HH:mm' />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'enable_etime']}
                          style={{ width: 110 }}
                          rules={[
                            {
                              required: true,
                              message: t('mute_type.end_msg'),
                            },
                          ]}
                        >
                          <TimePicker format='HH:mm' />
                        </Form.Item>
                        {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(name)} />}
                      </Space>
                    ))}
                  </>
                )}
              </Form.List>
              <div className='text-soft'>{t('mute_type.periodic_tip')}</div>
            </div>
          </SectionCard>

          <SectionCard
            className='mt-4'
            item={sectionMap.basic!}
            index={sectionKeys.indexOf('basic')}
            collapsed={sectionCollapsed.basic}
            setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, basic: collapsed }))}
          >
            <Form.Item
              label={t('note')}
              name='note'
              tooltip={t('name_auto_tip')}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label={t('cause')} name='cause' tooltip={t('cause_tip')} className='mb-0'>
              <TextArea rows={3} placeholder={t('cause_placeholder')} />
            </Form.Item>
          </SectionCard>
        </div>
        <AffixWrapper>
          <Card size='small' className='affix-bottom-shadow max-w-[1200px] mx-auto'>
            <Space>
              <PreviewMutedEvents
                form={form}
                validateFields={validateFields}
                onOk={() => {
                  validateFields().then((values: any) => {
                    onFinish(values);
                  });
                }}
              />
              <AlertEventRuleTesterWithButton
                onClick={() => {
                  return validateFields();
                }}
                onTest={(eventID) => {
                  return validateFields().then((values: any) => {
                    return alertMuteTryrun({
                      event_id: eventID,
                      config: processFormValues(values),
                    });
                  });
                }}
              />
              <Button onClick={() => window.history.back()}>{t('common:btn.cancel')}</Button>
            </Space>
          </Card>
        </AffixWrapper>
      </Form>
    </div>
  );
};

export default OperateForm;
