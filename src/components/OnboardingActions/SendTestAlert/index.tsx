import React from 'react';
import { Alert, Button, Modal, Select, Space, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { getItems as getNotifyRules, notifyRuleTest, RuleItem } from '@/pages/notificationRules/services';
import { getNotificationChannelTypes } from '@/pages/notificationChannels/constants';
import { refreshOnboardingProgress } from '@/components/OnboardingProgress/useOnboardingProgress';
import { writeOnboardingMarker } from '@/components/OnboardingProgress/detect';
import { localizeDocUrl } from '@/utils/docUrl';

import { NOTIFY_CHANNEL_DOC, NS } from '../constants';
import { interpretTestSendResponse } from './interpretResponse';

const channelTypes = getNotificationChannelTypes() as Record<string, unknown>;

interface SendResult {
  /** notify_configs 下标，作为列表 key —— 同一条规则可能配了两个同类型渠道 */
  index: number;
  label: string;
  ok: boolean;
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
          return Promise.resolve<SendResult>({ index, label, ok: false, detail: t('test.no_channel') });
        }
        return notifyRuleTest({ use_mock_event: true, notify_config: config }, { silence: true }).then(
          // resolve ≠ 送达：后端对 HTTP 200 不解析响应体，钉钉/企微的业务失败要靠 interpretResponse 识别
          (res) => ({ index, label, ...interpretTestSendResponse(res?.dat) } as SendResult),
          (err) => ({ index, label, ok: false, detail: err?.message || t('test.unknown_error') } as SendResult),
        );
      }),
    )
      .then((list) => {
        setResults(list);
        if (_.some(list, { ok: true })) {
          // 本地标记让这一步立刻点亮；换浏览器/其他用户由服务端送达探测兜住
          writeOnboardingMarker('testDelivered');
          refreshOnboardingProgress(['testDelivered']);
        }
      })
      .finally(() => {
        setSending(false);
      });
  };

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
                      {result.ok ? <CheckCircleFilled className='mt-0.5 text-success' /> : <CloseCircleFilled className='mt-0.5 text-error' />}
                      <div className='min-w-0 flex-1'>
                        <div className='font-bold'>{result.label}</div>
                        <div className='break-all text-soft'>{result.ok ? t('test.sent') : result.detail}</div>
                        {/* 成功态也原样展示 provider 响应：HTTP 200 不代表业务成功，errcode/errmsg 是用户仅有的排错线索 */}
                        {result.ok && result.detail && <div className='break-all text-soft'>{result.detail}</div>}
                        {!result.ok && (
                          <Space>
                            <Link to='/notification-channels' target='_blank'>
                              {t('test.go_check_channel')}
                            </Link>
                            <a href={localizeDocUrl(NOTIFY_CHANNEL_DOC, i18n.language)} target='_blank' rel='noreferrer'>
                              {t('test.channel_doc')}
                            </a>
                          </Space>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {_.some(results, { ok: true }) && <div className='mt-2 text-soft'>{t('test.sent_hint')}</div>}
              </div>
            )}
          </>
        )}
      </Spin>
    </Modal>
  );
}
