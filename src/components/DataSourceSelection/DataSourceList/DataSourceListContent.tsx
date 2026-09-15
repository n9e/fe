import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Empty, Spin } from 'antd';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import DataSourceOption from './DataSourceOption';
import DeletedSourceOption from './DeletedSourceOption';
import type { DataSourceListProps } from '../types';

interface DataSourceListContentProps<T> extends Omit<DataSourceListProps<T>, 'className' | 'onSearch' | 'onAccess'> {
  query: string;
}

const LOADING_DELAY = 300;

export default function DataSourceListContent<T>(props: DataSourceListContentProps<T>) {
  const { sources, value, fallbackIcon, query, loading, refreshing, error, disabled = false, emptyDescription, noMatchDescription, onChange, onRefresh } = props;
  const { t } = useTranslation('dataSourceSelection');
  const [showLoading, setShowLoading] = useState(false);
  const [showSourceListFade, setShowSourceListFade] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredSources = sources.filter((source) => !normalizedQuery || source.name.toLocaleLowerCase().includes(normalizedQuery));
  const deletedSourceValue = !refreshing && value !== undefined && !sources.some((source) => source.id === value) ? value : undefined;

  const syncSourceListFade = useCallback(() => {
    const viewport = viewportRef.current;
    setShowSourceListFade(Boolean(viewport && viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight > 1));
  }, []);

  useEffect(() => {
    if (!loading) {
      setShowLoading(false);
      return;
    }
    const timer = window.setTimeout(() => setShowLoading(true), LOADING_DELAY);
    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      setShowSourceListFade(false);
      return;
    }
    viewport.scrollTop = 0;
    syncSourceListFade();
    if (typeof ResizeObserver === 'undefined') return;
    const resizeObserver = new ResizeObserver(syncSourceListFade);
    resizeObserver.observe(viewport);
    return () => resizeObserver.disconnect();
  }, [deletedSourceValue, error, filteredSources.length, loading, query, syncSourceListFade]);

  if (loading) {
    return <div className='data-source-picker-state'>{showLoading ? <Spin size='small' /> : null}</div>;
  }
  if (error) {
    return (
      <div className='data-source-picker-state data-source-picker-state-error'>
        <span>{React.isValidElement(error) || typeof error === 'string' ? error : t('loadFailed')}</span>
        {onRefresh ? (
          <Button size='small' loading={refreshing} onClick={onRefresh}>
            {t('retry')}
          </Button>
        ) : null}
      </div>
    );
  }
  if (filteredSources.length === 0 && deletedSourceValue === undefined) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={normalizedQuery ? noMatchDescription ?? t('noMatch') : emptyDescription ?? t('noSource')} />;
  }

  return (
    <div className={classNames('data-source-picker-source-scroll', { 'has-more-below': showSourceListFade })}>
      <div ref={viewportRef} className='data-source-picker-source-viewport' onScroll={syncSourceListFade}>
        <div className='data-source-picker-source-grid' role='radiogroup' aria-label={String(t('source'))}>
          {filteredSources.map((source) => (
            <DataSourceOption
              key={`${source.type}:${String(source.id)}`}
              source={source}
              selected={source.id === value}
              disabled={disabled}
              fallbackIcon={fallbackIcon}
              disabledLabel={String(t('disabledSource'))}
              onSelect={(selectedSource) => {
                if (!disabled && !selectedSource.disabled) onChange(selectedSource);
              }}
            />
          ))}
          {deletedSourceValue !== undefined ? <DeletedSourceOption value={deletedSourceValue} fallbackIcon={fallbackIcon} deletedLabel={String(t('deletedSource'))} /> : null}
        </div>
      </div>
    </div>
  );
}
