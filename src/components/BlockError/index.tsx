import React from 'react';
import { Tooltip } from 'antd';
import { LockKeyhole } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { AppError } from '@/utils/appError';

import './locale';

interface IProps {
  error: AppError;
  className?: string;
}

/**
 * 元素级的错误占位卡片。
 *
 * 用在「整屏还在、只缺一块」的地方：仪表盘里的一个图、详情页里的一个 tab。
 * 这类错误不能走全局通知——一个大盘里十个图都没权限就是十条通知，而且用户看到的
 * 只是一块空白，分不清是没数据还是没权限。卡片留在原位才说得清楚。
 */
export default function BlockError(props: IProps) {
  const { error, className } = props;
  const { t } = useTranslation('BlockError');
  const isForbidden = error.status === 403;
  const resourceName = error.resource?.name;

  const title = isForbidden ? (resourceName ? t('forbidden.title_with_resource', { resource: resourceName }) : t('forbidden.title')) : t('failed.title');

  const hint = isForbidden
    ? _.isEmpty(error.owners)
      ? t('forbidden.contact_admin')
      : t('forbidden.contact_owners', {
          owners: _.map(error.owners, (owner) => owner.nickname || owner.username).join('、'),
        })
    : error.message;

  return (
    <Tooltip title={`${error.status} · ${error.path}`}>
      <div className={`flex h-full w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-fc-300 p-4 text-center ${className || ''}`}>
        <LockKeyhole className='text-hint' size={20} strokeWidth={1.5} />
        <div className='text-base text-main'>{title}</div>
        {hint && <div className='text-base text-hint'>{hint}</div>}
      </div>
    </Tooltip>
  );
}
