import React, { useContext, useRef, useState } from 'react';
import { Alert, Button, Checkbox, Collapse, Form, Modal, Radio, Select, Space, Spin, Steps, Tag, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DetailNG from '@/pages/event/DetailNG';
import { getPromData } from '@/components/PromGraphCpt/services';
import { N9E_PATHNAME } from '@/utils/constant';
import { processFormValues } from '@/pages/alertRules/Form/utils';
import { alertRuleTestFire } from '@/pages/alertRules/services';

import { getConfiguredSeverities, getDefaultSeverity, getFirstPromql, parseVectorSeries, summarizeNotifyResults, SampleSeries, TestFireStage } from './utils';

interface Props {
  /** 保存接口同款业务组 id：initialValues?.group_id || 路由上的 bgid */
  bgid?: number;
  buttonDisabled?: boolean;
}

const STAGE_KEYS = ['query_check', 'synthesize', 'effective', 'pipeline', 'mute', 'notify'];

const statusIconMap: Record<string, React.ReactNode> = {
  pass: <CheckCircleOutlined className='text-success' />,
  warn: <ExclamationCircleOutlined style={{ color: 'var(--fc-orange-9)' }} />,
  fail: <CloseCircleOutlined className='text-error' />,
  skip: <MinusCircleOutlined className='text-soft' />,
};

const statusTagColorMap: Record<string, string> = {
  pass: 'success',
  warn: 'warning',
  fail: 'error',
  skip: 'default',
};

export default function TestFireModal(props: Props) {
  const { bgid, buttonDisabled } = props;
  const { t } = useTranslation('alertRules');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const form = Form.useFormInstance();

  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'settings' | 'result'>('settings');
  const [loading, setLoading] = useState(false);

  const [severity, setSeverity] = useState(2);
  // 规则里实际配置过的档位：多档位时供选择「模拟命中哪一档」，单档位时收敛为说明文字
  const [severityOptions, setSeverityOptions] = useState<number[]>([1, 2, 3]);
  const [eventType, setEventType] = useState<'trigger' | 'recover'>('trigger');
  const [skipSend, setSkipSend] = useState(false);
  const [notifyRecovered, setNotifyRecovered] = useState<boolean>(true);
  const [isPrometheus, setIsPrometheus] = useState(false);

  const [datasourceId, setDatasourceId] = useState<number>();
  const [series, setSeries] = useState<SampleSeries[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [selectedSeriesIndex, setSelectedSeriesIndex] = useState<number>();

  const [result, setResult] = useState<{ event: any; stages: TestFireStage[] }>();

  // 数据源快速切换时，先发的旧查询可能后到并覆盖新结果；用请求序号丢弃过期响应
  const seriesReqIdRef = useRef(0);

  const fetchSeries = (dsId?: number) => {
    const reqId = ++seriesReqIdRef.current;
    // 每次拉取先清空，避免在响应回来前回显上一轮的序列/选中项
    setSeries([]);
    setSelectedSeriesIndex(undefined);
    const promql = getFirstPromql(form.getFieldValue('rule_config'));
    if (!dsId || !promql) {
      setSeriesLoading(false);
      return;
    }
    setSeriesLoading(true);
    getPromData(`/api/${N9E_PATHNAME}/proxy/${dsId}/api/v1/query`, {
      time: moment().unix(),
      query: promql,
    })
      .then((res) => {
        if (reqId !== seriesReqIdRef.current) return; // 过期响应丢弃
        const parsed = parseVectorSeries(res);
        setSeries(parsed);
        setSelectedSeriesIndex(parsed.length > 0 ? 0 : undefined);
      })
      .catch((error) => {
        if (reqId !== seriesReqIdRef.current) return;
        console.error(error);
        setSeries([]);
        setSelectedSeriesIndex(undefined);
      })
      .finally(() => {
        if (reqId !== seriesReqIdRef.current) return;
        setSeriesLoading(false);
      });
  };

  // 关闭/重开时清理本地状态，避免再次打开回显上一轮的数据（项目规范要求）
  const resetLocalState = () => {
    seriesReqIdRef.current += 1;
    setSeries([]);
    setSelectedSeriesIndex(undefined);
    setSeriesLoading(false);
    setLoading(false);
    setResult(undefined);
    setPhase('settings');
  };

  const openModal = () => {
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue(true);
        const prometheus = values.cate === 'prometheus';
        resetLocalState();
        setIsPrometheus(prometheus);
        const configured = getConfiguredSeverities(values.rule_config);
        setSeverityOptions(configured.length > 0 ? configured : [1, 2, 3]);
        setSeverity(getDefaultSeverity(values.rule_config));
        setEventType('trigger');
        setSkipSend(false);
        // 表单里是 Switch 的布尔值，DB/接口里才是 0/1，两种形态都兼容
        setNotifyRecovered(values.notify_recovered === true || values.notify_recovered === 1);
        setDatasourceId(values.datasource_value);
        setVisible(true);
        if (prometheus) {
          fetchSeries(values.datasource_value);
        }
      })
      .catch(() => {
        message.warning(t('form_ng.test_fire.validate_first'));
      });
  };

  const closeModal = () => {
    setVisible(false);
    resetLocalState();
  };

  const run = () => {
    // processFormValues 会派生新对象，但按仓库约定先 cloneDeep 保护表单原始引用
    const values = _.cloneDeep(form.getFieldsValue(true));
    const config = processFormValues(values);
    const selected = isPrometheus && selectedSeriesIndex !== undefined ? series[selectedSeriesIndex] : undefined;
    const sample = selected
      ? {
          labels: selected.labels,
          value: selected.value,
          query: getFirstPromql(values.rule_config),
        }
      : undefined;

    setLoading(true);
    alertRuleTestFire(bgid as number, {
      event_type: eventType,
      severity,
      skip_send: skipSend,
      sample,
      config,
    })
      .then((res) => {
        if (res.err) {
          message.error(res.err);
          return;
        }
        setResult(res.dat);
        setPhase('result');
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderStageDescription = (stage: TestFireStage) => {
    const data = stage.data || {};
    const tf = (key: string, options?: any) => t(`form_ng.test_fire.${key}`, options);

    if (data.reason === 'event_dropped') {
      return tf('desc.event_dropped');
    }
    if (data.error) {
      return <span className='text-error'>{data.error}</span>;
    }

    if (stage.stage === 'query_check') {
      // data.error 的场景（rule_config 解析失败等）已被上方的通用错误分支消化，
      // 走到这里必然有 queries/triggers/host_count 明细
      return (
        <>
          {data.only_first_checked && <div className='text-soft'>{tf('desc.query_only_first', { ids: _.join(data.matched_datasource_ids, ', ') })}</div>}
          {data.host_count !== undefined && <div>{tf('desc.query_host_count', { count: data.host_count })}</div>}
          {_.map(data.queries, (q: any, idx: number) => {
            if (q.skipped) {
              return (
                <div key={idx} className='text-soft'>
                  {tf('desc.query_skipped')}
                </div>
              );
            }
            const label = q.promql || (q.ref ? `${tf('desc.query_ref')} ${q.ref}` : `#${idx + 1}`);
            return (
              <div key={idx}>
                {label}
                {': '}
                {q.skipped_var && <span className='text-soft'>{tf('desc.query_skipped_var')}</span>}
                {!q.skipped_var && q.ok && (
                  <span className={q.series_count === 0 ? 'text-soft' : 'text-success'}>
                    {q.series_count === 0 ? tf('desc.query_no_data') : tf('desc.query_ok', { count: q.series_count, value: q.latest_value })}
                  </span>
                )}
                {q.ok === false && <span className='text-error'>{q.syntax_error || q.error}</span>}
              </div>
            );
          })}
          {_.map(data.triggers, (tr: any, idx: number) => {
            if (tr.skipped) {
              return (
                <div key={`t${idx}`} className='text-soft'>
                  {tf('desc.trigger_skipped')}
                </div>
              );
            }
            return (
              <div key={`t${idx}`}>
                {tr.exp}
                {': '}
                {tr.ok === false && !_.isEmpty(tr.missing_refs) && <span className='text-error'>{tf('desc.trigger_missing_refs', { refs: _.join(tr.missing_refs, ', ') })}</span>}
                {tr.ok === false && !_.isEmpty(tr.missing_join_refs) && (
                  <span className='text-error'>{tf('desc.trigger_missing_refs', { refs: _.join(tr.missing_join_refs, ', ') })}</span>
                )}
                {tr.ok === false && tr.syntax_error && <span className='text-error'>{tf('desc.trigger_syntax_error', { error: tr.syntax_error })}</span>}
                {tr.ok === false && tr.recover_exp_error && <span className='text-error'>{tf('desc.trigger_recover_exp_error', { error: tr.recover_exp_error })}</span>}
                {tr.ok === false && tr.error && <span className='text-error'>{tr.error}</span>}
                {tr.ok && tr.no_data && <span className='text-soft'>{tf('desc.trigger_no_data')}</span>}
                {tr.ok && !tr.no_data && (
                  <span className={tr.fired_groups > 0 ? 'text-success' : 'text-soft'}>{tf('desc.trigger_evaluated', { groups: tr.groups, fired: tr.fired_groups })}</span>
                )}
                {tr.ok && !tr.no_data && !_.isEmpty(tr.sample_vars) && (
                  <span className='text-soft'>{` · ${_.map(tr.sample_vars, (v, k) => `${k}=${v}`).join(' ')}`}</span>
                )}
                {tr.eval_error && <span className='text-error'> · {tf('desc.trigger_eval_error', { error: tr.eval_error })}</span>}
              </div>
            );
          })}
        </>
      );
    }
    if (stage.stage === 'synthesize') {
      return (
        <>
          <div>
            {data.sample_source === 'real'
              ? tf('desc.synthesize_real', { value: data.value })
              : data.sample_source === 'real_auto'
              ? tf('desc.synthesize_real_auto', { value: data.value })
              : tf('desc.synthesize_mock', { value: data.value })}
          </div>
          {!_.isEmpty(data.render_errors) && (
            <div className='text-error'>
              {tf('desc.render_errors')}
              {_.map(data.render_errors, (err, idx) => (
                <div key={idx}>{err}</div>
              ))}
            </div>
          )}
        </>
      );
    }
    if (stage.stage === 'effective') {
      if (stage.status === 'pass') return tf('desc.effective_ok');
      return (
        <>
          {data.disabled && <div>{tf('desc.effective_disabled')}</div>}
          {data.in_time_span === false && <div>{tf('desc.effective_time')}</div>}
          {data.ident_exists === false && <div>{tf('desc.effective_ident')}</div>}
          {data.bg_match === false && <div>{tf('desc.effective_bg')}</div>}
        </>
      );
    }
    if (stage.stage === 'pipeline') {
      if (_.isEmpty(data.pipelines)) return tf('desc.pipeline_empty');
      return (
        <>
          {_.map(data.pipelines, (p: any) => (
            <div key={p.id}>
              {p.name} · {p.status}
              {p.dropped && <span className='text-error'> · {tf('desc.pipeline_dropped')}</span>}
              {p.error && <span className='text-error'> · {p.error}</span>}
            </div>
          ))}
        </>
      );
    }
    if (stage.stage === 'mute') {
      if (_.isEmpty(data.matched_mutes) && !data.hook_muted) return tf('desc.mute_none');
      return (
        <>
          {_.map(data.matched_mutes, (m: any) => (
            <div key={m.id}>{m.mute_type === 1 ? tf('desc.mute_matched_notify_only', { name: m.note }) : tf('desc.mute_matched_full', { name: m.note })}</div>
          ))}
          {data.hook_muted && <div>{tf('desc.mute_hook')}</div>}
          <div className='text-soft'>{tf('desc.mute_continue')}</div>
        </>
      );
    }
    if (stage.stage === 'notify') {
      if (data.recover_notify_disabled) return <span className='text-soft'>{tf('desc.notify_recover_disabled')}</span>;
      if (data.no_targets) return <span className='text-error'>{tf('desc.notify_no_targets')}</span>;
      if (data.legacy) {
        return _.isEmpty(data.missing_channels) ? tf('desc.notify_legacy_ok') : tf('desc.notify_legacy_missing', { channels: _.join(data.missing_channels, ', ') });
      }
      const summary = summarizeNotifyResults(data.results);
      return (
        <>
          <div>{tf('desc.notify_summary', summary)}</div>
          {_.map(data.results, (item: any, idx) => (
            <div key={idx}>
              {item.notify_rule_name || item.notify_rule_id}
              {item.channel_name ? ` · ${item.channel_name}` : ''}
              {': '}
              {item.added_by_pipeline && <span className='text-soft'>{tf('desc.notify_added_by_pipeline')}</span>}
              {item.dropped_by_notify_pipeline && <span className='text-error'>{tf('desc.notify_dropped_by_pipeline')}</span>}
              {!item.added_by_pipeline && !item.dropped_by_notify_pipeline && !item.matched && (
                <span className='text-soft'>
                  {tf('desc.notify_not_matched')}
                  {item.match_error ? `（${item.match_error}）` : ''}
                </span>
              )}
              {item.matched && item.skipped && <span className='text-soft'>{tf('desc.notify_skipped')}</span>}
              {item.matched && !item.skipped && item.sent && <span className='text-success'>{tf('desc.notify_sent')}</span>}
              {item.matched && !item.skipped && !item.sent && <span className='text-error'>{tf('desc.notify_send_failed', { error: item.error })}</span>}
            </div>
          ))}
        </>
      );
    }
    return null;
  };

  return (
    <>
      <Button disabled={buttonDisabled} onClick={openModal}>
        {t('form_ng.test_fire.title')}
      </Button>
      <Modal
        title={phase === 'settings' ? t('form_ng.test_fire.title') : t('form_ng.test_fire.title_result')}
        visible={visible}
        footer={null}
        onCancel={closeModal}
        width={phase === 'settings' ? 680 : '80%'}
        destroyOnClose
      >
        <Spin spinning={loading}>
          {phase === 'settings' && (
            <div className='flex flex-col gap-4'>
              <Alert type='info' showIcon message={t('form_ng.test_fire.intro')} />
              {severityOptions.length === 1 ? (
                <div>
                  <div className='mb-1 text-title'>{t('form_ng.test_fire.severity')}</div>
                  <div className='text-soft'>{t('form_ng.test_fire.severity_single', { severity: t(`common:severity.${severityOptions[0]}`) })}</div>
                </div>
              ) : (
                <div>
                  <div className='mb-1 text-title'>{t('form_ng.test_fire.severity')}</div>
                  <Radio.Group value={severity} onChange={(e) => setSeverity(e.target.value)}>
                    {_.map(severityOptions, (item) => (
                      <Radio key={item} value={item}>
                        {t(`common:severity.${item}`)}
                      </Radio>
                    ))}
                  </Radio.Group>
                  <div className='text-soft mt-1'>{t('form_ng.test_fire.severity_multi_tip')}</div>
                </div>
              )}
              <div>
                <div className='mb-1 text-title'>{t('form_ng.test_fire.event_type')}</div>
                <Radio.Group value={eventType} onChange={(e) => setEventType(e.target.value)}>
                  <Radio value='trigger'>{t('form_ng.test_fire.event_type_trigger')}</Radio>
                  <Radio value='recover'>{t('form_ng.test_fire.event_type_recover')}</Radio>
                </Radio.Group>
                {eventType === 'recover' && !notifyRecovered && <Alert className='mt-2' type='warning' showIcon message={t('form_ng.test_fire.recover_disabled_warning')} />}
              </div>
              <div>
                <div className='mb-1 text-title'>{t('form_ng.test_fire.sample')}</div>
                {isPrometheus ? (
                  // 与其他数据源交互统一：自动取真实序列（默认第一条，可换选），查询无数据时自动用内置模拟值
                  <Spin spinning={seriesLoading}>
                    <div className='flex flex-col gap-2'>
                      <Select
                        style={{ width: 300 }}
                        showSearch
                        optionFilterProp='label'
                        placeholder={t('form_ng.test_fire.sample_datasource')}
                        value={datasourceId}
                        onChange={(value) => {
                          setDatasourceId(value);
                          fetchSeries(value);
                        }}
                        options={_.map(groupedDatasourceList.prometheus, (item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      />
                      {_.isEmpty(series) ? (
                        !seriesLoading && <Alert type='warning' showIcon message={t('form_ng.test_fire.sample_empty')} />
                      ) : (
                        <Select
                          style={{ width: '100%' }}
                          showSearch
                          optionFilterProp='label'
                          value={selectedSeriesIndex}
                          onChange={(value) => setSelectedSeriesIndex(value)}
                          options={_.map(series, (item, idx) => ({
                            label: `${item.labelStr} = ${item.value}`,
                            value: idx,
                          }))}
                        />
                      )}
                    </div>
                  </Spin>
                ) : (
                  <div className='text-soft'>{t('form_ng.test_fire.sample_auto')}</div>
                )}
              </div>
              <div>
                <Checkbox checked={skipSend} onChange={(e) => setSkipSend(e.target.checked)}>
                  {t('form_ng.test_fire.skip_send')}
                </Checkbox>
                <div className='text-soft mt-1'>{t('form_ng.test_fire.skip_send_tip')}</div>
              </div>
              {!skipSend && <Alert type='warning' showIcon message={t('form_ng.test_fire.send_warning')} />}
              <Space>
                <Button type='primary' onClick={run} disabled={seriesLoading}>
                  {t('form_ng.test_fire.run')}
                </Button>
                <Button onClick={closeModal}>{t('common:btn.cancel')}</Button>
              </Space>
            </div>
          )}
          {phase === 'result' && result && (
            <div className='flex flex-col gap-4'>
              <Steps direction='vertical' size='small' current={STAGE_KEYS.length}>
                {_.map(result.stages, (stage) => (
                  <Steps.Step
                    key={stage.stage}
                    status='finish'
                    icon={statusIconMap[stage.status]}
                    title={
                      <Space>
                        {t(`form_ng.test_fire.stages.${stage.stage}`)}
                        <Tag color={statusTagColorMap[stage.status]}>{t(`form_ng.test_fire.status.${stage.status}`)}</Tag>
                      </Space>
                    }
                    description={renderStageDescription(stage)}
                  />
                ))}
              </Steps>
              <Collapse>
                <Collapse.Panel header={t('form_ng.test_fire.event_detail')} key='event'>
                  <DetailNG data={result.event} />
                </Collapse.Panel>
              </Collapse>
              <Space>
                <Button
                  onClick={() => {
                    setPhase('settings');
                  }}
                >
                  {t('form_ng.test_fire.back')}
                </Button>
                <Button onClick={closeModal}>{t('form_ng.test_fire.close')}</Button>
              </Space>
            </div>
          )}
        </Spin>
      </Modal>
    </>
  );
}
