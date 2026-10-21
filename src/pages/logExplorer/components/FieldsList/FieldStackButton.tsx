import React, { useLayoutEffect, useRef, useState } from 'react';
import { Button, Tooltip, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { FieldActionOptions } from './types';

interface Props extends Pick<FieldActionOptions, 'getUniqueCount' | 'statsScope'> {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  onChange: () => void;
}

export default function FieldStackButton({ active, icon, title, getUniqueCount, statsScope, onChange }: Props) {
  const { t } = useTranslation('log_explorer');
  const noticeKey = `log-field-stack-${React.useId()}`;
  const [loading, setLoading] = useState(false);
  const pending = useRef(false);
  const scope = useRef(statsScope);
  scope.current = statsScope;
  const alive = useRef(true);
  useLayoutEffect(() => {
    alive.current = true;
    pending.current = false;
    setLoading(false);
    return () => {
      alive.current = false;
      message.destroy(noticeKey);
    };
  }, [statsScope, noticeKey]);

  const showNotice = (type: 'warning' | 'error', text: string) => {
    message[type]({
      key: noticeKey,
      duration: 10,
      content: (
        <span className='n9e-log-field-stack-notice'>
          <span>{text}</span>
          <Button
            className='n9e-log-field-stack-notice-close'
            type='text'
            size='small'
            aria-label={t('field_stack.close')}
            title={t('field_stack.close')}
            icon={<CloseOutlined />}
            onClick={() => message.destroy(noticeKey)}
          />
        </span>
      ),
    });
  };

  const toggle = async () => {
    if (active) return onChange();
    if (pending.current || !getUniqueCount) return;
    const currentScope = statsScope;
    const current = () => alive.current && scope.current === currentScope;
    pending.current = true;
    setLoading(true);
    try {
      const count = await getUniqueCount();
      if (!current()) return;
      if (count >= 2 && count <= 10) onChange();
      else showNotice('warning', t('field_stack.unsupported', { count }));
    } catch {
      if (current()) showNotice('error', t('field_stack.failed'));
    } finally {
      if (current()) {
        pending.current = false;
        setLoading(false);
      }
    }
  };

  return (
    <Tooltip mouseEnterDelay={0.6} title={loading ? t('field_stack.checking') : title}>
      <Button
        aria-label={title}
        aria-pressed={active}
        className={active ? 'n9e-log-field-stack-active' : undefined}
        icon={icon}
        type='text'
        size='small'
        loading={loading}
        onClick={toggle}
      />
    </Tooltip>
  );
}
