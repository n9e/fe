import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Input, message, Row, Select, Space } from 'antd';
import { Sparkles, ChevronsUpDown, ChevronsDownUp, PanelRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import AffixWrapper from '@/components/AffixWrapper';
import KVTagSelect, { validatorOfKVTagSelect } from '@/components/KVTagSelect';
import { DatasourceCateSelectV2 } from '@/components/DatasourceSelect';
import { addStrategy, EditStrategy } from '@/services/warning';
import { scrollToFirstError } from '@/utils';
import { IS_PLUS } from '@/utils/constant';

import { defaultValues } from '../Form/constants';
import { processFormValues, processInitialValues, getDefaultValuesByCate } from '../Form/utils';
import SectionCard, { SectionItem } from './components/SectionCard';
import Sidebar from './components/Sidebar';
import DatasourceValueSelect from './components/DatasourceValueSelect';
import Host from './Rule/Host';
import Rule from './Rule';
import PipelineConfigsNG, { PipelineConfigsNGRef } from './PipelineConfigsNG';
import Effective from './Effective';
import Notify from './Notify';
import useScrollSync from './utils/useScrollSync';
import shouldShowAdvancedSettings from './utils/shouldShowAdvancedSettings';
import { FormNGDataProvider } from './context';

interface IProps {
  type?: number; // 空: 新增 1:编辑 2:克隆 3:查看
  initialValues?: any;
  editable?: boolean;
}

export const FormStateContext = createContext({
  disabled: false,
  type: undefined as number | undefined,
});

export default function FormNG(props: IProps) {
  const { type, initialValues, editable = true } = props;
  const history = useHistory();
  const { bgid } = useParams<{ bgid: string }>();
  const { t, i18n } = useTranslation('alertRules');

  const { busiGroups, datasourceCateOptions, groupedDatasourceList, reloadGroupedDatasourceList, licenseRulesRemaining } = useContext(CommonStateContext);
  const disabled = type === 3;

  const [form] = Form.useForm();
  const prod = Form.useWatch('prod', form);
  const cate = Form.useWatch('cate', form);
  const notifyVersion = Form.useWatch('notify_version', form);
  const showAdvanced = shouldShowAdvancedSettings(notifyVersion, cate);
  const [sidebarVisible, setSidebarVisible] = useState(() => localStorage.getItem('alert_rule_form_ng_sidebar_visible') !== 'false');

  useEffect(() => {
    localStorage.setItem('alert_rule_form_ng_sidebar_visible', String(sidebarVisible));
  }, [sidebarVisible]);

  const sections = useMemo(() => {
    const showRuleHelp = prod === 'metric' && cate === 'prometheus';
    const allSections: SectionItem[] = [
      {
        key: 'basic',
        title: t('basic_configs'),
        description: t('name_severities_appendtags'),
        tag: 'default',
        helpDoc: {
          documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/alert-basic-conf/',
        },
      },
      {
        key: 'datasource',
        title: t('datasource_configs'),
        description: t('datasource_configs_desc'),
        tag: 'core',
      },
      {
        key: 'rule',
        title: t('rule_configs'),
        description: t('rule_configs_desc'),
        tag: 'core',
        ...(showRuleHelp
          ? {
              helpDoc: {
                documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/query-data/promethues/',
              },
            }
          : {}),
      },
      {
        key: 'pipeline',
        title: t('pipeline_configuration_ng.title'),
        description: t('pipeline_configuration_ng.desc'),
        tag: 'optional',
      },
      {
        key: 'effective',
        title: t('effective_configs'),
        description: t('effective_configs_desc'),
        tag: 'optional',
        helpDoc: {
          documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/effective-configuration/',
        },
      },
      {
        key: 'notify',
        title: t('notify_configs'),
        description: t('notify_configs_desc'),
        tag: 'optional',
      },
      {
        key: 'advanced',
        title: t('alertRules_extra:advanced_title'),
        description: t('alertRules_extra:advanced_title_desc'),
        tag: 'optional',
      },
    ];
    return IS_PLUS && showAdvanced ? allSections : allSections.filter((s) => s.key !== 'advanced');
  }, [i18n.language, showAdvanced, prod, cate]);

  const pipelineConfigsRef = React.useRef<PipelineConfigsNGRef>(null);
  const scroll = useScrollSync(sections);

  const handleCheck = (values) => {
    if (values.cate === 'prometheus') {
      if (values.rule_config.checked && values.prod === 'anomaly') {
        message.warning(t('validate_metric_msg'));
        return false;
      }
    } else if (type !== 1) {
      if (licenseRulesRemaining === 0 && values.prod === 'anomaly') {
        message.error(t('smart_rule_limit_msg'));
        return false;
      }
    }
    return true;
  };

  const handleMessage = (res) => {
    if (type === 1) {
      if (res.err) {
        message.error(res.error);
      } else {
        message.success(t('common:success.modify'));
        history.push('/alert-rules');
      }
    } else {
      const { dat } = res;
      let errorNum = 0;
      const msg = Object.keys(dat).map((key) => {
        dat[key] && errorNum++;
        return dat[key];
      });

      if (!errorNum) {
        message.success(`${type === 2 ? t('common:success.clone') : t('common:success.add')}`);
        history.push('/alert-rules');
      } else {
        message.error(t(msg));
      }
    }
  };

  useEffect(() => {
    if (type === 1 || type === 2 || type === 3 || !_.isEmpty(initialValues)) {
      form.setFieldsValue(processInitialValues(initialValues));
    } else {
      const newValues = {
        ...defaultValues,
        group_id: Number(bgid),
      };
      if (_.find(datasourceCateOptions, { value: 'prometheus' })) {
        newValues.prod = 'metric';
        newValues.cate = 'prometheus';
      } else if (datasourceCateOptions.length) {
        newValues.prod = datasourceCateOptions[0].type[0];
        newValues.cate = datasourceCateOptions[0].value;
      } else {
        newValues.prod = 'host';
        newValues.cate = 'host';
      }
      form.setFieldsValue(newValues);
    }
  }, [initialValues]);

  return (
    <FormStateContext.Provider
      value={{
        disabled,
        type,
      }}
    >
      <Form form={form} layout='vertical' disabled={disabled} className='h-full'>
        <FormNGDataProvider>
          <div className='flex h-full min-h-0 overflow-hidden bg-fc-50'>
            <div
              className='flex-1 min-w-0 h-full best-looking-scroll'
              ref={scroll.containerRef}
              onScroll={scroll.handleScroll}
              onWheel={scroll.handleUserScroll}
              onTouchMove={scroll.handleUserScroll}
            >
              <div className='w-full max-w-[1200px] mx-auto p-5'>
                <div className='flex items-center justify-end gap-2 mb-4'>
                  <div className='flex items-center gap-2'>
                    <Button
                      onClick={() => {
                        scroll.setSectionCollapsed((prev) => ({
                          ...prev,
                          basic: false,
                          datasource: false,
                          rule: false,
                          pipeline: true,
                          notify: true,
                          effective: true,
                          advanced: true,
                        }));
                      }}
                      className='flex items-center gap-1'
                      size='small'
                      icon={<Sparkles size={12} className='text-error' />}
                    >
                      {t('form_ng.collapse_core_only')}
                    </Button>
                    {(() => {
                      const visibleKeys = sections.map((s) => s.key);
                      const allExpanded = visibleKeys.every((k) => scroll.sectionCollapsed[k] === false);
                      return (
                        <Button
                          onClick={() => {
                            scroll.setSectionCollapsed((prev) => {
                              const anyCollapsed = visibleKeys.some((k) => prev[k] === true);
                              const next = {};
                              for (const k of visibleKeys) {
                                next[k] = anyCollapsed ? false : true;
                              }
                              return { ...prev, ...next };
                            });
                            scroll.setToggleAllSignal({ action: allExpanded ? 'collapse' : 'expand', ts: Date.now() });
                          }}
                          className='flex items-center gap-1'
                          size='small'
                          icon={allExpanded ? <ChevronsDownUp size={12} /> : <ChevronsUpDown size={12} />}
                        >
                          {allExpanded ? t('form_ng.collapse_collapse_all') : t('form_ng.collapse_expand_all')}
                        </Button>
                      );
                    })()}
                    <Button
                      onClick={() => {
                        setSidebarVisible((prev) => !prev);
                      }}
                      className='flex items-center gap-1'
                      size='small'
                      icon={<PanelRight size={12} />}
                    >
                      {sidebarVisible ? t('form_ng.collapse_sidebar') : t('form_ng.expand_sidebar')}
                    </Button>
                  </div>
                </div>
                {editable === false && <Alert type='warning' message={t('expired')} className='mb-4' />}
                <Form.Item name='disabled' hidden>
                  <div />
                </Form.Item>
                <Form.Item name='prod' hidden>
                  <div />
                </Form.Item>
                <Form.Item name='cate' hidden>
                  <div />
                </Form.Item>

                <SectionCard
                  item={sections[0]}
                  index={0}
                  collapsed={scroll.sectionCollapsed.basic}
                  setCollapsed={(collapsed) => scroll.setSectionCollapsed((prev) => ({ ...prev, basic: collapsed }))}
                  sectionRef={(node) => {
                    scroll.sectionRefs.current.basic = node;
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} lg={8}>
                      <Form.Item label={t('name')} name='name' rules={[{ required: true }]}>
                        <Input placeholder={t('name_placeholder')} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={8}>
                      <Form.Item label={t('group_id')} name='group_id' rules={[{ required: true }]}>
                        <Select
                          placeholder={t('group_id_placeholder')}
                          options={_.map(busiGroups, (item) => ({
                            label: item.name,
                            value: item.id,
                          }))}
                          showSearch
                          optionFilterProp='label'
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={8}>
                      <Form.Item label={t('append_tags')} name='append_tags' rules={[validatorOfKVTagSelect]} tooltip={t('append_tags_note_tip')}>
                        <KVTagSelect />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item label={t('note')} name='note' className='mb-0'>
                        <Input.TextArea placeholder={t('note_placeholder')} autoSize={{ minRows: 3, maxRows: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </SectionCard>

                <SectionCard
                  item={sections[1]}
                  index={1}
                  collapsed={scroll.sectionCollapsed.datasource}
                  setCollapsed={(collapsed) => scroll.setSectionCollapsed((prev) => ({ ...prev, datasource: collapsed }))}
                  sectionRef={(node) => {
                    scroll.sectionRefs.current['datasource'] = node;
                  }}
                >
                  <Form.Item label={t('form_ng.cate')} name='cate' rules={[{ required: true }]}>
                    <DatasourceCateSelectV2
                      filterCates={(cates) => {
                        const filtedCates = _.filter(cates, (item) => {
                          return !!item.alertRule && (item.alertPro ? IS_PLUS : true);
                        });
                        const sortedCateValues = [
                          'prometheus',
                          'ck',
                          'influxdb',
                          'loki',
                          'doris',
                          'mysql',
                          'oracle',
                          'redshift',
                          'pgsql',
                          'victorialogs',
                          'elasticsearch',
                          'opensearch',
                          'aliyun-sls',
                          'tencent-cls',
                          'volc-tls',
                          'huawei-lts',
                          'bce-bls',
                          'tdengine',
                          'cloudwatch',
                          'cloudwatchlogs',
                          'gcm',
                        ];
                        const sorted = _.sortBy(filtedCates, (cate) => {
                          const idx = _.indexOf(sortedCateValues, cate.value);
                          return idx === -1 ? 999 : idx;
                        });
                        return _.concat(sorted, {
                          value: 'host',
                          label: 'Host',
                          type: ['host'],
                          alertRule: true,
                          alertPro: false,
                          logo: '/image/logos/host.png',
                        } as any);
                      }}
                      onChange={(val, record) => {
                        const { type } = record;
                        const curProd = type[0];
                        form.setFieldsValue(getDefaultValuesByCate(curProd, val));
                      }}
                    />
                  </Form.Item>
                  {prod !== 'host' && (
                    <DatasourceValueSelect datasourceList={groupedDatasourceList[cate] || []} reloadGroupedDatasourceList={reloadGroupedDatasourceList} showExtra />
                  )}
                </SectionCard>

                <SectionCard
                  item={sections[2]}
                  index={2}
                  collapsed={scroll.sectionCollapsed.rule}
                  setCollapsed={(collapsed) => scroll.setSectionCollapsed((prev) => ({ ...prev, rule: collapsed }))}
                  sectionRef={(node) => {
                    scroll.sectionRefs.current['rule'] = node;
                  }}
                >
                  <Form.Item isListField={false} name={['rule_config', 'inhibit']} valuePropName='checked' noStyle hidden>
                    <div />
                  </Form.Item>
                  {prod === 'host' && <Host />}
                  {prod !== 'host' && <Rule />}
                </SectionCard>

                <PipelineConfigsNG
                  item={sections[3]}
                  sectionRefs={scroll.sectionRefs}
                  ref={pipelineConfigsRef}
                  initialValues={initialValues ? processInitialValues(initialValues) : defaultValues}
                  expandSignal={scroll.expandSignal}
                  toggleAllSignal={scroll.toggleAllSignal}
                />

                <Effective
                  item={sections[4]}
                  sectionRefs={scroll.sectionRefs}
                  initialValues={initialValues ? processInitialValues(initialValues) : defaultValues}
                  expandSignal={scroll.expandSignal}
                  toggleAllSignal={scroll.toggleAllSignal}
                />

                <Notify
                  item={sections[5]}
                  advancedItem={sections[6]}
                  sectionRefs={scroll.sectionRefs}
                  disabled={disabled}
                  expandSignal={scroll.expandSignal}
                  toggleAllSignal={scroll.toggleAllSignal}
                />
              </div>
              <AffixWrapper>
                <Card size='small' className='affix-bottom-shadow max-w-[1200px] mx-auto'>
                  {!disabled && (
                    <Space>
                      <Button
                        type='primary'
                        onClick={() => {
                          form
                            .validateFields()
                            .then(async () => {
                              const values = form.getFieldsValue(true);
                              if (!handleCheck(values)) return;
                              const data = processFormValues(values) as any;
                              if (type === 1) {
                                const res = await EditStrategy(data, initialValues.group_id, initialValues.id);
                                handleMessage(res);
                              } else {
                                const curBusiId = initialValues?.group_id || Number(bgid);
                                const res = await addStrategy([data], curBusiId);
                                handleMessage(res);
                              }
                            })
                            .catch((err) => {
                              console.error(err);
                              scrollToFirstError();
                            });
                        }}
                        disabled={editable === false}
                      >
                        {t('common:btn.save')}
                      </Button>
                      <Link to='/alert-rules'>
                        <Button>{t('common:btn.cancel')}</Button>
                      </Link>
                    </Space>
                  )}
                </Card>
              </AffixWrapper>
            </div>
            {sidebarVisible && (
              <Sidebar sections={sections} activeSection={scroll.activeSection} onSectionClick={scroll.scrollToSection} datasourceList={groupedDatasourceList[cate] || []} />
            )}
          </div>
        </FormNGDataProvider>
      </Form>
    </FormStateContext.Provider>
  );
}
