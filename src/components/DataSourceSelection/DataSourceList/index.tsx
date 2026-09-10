import React, { useEffect, useRef, useState } from 'react';
import { Button, Input } from 'antd';
import { ExportOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import DataSourceListContent from './DataSourceListContent';
import type { DataSourceListProps } from '../types';

import './style.less';

const SEARCH_DEBOUNCE = 400;

export default function DataSourceList<T = unknown>(props: DataSourceListProps<T>) {
  const { className, loading = false, refreshing = false, error, onSearch, onRefresh, onAccess, ...contentProps } = props;
  const { t } = useTranslation('dataSourceSelection');
  const [query, setQuery] = useState('');
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const searchTimerRef = useRef<number>();
  const isRefreshing = refreshing || internalRefreshing;

  useEffect(() => {
    return () => {
      if (searchTimerRef.current !== undefined) window.clearTimeout(searchTimerRef.current);
    };
  }, []);

  const handleSearchChange = (nextQuery: string) => {
    setQuery(nextQuery);
    if (searchTimerRef.current !== undefined) window.clearTimeout(searchTimerRef.current);
    if (!onSearch) return;
    searchTimerRef.current = window.setTimeout(() => {
      searchTimerRef.current = undefined;
      void onSearch(nextQuery.trim());
    }, SEARCH_DEBOUNCE);
  };

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    if (searchTimerRef.current !== undefined) {
      window.clearTimeout(searchTimerRef.current);
      searchTimerRef.current = undefined;
    }
    setInternalRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setInternalRefreshing(false);
    }
  };

  return (
    <div className={classNames('data-source-list-box', className)}>
      <div className='data-source-picker-toolbar'>
        <div className='data-source-picker-label'>{t('source')}</div>
        <div className='data-source-picker-toolbar-actions'>
          <Input
            allowClear
            size='small'
            prefix={<SearchOutlined />}
            placeholder={t('searchPlaceholder')}
            value={query}
            disabled={loading || !!error}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
          {onRefresh ? (
            <Button size='small' icon={<ReloadOutlined />} loading={isRefreshing} disabled={loading} onClick={handleRefresh}>
              {t('refresh')}
            </Button>
          ) : null}
          {onAccess ? (
            <Button size='small' icon={<ExportOutlined />} onClick={onAccess}>
              {t('access')}
            </Button>
          ) : null}
        </div>
      </div>
      <div className='data-source-picker-content'>
        <DataSourceListContent {...contentProps} query={query} loading={loading} refreshing={isRefreshing} error={error} onRefresh={onRefresh ? handleRefresh : undefined} />
      </div>
    </div>
  );
}
