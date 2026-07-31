import React from 'react';

import { IS_PLUS } from '@/utils/constant';
import QuickCreateModal from '@/pages/notificationRules/components/RuleDropdownSelect/QuickCreateModal';
import { refreshOnboardingProgress } from '@/components/OnboardingProgress/useOnboardingProgress';

import SendTestAlertModal from './SendTestAlert';
import HostMonitorPackModal from './HostMonitorPack';
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
  /** 动作层是否可用。商业版走自己的接入体系，这里整体关闭，调用方回退到跳转 */
  enabled: boolean;
}

const noop = () => undefined;

const OnboardingActionsContext = React.createContext<OnboardingActionsContextValue>({
  current: undefined,
  openAction: noop,
  closeAction: noop,
  enabled: false,
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
  const enabled = !IS_PLUS;

  const openAction = React.useCallback(
    (key: OnboardingActionKey, payload?: OnboardingActionPayload) => {
      if (!enabled) return;
      setCurrent({ key, payload });
    },
    [enabled],
  );

  // 用函数式更新读 prev：同一批 setState 里先 open 后 close 时，闭包里的 current 已是旧值
  const closeAction = React.useCallback((key?: OnboardingActionKey) => {
    setCurrent((prev) => (key && prev?.key !== key ? prev : undefined));
  }, []);

  const value = React.useMemo(() => ({ current, openAction, closeAction, enabled }), [current, openAction, closeAction, enabled]);

  return <OnboardingActionsContext.Provider value={value}>{children}</OnboardingActionsContext.Provider>;
}

/** 动作弹窗的唯一挂载点，与 Provider 一起放在 App 层 */
export function OnboardingActionModals() {
  const { current, openAction, closeAction } = useOnboardingActions();

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
          // 接力到「发送测试告警」：刚配好通知，用户最想确认的就是"真出事了我能收到吗"
          openAction('test', { notifyRuleId: ruleId });
        }}
      />
      {/* 自己写的两个弹窗都做了取消守卫，用条件挂载，卸载即清干净本地状态 */}
      {current?.key === 'test' && <SendTestAlertModal notifyRuleId={current.payload?.notifyRuleId} onCancel={() => closeAction('test')} />}
      {current?.key === 'pack' && <HostMonitorPackModal onCancel={() => closeAction('pack')} onRequestTestAlert={() => openAction('test')} />}
    </>
  );
}
