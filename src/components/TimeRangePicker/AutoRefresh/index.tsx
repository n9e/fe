// 要保证一下行为可以正常
// 1. 设置20s时，拿手机算了算差不多20s刷新
// 2. 20s切换到1m时，间隔会从20s 到1m
// 3. off时不触发
// 4. 从off切换到5s时可以正常触发
// 5. 切换到其他页面时，会关闭（不会出发之前的轮询）
import React, { useState, useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import { Dropdown, Button, Menu, Tooltip, message } from 'antd';
import { DownOutlined, UpOutlined, SyncOutlined } from '@ant-design/icons';
import _ from 'lodash';
import './style.less';
import { useTranslation } from 'react-i18next';
import { useRefreshLoading } from '../RefreshScope';

const refreshMap = {
  0: 'Off',
  5: '5s',
  10: '10s',
  20: '20s',
  30: '30s',
  60: '1m',
  120: '2m',
  180: '3m',
  300: '5m',
  600: '10m',
};

export const GRAFANA_REFRESH_OPTIONS = {
  0: 'Off',
  5: '5s',
  10: '10s',
  30: '30s',
  60: '1m',
  300: '5m',
  900: '15m',
  1800: '30m',
  3600: '1h',
  7200: '2h',
  86400: '1d',
};

interface IProps {
  disabled?: boolean;
  tooltip?: React.ReactNode;
  intervalTooltip?: React.ReactNode;
  loading?: boolean;
  onRefresh: () => void | Promise<unknown>;
  localKey?: string;
  intervalSeconds?: number;
  intervalOptions?: Record<number, string>;
  onIntervalSecondsChange?: (intervalSeconds: number) => void;
}

function Refresh(props: IProps, ref) {
  const { t } = useTranslation('timePickerInteraction');
  const scopeLoading = useRefreshLoading();
  const [pending, setPending] = useState(false);
  const busy = !!props.loading || scopeLoading || pending;
  // Keep brief responses readable without delaying queries or changing their cadence.
  const [feedback, setFeedback] = useState(false);
  const feedbackStarted = useRef<number>();
  const displayBusy = busy || feedback;
  useEffect(() => {
    if (busy) {
      if (feedbackStarted.current === undefined) feedbackStarted.current = Date.now();
      setFeedback(true);
      return;
    }
    if (!feedback) return;
    const remaining = Math.max(0, 800 - (Date.now() - (feedbackStarted.current ?? Date.now())));
    const finish = () => {
      feedbackStarted.current = undefined;
      setFeedback(false);
    };
    if (remaining === 0) {
      finish();
      return;
    }
    const timer = setTimeout(finish, remaining);
    return () => clearTimeout(timer);
  }, [busy, feedback]);
  const current = useRef({ ...props, busy, failedMessage: t('failed') });
  current.current = { ...props, busy, failedMessage: t('failed') };
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const intervalOptions = props.intervalOptions || refreshMap;
  const intervalSecondsCache = props.localKey ? Number(window.localStorage.getItem(props.localKey)) || 0 : 0;
  const [intervalSeconds, setIntervalSeconds] = useState(props.intervalSeconds ?? intervalSecondsCache);
  const [visible, setVisible] = useState(false);
  const [intervalTooltipVisible, setIntervalTooltipVisible] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (current.current.disabled || current.current.busy || inFlight.current) return;
    inFlight.current = true;
    if (feedbackStarted.current === undefined) feedbackStarted.current = Date.now();
    setFeedback(true);
    try {
      const result = current.current.onRefresh();
      if (result && typeof result.then === 'function') {
        setPending(true);
        await result;
      }
    } catch (error) {
      if (mounted.current) message.error(error instanceof Error ? error.message : current.current.failedMessage);
    } finally {
      inFlight.current = false;
      if (mounted.current) setPending(false);
    }
  }, []);

  useEffect(() => {
    if (!intervalSeconds || props.disabled || busy) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(async () => {
        await refresh();
        if (!stopped) schedule();
      }, intervalSeconds * 1000);
    };
    schedule();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [intervalSeconds, props.disabled, busy, refresh]);

  useEffect(() => {
    setIntervalSeconds(props.intervalSeconds ?? intervalSecondsCache);
  }, [props.intervalSeconds, props.localKey]);

  useImperativeHandle(ref, () => ({
    closeRefresh() {
      setIntervalSeconds(0);
      props.localKey && window.localStorage.setItem(props.localKey, '0');
    },
  }));

  return (
    <div className='auto-refresh-container'>
      <Tooltip title={displayBusy ? t('refreshing') : props.tooltip || t('refresh')}>
        <Button
          className={`auto-refresh-button${displayBusy ? ' auto-refresh-button--updating' : ''}`}
          aria-label={displayBusy ? t('refreshing') : t('refresh')}
          aria-busy={busy}
          disabled={props.disabled || displayBusy}
          icon={<SyncOutlined className={displayBusy ? 'rotate-icon' : ''} />}
          onClick={refresh}
        >
          <span className='auto-refresh-label' aria-hidden='true'>
            <span>{t('refreshing')}</span>
          </span>
        </Button>
      </Tooltip>
      <Tooltip
        overlayStyle={{ maxWidth: 320, pointerEvents: 'none' }}
        title={props.intervalTooltip}
        visible={intervalTooltipVisible && !visible}
        onVisibleChange={(nextVisible) => setIntervalTooltipVisible(nextVisible && !visible)}
        transitionName=''
        destroyTooltipOnHide
      >
        <span>
          <Dropdown
            disabled={props.disabled}
            trigger={['click']}
            visible={visible}
            onVisibleChange={(visible) => {
              setVisible(visible);
              if (visible) setIntervalTooltipVisible(false);
            }}
            overlay={
              <Menu
                onClick={(e) => {
                  setIntervalSeconds(_.toNumber(e.key));
                  props.localKey && window.localStorage.setItem(props.localKey, e.key);
                  props.onIntervalSecondsChange && props.onIntervalSecondsChange(_.toNumber(e.key));
                  setVisible(false);
                }}
              >
                {_.map(intervalOptions, (text, value) => {
                  return <Menu.Item key={value}>{text}</Menu.Item>;
                })}
              </Menu>
            }
          >
            <Button
              onClick={() => {
                setVisible(!visible);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {intervalOptions[intervalSeconds]} {visible ? <UpOutlined /> : <DownOutlined style={{ fontSize: 12 }} />}
            </Button>
          </Dropdown>
        </span>
      </Tooltip>
    </div>
  );
}

export default React.forwardRef(Refresh);
