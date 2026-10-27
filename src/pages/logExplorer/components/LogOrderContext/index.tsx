import React, { useEffect, useRef, useState } from 'react';
import { Button, Divider, Drawer, Empty, Space, Spin, Tag, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NAME_SPACE } from '../../constants';
import { LOG_INDEX_FIELD, LOG_SEQ_FIELD, getLogOrderAnchor, logGeneration, mergeContextPage, LogContextPage, LogContextRequest } from './utils';

interface Props {
  /** 原始行（未拍平），带两个原文顺序字段时才显示入口 */
  log?: Record<string, any>;
  timeField: string;
  /** 把锚点时间换成该存储要的格式（Doris 原样字符串，ES 毫秒时间戳字符串） */
  formatTime?: (time: string | number) => string;
  fetchPage: (req: LogContextRequest) => Promise<LogContextPage>;
}

// 与 SLS 上下文每次取的行数一致
const STEP_LINES = 30;

function rowText(row: Record<string, any>) {
  if (typeof row.message === 'string') return row.message;
  return JSON.stringify(_.omit(row, [LOG_INDEX_FIELD]));
}

/** 按原文顺序查看同一个文件流的前后日志，翻页语义与 SLS 上下文一致 */
export default function LogOrderContext(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { log, timeField, formatTime = String, fetchPage } = props;
  const anchor = log ? getLogOrderAnchor(log, timeField) : undefined;
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<LogContextPage>();
  const [loading, setLoading] = useState<'back' | 'forward' | 'initial' | undefined>();
  const anchorRef = useRef<HTMLDivElement>(null);

  const load = async (req: Omit<LogContextRequest, 'stream_id'>) => {
    try {
      return await fetchPage({ ...req, stream_id: anchor!.streamId });
    } catch (e) {
      message.error(t('log_order_context.query_failed'));
      return undefined;
    }
  };

  useEffect(() => {
    if (!open || !anchor) return;
    setLoading('initial');
    load({ seq: anchor.seq, time: formatTime(anchor.time), cursor_index: 0, back_lines: STEP_LINES, forward_lines: STEP_LINES }).then((res) => {
      setPage(res);
      setLoading(undefined);
    });
  }, [open]);

  const initialLoaded = open && loading === undefined && !!page;
  useEffect(() => {
    if (initialLoaded) anchorRef.current?.scrollIntoView({ block: 'center' });
  }, [initialLoaded]);

  if (!anchor) return null;

  const close = () => {
    setOpen(false);
    setPage(undefined);
    setLoading(undefined);
  };

  const loadMore = async (direction: 'back' | 'forward') => {
    if (!page) return;
    const cursor = direction === 'back' ? page.back_cursor : page.forward_cursor;
    setLoading(direction);
    const res = await load({
      seq: cursor.seq,
      time: cursor.time,
      cursor_index: cursor.index,
      back_lines: direction === 'back' ? STEP_LINES : 0,
      forward_lines: direction === 'forward' ? STEP_LINES : 0,
    });
    setLoading(undefined);
    if (!res) return;
    const limited = direction === 'back' ? res.back_scan_limited : res.forward_scan_limited;
    if (limited) message.info(t(direction === 'back' ? 'log_order_context.no_more_before' : 'log_order_context.no_more_after'));
    setPage((prev) => (prev ? mergeContextPage(prev, res, direction) : res));
  };

  const rows = page?.logs || [];

  return (
    <>
      <Button onClick={() => setOpen(true)}>{t('log_order_context.title')}</Button>
      <Drawer
        className='n9e-antd-drawer log-explorer-ignore-click-away'
        title={
          <Space>
            {t('log_order_context.title')}
            <Tag>{anchor.streamId}</Tag>
          </Space>
        }
        extra={<CloseOutlined onClick={close} />}
        placement='right'
        onClose={close}
        visible={open}
        width='80%'
        destroyOnClose
        bodyStyle={{ padding: 10 }}
      >
        <div className='flex flex-col h-full' onClick={(e) => e.stopPropagation()}>
          <div className='flex-shrink-0 mb-2 pb-2 border-0 border-b border-solid border-fc-200'>
            <Space>
              <Button loading={loading === 'back'} disabled={!!loading || !page?.has_back} onClick={() => loadMore('back')}>
                {t('log_order_context.earlier')}
              </Button>
              <Button disabled={rows.length === 0} onClick={() => anchorRef.current?.scrollIntoView({ block: 'center' })}>
                {t('log_order_context.back_to_anchor')}
              </Button>
              <Button loading={loading === 'forward'} disabled={!!loading || !page?.has_forward} onClick={() => loadMore('forward')}>
                {t('log_order_context.later')}
              </Button>
            </Space>
          </div>
          <Spin spinning={loading === 'initial'} wrapperClassName='flex-1 min-h-0 overflow-auto'>
            {rows.length === 0 && loading !== 'initial' ? (
              <Empty />
            ) : (
              <div className='font-mono text-[12px] leading-[20px]'>
                {_.map(rows, (row, i) => {
                  const prev = rows[i - 1];
                  const rotated = prev && logGeneration(prev[LOG_SEQ_FIELD]) !== logGeneration(row[LOG_SEQ_FIELD]);
                  const isAnchor = row[LOG_INDEX_FIELD] === 0;
                  return (
                    <React.Fragment key={row[LOG_INDEX_FIELD]}>
                      {rotated && (
                        <Divider plain className='my-1 text-[12px]'>
                          {t('log_order_context.rotated')}
                        </Divider>
                      )}
                      <div
                        ref={isAnchor ? anchorRef : undefined}
                        className='flex gap-3 px-2 whitespace-pre-wrap break-all'
                        style={isAnchor ? { backgroundColor: 'var(--fc-primary-bg)' } : undefined}
                      >
                        <span className='shrink-0' style={{ color: 'var(--fc-text-4)' }}>
                          {String(row[timeField] ?? '')}
                        </span>
                        <span>{rowText(row)}</span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </Spin>
        </div>
      </Drawer>
    </>
  );
}
