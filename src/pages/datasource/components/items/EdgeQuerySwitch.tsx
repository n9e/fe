import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Form, Spin, Switch, Tag, Typography } from 'antd';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { EdgeClusterStatus, getEdgeQueryStatus } from '../../services';

const EDGE_STATUS_POLL_INTERVAL_MS = 8000;
const MAX_CONSECUTIVE_POLL_FAILURES = 3;

function EdgeStatusSpinner() {
  return <Spin style={{ display: 'flex' }} indicator={<LoadingOutlined aria-hidden style={{ fontSize: 12 }} />} />;
}

export function EdgeClusterStatusBadge({ clusterName }: { clusterName?: string }) {
  const { t } = useTranslation('datasourceManage');
  const { isPlus } = useContext(CommonStateContext);
  const [loading, setLoading] = useState(false);
  const [statusInfo, setStatusInfo] = useState<EdgeClusterStatus | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const initialLoadRef = useRef(true);
  const reqSeqRef = useRef(0);
  const consecutiveFailuresRef = useRef(0);

  useEffect(() => {
    initialLoadRef.current = true;
    consecutiveFailuresRef.current = 0;
    reqSeqRef.current += 1;
    setStatusInfo(null);
    setLoadFailed(false);
  }, [clusterName]);

  useEffect(() => {
    if (!isPlus || !clusterName || clusterName === 'no_assigned_engine') {
      reqSeqRef.current += 1;
      setStatusInfo(null);
      setLoadFailed(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    let timer: number | undefined;
    const clearTimer = () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
        timer = undefined;
      }
    };
    const scheduleNext = () => {
      clearTimer();
      timer = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        if (typeof document !== 'undefined' && document.hidden) {
          scheduleNext();
          return;
        }
        loadStatus(false);
      }, EDGE_STATUS_POLL_INTERVAL_MS);
    };
    const loadStatus = (showSpinner: boolean) => {
      const seq = ++reqSeqRef.current;
      if (showSpinner) {
        setLoading(true);
      }
      getEdgeQueryStatus(clusterName)
        .then(({ featureEnabled, clusters }) => {
          if (!cancelled && seq === reqSeqRef.current) {
            consecutiveFailuresRef.current = 0;
            setLoadFailed(false);
            setStatusInfo(
              clusters?.[clusterName] || {
                cluster_name: clusterName,
                feature_enabled: featureEnabled,
                ws_online_count: 0,
                heartbeat_online_count: 0,
                status: featureEnabled ? 'offline' : 'disabled',
              },
            );
          }
        })
        .catch(() => {
          if (!cancelled && seq === reqSeqRef.current) {
            consecutiveFailuresRef.current += 1;
            setStatusInfo(null);
            setLoadFailed(true);
          }
        })
        .finally(() => {
          if (!cancelled && seq === reqSeqRef.current) {
            setLoading(false);
            if (consecutiveFailuresRef.current < MAX_CONSECUTIVE_POLL_FAILURES) {
              scheduleNext();
            }
          }
        });
    };

    const showSpinner = initialLoadRef.current || refreshTick > 0;
    initialLoadRef.current = false;
    consecutiveFailuresRef.current = 0;
    setLoadFailed(false);
    loadStatus(showSpinner);

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [isPlus, clusterName, refreshTick]);

  if (!isPlus || !clusterName || clusterName === 'no_assigned_engine') {
    return null;
  }
  const activeStatus = statusInfo?.cluster_name === clusterName ? statusInfo : null;
  if (loading && !activeStatus && !loadFailed) {
    return <EdgeStatusSpinner />;
  }
  if (!activeStatus && !loadFailed) {
    return null;
  }

  let tag: React.ReactNode;
  if (!activeStatus && loadFailed) {
    tag = <Tag color='default'>{t('form.edge_status_unavailable')}</Tag>;
  } else if (activeStatus?.status === 'disabled' || activeStatus?.feature_enabled === false) {
    tag = <Tag color='default'>{t('form.edge_status_disabled')}</Tag>;
  } else if (activeStatus?.status === 'connected') {
    tag = <Tag color='success'>{t('form.edge_status_connected', { count: activeStatus.ws_online_count })}</Tag>;
  } else if (activeStatus?.status === 'standby') {
    tag = <Tag color='processing'>{t('form.edge_status_standby')}</Tag>;
  } else {
    tag = <Tag color='warning'>{t('form.edge_status_offline')}</Tag>;
  }

  return (
    <span className='inline-flex items-center gap-1'>
      {tag}
      <ReloadOutlined spin={loading} className='cursor-pointer text-xs' onClick={() => setRefreshTick((v) => v + 1)} />
    </span>
  );
}

export default function EdgeQuerySwitch({ form }: { form: FormInstance }) {
  const { t } = useTranslation('datasourceManage');
  const { isPlus } = useContext(CommonStateContext);
  const useEdge = Form.useWatch(['settings', 'use_edge'], form);
  const clusterName = Form.useWatch('cluster_name', form);
  const [availability, setAvailability] = useState<'loading' | 'enabled' | 'disabled' | 'unavailable'>('loading');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isPlus) {
      return;
    }
    let cancelled = false;
    setAvailability('loading');
    getEdgeQueryStatus()
      .then(({ featureEnabled }) => {
        if (!cancelled) {
          setAvailability(featureEnabled ? 'enabled' : 'disabled');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailability('unavailable');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isPlus, retryCount]);

  if (!isPlus) {
    return null;
  }

  const featureEnabled = availability === 'enabled';
  const warning = availability === 'disabled' ? t('form.edge_query_disabled_tip') : t('form.edge_query_unavailable_tip');

  return (
    <div className='mb-4'>
      <div className='inline-flex flex-wrap items-center gap-2'>
        <span>{t('form.edge_query')}</span>
        <Form.Item
          name={['settings', 'use_edge']}
          valuePropName='checked'
          rules={[
            {
              validator: (_, value) => (value === true && !featureEnabled ? Promise.reject(warning) : Promise.resolve()),
            },
          ]}
          noStyle
        >
          <Switch size='small' aria-label={t('form.edge_query')} disabled={!featureEnabled && !useEdge} />
        </Form.Item>
        {availability === 'loading' && <EdgeStatusSpinner />}
        {availability === 'disabled' && <Tag color='default'>{t('form.edge_status_disabled')}</Tag>}
        {availability === 'unavailable' && (
          <Button
            type='link'
            size='small'
            className='flex h-auto items-center border-0 p-0'
            icon={<ReloadOutlined aria-hidden />}
            onClick={() => setRetryCount((count) => count + 1)}
          >
            {t('form.edge_query_retry')}
          </Button>
        )}
        {featureEnabled && useEdge && <EdgeClusterStatusBadge clusterName={clusterName} />}
      </div>
      <div>
        <Typography.Text type={availability === 'disabled' || availability === 'unavailable' ? 'warning' : 'secondary'} className='text-xs'>
          {availability === 'loading' || featureEnabled ? t('form.edge_query_tip') : warning}
        </Typography.Text>
      </div>
    </div>
  );
}
