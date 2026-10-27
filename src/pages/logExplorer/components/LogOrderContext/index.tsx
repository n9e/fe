import React, { useEffect, useRef, useState } from 'react';
import { Button, Divider, Drawer, Empty, Space, Spin, Tag, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NAME_SPACE } from '../../constants';
import { LOG_SEQ_FIELD, LOG_STREAM_ID_FIELD, getLogOrderAnchor, logGeneration, LogOrderAnchor } from './utils';

export type LogContextDirection = 'before' | 'after';

interface Props {
  /** 原始行（未拍平），带两个原文顺序字段时才显示入口 */
  log?: Record<string, any>;
  timeField: string;
  fetchContext: (anchor: LogOrderAnchor, direction: LogContextDirection, limit: number) => Promise<Record<string, any>[]>;
}

interface ContextRow {
  key: string;
  row: Record<string, any>;
  anchor?: boolean;
}

const STEP_LINES = 30;

function rowText(row: Record<string, any>) {
  if (typeof row.message === 'string') return row.message;
  return JSON.stringify(_.omit(row, [LOG_STREAM_ID_FIELD, LOG_SEQ_FIELD]));
}

/** 按原文顺序查看同一个文件流的前后日志 */
export default function LogOrderContext(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { log, timeField, fetchContext } = props;
  const anchor = log ? getLogOrderAnchor(log, timeField) : undefined;
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ContextRow[]>([]);
  const [loading, setLoading] = useState<LogContextDirection | 'initial' | undefined>();
  const anchorRef = useRef<HTMLDivElement>(null);

  const load = async (direction: LogContextDirection, from: LogOrderAnchor): Promise<ContextRow[]> => {
    try {
      const list = await fetchContext(from, direction, STEP_LINES);
      if (_.isEmpty(list)) message.info(t(direction === 'before' ? 'log_order_context.no_more_before' : 'log_order_context.no_more_after'));
      return _.map(list, (row) => ({ key: `${row[LOG_STREAM_ID_FIELD]}/${row[LOG_SEQ_FIELD]}`, row }));
    } catch (e) {
      message.error(t('log_order_context.query_failed'));
      return [];
    }
  };

  useEffect(() => {
    if (!open || !anchor || !log) return;
    setLoading('initial');
    Promise.all([load('before', anchor), load('after', anchor)]).then(([before, after]) => {
      setRows([...before, { key: `${anchor.streamId}/${anchor.seq}`, row: log, anchor: true }, ...after]);
      setLoading(undefined);
    });
  }, [open]);

  const initialLoaded = open && loading === undefined && rows.length > 0;
  useEffect(() => {
    if (initialLoaded) anchorRef.current?.scrollIntoView({ block: 'center' });
  }, [initialLoaded]);

  if (!anchor) return null;

  const close = () => {
    setOpen(false);
    setRows([]);
    setLoading(undefined);
  };

  const loadMore = async (direction: LogContextDirection) => {
    const edge = direction === 'before' ? _.first(rows) : _.last(rows);
    const from = edge && getLogOrderAnchor(edge.row, timeField);
    if (!from) return;
    setLoading(direction);
    const more = await load(direction, from);
    setRows((prev) => (direction === 'before' ? [...more, ...prev] : [...prev, ...more]));
    setLoading(undefined);
  };

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
              <Button loading={loading === 'before'} disabled={!!loading} onClick={() => loadMore('before')}>
                {t('log_order_context.earlier')}
              </Button>
              <Button disabled={rows.length === 0} onClick={() => anchorRef.current?.scrollIntoView({ block: 'center' })}>
                {t('log_order_context.back_to_anchor')}
              </Button>
              <Button loading={loading === 'after'} disabled={!!loading} onClick={() => loadMore('after')}>
                {t('log_order_context.later')}
              </Button>
            </Space>
          </div>
          <Spin spinning={loading === 'initial'} wrapperClassName='flex-1 min-h-0 overflow-auto'>
            {rows.length === 0 && loading !== 'initial' ? (
              <Empty />
            ) : (
              <div className='font-mono text-[12px] leading-[20px]'>
                {_.map(rows, (item, i) => {
                  const prev = rows[i - 1];
                  const rotated = prev && logGeneration(prev.row[LOG_SEQ_FIELD]) !== logGeneration(item.row[LOG_SEQ_FIELD]);
                  return (
                    <React.Fragment key={item.key}>
                      {rotated && (
                        <Divider plain className='my-1 text-[12px]'>
                          {t('log_order_context.rotated')}
                        </Divider>
                      )}
                      <div
                        ref={item.anchor ? anchorRef : undefined}
                        className='flex gap-3 px-2 whitespace-pre-wrap break-all'
                        style={item.anchor ? { backgroundColor: 'var(--fc-primary-bg)' } : undefined}
                      >
                        <span className='shrink-0' style={{ color: 'var(--fc-text-4)' }}>
                          {String(item.row[timeField] ?? '')}
                        </span>
                        <span>{rowText(item.row)}</span>
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
