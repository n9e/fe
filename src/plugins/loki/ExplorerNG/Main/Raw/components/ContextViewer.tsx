import React, { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import purify from 'dompurify';
import type { InputRef } from 'antd';
import { Button, Col, Drawer, Empty, Input, Modal, Row, Space, Table, Tag, Tooltip, message } from 'antd';
import { CloseOutlined, CloseSquareOutlined, EyeInvisibleOutlined, LeftOutlined, PlusOutlined, PlusSquareOutlined, RightOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';

import { NAME_SPACE } from '../../../../constants';
import { logsQuery } from '../../../services';
import { LokiLogRow } from '../../../types';
import { buildLokiSelector, getContextTimeRanges, getLogIdentity, getReliableLokiLabels, mergeContextLogs } from '../utils/context';
import { getLineHighlights, LineHighlightFilter } from '../utils/highlights';
import { flattenFieldGroup } from '../../../utils/logFields';
import { highlightTags } from '@/pages/logExplorer/utils/highlight/highlight_tags';

interface Props {
  log?: LokiLogRow & Record<string, any>;
  datasourceValue?: number;
  lineFilters: LineHighlightFilter[];
}

interface ContextLogRow extends LokiLogRow {
  __context_id__: string;
  __offset__: number;
  __current__?: boolean;
}

const STEP_LINES = 30;
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';

interface DynamicTagsProps {
  newTagText?: string;
  value?: string[];
  onChange?: (tags: string[]) => void;
}

function DynamicTags(props: DynamicTagsProps) {
  const { newTagText = 'New Tag', value = [], onChange } = props;
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) inputRef.current?.focus();
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [editInputIndex]);

  const confirmInput = () => {
    if (inputValue && !_.includes(value, inputValue)) {
      onChange?.([...value, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const confirmEditInput = () => {
    const newTags = [...value];
    newTags[editInputIndex] = editInputValue;
    onChange?.(_.filter(newTags));
    setEditInputIndex(-1);
    setEditInputValue('');
  };

  return (
    <Space size={0}>
      {_.map(value, (tag, index) => {
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={tag}
              size='small'
              value={editInputValue}
              onChange={(e) => setEditInputValue(e.target.value)}
              onBlur={confirmEditInput}
              onPressEnter={confirmEditInput}
            />
          );
        }

        const tagElem = (
          <Tag
            key={tag}
            closable
            onClose={() => {
              onChange?.(_.filter(value, (item) => item !== tag));
            }}
          >
            <span
              onDoubleClick={(e) => {
                setEditInputIndex(index);
                setEditInputValue(tag);
                e.preventDefault();
              }}
            >
              {tag.length > 20 ? `${tag.slice(0, 20)}...` : tag}
            </span>
          </Tag>
        );
        return tag.length > 20 ? (
          <Tooltip title={tag} key={tag}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        );
      })}
      {inputVisible ? (
        <Input
          ref={inputRef}
          size='small'
          className='min-w-[80px]'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={confirmInput}
          onPressEnter={confirmInput}
        />
      ) : (
        <Tag className='cursor-pointer' onClick={() => setInputVisible(true)}>
          <PlusOutlined /> {newTagText}
        </Tag>
      )}
    </Space>
  );
}

function DynamicTagsTrigger(props: DynamicTagsProps) {
  const { newTagText = 'New Tag', value = [], onChange } = props;
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) inputRef.current?.focus();
  }, [inputVisible]);

  const confirmInput = () => {
    if (inputValue && !_.includes(value, inputValue)) {
      onChange?.([...value, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  if (inputVisible) {
    return <Input ref={inputRef} className='min-w-[80px]' value={inputValue} onChange={(e) => setInputValue(e.target.value)} onBlur={confirmInput} onPressEnter={confirmInput} />;
  }
  return (
    <Button onClick={() => setInputVisible(true)} icon={<PlusOutlined />}>
      {newTagText}
    </Button>
  );
}

function OrganizeFields(props: { fields: string[]; organizeFields: string[]; onChange: (fields: string[]) => void }) {
  const { t } = useTranslation(NAME_SPACE);
  const { fields, organizeFields, onChange } = props;
  const [visible, setVisible] = useState(false);
  const [currentFields, setCurrentFields] = useState(organizeFields);

  useEffect(() => {
    setCurrentFields(organizeFields);
  }, [JSON.stringify(organizeFields)]);

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        <Space>
          {t('context.organize_fields')}
          {!_.isEmpty(organizeFields) && (
            <Tooltip title={t('context.organize_fields_tip', { fields: _.join(organizeFields, ', ') })}>
              <EyeInvisibleOutlined className='text-gray-500' />
            </Tooltip>
          )}
        </Space>
      </Button>
      <Modal
        className='log-explorer-ignore-click-away'
        title={t('context.organize_fields')}
        visible={visible}
        onOk={() => {
          onChange(currentFields);
          setVisible(false);
        }}
        onCancel={() => setVisible(false)}
      >
        <Row gutter={16}>
          <Col span={12}>
            <div>
              <div className='border border-solid border-fc-300 border-b-0 py-2 px-4'>
                <h3 className='m-0'>{t('context.all_fields')}</h3>
              </div>
              <div className='border border-solid border-fc-300 p-4 overflow-y-auto h-[450px]'>
                {_.map(_.xor(fields, currentFields), (field) => (
                  <div
                    key={field}
                    className='cursor-pointer mb-2'
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentFields([...currentFields, field]);
                    }}
                  >
                    <Space>
                      <PlusSquareOutlined />
                      {field}
                    </Space>
                  </div>
                ))}
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <div className='border border-solid border-fc-300 border-b-0 py-2 px-4'>
                <h3 className='m-0'>{t('context.show_fields')}</h3>
              </div>
              <div className='border border-solid border-fc-300 p-4 overflow-y-auto h-[450px]'>
                {_.isEmpty(currentFields) && <div className='text-gray-400'>{t('context.show_fields_empty')}</div>}
                {_.map(currentFields, (field) => (
                  <div
                    key={field}
                    className='cursor-pointer mb-2'
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentFields(_.filter(currentFields, (item) => item !== field));
                    }}
                  >
                    <Space>
                      <CloseSquareOutlined />
                      {field}
                    </Space>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Modal>
    </>
  );
}

function toContextRows(logs: LokiLogRow[], currentLog: LokiLogRow): ContextLogRow[] {
  const currentIdentity = getLogIdentity(currentLog);
  const currentIndex = _.findIndex(logs, (item) => getLogIdentity(item) === currentIdentity);
  return _.map(logs, (item, index) => {
    const identity = getLogIdentity(item);
    return {
      ...item,
      __context_id__: identity,
      __offset__: currentIndex === -1 ? index : index - currentIndex,
      __current__: identity === currentIdentity,
    };
  });
}

function stringifyContextValue(value: any) {
  if (_.isPlainObject(value) || _.isArray(value)) {
    return JSON.stringify(value);
  }
  return _.toString(value ?? '');
}

function getContextDocumentFields(record?: Partial<LokiLogRow>) {
  if (!record) return {};
  return {
    ...flattenFieldGroup('labels', record.labels || {}),
    ...flattenFieldGroup('parsed_fields', record.parsed_fields || {}),
    line: record.line || '',
  };
}

function stripHighlightTag(value: string) {
  return value.replaceAll(highlightTags.pre, '').replaceAll(highlightTags.post, '');
}

function highlightPattern(keywords: string[]) {
  const escapedKeywords = _.filter(_.map(keywords, (keyword) => _.escapeRegExp(_.escape(keyword))));
  if (_.isEmpty(escapedKeywords)) return null;
  return new RegExp(`(${_.join(escapedKeywords, '|')})`, 'gi');
}

function renderMarkedText(value: any, filterKeywords: string[], highlightKeywords: string[]) {
  let html = _.escape(stringifyContextValue(value));
  const filterPattern = highlightPattern(filterKeywords);
  if (filterPattern) {
    html = html.replace(filterPattern, "<span style='color: #f50;'>$1</span>");
  }
  const bgPattern = highlightPattern(highlightKeywords);
  if (bgPattern) {
    html = html.replace(bgPattern, "<span style='background-color: yellow;'>$1</span>");
  }
  return <span dangerouslySetInnerHTML={{ __html: purify.sanitize(html) }} />;
}

function getLineFilterHighlightKeywords(line: string, lineFilters: LineHighlightFilter[]) {
  return _.map(getLineHighlights(line, lineFilters), stripHighlightTag);
}

export default function ContextViewer(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { log, datasourceValue, lineFilters } = props;
  const [open, setOpen] = useState(false);
  const [organizeFields, setOrganizeFields] = useState<string[]>([]);
  const [filterKeywords, setFilterKeywords] = useState<string[]>([]);
  const [highlightKeywords, setHighlightKeywords] = useState<string[]>([]);
  const selector = useMemo(() => buildLokiSelector(getReliableLokiLabels(log)), [log]);
  const logIdentity = useMemo(() => getLogIdentity(log), [log]);
  const scrollTarget = useRef<'top' | 'bottom' | 'current'>('current');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<{ flag: string; list: LokiLogRow[] } | undefined>();

  const queryContextLogs = async (params: { anchorLog: LokiLogRow; mode: 'initial' | 'top' | 'bottom' }) => {
    if (!log || !datasourceValue || !selector) {
      return {
        flag: _.uniqueId('loki_context_'),
        list: [],
      };
    }
    const currentLog = log;

    const ranges = getContextTimeRanges(params.anchorLog.__timestamp__);
    if (!ranges) {
      return {
        flag: _.uniqueId('loki_context_'),
        list: [],
      };
    }

    const runQuery = (range: { start: string; end: string }, direction: 'forward' | 'backward') => {
      return logsQuery({
        cate: DatasourceCateEnum.loki,
        datasource_id: datasourceValue,
        query: [
          {
            query: selector,
            start: range.start,
            end: range.end,
            limit: STEP_LINES,
            direction,
            skip_count: true,
            ref: direction === 'backward' ? 'context_backward' : 'context_forward',
          },
        ],
      }).then((res) => res.list || []);
    };

    if (params.mode === 'top') {
      let backwardLogs: LokiLogRow[] = [];
      try {
        backwardLogs = await runQuery(ranges.backward, 'backward');
      } catch (e) {
        message.error(t('context.query_failed'));
        return { flag: _.uniqueId('loki_context_'), list: dataRef.current?.list || [] };
      }

      if (_.isEmpty(backwardLogs)) {
        message.info(t('context.no_more_top'));
      }
      return {
        flag: _.uniqueId('loki_context_'),
        list: mergeContextLogs(currentLog, backwardLogs, dataRef.current?.list || []),
      };
    }

    if (params.mode === 'bottom') {
      let forwardLogs: LokiLogRow[] = [];
      try {
        forwardLogs = await runQuery(ranges.forward, 'forward');
      } catch (e) {
        message.error(t('context.query_failed'));
        return { flag: _.uniqueId('loki_context_'), list: dataRef.current?.list || [] };
      }

      if (_.isEmpty(forwardLogs)) {
        message.info(t('context.no_more_bottom'));
      }
      return {
        flag: _.uniqueId('loki_context_'),
        list: mergeContextLogs(currentLog, dataRef.current?.list || [], forwardLogs),
      };
    }

    const [backwardRes, forwardRes] = await Promise.allSettled([runQuery(ranges.backward, 'backward'), runQuery(ranges.forward, 'forward')]);
    const backwardLogs = backwardRes.status === 'fulfilled' ? backwardRes.value : [];
    const forwardLogs = forwardRes.status === 'fulfilled' ? forwardRes.value : [];
    if (backwardRes.status === 'rejected' || forwardRes.status === 'rejected') {
      message.error(t('context.query_failed'));
    }
    return {
      flag: _.uniqueId('loki_context_'),
      list: mergeContextLogs(currentLog, backwardLogs, forwardLogs),
    };
  };

  const { data, loading, run } = useRequest<
    {
      flag: string;
      list: LokiLogRow[];
    },
    any
  >(queryContextLogs, {
    manual: true,
  });

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (open && log) {
      scrollTarget.current = 'current';
      run({
        anchorLog: log,
        mode: 'initial',
      });
    }
  }, [open, selector, logIdentity]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;
    window.setTimeout(() => {
      if (scrollTarget.current === 'top') {
        container.scrollTo({ top: 0 });
        return;
      }
      if (scrollTarget.current === 'bottom') {
        container.scrollTo({ top: container.scrollHeight });
        return;
      }
      const currentIdentity = getLogIdentity(log);
      const row = _.find(Array.from(container.querySelectorAll('tr[data-row-key]')), (item) => item.getAttribute('data-row-key') === currentIdentity) as HTMLElement | undefined;
      if (row) {
        container.scrollTo({
          top: Math.max(0, row.offsetTop - (container.clientHeight - row.clientHeight) / 2),
        });
      }
    }, 100);
  }, [data?.flag, log]);

  const dataSource = useMemo(() => (log ? toContextRows(data?.list || [], log) : []), [data?.flag, log]);
  const availableFields = useMemo(() => {
    const rows = log ? [log, ...dataSource] : dataSource;
    return _.sortBy(_.uniq(_.flatMap(rows, (item) => _.keys(getContextDocumentFields(item)))));
  }, [data?.flag, log]);
  const filteredDataSource = useMemo(() => {
    return _.filter(dataSource, (item) => {
      if (_.isEmpty(filterKeywords)) return true;
      const text = JSON.stringify(getContextDocumentFields(item));
      return _.some(filterKeywords, (keyword) => _.includes(text, keyword));
    });
  }, [dataSource, filterKeywords]);
  const tableColumns = useMemo(() => {
    return [
      {
        key: 'offset',
        width: 56,
        render: (record: ContextLogRow) => {
          return <span className={record.__offset__ < 0 ? 'text-red-500' : 'text-green-500'}>{record.__offset__}</span>;
        },
      },
      {
        key: 'document',
        render: (record: ContextLogRow) => {
          const fields = getContextDocumentFields(record);
          const pickedFields = _.isEmpty(organizeFields) ? fields : _.pick(fields, organizeFields);
          const fieldHighlightKeywords = [...highlightKeywords, ...getLineFilterHighlightKeywords(record.line || '', lineFilters)];
          return (
            <Space wrap>
              {record.timestamp && <span>[{moment(record.timestamp).format(TIME_FORMAT)}]</span>}
              {_.map(pickedFields, (value, key) => {
                const currentHighlightKeywords = key === 'line' ? fieldHighlightKeywords : highlightKeywords;
                return (
                  <span key={key}>
                    <span className='font-bold whitespace-nowrap'>{renderMarkedText(key, filterKeywords, currentHighlightKeywords)}</span>:{' '}
                    <span className='text-gray-500'>{renderMarkedText(value, filterKeywords, currentHighlightKeywords)}</span>
                  </span>
                );
              })}
            </Space>
          );
        },
      },
    ];
  }, [organizeFields, filterKeywords, highlightKeywords, lineFilters]);
  if (!log || !selector || !log.__timestamp__) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)}>{t('context.title')}</Button>
      <Drawer
        className='log-explorer-ignore-click-away'
        title={t('context.title')}
        extra={
          <CloseOutlined
            onClick={() => {
              setOpen(false);
            }}
          />
        }
        placement='right'
        onClose={() => {
          setOpen(false);
        }}
        visible={open}
        width='80%'
        destroyOnClose
        bodyStyle={{ padding: 10 }}
      >
        <div className='flex flex-col h-full' onClick={(e) => e.stopPropagation()}>
          <div className='flex-shrink-0 mb-2 pb-2 border-0 border-b border-solid border-fc-200'>
            <Space wrap>
              <Space size={2}>
                <Button
                  onClick={() => {
                    if (!_.isEmpty(data?.list)) {
                      scrollTarget.current = 'top';
                      run({
                        anchorLog: data!.list[0],
                        mode: 'top',
                      });
                    }
                  }}
                >
                  <Space size={2}>
                    <LeftOutlined />
                    {t('context.back_lines_btn')}
                  </Space>
                </Button>
                <Button
                  onClick={() => {
                    scrollTarget.current = 'current';
                    run({
                      anchorLog: log,
                      mode: 'initial',
                    });
                  }}
                >
                  {t('context.current_lines_btn')}
                </Button>
                <Button
                  onClick={() => {
                    if (!_.isEmpty(data?.list)) {
                      scrollTarget.current = 'bottom';
                      run({
                        anchorLog: data!.list[data!.list.length - 1],
                        mode: 'bottom',
                      });
                    }
                  }}
                >
                  <Space size={0}>
                    {t('context.forward_lines_btn')}
                    <RightOutlined />
                  </Space>
                </Button>
              </Space>
              <OrganizeFields fields={availableFields} organizeFields={organizeFields} onChange={setOrganizeFields} />
              {_.isEmpty(filterKeywords) && <DynamicTagsTrigger newTagText={t('context.filter_keywords_add')} value={filterKeywords} onChange={setFilterKeywords} />}
              {_.isEmpty(highlightKeywords) && <DynamicTagsTrigger newTagText={t('context.highlight_keywords_add')} value={highlightKeywords} onChange={setHighlightKeywords} />}
            </Space>
            {!_.isEmpty(filterKeywords) && (
              <div className='mt-2'>
                <Space>
                  <span>{t('context.filter_keywords')}:</span>
                  <DynamicTags newTagText={t('context.filter_keywords_add')} value={filterKeywords} onChange={setFilterKeywords} />
                </Space>
              </div>
            )}
            {!_.isEmpty(highlightKeywords) && (
              <div className='mt-2'>
                <Space>
                  <span>{t('context.highlight_keywords')}:</span>
                  <DynamicTags newTagText={t('context.highlight_keywords_add')} value={highlightKeywords} onChange={setHighlightKeywords} />
                </Space>
              </div>
            )}
            <div className='mt-2'>
              <Space wrap size={[4, 4]}>
                {_.map(getReliableLokiLabels(log), (value, key) => (
                  <Tag key={key}>
                    {key}={value}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
          <div ref={tableContainerRef} className='min-h-0 flex-1 overflow-y-auto'>
            {_.isEmpty(filteredDataSource) && !loading ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                rowKey='__context_id__'
                size='small'
                showHeader={false}
                pagination={false}
                loading={loading}
                dataSource={filteredDataSource}
                columns={tableColumns}
                rowClassName={(record: ContextLogRow) => (record.__current__ ? 'bg-purple-950/[0.1]' : '')}
              />
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}
