import React from 'react';
import { useLocation } from 'react-router-dom';
import { notification } from 'antd';
import { useTranslation } from 'react-i18next';

import { basePrefix, isAnonymousPath } from '@/App';
import { IS_ENT } from '@/utils/constant';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import QuickCreateModal from '@/pages/notificationRules/components/RuleDropdownSelect/QuickCreateModal';
import useOnboardingProgress, { refreshOnboardingProgress } from '@/components/OnboardingProgress/useOnboardingProgress';

import SendTestAlertModal from './SendTestAlert';
import HostMonitorPackModal from './HostMonitorPack';
import { ACTION_PERMS, NS } from './constants';
import { OnboardingActionKey, OnboardingActionPayload, OnboardingActionState } from './types';

interface OnboardingActionsContextValue {
  current?: OnboardingActionState;
  openAction: (key: OnboardingActionKey, payload?: OnboardingActionPayload) => void;
  /**
   * 关闭动作弹窗。传 key 时只在当前打开的正是该动作时才关 —— 用于「接力」场景：
   * QuickCreateModal 成功后会连着调 onSuccess 再调 onCancel，onSuccess 里已经把 current
   * 切到下一个动作，此时 onCancel 不能把它关掉。
   */
  closeAction: (key?: OnboardingActionKey) => void;
  /** 动作层是否可用。企业版走自己的接入体系，那里整体关闭，调用方回退到跳转 */
  enabled: boolean;
  /**
   * 当前用户是否有权执行各动作（按 ACTION_PERMS 与后端 rt.perm 对齐）。
   * 无权限的动作 openAction 会拒绝打开 —— 弹窗开了也只会在提交时收 403；
   * 调用方应据此隐藏对应 CTA 或回退到 step.to 跳转，别让用户点了没反应。
   */
  permittedActions: Record<OnboardingActionKey, boolean>;
}

const noop = () => undefined;

const NO_PERMITTED_ACTIONS: Record<OnboardingActionKey, boolean> = { pack: false, notify: false, test: false };

const OnboardingActionsContext = React.createContext<OnboardingActionsContextValue>({
  current: undefined,
  openAction: noop,
  closeAction: noop,
  enabled: false,
  permittedActions: NO_PERMITTED_ACTIONS,
});

export function useOnboardingActions() {
  return React.useContext(OnboardingActionsContext);
}

/**
 * 新手引导动作层。
 *
 * 三个动作弹窗（主机基础包 / 通知快捷创建 / 发送测试告警）需要从机器列表、安装与采集向导的
 * 成功态、着陆页清单、侧栏引导徽标共五处触发，其中后两处在 hosts 页之外、且侧栏在任意路由都可能
 * 打开，所以状态与弹窗都挂在 App 层统一管理。
 *
 * 必须挂在 Router 与 CommonStateContext.Provider 之内：QuickCreateModal 依赖 useIsAuthorized
 * 读 context 判权限，脱离 Provider 会静默按「无权限」处理且不报错。
 */
export function OnboardingActionsProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = React.useState<OnboardingActionState | undefined>(undefined);
  // 专业版同样需要这条引导线：中心端下发采集恰恰只在专业版，而它正是「装完机器之后干什么」
  // 最需要接力的一段。企业版另有自己的接入叙事（连 /landing 路由都是 !IS_ENT），维持关闭。
  // 三个动作走的都是 n9e 通用接口（大盘/告警规则导入、通知规则、发送测试），专业版一样有。
  const enabled = !IS_ENT;

  const packPermitted = useIsAuthorized(ACTION_PERMS.pack);
  const notifyPermitted = useIsAuthorized(ACTION_PERMS.notify);
  const testPermitted = useIsAuthorized(ACTION_PERMS.test);
  const permittedActions = React.useMemo(
    () => ({ pack: packPermitted, notify: notifyPermitted, test: testPermitted }),
    [packPermitted, notifyPermitted, testPermitted],
  );

  const openAction = React.useCallback(
    (key: OnboardingActionKey, payload?: OnboardingActionPayload) => {
      if (!enabled || !permittedActions[key]) return;
      setCurrent({ key, payload });
    },
    [enabled, permittedActions],
  );

  // 用函数式更新读 prev：同一批 setState 里先 open 后 close 时，闭包里的 current 已是旧值
  const closeAction = React.useCallback((key?: OnboardingActionKey) => {
    setCurrent((prev) => (key && prev?.key !== key ? prev : undefined));
  }, []);

  const value = React.useMemo(
    () => ({ current, openAction, closeAction, enabled, permittedActions }),
    [current, openAction, closeAction, enabled, permittedActions],
  );

  return <OnboardingActionsContext.Provider value={value}>{children}</OnboardingActionsContext.Provider>;
}

/**
 * 动作弹窗的唯一挂载点，与 Provider 一起放在 App 层。
 *
 * 挂载 gate 收在这一层而不是 App.tsx：这里在 Router 之内，useLocation 能随 SPA 路由变化重新判定，
 * 而 App.tsx 顶部的 anonymous 是模块级常量、页内跳转不会更新。两个条件都不能少：
 * - 匿名路由（登录页、分享大盘/图表等）：内层 useOnboardingProgress 会发一组鉴权探测请求，
 *   401 后 request.tsx 会把无 token 的匿名访客直接踢到登录页，分享链路就断了；
 * - 企业版（enabled=false）：openAction 是 no-op、弹窗永远开不起来，探测请求纯属浪费。
 */
export function OnboardingActionModals() {
  const { enabled } = useOnboardingActions();
  const { pathname } = useLocation();

  if (!enabled || isAnonymousPath(pathname)) {
    return null;
  }
  return <ActionModals />;
}

/** 真正持有 useOnboardingProgress（会发探测请求）的内层，只在上面的 gate 放行后挂载 */
function ActionModals() {
  const { t } = useTranslation(NS);
  const { current, openAction, closeAction, permittedActions } = useOnboardingActions();
  const { doneMap } = useOnboardingProgress();

  return (
    <>
      {/* QuickCreateModal 常驻挂载、只切 visible —— 它拉授权团队时没有取消守卫，
          条件挂载会在请求未回时卸载，React 会报 setState on unmounted component。
          常驻也是它在告警规则表单里的既有用法；它自己在每次打开时 resetFields，不会回显旧数据。 */}
      <QuickCreateModal
        visible={current?.key === 'notify'}
        onCancel={() => closeAction('notify')}
        onSuccess={(ruleId) => {
          refreshOnboardingProgress(['notification']);
          // 快捷创建不会把新规则回填到已导入的主机告警上。存在未绑定的启用主机告警时提醒一句，
          // 否则「绑定通知」这一步会一直不亮，用户也不知道差在哪。用探测态判断（可能略滞后），
          // 提示只是指路，完成态本身由探测兜底，不会因此误标。
          if (doneMap.hostAlert && !doneMap.hostNotifyBound) {
            notification.info({
              message: t('notify.bind_hint'),
              // notification 渲染在 Router 之外，不能用 <Link>；basePrefix 要自己拼
              description: (
                <a href={`${basePrefix}/alert-rules`} target='_blank' rel='noreferrer'>
                  {t('pack.go_bind_notify')}
                </a>
              ),
            });
          }
          // 接力到「发送测试告警」：刚配好通知，用户最想确认的就是"真出事了我能收到吗"
          openAction('test', { notifyRuleId: ruleId });
        }}
      />
      {/* 自己写的两个弹窗都做了取消守卫，用条件挂载，卸载即清干净本地状态 */}
      {current?.key === 'test' && <SendTestAlertModal notifyRuleId={current.payload?.notifyRuleId} onCancel={() => closeAction('test')} />}
      {/* 无 test 权限时不传 onRequestTestAlert：openAction 会拒绝打开，留个点了没反应的按钮更糟 */}
      {current?.key === 'pack' && (
        <HostMonitorPackModal onCancel={() => closeAction('pack')} onRequestTestAlert={permittedActions.test ? () => openAction('test') : undefined} />
      )}
    </>
  );
}
