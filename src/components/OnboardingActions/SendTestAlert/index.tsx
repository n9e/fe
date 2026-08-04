import React from 'react';
import { Alert, Button, Modal, Select, Space, Spin } from 'antd';
import { CloseCircleFilled, SendOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { getItems as getNotifyRules, notifyRuleTest, RuleItem } from '@/pages/notificationRules/services';
import { getNotificationChannelTypes } from '@/pages/notificationChannels/constants';
import { refreshOnboardingProgress } from '@/components/OnboardingProgress/useOnboardingProgress';
import { writeOnboardingMarker } from '@/components/OnboardingProgress/detect';
import { localizeDocUrl } from '@/utils/docUrl';

import { NOTIFY_CHANNEL_DOC, NS } from '../constants';
import { formatTestSendResponse } from './interpretResponse';

const channelTypes = getNotificationChannelTypes() as Record<string, unknown>;

interface SendResult {
  /** notify_configs 下标，作为列表 key —— 同一条规则可能配了两个同类型渠道 */
  index: number;
  label: string;
  /**
   * 请求是否成功发出（HTTP 层 + 后端 err 为空）。**不代表送达** —— 各家 IM 的业务失败都藏在
   * HTTP 200 里，前端不去猜（见 interpretResponse.ts），送没送到以 detail 里的 provider 原文
   * 与用户自己的聊天群/邮箱为准。
   */
  called: boolean;
  /** provider 原始响应（已格式化）或失败原因，始终展示给用户自行判断 */
  detail?: string;
}

interface Props {
  /** 默认选中的通知规则，通常是刚快捷创建出来的那条 */
  notifyRuleId?: number;
  onCancel: () => void;
}

/** 通知媒介的展示名：优先渠道类型的译名，退到后端给的 channel 字段，最后退到 id */
function useConfigLabel() {
  const { t } = useTranslation(NS);
  return (config: { channel_id?: number; channel_ident?: string; channel?: string }, index: number) => {
    const ident = config?.channel_ident;
    if (ident && channelTypes[ident]) {
      return t(`notification-channels:types.${ident}`);
    }
    return config?.channel || t('test.channel_fallback', { index: index + 1 });
  };
}

/**
 * 发送测试告警：用后端的 mock 事件走真实通知媒介发一条消息，逐渠道展示送达结果。
 *
 * 走 `/notify-rule/test` 而不是告警规则的模拟触发：用户此刻的问题是「真出事了我能收到吗」，
 * 只需要验证通知链路。该接口同步返回 provider 响应，比轮询送达记录更即时 —— 事实上它不写
 * notification_record，轮询必然是空的。
 */
export default function SendTestAlertModal({ notifyRuleId, onCancel }: Props) {
  const { t, i18n } = useTranslation(NS);
  const getConfigLabel = useConfigLabel();
  const [rules, setRules] = React.useState<RuleItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [ruleId, setRuleId] = React.useState<number | undefined>(notifyRuleId);
  const [sending, setSending] = React.useState(false);
  const [results, setResults] = React.useState<SendResult[]>();

  React.useEffect(() => {
    let cancelled = false;
    getNotifyRules()
      .then((list) => {
        if (cancelled) return;
        setRules(list);
        // 未指定时默认选第一条启用中的规则，让用户点开就能直接发
        setRuleId((prev) => prev ?? _.find(list, (item) => item.enable !== false)?.id ?? list[0]?.id);
      })
      .catch(() => {
        if (!cancelled) setRules([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedRule = _.find(rules, { id: ruleId });
  const configs = selectedRule?.notify_configs ?? [];

  const handleSend = () => {
    if (_.isEmpty(configs)) return;
    setSending(true);
    setResults(undefined);

    // 逐个 notify_config 发一次，这样用户能看到「钉钉成功、邮件失败」而不是一个笼统的结果。
    // time_ranges 直接用接口返回的原始值：列表接口给的就是后端要的 'HH:mm' 字符串，
    // 只有表单态才会被 normalizeInitialValues 转成 moment。
    Promise.all(
      _.map(configs, (config, index) => {
        const label = getConfigLabel(config, index);
        if (!config?.channel_id || config.channel_id <= 0) {
          // 后端对 channel_id <= 0 直接 400，先在前端说清楚是"没选通知媒介"
          return Promise.resolve<SendResult>({ index, label, called: false, detail: t('test.no_channel') });
        }
        return notifyRuleTest({ use_mock_event: true, notify_config: config }, { silence: true }).then(
          // resolve 只说明请求发出去了：后端对 HTTP 200 不解析响应体，各家 IM 的业务失败也藏在 200 里，
          // 所以这里不下"已送达"的结论，只把 provider 原文整理好摆给用户
          (res) => ({ index, label, called: true, detail: formatTestSendResponse(res?.dat) } as SendResult),
          (err) => ({ index, label, called: false, detail: err?.message || t('test.unknown_error') } as SendResult),
        );
      }),
    )
      .then((list) => {
        setResults(list);
        if (_.some(list, { called: true })) {
          // 标记的语义是「你执行过发送测试告警这个动作」，与步骤名一致，不隐含"已送达"——
          // 送达与否前端无从判断（见 interpretResponse.ts）。这一步也只能靠本地标记：
          // /notify-rule/test 不写 notification_record，服务端的 used 探针永远探不到它。
          writeOnboardingMarker('testDelivered');
          refreshOnboardingProgress(['testDelivered']);
        }
      })
      .finally(() => {
        setSending(false);
      });
  };

  // 排障入口：请求根本没发出去（硬失败）时挂在那一行下面；发出去了但用户没收到时挂在底部提示旁边。
  // 后者同样需要它 —— 业务码失败正藏在 HTTP 200 里，而我们不再替用户判断成败。
  const troubleshootLinks = (
    <Space>
      <Link to='/notification-channels' target='_blank'>
        {t('test.go_check_channel')}
      </Link>
      <a href={localizeDocUrl(NOTIFY_CHANNEL_DOC, i18n.language)} target='_blank' rel='noreferrer'>
        {t('test.channel_doc')}
      </a>
    </Space>
  );

  return (
    <Modal visible title={t('test.title')} width={620} onCancel={onCancel} footer={<Button onClick={onCancel}>{t('close')}</Button>}>
      <Spin spinning={loading}>
        {!loading && _.isEmpty(rules) ? (
          <Alert
            type='info'
            showIcon
            message={t('test.no_rule')}
            description={
              <Link to='/notification-rules' target='_blank'>
                {t('test.go_create_rule')}
              </Link>
            }
          />
        ) : (
          <>
            <div className='mb-2'>{t('test.rule_label')}</div>
            <Space align='start' className='w-full justify-between'>
              <Select
                className='min-w-[320px]'
                value={ruleId}
                onChange={(value) => {
                  setRuleId(value);
                  setResults(undefined);
                }}
                options={_.map(rules, (rule) => ({ value: rule.id, label: rule.enable === false ? `${rule.name}（${t('common:disabled')}）` : rule.name }))}
              />
              <Button type='primary' loading={sending} disabled={_.isEmpty(configs)} onClick={handleSend}>
                {t('test.send')}
              </Button>
            </Space>

            {_.isEmpty(configs) && !loading && <div className='mt-2 text-warning'>{t('test.rule_without_config')}</div>}

            {results && (
              <div className='mt-4'>
                <div className='mb-2'>{t('test.result_title')}</div>
                <div className='fc-border rounded'>
                  {_.map(results, (result) => (
                    <div key={result.index} className='flex items-start gap-2 px-3 py-2'>
                      {/* 发出去了只用中性图标，不打绿勾：HTTP 200 不代表业务成功，这里不替用户下结论 */}
                      {result.called ? <SendOutlined className='mt-1 text-soft' /> : <CloseCircleFilled className='mt-0.5 text-error' />}
                      <div className='min-w-0 flex-1'>
                        <div className='font-bold'>{result.label}</div>
                        <div className='break-all text-soft'>{result.called ? t('test.sent') : result.detail}</div>
                        {/* provider 响应原样摆出来：errcode / StatusCode / code 各家叫法不同，交给用户判断 */}
                        {result.called && result.detail && (
                          <pre className='mt-1 max-h-[160px] overflow-auto whitespace-pre-wrap break-all rounded bg-fc-100 p-2 text-soft'>{result.detail}</pre>
                        )}
                        {!result.called && troubleshootLinks}
                      </div>
                    </div>
                  ))}
                </div>
                {_.some(results, { called: true }) && (
                  <div className='mt-2'>
                    <div className='text-soft'>{t('test.sent_hint')}</div>
                    <div className='mt-1'>{troubleshootLinks}</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Spin>
    </Modal>
  );
}
