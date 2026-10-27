import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Drawer, Empty, Space, Table, Tag, Tooltip, message } from 'antd';
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { DynamicTags, DynamicTagsTrigger, OrganizeFields, renderMarkedText } from '@/pages/logExplorer/components/ContextViewerParts';

import { NAME_SPACE } from '../../constants';
import { LOG_INDEX_FIELD, LOG_SEQ_FIELD, LOG_STREAM_ID_FIELD, getLogOrderAnchor, logGeneration, mergeContextPage, LogContextPage, LogContextRequest } from './utils';

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
// 采集端写入的来源字段，作为上下文的来源标签展示
const SOURCE_FIELDS = ['agent_hostname', 'fcsource'];

type Direction = 'back' | 'forward';

/** 按原文顺序查看同一个文件流的前后日志，交互与 SLS 上下文一致 */
export default function LogOrderContext(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { log, timeField, formatTime = String, fetchPage } = props;
  const anchor = log ? getLogOrderAnchor(log, timeField) : undefined;
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<LogContextPage>();
  const [loading, setLoading] = useState<Direction | 'initial' | undefined>();
  const [limited, setLimited] = useState<Direction | undefined>();
  const [organizeFields, setOrganizeFields] = useState<string[]>([]);
  const [filterKeywords, setFilterKeywords] = useState<string[]>([]);
  const [highlightKeywords, setHighlightKeywords] = useState<string[]>([]);
  const [flashAnchor, setFlashAnchor] = useState(false);
  const scrollTarget = useRef<Direction | 'anchor'>('anchor');
  const containerRef = useRef<HTMLDivElement>(null);

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
    // 同一文件流里来源字段每行都一样，默认只显示日志正文
    setOrganizeFields(log && 'message' in log ? ['message'] : []);
    setLimited(undefined);
    scrollTarget.current = 'anchor';
    setLoading('initial');
    load({ seq: anchor.seq, time: formatTime(anchor.time), cursor_index: 0, back_lines: STEP_LINES, forward_lines: STEP_LINES }).then((res) => {
      setPage(res);
      setLoading(undefined);
    });
  }, [open]);

  const scrollToAnchor = () => {
    const container = containerRef.current;
    const row = container?.querySelector('tr[data-row-key="0"]') as HTMLElement | null;
    if (row && container) {
      container.scrollTo({ top: Math.max(0, row.offsetTop - (container.clientHeight - row.clientHeight) / 2) });
    }
  };

  useEffect(() => {
    if (!page || loading) return;
    window.setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      if (scrollTarget.current === 'back') container.scrollTo({ top: 0 });
      else if (scrollTarget.current === 'forward') container.scrollTo({ top: container.scrollHeight });
      else scrollToAnchor();
    }, 100);
  }, [page, loading]);

  const loadMore = async (direction: Direction) => {
    if (!page) return;
    const cursor = direction === 'back' ? page.back_cursor : page.forward_cursor;
    scrollTarget.current = direction;
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
    setLimited((direction === 'back' ? res.back_scan_limited : res.forward_scan_limited) ? direction : undefined);
    setPage((prev) => (prev ? mergeContextPage(prev, res, direction) : res));
  };

  const hiddenFields = [LOG_INDEX_FIELD, LOG_STREAM_ID_FIELD, LOG_SEQ_FIELD, timeField];
  const rows = page?.logs || [];
  const availableFields = useMemo(() => _.sortBy(_.uniq(_.flatMap(rows, (row) => _.keys(_.omit(row, hiddenFields))))), [page]);
  const filteredRows = useMemo(() => {
    if (_.isEmpty(filterKeywords)) return rows;
    return _.filter(rows, (row) => {
      const text = JSON.stringify(_.omit(row, hiddenFields));
      return _.some(filterKeywords, (keyword) => _.includes(text, keyword));
    });
  }, [page, filterKeywords]);
  // 代次变化即文件轮转，在新文件的第一行前标出
  const rotatedIndexes = useMemo(() => {
    const set = new Set<number>();
    _.forEach(rows, (row, i) => {
      if (i > 0 && logGeneration(rows[i - 1][LOG_SEQ_FIELD]) !== logGeneration(row[LOG_SEQ_FIELD])) set.add(row[LOG_INDEX_FIELD]);
    });
    return set;
  }, [page]);

  const columns = useMemo(
    () => [
      {
        key: 'index',
        width: 56,
        render: (row: Record<string, any>) => {
          const index = row[LOG_INDEX_FIELD];
          return <span className={index < 0 ? 'text-red-500' : 'text-green-500'}>{index}</span>;
        },
      },
      {
        key: 'document',
        render: (row: Record<string, any>) => {
          const fields = _.omit(row, hiddenFields);
          const picked = _.isEmpty(organizeFields) ? fields : _.pick(fields, organizeFields);
          // 只显示正文时省掉字段名，正文紧跟在时间后面
          const onlyMessage = _.isEqual(_.keys(picked), ['message']);
          return (
            <div className='whitespace-pre-wrap break-all'>
              {rotatedIndexes.has(row[LOG_INDEX_FIELD]) && <Tag color='orange'>{t('log_order_context.rotated')}</Tag>}
              {row[timeField] != null && <span className='text-hint mr-2'>[{String(row[timeField])}]</span>}
              {_.map(picked, (value, key) =>
                onlyMessage ? (
                  <span key={key}>{renderMarkedText(value, filterKeywords, highlightKeywords)}</span>
                ) : (
                  <span key={key} className='mr-3'>
                    <span className='font-bold'>{renderMarkedText(key, filterKeywords, highlightKeywords)}</span>:{' '}
                    <span className='text-gray-500'>{renderMarkedText(value, filterKeywords, highlightKeywords)}</span>
                  </span>
                ),
              )}
            </div>
          );
        },
      },
    ],
    [organizeFields, filterKeywords, highlightKeywords, rotatedIndexes, timeField],
  );

  if (!anchor) return null;

  const close = () => {
    setOpen(false);
    setPage(undefined);
    setLoading(undefined);
    setFilterKeywords([]);
    setHighlightKeywords([]);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>{t('log_order_context.title')}</Button>
      <Drawer
        className='n9e-antd-drawer log-explorer-ignore-click-away'
        title={t('log_order_context.title')}
        extra={<CloseOutlined onClick={close} />}
        closable={false}
        placement='right'
        onClose={close}
        visible={open}
        width='80%'
        destroyOnClose
        bodyStyle={{ padding: 10 }}
      >
        <div className='flex flex-col h-full' onClick={(e) => e.stopPropagation()}>
          <div className='flex-shrink-0 mb-2 pb-2 border-0 border-b border-solid border-fc-200'>
            {limited && <Alert className='mb-2' type='info' showIcon message={t(limited === 'back' ? 'log_order_context.no_more_before' : 'log_order_context.no_more_after')} />}
            <Space wrap>
              <Space size={2}>
                <Button loading={loading === 'back'} disabled={!!loading || !page?.has_back} onClick={() => loadMore('back')}>
                  <Space size={2}>
                    <LeftOutlined />
                    {t('log_order_context.earlier')}
                  </Space>
                </Button>
                <Button
                  disabled={rows.length === 0}
                  onClick={() => {
                    scrollToAnchor();
                    // 当前行本就在视野里时不会滚动，闪一下才看得出按钮生效了
                    setFlashAnchor(true);
                    window.setTimeout(() => setFlashAnchor(false), 800);
                  }}
                >
                  {t('log_order_context.back_to_anchor')}
                </Button>
                <Button loading={loading === 'forward'} disabled={!!loading || !page?.has_forward} onClick={() => loadMore('forward')}>
                  <Space size={0}>
                    {t('log_order_context.later')}
                    <RightOutlined />
                  </Space>
                </Button>
              </Space>
              <OrganizeFields
                fields={availableFields}
                organizeFields={organizeFields}
                onChange={setOrganizeFields}
                labels={{
                  title: t('log_order_context.organize_fields'),
                  tip: (fields) => t('log_order_context.organize_fields_tip', { fields }),
                  allFields: t('log_order_context.all_fields'),
                  showFields: t('log_order_context.show_fields'),
                  showFieldsEmpty: t('log_order_context.show_fields_empty'),
                }}
              />
              {_.isEmpty(filterKeywords) && <DynamicTagsTrigger newTagText={t('log_order_context.filter_keywords_add')} value={filterKeywords} onChange={setFilterKeywords} />}
              {_.isEmpty(highlightKeywords) && (
                <DynamicTagsTrigger newTagText={t('log_order_context.highlight_keywords_add')} value={highlightKeywords} onChange={setHighlightKeywords} />
              )}
            </Space>
            {!_.isEmpty(filterKeywords) && (
              <div className='mt-2'>
                <Space>
                  <span>{t('log_order_context.filter_keywords')}:</span>
                  <DynamicTags newTagText={t('log_order_context.filter_keywords_add')} value={filterKeywords} onChange={setFilterKeywords} />
                </Space>
              </div>
            )}
            {!_.isEmpty(highlightKeywords) && (
              <div className='mt-2'>
                <Space>
                  <span>{t('log_order_context.highlight_keywords')}:</span>
                  <DynamicTags newTagText={t('log_order_context.highlight_keywords_add')} value={highlightKeywords} onChange={setHighlightKeywords} />
                </Space>
              </div>
            )}
            <div className='mt-2'>
              <Space wrap size={[4, 4]}>
                {_.map(
                  _.filter(SOURCE_FIELDS, (field) => log?.[field]),
                  (field) => (
                    <Tag key={field}>
                      {field}={log?.[field]}
                    </Tag>
                  ),
                )}
                <Tooltip title={t('log_order_context.stream_tip')}>
                  <Tag>
                    {LOG_STREAM_ID_FIELD}={anchor.streamId}
                  </Tag>
                </Tooltip>
              </Space>
            </div>
          </div>
          <div ref={containerRef} className='min-h-0 flex-1 overflow-y-auto'>
            {_.isEmpty(filteredRows) && loading !== 'initial' ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                rowKey={LOG_INDEX_FIELD}
                size='small'
                showHeader={false}
                pagination={false}
                loading={loading === 'initial'}
                dataSource={filteredRows}
                columns={columns}
                onRow={(row) =>
                  row[LOG_INDEX_FIELD] === 0
                    ? {
                        // 主题色左边条 + 随主题变化的底色，暗色模式下也看得清
                        style: {
                          background: flashAnchor ? 'rgba(var(--fc-fill-primary-rgb), 0.35)' : 'var(--fc-primary-bg)',
                          boxShadow: 'inset 3px 0 0 var(--fc-primary-color)',
                          transition: 'background 0.6s',
                        },
                      }
                    : {}
                }
              />
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}
