import React, { useEffect, useState } from 'react';
import { Alert, Button, Empty, Space, Spin, Switch, Tooltip } from 'antd';
import { CodeOutlined, CopyOutlined, EditOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PanelTopClose, PanelTopOpen, RectangleEllipsis } from 'lucide-react';
import { SqlMonacoPreview } from '@fc-components/monaco-editor';

import { copy2ClipBoard } from '@/utils';
import { NAME_SPACE } from '../../constants';
import type { QueryWorkspaceProps } from './types';

export default function QueryWorkspace(props: QueryWorkspaceProps) {
  const { t } = useTranslation(NAME_SPACE);
  const {
    assistEnabled,
    preview,
    dirty,
    generating,
    executeLoading,
    error,
    languageLabel = 'SQL',
    builderTitle,
    previewTitle,
    darkMode,
    builder,
    editor,
    previewExtra,
    previewRef,
    below,
    queryButtonRef,
    onAssistChange,
    onReset,
    onConvert,
    onExecute,
    onContinueWriting,
  } = props;
  const [collapsed, setCollapsed] = useState(false);
  const hasError = Boolean(error);
  const collapseLabel = collapsed ? t('query_workspace.expand') : t('query_workspace.collapse');
  useEffect(() => {
    // A failed generation is reported in the preview column: reveal it instead of leaving the button silent.
    if (hasError) setCollapsed(false);
  }, [hasError]);
  const busy = generating || executeLoading;
  const convertLabel = t('query_workspace.convert', { language: languageLabel });
  const previewStatus = generating
    ? t('query_workspace.generating')
    : !preview
    ? t('query_workspace.not_generated')
    : dirty
    ? t('query_workspace.modified')
    : t('query_workspace.synced');
  // A changed form is only "modified" once there is a conversion to go stale; before that it is still pending.
  const convertSuffix = preview ? t('query_workspace.modified') : t('query_workspace.not_generated');

  return (
    <div className='mb-2 rounded-[var(--fc-border-radius-base)] border border-solid border-antd [&_[hidden]]:hidden'>
      <div className={`flex min-h-8 flex-wrap items-center justify-between gap-2 border-0 border-solid border-antd px-1.5 py-1 ${collapsed ? '' : 'border-b'}`}>
        <Space>
          <Tooltip title={collapseLabel}>
            <Button
              size='small'
              type='text'
              className='flex h-6 w-6 items-center justify-center p-0'
              aria-label={collapseLabel}
              aria-expanded={!collapsed}
              icon={collapsed ? <PanelTopOpen size={14} strokeWidth={1.5} /> : <PanelTopClose size={14} strokeWidth={1.5} />}
              onClick={() => setCollapsed((previous) => !previous)}
            />
          </Tooltip>
          <Switch size='small' checked={assistEnabled} onChange={onAssistChange} aria-label={t('query_workspace.assist')} />
          <span>{t('query_workspace.assist')}</span>
          <Tooltip title={t('query_workspace.assist_tip')}>
            <InfoCircleOutlined className='text-hint' />
          </Tooltip>
        </Space>
        <Space>
          <Button size='small' type='text' onClick={onReset}>
            {t('common:btn.reset')}
          </Button>
          {assistEnabled && (
            <Button
              size='small'
              type={dirty ? 'primary' : 'default'}
              ghost={dirty}
              shape={dirty ? 'round' : 'default'}
              icon={<CodeOutlined />}
              disabled={busy}
              onClick={() => {
                // The conversion is reported in the panel below: reveal it instead of updating it out of sight.
                setCollapsed(false);
                onConvert();
              }}
            >
              {dirty ? `${convertLabel} · ${convertSuffix}` : convertLabel}
            </Button>
          )}
          <Button size='small' ref={queryButtonRef} type='primary' icon={<SearchOutlined />} loading={busy} onClick={onExecute}>
            {t('execute')}
          </Button>
        </Space>
      </div>
      <div className='grid h-[200px] grid-cols-2' hidden={!assistEnabled || collapsed}>
        <section className='flex min-h-0 min-w-0 flex-col'>
          <div className='flex min-h-8 shrink-0 items-center gap-2 border-0 border-b border-solid border-antd px-3'>
            <RectangleEllipsis size={14} strokeWidth={1.5} className='shrink-0' />
            <span>{builderTitle || t('query_workspace.builder')}</span>
          </div>
          <div className='best-looking-scroll min-h-0 flex-1 overflow-auto p-3 pt-0'>{builder}</div>
        </section>
        <div className='flex min-h-0 min-w-0 flex-col border-0 border-l border-solid border-antd' ref={previewRef}>
          <div className='flex min-h-8 shrink-0 items-center justify-between gap-2 border-0 border-b border-solid border-antd px-3'>
            <Space>
              <CodeOutlined />
              <span>{previewTitle || t('query_workspace.preview', { language: languageLabel })}</span>
              <span className='text-soft'>·</span>
              <span className='text-soft' role='status'>
                {previewStatus}
              </span>
            </Space>
            {previewExtra}
          </div>
          <div className='flex min-h-0 flex-1 flex-col bg-fc-100 p-3'>
            {/* A failed conversion belongs to the preview, not to the whole panel: keep it in this column. */}
            {error && <Alert className='mb-3 shrink-0' type='error' showIcon message={error} />}
            <div className='best-looking-scroll min-h-0 flex-1 overflow-auto'>
              <Spin spinning={generating}>
                {preview ? (
                  <SqlMonacoPreview theme={darkMode ? 'dark' : 'light'} value={preview} />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('query_workspace.empty', { language: languageLabel })} />
                )}
              </Spin>
            </div>
            <div className='mt-0 flex shrink-0 justify-end gap-2'>
              <Button size='small' icon={<CopyOutlined />} disabled={!preview} onClick={() => copy2ClipBoard(preview || '')}>
                {t('common:btn.copy2')}
              </Button>
              <Tooltip title={dirty && preview ? t('query_workspace.use_previous') : undefined}>
                <Button size='small' icon={<EditOutlined />} disabled={!preview || busy} onClick={onContinueWriting}>
                  {t('query_workspace.continue', { language: languageLabel })}
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      <div className='pb-2 px-1 [&_.ant-form-item]:mb-0' hidden={assistEnabled || collapsed}>
        {editor}
      </div>
      {below}
    </div>
  );
}
