import React, { useState, useContext, useEffect, useRef } from 'react';
import { Drawer, Table, Tag, Space, Tooltip, Empty, Button, message, Alert, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { ColumnsType } from 'antd/lib/table';

import { CommonStateContext, basePrefix } from '@/App';
import TimeRangePicker, { parseRange, IRawTimeRange } from '@/components/TimeRangePicker';
import RefreshIcon from '@/components/RefreshIcon';
import { getAlertRuleEvalRecords, EvalRecord, EvalQueryRecord, EvalRecordsNodeErr } from '@/pages/alertRules/services';

import './style.less';

export interface Props {
  title?: string;
  rid?: number;
  visible: boolean;
  onClose: () => void;
}

const FETCH_LIMIT = 1000;
const SeverityColor = ['red', 'orange', 'yellow', 'green'];

// 事件裁决阶段的着色：触发红、等待黄、恢复绿，未产生通知的各类拦截为灰
const STAGE_COLOR: Record<string, string | undefined> = {
  fired: 'red',
  pending: 'gold',
  recovered: 'green',
  push_queue_failed: 'red',
  stalled: undefined,
  notify_muted: undefined,
  muted: undefined,
  muted_notify_only: undefined,
  muted_by_hook: undefined,
  drop_by_pipeline: undefined,
  inhibited: undefined,
};

// 这些阶段的事件确定已落库到 alert_his_event，/event-detail 才查得到。
// 其余阶段（pending / muted / drop_by_pipeline / inhibited / push_queue_failed 等）
// 事件从未入队持久化，点进去后端会以 no such alert event 返回 500，
// 所以只展示 hash 文本，不给链接。
const PERSISTED_STAGES = ['fired', 'recovered', 'stalled', 'notify_muted'];

function formatValue(v: number) {
  if (!_.isFinite(v)) return String(v);
  return Math.abs(v) >= 1e6 || (v !== 0 && Math.abs(v) < 1e-4) ? v.toExponential(4) : _.round(v, 4).toString();
}

function QueryDetail({ query, t }: { query: EvalQueryRecord; t: TFunction }) {
  return (
    <div className='eval-records-query-detail'>
      <div className='eval-records-query-header'>
        <Space size={8} wrap>
          <Tag>{query.ref || '-'}</Tag>
          {query.var_query && <Tag color='blue'>{t('eval_records.var_query')}</Tag>}
          <span className='text-soft'>{t('eval_records.series_total', { count: query.series_total })}</span>
          <span className='text-soft'>{query.duration_ms}ms</span>
        </Space>
      </div>
      <pre className='eval-records-query-ql'>{query.query}</pre>
      {query.error && <div className='eval-records-error'>{query.error}</div>}
      {_.map(query.warnings, (w, i) => (
        <div key={i} className='eval-records-warning'>
          {w}
        </div>
      ))}
      {!_.isEmpty(query.series) && (
        <Table
          className='mt-1'
          size='small'
          rowKey={(r: any) => JSON.stringify(r.labels)}
          pagination={query.series!.length > 10 ? { pageSize: 10, size: 'small', showSizeChanger: false } : false}
          dataSource={query.series}
          columns={[
            {
              title: t('eval_records.labels'),
              dataIndex: 'labels',
              render: (labels: Record<string, string>) => (
                <span className='eval-records-labels'>
                  {_.map(labels, (v, k) => (
                    <Tag key={k}>
                      {k}={v}
                    </Tag>
                  ))}
                </span>
              ),
            },
            {
              title: t('eval_records.value'),
              width: 140,
              render: (record: any) => {
                const last = _.last(record.points as [number, number][]);
                if (!last) return '-';
                return (
                  <Tooltip
                    title={_.map(record.points as [number, number][], (p) => `${moment.unix(p[0]).format('MM-DD HH:mm:ss')} → ${formatValue(p[1])}`).join('\n')}
                    overlayClassName='eval-records-points-tooltip'
                  >
                    <span>{formatValue(last[1])}</span>
                  </Tooltip>
                );
              },
            },
            {
              title: t('eval_records.point_time'),
              width: 160,
              render: (record: any) => {
                const last = _.last(record.points as [number, number][]);
                return last ? moment.unix(last[0]).format('YYYY-MM-DD HH:mm:ss') : '-';
              },
            },
          ]}
        />
      )}
    </div>
  );
}

function RecordDetail({ record, t }: { record: EvalRecord; t: TFunction }) {
  return (
    <div className='eval-records-detail'>
      {record.error && <div className='eval-records-error'>{record.error}</div>}
      {record.truncated && (
        <div className='eval-records-warning'>
          <InfoCircleOutlined /> {t('eval_records.truncated')}
        </div>
      )}
      <div className='eval-records-section-title'>{t('eval_records.detail_query')}</div>
      {_.isEmpty(record.queries) ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : _.map(record.queries, (q, i) => <QueryDetail key={i} query={q} t={t} />)}
      {!_.isEmpty(record.anomalies) && (
        <>
          <div className='eval-records-section-title'>{t('eval_records.detail_anomalies')}</div>
          <Table
            size='small'
            rowKey={(r: any) => `${r.key}_${r.severity}_${r.recover ? 1 : 0}_${r.value}`}
            pagination={record.anomalies!.length > 10 ? { pageSize: 10, size: 'small', showSizeChanger: false } : false}
            dataSource={record.anomalies}
            columns={[
              {
                title: t('eval_records.labels'),
                dataIndex: 'key',
                render: (val, r: any) => (
                  <Space size={4}>
                    <Tag color={SeverityColor[r.severity - 1]}>S{r.severity}</Tag>
                    {r.recover && <Tag color='green'>{t('eval_records.recover')}</Tag>}
                    {r.trigger_type === 'nodata' && <Tag>nodata</Tag>}
                    <span className='eval-records-anomaly-key'>{val}</span>
                  </Space>
                ),
              },
              {
                title: t('eval_records.value'),
                dataIndex: 'value',
                width: 140,
                render: (val) => formatValue(val),
              },
            ]}
          />
        </>
      )}
      {!_.isEmpty(record.events) && (
        <>
          <div className='eval-records-section-title'>{t('eval_records.detail_events')}</div>
          <Table
            size='small'
            rowKey={(r: any) => `${r.hash}_${r.stage}_${r.detail || ''}`}
            pagination={record.events!.length > 10 ? { pageSize: 10, size: 'small', showSizeChanger: false } : false}
            dataSource={record.events}
            columns={[
              {
                title: t('eval_records.event_hash'),
                dataIndex: 'hash',
                width: 130,
                render: (hash: string, r: any) => (
                  <Space size={4}>
                    {_.includes(PERSISTED_STAGES, r.stage) ? (
                      <Tooltip title={t('eval_records.event_hash_tip')}>
                        <a href={`${basePrefix}/api/n9e/event-detail/${encodeURIComponent(hash)}`} target='_blank' rel='noreferrer' className='eval-records-hash'>
                          {_.truncate(hash, { length: 10, omission: '…' })}
                        </a>
                      </Tooltip>
                    ) : (
                      <span className='eval-records-hash'>{_.truncate(hash, { length: 10, omission: '…' })}</span>
                    )}
                    <Typography.Text copyable={{ text: hash }} />
                  </Space>
                ),
              },
              {
                title: t('eval_records.labels'),
                dataIndex: 'tags',
                render: (tags: string | undefined, r: any) => (
                  <Space size={4} wrap>
                    {!!r.severity && <Tag color={SeverityColor[r.severity - 1]}>S{r.severity}</Tag>}
                    {_.map(_.compact(_.split(tags || '', ',,')), (tag, i) => (
                      <Tag key={i}>{tag}</Tag>
                    ))}
                  </Space>
                ),
              },
              {
                title: t('eval_records.stage'),
                dataIndex: 'stage',
                width: 120,
                render: (stage: string) => (
                  <Tag color={STAGE_COLOR[stage]}>{t(`eval_records.stage_${stage}`, { defaultValue: stage })}</Tag>
                ),
              },
              {
                title: t('eval_records.stage_detail'),
                dataIndex: 'detail',
                render: (detail: string | undefined) => (detail ? <span className='eval-records-stage-detail'>{detail}</span> : <span className='text-soft'>-</span>),
              },
            ]}
          />
        </>
      )}
    </div>
  );
}

export default function EvalRecordsDrawer(props: Props) {
  const { t } = useTranslation('alertRules');
  const { datasourceList } = useContext(CommonStateContext);
  const { title, rid, visible, onClose } = props;
  const [range, setRange] = useState<IRawTimeRange>({ start: 'now-1h', end: 'now' });
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<EvalRecord[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nodeErrs, setNodeErrs] = useState<EvalRecordsNodeErr[]>([]);
  const [queriedRange, setQueriedRange] = useState<{ from: number; to: number }>();
  // 请求代次：抽屉常驻挂载，切换规则/时间范围/关闭都可能留下在途请求，
  // 慢节点（后端对 edge 节点有 5s 超时）的旧响应回来晚了会覆盖新结果
  const reqIdRef = useRef(0);

  const resetState = () => {
    setRecords([]);
    setNodeErrs([]);
    setHasMore(false);
    setQueriedRange(undefined);
  };

  const fetchData = (before?: number) => {
    if (!rid) return;
    const parsedRange = parseRange(range);
    const from = moment(parsedRange.start).unix();
    const to = moment(parsedRange.end).unix();
    const reqId = ++reqIdRef.current;
    // 首屏请求先清空上一次的结果，避免请求返回前回显上一条规则的数据
    if (!before) resetState();
    setLoading(true);
    getAlertRuleEvalRecords(rid, {
      from,
      to,
      limit: FETCH_LIMIT,
      before,
    })
      .then((dat) => {
        if (reqId !== reqIdRef.current) return;
        const list = dat?.list || [];
        // 后端游标语义是 ts < before，翻页时传的是 last.ts + 1，因此本页会与上页
        // 边界记录重叠，这里按 rowKey 同款的组合键去重
        setRecords((prev) => (before ? _.uniqBy(_.concat(prev, list), (r) => `${r.datasource_id}_${r.ts}`) : list));
        setHasMore(list.length >= FETCH_LIMIT);
        setNodeErrs(dat?.errors || []);
        setQueriedRange({ from, to });
      })
      .catch(() => {
        if (reqId !== reqIdRef.current) return;
        if (!before) resetState();
      })
      .finally(() => {
        if (reqId !== reqIdRef.current) return;
        setLoading(false);
      });
  };

  useEffect(() => {
    if (visible) {
      fetchData();
    } else {
      // 关闭时让在途请求失效并清理本地状态，避免下次打开先闪一下上一条规则的记录与节点错误
      reqIdRef.current += 1;
      resetState();
      setLoading(false);
    }
  }, [rid, visible, JSON.stringify(range), refreshFlag]);

  const showDatasourceCol = _.uniqBy(records, 'datasource_id').length > 1;

  const columns: ColumnsType<EvalRecord> = _.compact([
    {
      title: t('eval_records.time'),
      dataIndex: 'ts',
      width: 170,
      render: (val) => moment(val).format('YYYY-MM-DD HH:mm:ss'),
    },
    showDatasourceCol && {
      title: t('eval_records.datasource'),
      dataIndex: 'datasource_id',
      width: 120,
      render: (val) => _.find(datasourceList, { id: val })?.name || (val === 0 ? 'host' : val),
    },
    {
      title: t('eval_records.queries'),
      dataIndex: 'queries',
      render: (queries: EvalQueryRecord[] | undefined, record) => {
        if (record.error) {
          return (
            <Tooltip title={record.error}>
              <Tag color='red'>{t('eval_records.query_error')}</Tag>
            </Tooltip>
          );
        }
        if (_.isEmpty(queries)) return '-';
        return (
          <Space size={4} wrap>
            {_.map(queries, (q, i) => {
              if (q.error) {
                return (
                  <Tooltip key={i} title={q.error}>
                    <Tag color='red'>{q.ref || i}: {t('eval_records.query_error')}</Tag>
                  </Tooltip>
                );
              }
              return (
                <Tag key={i} color={q.series_total === 0 ? 'orange' : undefined}>
                  {q.ref || i}: {q.series_total === 0 ? t('eval_records.no_series') : t('eval_records.series_total', { count: q.series_total })}
                </Tag>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: t('eval_records.anomalies'),
      dataIndex: 'anomaly_total',
      width: 90,
      render: (val, record) => {
        if (val === 0 && record.recover_total === 0) return <span className='text-soft'>0</span>;
        return (
          <Space size={4}>
            {val > 0 && <Tag color='red'>{val}</Tag>}
            {record.recover_total > 0 && <Tag color='green'>↓{record.recover_total}</Tag>}
          </Space>
        );
      },
    },
    {
      title: t('eval_records.funnel'),
      key: 'funnel',
      render: (record: EvalRecord) => {
        const items = _.compact([
          record.fired > 0 && { label: t('eval_records.funnel_fired'), value: record.fired, color: 'red' },
          record.pending > 0 && { label: t('eval_records.funnel_pending'), value: record.pending, color: 'gold' },
          record.muted > 0 && { label: t('eval_records.funnel_muted'), value: record.muted, color: 'default' },
          record.drop_by_pipeline > 0 && { label: t('eval_records.funnel_dropped'), value: record.drop_by_pipeline, color: 'default' },
          record.inhibited > 0 && { label: t('eval_records.funnel_inhibited'), value: record.inhibited, color: 'default' },
        ]) as { label: string; value: number; color: string }[];
        if (_.isEmpty(items)) return <span className='text-soft'>-</span>;
        return (
          <Space size={4} wrap>
            {_.map(items, (item, i) => (
              <Tag key={i} color={item.color === 'default' ? undefined : item.color}>
                {item.label} {item.value}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: t('eval_records.duration'),
      dataIndex: 'duration_ms',
      width: 90,
      render: (val) => `${val}ms`,
    },
  ]) as ColumnsType<EvalRecord>;

  return (
    <Drawer
      title={
        <Space>
          {t('eval_records.title')}
          {title && <span className='text-soft eval-records-drawer-subtitle'>{title}</span>}
        </Space>
      }
      width='75%'
      placement='right'
      visible={visible}
      onClose={onClose}
      destroyOnClose
    >
      <div className='mb-2 flex justify-between'>
        <Space>
          <RefreshIcon
            onClick={() => {
              setRefreshFlag(_.uniqueId('refresh_'));
            }}
          />
          <TimeRangePicker value={range} onChange={setRange} dateFormat='YYYY-MM-DD HH:mm:ss' />
          <Tooltip title={t('eval_records.tip')}>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      </div>
      {!_.isEmpty(nodeErrs) && (
        <Alert
          className='mb-2'
          type='warning'
          showIcon
          message={t('eval_records.node_error_title')}
          description={
            <div>
              {_.map(nodeErrs, (e, i) => (
                <div key={i} className='eval-records-node-err'>
                  <div>
                    {e.instance}
                    {e.datasource_id > 0 ? `（datasource ${e.datasource_id}）` : ''}: {e.error}
                  </div>
                </div>
              ))}
              <div className='mt-1'>{t('eval_records.node_error_hint')}</div>
              {_.map(_.uniqBy(nodeErrs, 'instance'), (e, i) => (
                <pre key={i} className='eval-records-node-err-url'>
                  {`curl -u <user>:<pass> 'http://${e.instance}/v1/n9e/eval-records?rule_id=${rid}&datasource_id=${e.datasource_id}&from=${queriedRange?.from || ''}&to=${
                    queriedRange?.to || ''
                  }'`}
                </pre>
              ))}
            </div>
          }
        />
      )}
      <Table
        size='small'
        rowKey={(record) => `${record.datasource_id}_${record.ts}`}
        loading={loading}
        dataSource={records}
        columns={columns}
        pagination={{ pageSize: 30, showSizeChanger: false, showTotal: (total) => t('common:table.total', { total }) }}
        expandable={{
          expandedRowRender: (record) => <RecordDetail record={record} t={t} />,
          rowExpandable: () => true,
        }}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className='eval-records-empty-desc'>{t('eval_records.empty')}</span>} />,
        }}
      />
      {hasMore && (
        <div className='mt-2 flex justify-center'>
          <Button
            loading={loading}
            onClick={() => {
              const last = _.last(records);
              if (last) {
                // 传 last.ts + 1 而不是 last.ts：后端是严格 ts < before，多数据源同刻触发
                // 撞到同一毫秒时，那一组记录会被整组跳过。宁可与上页重叠，由上面去重兜住
                fetchData(last.ts + 1);
              } else {
                message.warning(t('eval_records.empty'));
              }
            }}
          >
            {t('eval_records.load_more')}
          </Button>
        </div>
      )}
    </Drawer>
  );
}
