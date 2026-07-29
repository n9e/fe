import React, { useContext, useEffect, useMemo, useState } from 'react';
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

import { NS } from '../../../constants';
import { CategrafInstallMeta, probeTargets } from '../../../services';
import CommandBlock from '../components/CommandBlock';
import { isValidServerAddr, normalizeServerAddr } from '../InstallCategraf/buildCommand';
import { CollectComponent, CollectField, getTemplateUrl } from './catalog';
import { buildToml, CollectFormValues } from './buildToml';
import { buildCollectCommand, buildManualCollectCommand } from './buildCommand';
import ComponentPicker from './ComponentPicker';
import useMetricArrival from './useMetricArrival';

interface Props {
  meta: CategrafInstallMeta;
  /** 机器列表已勾选的机器，作为验证步骤"目标机器"的默认值 */
  defaultIdents?: string[];
  onClose: () => void;
}

/** 以 field.default 初始化一个新实例的取值 */
function newInstance(component: CollectComponent): Record<string, unknown> {
  const instance: Record<string, unknown> = {};
  _.forEach(component.fields, (field) => {
    if (field.default !== undefined) instance[field.key] = field.default;
  });
  return instance;
}

function FieldInput(props: { field: CollectField; namePrefix: (string | number)[] }) {
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
  const { meta, onClose } = props;
  const { t } = useTranslation(NS);
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

  const [addr, setAddr] = useState<string>(() => meta.base_url || normalizeServerAddr(siteInfo?.site_url) || window.location.origin);
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');

  const [logoMap, setLogoMap] = useState<Record<string, string>>({});
  useEffect(() => {
    getComponents()
      .then((components) => {
        setLogoMap(_.fromPairs(_.map(components, (item) => [_.toLower(item.ident), item.logo])));
      })
      .catch(() => setLogoMap({})); // 拿不到 logo 只是回退分类图标，不阻塞向导
  }, []);

  const metricPrefix = component ? (component.metricPrefix === undefined ? component.name : component.metricPrefix) : null;

  // 用户声明将在哪些机器上执行命令（可选，机器列表勾选行时自动带入）。
  // 系统无法感知命令实际在哪台机器执行，这份声明用于：1）按机器的 engine_name
  // 精确定位数据源；2）验证从"出现新 ident"升级为"所选机器逐台确认"。
  const [targetIdents, setTargetIdents] = useState<string[]>(props.defaultIdents ?? []);
  const [targetList, setTargetList] = useState<{ ident: string; engine_name?: string }[]>([]);
  useEffect(() => {
    probeTargets({ limit: 500 }).then((res) => {
      setTargetList(_.map(res?.list, (item) => ({ ident: item.ident, engine_name: item.engine_name })));
    });
  }, []);

  // 机器数据落在哪个数据源：机器心跳会带回 engine_name（告警引擎集群），
  // 数据源的 cluster_name 标识它由哪个引擎消费——host 告警正是靠这条链路路由查询的。
  // 选了目标机器则只取它们的 engine；匹配不到（单机部署未配 cluster_name、老
  // categraf 无 engine 字段）则退化为并行探测全部 prometheus 数据源。
  const arrivalDatasources = useMemo(() => {
    const engineByIdent = _.fromPairs(_.map(targetList, (item) => [item.ident, item.engine_name]));
    const scope = targetIdents.length > 0 ? _.map(targetIdents, (ident) => engineByIdent[ident]) : _.map(targetList, 'engine_name');
    const engineNames = _.uniq(_.compact(scope));
    const prometheusList = groupedDatasourceList.prometheus || [];
    const matched = _.filter(prometheusList, (ds) => !!ds.cluster_name && _.includes(engineNames, ds.cluster_name));
    return _.map(matched.length > 0 ? matched : prometheusList, (ds) => ({ id: ds.id, name: ds.name }));
  }, [groupedDatasourceList, targetList, targetIdents]);

  // 展示与查询用的验证指标：有代表性精确指标（如 mysql_up）优先，否则前缀通配
  const displayMetric = component?.verifyMetric ?? (metricPrefix ? `${metricPrefix}_*` : '');
  const arrival = useMetricArrival({
    active: step === 3 && !!metricPrefix && arrivalDatasources.length > 0,
    datasources: arrivalDatasources,
    metricPrefix: metricPrefix || '',
    metric: component?.verifyMetric,
    idents: targetIdents,
  });

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
          <div>
            {step > 0 && (
              <Button onClick={() => setStep(step - 1)}>{t('collect.prev')}</Button>
            )}
          </div>
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
                          {instances.length > 1 && (
                            <Button size='small' type='text' icon={<MinusCircleOutlined />} onClick={() => remove(instanceField.name)} />
                          )}
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
                <pre className='m-0 bg-fc-100 fc-border rounded-lg p-3 text-[12px] leading-5 max-h-[220px] overflow-auto whitespace-pre-wrap break-all'>
                  {previewToml}
                </pre>
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
          ) : arrivalDatasources.length === 0 ? (
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
                <Form.Item label={t('collect.verify.targets_label')} extra={t('collect.verify.targets_tip')} className='mb-3'>
                  <Select
                    mode='multiple'
                    showSearch
                    allowClear
                    value={targetIdents}
                    onChange={(value) => setTargetIdents(value)}
                    placeholder={t('collect.verify.targets_placeholder')}
                    options={_.map(targetList, (item) => ({ label: item.ident, value: item.ident }))}
                  />
                </Form.Item>
              </Form>
              {arrival.status === 'detected' ? (
                <Alert
                  type='success'
                  showIcon
                  icon={<CheckCircleFilled />}
                  message={
                    targetIdents.length > 0
                      ? t('collect.verify.detected_targets', {
                          count: targetIdents.length,
                          metric: displayMetric,
                          idents: _.join(_.take(targetIdents, 3), ', '),
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
                      {arrival.preexistingIdents.length > 0 && (
                        <div className='mb-1'>{t('collect.verify.preexisting_note', { idents: _.join(arrival.preexistingIdents, ', ') })}</div>
                      )}
                      <a href='/metric/explorer' target='_blank'>
                        {t('collect.verify.explore')}
                      </a>
                    </>
                  }
                />
              ) : arrival.status === 'timeout' ? (
                <Alert
                  type='warning'
                  showIcon
                  message={
                    targetIdents.length > 0
                      ? t('collect.verify.timeout_targets', { idents: _.join(arrival.missingIdents, ', ') })
                      : t('collect.verify.timeout')
                  }
                  description={
                    <>
                      <div>{t('collect.verify.timeout_tip', { prefix: `${metricPrefix}_` })}</div>
                      <Button size='small' className='mt-2' onClick={arrival.restart}>
                        {t('install.retry')}
                      </Button>
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
