import React from 'react';
import { Button, Tooltip } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { ButtonProps } from 'antd/es/button';
import { useTranslation } from 'react-i18next';

import { basePrefix } from '@/App';

import { NextAction } from '../nextActions';
import '../locale';

/**
 * 「下一步动作」按钮的唯一渲染实现：保存结果弹窗与详情抽屉共用。
 * 不可用时展示为置灰按钮 + 原因 Tooltip，而不是静默隐藏 —— 避免用户以为产品没有这个能力。
 *
 * 一律新标签打开：引导弹窗里挑一件事去做，不该把弹窗连同没看完的体检结论一起冲掉。
 * 用 Button 的 href（antd 此时渲染 <a>）而不是 <Link> 包 <Button>，后者是 <a> 套 <button> 的非法嵌套。
 * href 需自己补 basePrefix —— Router 的 basename 只对 <Link> 生效。
 */

interface Props {
  action?: NextAction;
  label: string;
  type?: ButtonProps['type'];
  /** 可用时的 Tooltip：说明会跳到哪、落地后要干嘛 */
  hint?: string;
}

export default function NextActionButton(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { action, label, type, hint } = props;

  if (!action) return null;

  if (action.enabled && action.url) {
    const btn = (
      <Button type={type} href={`${basePrefix}${action.url}`} target='_blank' rel='noopener noreferrer'>
        {label} <ArrowRightOutlined />
      </Button>
    );
    return hint ? <Tooltip title={hint}>{btn}</Tooltip> : btn;
  }

  return (
    <Tooltip title={action.disabledReason === 'pro_only' ? t('result.pro_only') : t('result.type_unsupported')}>
      <Button type={type} disabled>
        {label}
      </Button>
    </Tooltip>
  );
}
