import React, { useEffect, useMemo, useState } from 'react';
import { Button, Result, Typography } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { AppError, AppErrorOwner } from '@/utils/appError';
import { copy2ClipBoard } from '@/utils';
import { canGoBackInApp } from '@/utils/pageError';

import { getAdminList } from './services';
import './locale';

export type PageErrorStatus = 403 | 404 | 500;

interface IProps {
  /** 状态码。传了 error 时以 error.status 为准 */
  status?: PageErrorStatus | number;
  error?: AppError;
  /** 5xx 的重试动作，不传则不显示重试按钮 */
  onRetry?: () => void;
}

/** antd Result 只认这几种，其余状态统一按 error 画 */
function toResultStatus(status: number) {
  if (status === 403) return '403' as const;
  if (status === 404) return '404' as const;
  if (status >= 500 && status < 600) return '500' as const;
  return 'error' as const;
}

/** 「找谁要权限」最多列这么多人：真实环境里管理员可能有几十个，全列出来既没法用，也等于把用户名单摊在错误页上 */
const MAX_SHOWN_OWNERS = 3;

/** 回首页统一交给根路由：首页地址由 siteInfo 决定，那套判断只该有一处 */
const HOME_PATH = '/';

function formatOwner(owner: AppErrorOwner) {
  return owner.nickname ? `${owner.nickname}(${owner.username})` : owner.username;
}

export default function PageError(props: IProps) {
  const { error, onRetry } = props;
  const status = error?.status ?? props.status ?? 404;
  const { t } = useTranslation('PageError');
  const history = useHistory();
  const [collapsed, setCollapsed] = useState(true);
  const [adminNames, setAdminNames] = useState<string[]>();

  const isForbidden = status === 403;
  const isServerError = status >= 500 && status < 600;

  const ownerNames = useMemo(() => {
    if (!_.isEmpty(error?.owners)) return _.map(error?.owners, formatOwner);
    return adminNames;
  }, [error?.owners, adminNames]);

  useEffect(() => {
    // 后端没在 403 响应里带 owners 时，回退到查管理员列表。
    // 这个接口不一定存在（开源版就没有），失败了就再退一档到纯文案，不打扰用户。
    if (!isForbidden || !_.isEmpty(error?.owners)) return;
    let cancelled = false;
    getAdminList()
      .then((names) => {
        if (!cancelled && !_.isEmpty(names)) setAdminNames(names);
      })
      .catch(_.noop);
    return () => {
      cancelled = true;
    };
  }, [isForbidden, error?.owners]);

  const subTitle = useMemo(() => {
    if (isServerError) return t('500.desc');
    if (status === 404) return t('404.desc');
    // 403：能说清是哪个资源就说清，说不清就退回泛化文案
    const resourceName = error?.resource?.name;
    return resourceName ? t('403.desc_with_resource', { resource: resourceName }) : t('403.desc');
  }, [status, isServerError, error?.resource?.name, t]);

  const ownersText = useMemo(() => {
    const shown = _.take(ownerNames, MAX_SHOWN_OWNERS);
    const rest = (ownerNames?.length ?? 0) - shown.length;
    return rest > 0 ? `${shown.join('、')}${t('403.owners_more', { count: rest })}` : shown.join('、');
  }, [ownerNames, t]);

  const handleGoBack = () => {
    // 不能无脑 goBack：用户可能是直接粘贴链接进来的（没有上一页），
    // 也可能上一页就是同一个没权限的地址，退回去还会再错一次。
    if (canGoBackInApp()) {
      history.goBack();
    } else {
      history.replace(HOME_PATH);
    }
  };

  const diagnosis = useMemo(() => {
    if (!error) return [];
    return _.compact([
      { label: t('diagnosis.status'), value: `${error.status}` },
      { label: t('diagnosis.path'), value: error.path },
      error.resource && {
        label: t('diagnosis.resource'),
        value: _.compact([error.resource.type, error.resource.name || error.resource.id]).join(' / '),
      },
      error.requiredPerm && { label: t('diagnosis.required_perm'), value: error.requiredPerm },
      error.action && { label: t('diagnosis.action'), value: error.action },
      error.from && { label: t('diagnosis.from'), value: error.from },
      { label: t('diagnosis.occurred_at'), value: new Date(error.occurredAt).toLocaleString() },
    ]);
  }, [error, t]);

  const extra = _.compact([
    <Button key='back' type='primary' onClick={handleGoBack}>
      {t('action.back')}
    </Button>,
    isServerError && onRetry ? (
      <Button key='retry' onClick={onRetry}>
        {t('action.retry')}
      </Button>
    ) : null,
    <Button key='home' onClick={() => history.replace(HOME_PATH)}>
      {t('action.home')}
    </Button>,
  ]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Result
        status={toResultStatus(status)}
        title={t(`${status}.title`, { defaultValue: `${status}` })}
        subTitle={
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div>{subTitle}</div>
            {isForbidden && <div style={{ marginTop: 8 }}>{_.isEmpty(ownerNames) ? t('403.contact_admin') : t('403.contact_owners', { owners: ownersText })}</div>}
            {!_.isEmpty(diagnosis) && (
              <div style={{ marginTop: 16, textAlign: 'left', color: 'var(--fc-text-4)' }}>
                <Typography.Link onClick={() => setCollapsed(!collapsed)}>
                  {t('diagnosis.title')} {collapsed ? <DownOutlined /> : <UpOutlined />}
                </Typography.Link>
                {!collapsed && (
                  <div style={{ marginTop: 8 }}>
                    {_.map(diagnosis, (item) => (
                      <div key={item.label}>
                        {item.label}：{item.value}
                      </div>
                    ))}
                    <Typography.Link onClick={() => copy2ClipBoard(_.map(diagnosis, (item) => `${item.label}: ${item.value}`).join('\n'))}>{t('diagnosis.copy')}</Typography.Link>
                  </div>
                )}
              </div>
            )}
          </div>
        }
        extra={extra}
      />
    </div>
  );
}
