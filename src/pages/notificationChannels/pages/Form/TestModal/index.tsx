import React, { useEffect, useState } from 'react';
import { Modal, Button, Segmented, Alert, Select, Input, Form, FormInstance, Space, Result } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import EventsTable from '@/pages/eventPipeline/pages/Form/TestModal/EventsTable';
import MockEventPanel, { MockEventState } from '@/pages/eventPipeline/pages/Form/TestModal/MockEventPanel';
import { getUserInfoList, getTeamInfoList } from '@/services/manage';
import { buildStarterContent, getExpectedTplKeys, StarterTexts } from '@/pages/notificationTemplates/utils/tplKeys';

import { NS } from '../../../constants';
import { testItem } from '../../../services';
import { ChannelItem } from '../../../types';
import { normalizeFormValues } from '../../../utils/normalizeValues';

interface Props {
  form: FormInstance;
  /** 打开前的校验，reject 表示不该打开——反馈已在里面做完 */
  onBeforeOpen?: () => Promise<unknown>;
}

type TestMode = 'history' | 'mock';

const DEFAULT_MOCK_EVENT: MockEventState = { severity: 2, isRecovered: false };

export default function TestModal(props: Props) {
  const { t, i18n } = useTranslation(NS);
  const { t: tt } = useTranslation('notification-templates');
  const { form, onBeforeOpen } = props;

  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<'settings' | 'result'>('settings');
  const [mode, setMode] = useState<TestMode>('mock');
  const [mockEvent, setMockEvent] = useState<MockEventState>(DEFAULT_MOCK_EVENT);
  const [historyTotal, setHistoryTotal] = useState<number>();
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>();
  const [params, setParams] = useState<Record<string, string>>({});
  // PagerDuty 的 routing key 不在媒介配置里，而是通知规则那层按「服务/集成」选出来的；
  // 那份下拉依赖已保存的 channel id（/pagerduty-integration-key/:id/...），未保存时取不到，
  // 所以这里让用户直接填。不填的话后端 PagerDutyProvider 会以
  // "pagerduty requires at least one routing key in sendtos" 必然失败——
  // 报错还指向一个用户在本页面看不到的概念。
  const [pagerdutyKeys, setPagerdutyKeys] = useState<string[]>([]);
  const [userIds, setUserIds] = useState<number[]>([]);
  const [userGroupIds, setUserGroupIds] = useState<number[]>([]);
  const [userOptions, setUserOptions] = useState<{ label: string; value: number }[]>([]);
  const [teamOptions, setTeamOptions] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error_message: string }>();

  // 必须用 useWatch 订阅：在 render 里裸调 getFieldsValue 拿到的是「上一次因别的原因重渲染时」
  // 的快照，首屏可能为空——表现为参数输入框不渲染、script 媒介的测试按钮没被禁用
  const requestType = Form.useWatch('request_type', form);
  const paramConfig = Form.useWatch('param_config', form);
  const customParams = paramConfig?.custom?.params ?? [];
  const contactKey = paramConfig?.user_info?.contact_key;
  // 脚本媒介的内联测试被后端拒绝：未保存的脚本会被写盘 chmod 0777 后执行，
  // 等于从请求体直取任意代码执行，必须先保存（保存动作有权限门与 create_by 审计）
  const scriptBlocked = requestType === 'script';
  const isPagerduty = requestType === 'pagerduty';

  const starterTexts: StarterTexts = {
    ruleName: tt('starter.rule_name'),
    severity: tt('starter.severity'),
    status: tt('starter.status'),
    firing: tt('starter.firing'),
    recovered: tt('starter.recovered'),
    tags: tt('starter.tags'),
    triggerValue: tt('starter.trigger_value'),
    time: tt('starter.time'),
    detail: tt('starter.detail'),
  };

  useEffect(() => {
    if (!visible || !contactKey) return;
    getUserInfoList({ limit: 5000 })
      .then((res) => {
        setUserOptions(_.map(res?.dat?.list, (item: any) => ({ label: item.username, value: item.id })));
      })
      .catch((err) => {
        console.error(err);
        setUserOptions([]);
      });
    getTeamInfoList({ limit: 5000, query: '' })
      .then((res) => {
        setTeamOptions(_.map(res?.dat, (item: any) => ({ label: item.name, value: item.id })));
      })
      .catch((err) => {
        console.error(err);
        setTeamOptions([]);
      });
  }, [visible, contactKey]);

  // Modal 的 destroyOnClose 销毁的是弹窗内容，TestModal 自身不卸载，
  // 不显式复位的话下次打开会回显上一次的模式、参数与结果
  const reset = () => {
    setVisible(false);
    setView('settings');
    setMode('mock');
    setMockEvent(DEFAULT_MOCK_EVENT);
    setHistoryTotal(undefined);
    setSelectedEventIds([]);
    setParams({});
    setPagerdutyKeys([]);
    setUserIds([]);
    setUserGroupIds([]);
    setResult(undefined);
  };

  const runTest = () => {
    const config = normalizeFormValues(form.getFieldsValue() as ChannelItem);
    const expected = getExpectedTplKeys(config);
    const tplContent = _.isEmpty(expected.keys) ? undefined : buildStarterContent(config, starterTexts);

    setLoading(true);
    testItem({
      ...(mode === 'mock'
        ? { use_mock_event: true as const, mock_severity: mockEvent.severity, mock_is_recovered: mockEvent.isRecovered }
        : { event_ids: selectedEventIds as number[] }),
      config,
      notify_config: {
        params: {
          ...params,
          ...(userIds.length ? { user_ids: userIds } : {}),
          ...(userGroupIds.length ? { user_group_ids: userGroupIds } : {}),
          // 后端按 []string 反序列化（GetNotifyConfigParams 的 pagerduty_integration_keys 分支），
          // 传裸字符串会反序列化失败并静默退化成「没有 routing key」
          ...(isPagerduty && pagerdutyKeys.length ? { pagerduty_integration_keys: pagerdutyKeys } : {}),
        },
        severities: [mockEvent.severity],
      },
      tpl_content: tplContent,
    })
      .then((res) => {
        setResult(res);
        setView('result');
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // PagerDuty 没有 routing key 就一定失败，与其发一个必败请求再展示一句用户看不懂的
  // 英文报错，不如先把按钮拦住
  const testDisabled = (mode === 'history' && _.isEmpty(selectedEventIds)) || (isPagerduty && _.isEmpty(pagerdutyKeys));

  return (
    <>
      <Button
        ghost
        type='primary'
        icon={<ExperimentOutlined />}
        disabled={scriptBlocked}
        title={scriptBlocked ? t('test.script_blocked') : undefined}
        onClick={() => {
          // 不 catch 的话校验失败会变成未捕获 rejection：弹窗不开、也没有任何提示，
          // 出错项还可能在收起的分区里，用户看到的就是「点了没反应」
          (onBeforeOpen?.() ?? Promise.resolve())
            .then(() => setVisible(true))
            .catch(() => {
              /* 反馈已在 onBeforeOpen 内完成 */
            });
        }}
      >
        {t('test.btn')}
      </Button>
      <Modal
        visible={visible}
        title={t('test.btn')}
        width='80%'
        onCancel={reset}
        destroyOnClose
        footer={
          view === 'settings' ? (
            <Space>
              <Button onClick={reset}>{t('common:btn.cancel')}</Button>
              <Button type='primary' loading={loading} disabled={testDisabled} onClick={runTest}>
                {t('test.run')}
              </Button>
            </Space>
          ) : (
            <Space>
              <Button
                onClick={() => {
                  setView('settings');
                  setResult(undefined);
                }}
              >
                {t('test.back')}
              </Button>
              <Button type='primary' onClick={reset}>
                {t('common:btn.close')}
              </Button>
            </Space>
          )
        }
      >
        {view === 'settings' && (
          <>
            <Alert className='mb-4' type='info' showIcon message={t('test.desc')} />
            {!_.isEmpty(customParams) && (
              <div className='mb-4'>
                <div className='mb-2 font-bold'>{t('test.params_title')}</div>
                <div className='grid grid-cols-2 gap-3'>
                  {_.map(customParams, (param) => (
                    <div key={param.key}>
                      <div className='mb-1 text-soft text-[12px]'>{param.cname || param.key}</div>
                      <Input
                        value={params[param.key]}
                        placeholder={param.key}
                        onChange={(e) => {
                          setParams((prev) => ({ ...prev, [param.key]: e.target.value }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isPagerduty && (
              <div className='mb-4'>
                <div className='mb-2 font-bold'>{t('test.pagerduty_keys_title')}</div>
                <div className='mb-1 text-soft text-[12px]'>{t('test.pagerduty_keys_tip')}</div>
                {/* mode='tags' 直接产出 string[]，与后端 pagerduty_integration_keys 的 []string 对齐；
                    保存之后在通知规则里是按「服务/集成」下拉选的，那份下拉要已保存的 channel id 才能拉到 */}
                <Select
                  mode='tags'
                  allowClear
                  // 没有候选项可选，开着下拉只会挡住下面的内容；与 KVTagSelect 等既有用法一致
                  open={false}
                  // 逗号/空格也能分隔：整段粘贴多个 key 时不必逐个回车
                  tokenSeparators={[',', ' ']}
                  className='w-full'
                  placeholder={t('test.pagerduty_keys_placeholder')}
                  value={pagerdutyKeys}
                  onChange={setPagerdutyKeys}
                />
              </div>
            )}
            {contactKey && (
              <div className='mb-4'>
                <div className='mb-2 font-bold'>{t('test.receivers_title')}</div>
                <div className='grid grid-cols-2 gap-3'>
                  <Select
                    mode='multiple'
                    allowClear
                    showSearch
                    optionFilterProp='label'
                    placeholder={t('test.user_ids')}
                    options={userOptions}
                    value={userIds}
                    onChange={setUserIds}
                  />
                  <Select
                    mode='multiple'
                    allowClear
                    showSearch
                    optionFilterProp='label'
                    placeholder={t('test.user_group_ids')}
                    options={teamOptions}
                    value={userGroupIds}
                    onChange={setUserGroupIds}
                  />
                </div>
              </div>
            )}
            <Segmented
              className='mb-4'
              value={mode}
              onChange={(val) => {
                setMode(val as TestMode);
              }}
              options={[
                { label: t('test.mode.mock'), value: 'mock' },
                { label: t('test.mode.history'), value: 'history' },
              ]}
            />
            {/* 两个面板常驻、靠 display 切换：EventsTable 卸载会丢掉已选事件和翻页位置 */}
            <div style={{ display: mode === 'mock' ? undefined : 'none' }}>
              <MockEventPanel value={mockEvent} onChange={setMockEvent} />
            </div>
            <div style={{ display: mode === 'history' ? undefined : 'none' }}>
              {historyTotal === 0 && (
                <Alert
                  className='mb-2'
                  type='info'
                  showIcon
                  message={
                    <Space>
                      {t('test.empty_alert')}
                      <a
                        onClick={() => {
                          setMode('mock');
                        }}
                      >
                        {t('test.switch_btn')}
                      </a>
                    </Space>
                  }
                />
              )}
              <EventsTable selectedEventIds={selectedEventIds} onChange={setSelectedEventIds} onTotalChange={setHistoryTotal} />
            </div>
          </>
        )}
        {view === 'result' && (
          <Result
            status={result?.success ? 'success' : 'error'}
            title={result?.success ? t('test.result_success') : t('test.result_failed')}
            subTitle={
              result?.success ? (
                t('test.result_success_desc')
              ) : (
                // 第三方的报错原文对排障最有用，完整展示、不截断
                <pre className='mt-2 mb-0 whitespace-pre-wrap break-all text-left text-[12px]'>{result?.error_message}</pre>
              )
            }
          />
        )}
      </Modal>
    </>
  );
}
