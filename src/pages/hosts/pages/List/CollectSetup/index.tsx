import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer, Steps, Form, Input, InputNumber, Checkbox, Button, Select, Alert, Space, Collapse, Radio, message } from 'antd';
import { LoadingOutlined, CheckCircleFilled, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/stream-parser';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { EditorView } from '@codemirror/view';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { getComponents } from '@/pages/builtInComponents/services';
import { writeOnboardingMarker } from '@/components/OnboardingProgress/detect';
import { refreshOnboardingProgress } from '@/components/OnboardingProgress/useOnboardingProgress';

import { localizeDocUrl } from '@/utils/docUrl';

import { CATEGRAF_TROUBLESHOOT_DOC, NS } from '../../../constants';
import { CategrafInstallMeta, probeTargets } from '../../../services';
import CommandBlock from '../components/CommandBlock';
import { isValidServerAddr, pickDefaultServerAddr } from '../InstallCategraf/buildCommand';
import { CollectComponent, CollectField, getTemplateUrl } from './catalog';
import { buildToml, CollectFormValues } from './buildToml';
import { buildCollectCommand, buildManualCollectCommand } from './buildCommand';
import ComponentPicker from './ComponentPicker';
import useMetricArrival from './useMetricArrival';
import { readVerifiedDatasourceIds, writeVerifiedDatasourceIds } from './verifiedDatasources';

interface Props {
  meta: CategrafInstallMeta;
  /** 机器列表已勾选的机器，作为验证步骤"目标机器"的默认值 */
  defaultIdents?: string[];
  onClose: () => void;
  /** 指标到达验证通过后追加展示的内容，用于接力到下一步（套大盘 / 开告警 / 配通知） */
  verifiedExtra?: React.ReactNode;
}

/** 数据源列表未加载时的稳定空引用，避免每次渲染都让下游 useMemo 失效 */
const EMPTY_DATASOURCES: { id: number; name: string; is_default?: boolean }[] = [];

/** 以 field.default 初始化一个新实例的取值 */
export function newInstance(component: CollectComponent): Record<string, unknown> {
  const instance: Record<string, unknown> = {};
  _.forEach(component.fields, (field) => {
    if (field.default !== undefined) instance[field.key] = field.default;
  });
  return instance;
}

/** 单个字段的输入控件。企业版采集配置页复用同一套 catalog 字段定义，所以这里导出 */
export function FieldInput(props: { field: CollectField; namePrefix: (string | number)[] }) {
  const { field, namePrefix } = props;
  const { t } = useTranslation(NS);
  const label = t(`collect.fields.${field.key}`, { defaultValue: field.key });
  const common = {
    label,
    extra: field.tip ? t(`collect.tips.${field.tip}`) : undefined,
    name: [...namePrefix, field.key],
  };
  if (field.type === 'boolean') {
    return (
      <Form.Item {...common} valuePropName='checked'>
        <Checkbox />
      </Form.Item>
    );
  }
  if (field.type === 'number') {
    return (
      <Form.Item {...common} rules={[{ required: field.required }]}>
        <InputNumber className='w-full' placeholder={field.placeholder} />
      </Form.Item>
    );
  }
  if (field.type === 'stringArray') {
    return (
      <Form.Item {...common} rules={[{ required: field.required }]}>
        <Select mode='tags' open={false} tokenSeparators={[',', ' ']} placeholder={field.placeholder} />
      </Form.Item>
    );
  }
  if (field.type === 'password') {
    return (
      <Form.Item {...common} rules={[{ required: field.required }]}>
        <Input.Password placeholder={field.placeholder} />
      </Form.Item>
    );
  }
  return (
    <Form.Item {...common} rules={[{ required: field.required }]}>
      <Input placeholder={field.placeholder} />
    </Form.Item>
  );
}

export default function CollectSetup(props: Props) {
  const { meta, onClose, verifiedExtra } = props;
  const { t, i18n } = useTranslation(NS);
  const { siteInfo, darkMode, groupedDatasourceList } = useContext(CommonStateContext);
  const [form] = Form.useForm<CollectFormValues>();

  const [step, setStep] = useState(0);
  const [component, setComponent] = useState<CollectComponent>();
  const [editorMode, setEditorMode] = useState(false);
  const [tomlText, setTomlText] = useState('');
  const [templateState, setTemplateState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [finalToml, setFinalToml] = useState('');
  // 预览随表单联动；不用 Form.useWatch 是为了兼容仓库锁定的 antd 4 小版本
  const [previewTick, setPreviewTick] = useState(0);

  const [addr, setAddr] = useState<string>(() => pickDefaultServerAddr({ metaBaseURL: meta.base_url, siteURL: siteInfo?.site_url, origin: window.location.origin }));
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');

  const [logoMap, setLogoMap] = useState<Record<string, string>>({});
  useEffect(() => {
    getComponents()
      .then((components) => {
        setLogoMap(_.fromPairs(_.map(components, (item) => [_.toLower(item.ident), item.logo])));
      })
      .catch(() => {
        setLogoMap({}); // 拿不到 logo 只是回退分类图标，不阻塞向导
      });
  }, []);

  const metricPrefix = component ? (component.metricPrefix === undefined ? component.name : component.metricPrefix) : null;

  // 用户声明将在哪些机器上执行命令（可选，机器列表勾选行时自动带入）。
  // 系统无法感知命令实际在哪台机器执行，这份声明把验证从"出现新 ident"升级为
  // "所选机器逐台确认"（含检测前就已在上报的，见 useMetricArrival 的 preexisting）。
  const [targetIdents, setTargetIdents] = useState<string[]>(props.defaultIdents ?? []);
  const [targetList, setTargetList] = useState<string[]>([]);
  useEffect(() => {
    probeTargets({ limit: 500 }).then((res) => {
      setTargetList(_.map(res?.list, 'ident'));
    });
  }, []);

  const prometheusList = groupedDatasourceList.prometheus || EMPTY_DATASOURCES;

  // 机器指标落在哪个数据源，由服务端按 pushgw 的 writer 配置匹配后随 meta 下发 ——
  // 写入路径才是直接答案。但 URL 匹配天然有 miss（writer 用容器内地址、数据源用
  // 外部域名等），所以这里只当默认值：先按权限过滤掉当前用户查不了的，匹配不上
  // 就退到单个数据源（默认数据源优先，否则第一个），猜错由用户在验证步骤切换。
  // 上次验证通过的数据源：writer URL 匹配天然会 miss，而「上次真的查到了指标」是经验证过的更强信号，
  // 所以优先级放在 meta 之前。只在 id 仍然可见时采纳，数据源被删/权限变更后自动退回后面的策略。
  const rememberedDatasourceIds = useRef(readVerifiedDatasourceIds()).current;
  const defaultFromRemembered = useMemo(() => _.filter(rememberedDatasourceIds, (id) => _.some(prometheusList, (ds) => ds.id === id)), [rememberedDatasourceIds, prometheusList]);

  const defaultDatasourceIds = useMemo(() => {
    if (defaultFromRemembered.length > 0) return defaultFromRemembered;
    const fromMeta = _.filter(meta.metric_datasource_ids, (id) => _.some(prometheusList, (ds) => ds.id === id));
    if (fromMeta.length > 0) return fromMeta;
    const preferred = _.find(prometheusList, 'is_default') ?? prometheusList[0];
    return preferred ? [preferred.id] : [];
  }, [defaultFromRemembered, meta.metric_datasource_ids, prometheusList]);

  // undefined = 跟随后端默认值；用户一旦手动选过就以其选择为准，不再被异步加载的
  // 数据源列表覆盖回去（这也是后端匹配不准时的兜底出口）
  const [pickedDatasourceIds, setPickedDatasourceIds] = useState<number[]>();
  const datasourceIds = pickedDatasourceIds ?? defaultDatasourceIds;
  const arrivalDatasources = useMemo(
    () =>
      _.map(
        _.filter(prometheusList, (ds) => _.includes(datasourceIds, ds.id)),
        (ds) => ({ id: ds.id, name: ds.name }),
      ),
    [prometheusList, datasourceIds],
  );

  // 展示与查询用的验证指标：有代表性精确指标（如 mysql_up）优先，否则前缀通配
  const displayMetric = component?.verifyMetric ?? (metricPrefix ? `${metricPrefix}_*` : '');
  const arrival = useMetricArrival({
    active: step === 3 && !!metricPrefix && arrivalDatasources.length > 0,
    datasources: arrivalDatasources,
    metricPrefix: metricPrefix || '',
    metric: component?.verifyMetric,
    idents: targetIdents,
  });

  // 指标确认到达即视为"采集已验证"，写本地标记点亮引导清单里那一步。
  // useMetricArrival 每 5 秒轮询，detected 会持续为真，用 ref 保证只写一次。
  const verifiedMarkedRef = useRef(false);
  useEffect(() => {
    if (arrival.status !== 'detected' || verifiedMarkedRef.current) return;
    verifiedMarkedRef.current = true;
    writeOnboardingMarker('collectVerified');
    refreshOnboardingProgress(['collectVerified']);
    // 只记真正命中的数据源：用户可能勾了 3 个而只有 1 个有数据，下次默认就该是那 1 个
    const hitIds = _.map(
      _.filter(arrivalDatasources, (ds) => _.includes(arrival.hitDatasourceNames, ds.name)),
      'id',
    );
    writeVerifiedDatasourceIds(hitIds.length > 0 ? hitIds : datasourceIds);
  }, [arrival.status]);

  const loadTemplate = (name: string) => {
    setTemplateState('loading');
    fetch(getTemplateUrl(name))
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((text) => {
        setTomlText(text);
        setTemplateState('idle');
      })
      .catch((err) => {
        console.error('load collect template failed', err);
        setTomlText('');
        setTemplateState('error');
      });
  };

  const handlePick = (picked: CollectComponent) => {
    if (picked.name !== component?.name) {
      setComponent(picked);
      setFinalToml('');
      if (picked.fields) {
        setEditorMode(false);
        setTomlText('');
        form.resetFields();
        form.setFieldsValue({ instances: [newInstance(picked)] });
      } else {
        setEditorMode(true);
        loadTemplate(picked.name);
      }
    }
    setStep(1);
  };

  /** 表单模式与 toml 模式切换：切过去带上当前表单生成的内容，切回来放弃手工修改 */
  const handleModeChange = (mode: 'form' | 'toml') => {
    if (!component) return;
    if (mode === 'toml') {
      setTomlText(buildToml(component, form.getFieldsValue() as CollectFormValues));
      setEditorMode(true);
    } else {
      setEditorMode(false);
    }
  };

  const handleConfigNext = async () => {
    if (!component) return;
    if (editorMode) {
      if (!_.trim(tomlText)) {
        message.error(t('collect.toml_required'));
        return;
      }
      setFinalToml(tomlText);
      setStep(2);
      return;
    }
    const values = (await form.validateFields()) as CollectFormValues;
    if (component.atLeastOne) {
      const missing = _.some(values.instances, (instance) => !_.some(component.atLeastOne, (key) => _.trim(String(instance?.[key] ?? '')) !== ''));
      if (missing) {
        message.error(
          t('collect.tips.at_least_one', {
            fields: _.map(component.atLeastOne, (key) => t(`collect.fields.${key}`, { defaultValue: key })).join(' / '),
          }),
        );
        return;
      }
    }
    setFinalToml(buildToml(component, values));
    setStep(2);
  };

  const addrValid = isValidServerAddr(addr);
  const command = useMemo(
    () =>
      component && addrValid && finalToml
        ? buildCollectCommand({ serverAddr: addr, basicAuthUser: authUser, basicAuthPass: authPass, input: component.name, toml: finalToml })
        : '',
    [component, addr, authUser, authPass, finalToml, addrValid],
  );

  const previewToml = useMemo(() => {
    if (!component || editorMode) return '';
    return buildToml(component, form.getFieldsValue() as CollectFormValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [component, editorMode, previewTick]);

  const editorExtensions = [
    StreamLanguage.define(toml),
    EditorView.lineWrapping,
    EditorView.theme({
      '&.cm-editor.cm-focused': {
        outline: 'unset',
      },
    }),
  ];

  const displayName = component ? t(`collect.names.${component.name}`, { defaultValue: component.label }) : '';

  return (
    <Drawer
      visible
      width={860}
      title={t('collect.title')}
      onClose={onClose}
      footer={
        <div className='flex justify-between'>
          <div>{step > 0 && <Button onClick={() => setStep(step - 1)}>{t('collect.prev')}</Button>}</div>
          <Space>
            {step === 1 && (
              <Button type='primary' onClick={handleConfigNext}>
                {t('collect.next')}
              </Button>
            )}
            {step === 2 && (
              <Button type='primary' disabled={!command} onClick={() => setStep(3)}>
                {t('collect.next')}
              </Button>
            )}
            {step === 3 && (
              <Button type='primary' onClick={onClose}>
                {t('collect.done')}
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <Steps size='small' current={step} className='mb-4'>
        <Steps.Step title={t('collect.steps.pick')} />
        <Steps.Step title={component ? `${t('collect.steps.config')} · ${displayName}` : t('collect.steps.config')} />
        <Steps.Step title={t('collect.steps.run')} />
        <Steps.Step title={t('collect.steps.verify')} />
      </Steps>

      {step === 0 && <ComponentPicker logoMap={logoMap} onPick={handlePick} />}

      {step === 1 && component && (
        <div>
          {component.fields ? (
            <div className='mb-3'>
              <Radio.Group size='small' value={editorMode ? 'toml' : 'form'} onChange={(e) => handleModeChange(e.target.value)}>
                <Radio.Button value='form'>{t('collect.mode_form')}</Radio.Button>
                <Radio.Button value='toml'>{t('collect.mode_toml')}</Radio.Button>
              </Radio.Group>
              {editorMode && <span className='ml-2 text-[12px] opacity-60'>{t('collect.mode_toml_tip')}</span>}
            </div>
          ) : (
            <Alert className='mb-3' type='info' showIcon message={t('collect.template_mode_tip')} />
          )}

          {editorMode ? (
            <>
              {templateState === 'error' && (
                <Alert
                  className='mb-2'
                  type='error'
                  showIcon
                  message={t('collect.template_load_failed')}
                  action={
                    <Button size='small' onClick={() => loadTemplate(component.name)}>
                      {t('collect.retry_load')}
                    </Button>
                  }
                />
              )}
              {templateState === 'loading' ? (
                <Space className='opacity-70'>
                  <LoadingOutlined />
                </Space>
              ) : (
                <CodeMirror
                  theme={darkMode ? 'dark' : 'light'}
                  className='fc-border rounded-[2px]'
                  height='420px'
                  basicSetup
                  editable
                  value={tomlText}
                  onChange={(value) => setTomlText(value)}
                  extensions={editorExtensions}
                />
              )}
            </>
          ) : (
            <Form form={form} layout='vertical' onValuesChange={() => setPreviewTick((tick) => tick + 1)}>
              <Form.Item label={t('collect.interval')} name='interval' extra={t('collect.interval_tip')}>
                <InputNumber min={1} className='w-[200px]' placeholder='15' />
              </Form.Item>
              <Form.List name='instances'>
                {(instances, { add, remove }) => (
                  <>
                    {instances.map((instanceField) => (
                      <div key={instanceField.key} className='relative fc-border rounded-lg p-3 pt-2 mb-3'>
                        <div className='flex justify-between items-center mb-1'>
                          <span className='text-[12px] opacity-60'>
                            {t('collect.instance')} #{instanceField.name + 1}
                          </span>
                          {instances.length > 1 && <Button size='small' type='text' icon={<MinusCircleOutlined />} onClick={() => remove(instanceField.name)} />}
                        </div>
                        <div className='grid grid-cols-2 gap-x-4'>
                          {_.map(component.fields, (field) => (
                            <FieldInput key={field.key} field={field} namePrefix={[instanceField.name]} />
                          ))}
                        </div>
                      </div>
                    ))}
                    <Button type='dashed' block icon={<PlusOutlined />} onClick={() => add(newInstance(component))}>
                      {t('collect.add_instance')}
                    </Button>
                  </>
                )}
              </Form.List>
              <div className='mt-3'>
                <div className='mb-1 text-[12px] opacity-60'>{t('collect.toml_preview')}</div>
                <pre className='m-0 bg-fc-100 fc-border rounded-lg p-3 text-[12px] leading-5 max-h-[220px] overflow-auto whitespace-pre-wrap break-all'>{previewToml}</pre>
              </div>
            </Form>
          )}
        </div>
      )}

      {step === 2 && component && (
        <Form layout='vertical'>
          <Form.Item
            label={t('install.addr_label')}
            extra={t('install.addr_tip')}
            validateStatus={addrValid ? undefined : 'error'}
            help={addrValid ? undefined : t('install.addr_invalid')}
          >
            <Input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder='http://10.1.1.1:17000' />
          </Form.Item>

          {meta.basic_auth && (
            <Form.Item label={t('install.basic_auth_label')}>
              <Space>
                <Input value={authUser} onChange={(e) => setAuthUser(e.target.value)} placeholder={t('install.basic_auth_user')} />
                <Input.Password value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder={t('install.basic_auth_pass')} />
              </Space>
            </Form.Item>
          )}

          <Form.Item label={t('collect.step_run')} className='mb-2' extra={t('collect.step_run_tip')}>
            {command ? <CommandBlock command={command} /> : null}
          </Form.Item>

          <div className='mb-2 text-[12px] opacity-70'>{t('collect.what_cmd_does', { name: component.name })}</div>
          <Alert type='warning' showIcon message={t('collect.sensitive_tip')} className='mb-2' />

          <Collapse ghost>
            <Collapse.Panel header={t('install.advanced')} key='advanced'>
              <div className='mb-1 opacity-70'>{t('install.manual_cmd_tip')}</div>
              {command ? (
                <CommandBlock
                  command={buildManualCollectCommand({
                    serverAddr: addr,
                    basicAuthUser: authUser,
                    basicAuthPass: authPass,
                    input: component.name,
                    toml: finalToml,
                  })}
                />
              ) : null}
            </Collapse.Panel>
          </Collapse>
        </Form>
      )}

      {step === 3 && component && (
        <div>
          {!metricPrefix ? (
            <Alert
              type='info'
              showIcon
              message={t('collect.verify.no_verify')}
              description={
                <a href='/metric/explorer' target='_blank'>
                  {t('collect.verify.explore')}
                </a>
              }
            />
          ) : prometheusList.length === 0 ? (
            <Alert
              type='info'
              showIcon
              message={t('collect.verify.no_datasource')}
              description={
                <a href='/metric/explorer' target='_blank'>
                  {t('collect.verify.explore')}
                </a>
              }
            />
          ) : (
            <>
              <Form layout='vertical'>
                <div className='grid grid-cols-2 gap-x-4'>
                  <Form.Item
                    label={t('collect.verify.datasource_label')}
                    // 默认值来自上次验证通过时，标注出来降低"是不是选错了"的焦虑
                    extra={!pickedDatasourceIds && defaultFromRemembered.length > 0 ? t('collect.verify.datasource_remembered') : t('collect.verify.datasource_tip')}
                    className='mb-3'
                  >
                    <Select
                      mode='multiple'
                      showSearch
                      optionFilterProp='label'
                      value={datasourceIds}
                      onChange={(value) => setPickedDatasourceIds(value)}
                      placeholder={t('collect.verify.datasource_placeholder')}
                      options={_.map(prometheusList, (ds) => ({ label: ds.name, value: ds.id }))}
                    />
                  </Form.Item>
                  <Form.Item label={t('collect.verify.targets_label')} extra={t('collect.verify.targets_tip')} className='mb-3'>
                    <Select
                      mode='multiple'
                      showSearch
                      allowClear
                      value={targetIdents}
                      onChange={(value) => setTargetIdents(value)}
                      placeholder={t('collect.verify.targets_placeholder')}
                      options={_.map(targetList, (ident) => ({ label: ident, value: ident }))}
                    />
                  </Form.Item>
                </div>
              </Form>
              {arrivalDatasources.length === 0 ? (
                <Alert type='warning' showIcon message={t('collect.verify.datasource_required')} />
              ) : arrival.status === 'detected' ? (
                <Alert
                  type='success'
                  showIcon
                  icon={<CheckCircleFilled />}
                  message={
                    /* 逐台确认的成功判据是「有一台上报即出结论」（见 useMetricArrival），
                       所以文案必须按**实际到达**渲染：拿 targetIdents 会把只到了 1 台说成
                       「所选 3 台均已上报」，并把还没上报的机器名一并列出来 */
                    targetIdents.length > 0
                      ? arrival.missingIdents.length > 0
                        ? t('collect.verify.detected_partial', {
                            arrived: arrival.arrivedIdents.length,
                            total: targetIdents.length,
                            metric: displayMetric,
                            idents: _.join(_.take(arrival.arrivedIdents, 3), ', '),
                            datasource: _.join(arrival.hitDatasourceNames, ', '),
                          })
                        : t('collect.verify.detected_targets', {
                            count: arrival.arrivedIdents.length,
                            metric: displayMetric,
                            idents: _.join(_.take(arrival.arrivedIdents, 3), ', '),
                            datasource: _.join(arrival.hitDatasourceNames, ', '),
                          })
                      : t('collect.verify.detected', {
                          count: arrival.newIdents.length,
                          metric: displayMetric,
                          idents: _.join(_.take(arrival.newIdents, 3), ', '),
                          datasource: _.join(arrival.hitDatasourceNames, ', '),
                        })
                  }
                  description={
                    <>
                      {/* 部分到达时把还差哪几台如实列出来：成功提示之后 partial 那行不再渲染，
                          不写在这里用户就拿不到任何「还差谁」的信号 */}
                      {arrival.missingIdents.length > 0 && (
                        <div className='mb-1'>{t('collect.verify.missing_note', { idents: _.join(arrival.missingIdents, ', ') })}</div>
                      )}
                      {/* 精确哨兵连查不到、按前缀匹配成功的，如实标注——此时区分不了存量机器 */}
                      {arrival.fallbackToPrefix && <div className='mb-1'>{t('collect.verify.fallback_note', { prefix: `${metricPrefix}_` })}</div>}
                      {arrival.preexistingIdents.length > 0 && (
                        <div className='mb-1'>{t('collect.verify.preexisting_note', { idents: _.join(arrival.preexistingIdents, ', ') })}</div>
                      )}
                      <a href='/metric/explorer' target='_blank'>
                        {t('collect.verify.explore')}
                      </a>
                      {verifiedExtra ? <div className='mt-2'>{verifiedExtra}</div> : null}
                    </>
                  }
                />
              ) : arrival.status === 'timeout' ? (
                <Alert
                  type='warning'
                  showIcon
                  message={targetIdents.length > 0 ? t('collect.verify.timeout_targets', { idents: _.join(arrival.missingIdents, ', ') }) : t('collect.verify.timeout')}
                  description={
                    <>
                      <div>{t('collect.verify.timeout_tip', { prefix: `${metricPrefix}_` })}</div>
                      <Space className='mt-2'>
                        <Button size='small' onClick={arrival.restart}>
                          {t('install.retry')}
                        </Button>
                        <a href={localizeDocUrl(CATEGRAF_TROUBLESHOOT_DOC, i18n.language)} target='_blank' rel='noreferrer'>
                          {t('install.troubleshoot_doc')}
                        </a>
                      </Space>
                    </>
                  }
                />
              ) : (
                <div>
                  <Space className='opacity-70'>
                    <LoadingOutlined />
                    {t('collect.verify.waiting', { metric: displayMetric })}
                  </Space>
                  <div className='mt-1 text-[12px] opacity-50'>{t('collect.verify.probing', { names: _.join(_.map(arrivalDatasources, 'name'), ', ') })}</div>
                  {targetIdents.length > 0
                    ? targetIdents.length - arrival.missingIdents.length > 0 && (
                        <div className='mt-2 text-[12px] opacity-60'>
                          {t('collect.verify.partial', {
                            arrived: targetIdents.length - arrival.missingIdents.length,
                            total: targetIdents.length,
                            idents: _.join(_.take(arrival.reportingIdents, 5), ', '),
                          })}
                        </div>
                      )
                    : arrival.reportingIdents.length > 0 && (
                        <div className='mt-2 text-[12px] opacity-60'>
                          {t('collect.verify.existing', { count: arrival.reportingIdents.length, idents: _.join(_.take(arrival.reportingIdents, 5), ', ') })}
                        </div>
                      )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Drawer>
  );
}
