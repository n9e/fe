// 日志聚类，目前仅支持了doris和es
import React, { useState, useEffect } from 'react';
import { Space, Tag, Select } from 'antd';
import { BarChartOutlined, SyncOutlined } from '@ant-design/icons';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { NAME_SPACE } from '../../../constants';
import getTextWidth from '@/utils/getTextWidth';
import { getLogClustering, ClusteringItem, getQueryClustering, getLogPattern } from '../../../services';
import { getGlobalConfig } from '@/plus/components/LogDownload/service';
import { OnValueFilterParams, OptionsType } from '../types';
import { Field } from '@/plugins/doris/ExplorerNG/types';
import RDGTable from '../components/Table';
const DEFAULT_MAX_LOG_COUNT = 100000;
import { DatasourceCateEnum } from '@/utils/constant';
import { PatternPopover, ConstPopover } from './Popover';
interface Props {
  onValueFilter: (condition: OnValueFilterParams) => void;
  indexData: Field[];
  options: OptionsType;
  clusteringOptionsEleRef: React.RefObject<HTMLDivElement>;
  clusteringExtraEleRef: React.RefObject<HTMLDivElement>;
  logs: { [index: string]: string }[];
  logsHash?: string;
  setPatternHistogramState: (v: { visible: boolean; uuid?: string; rowIndex?: number }) => void;
  logClusting: LogClusting;
}

// 日志聚类参数
export interface LogClusting {
  enabled: boolean;
  queryStrRef: React.RefObject<string>;
  logTotal: number;
  cate: DatasourceCateEnum;
  datasourceValue: number;
  fieldCacheKey: string;
}

export default function TableCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logClusting, indexData, options, clusteringOptionsEleRef, logs, logsHash, setPatternHistogramState, clusteringExtraEleRef, updateOptions } = props;
  const { queryStrRef, logTotal, cate, datasourceValue, fieldCacheKey } = logClusting;
  const [scope, setScope] = useState<'current' | 'full'>('current');
  const [timeCost, setTimeCost] = useState<number>(0);
  const FIELD_CACHE_PREFIX = 'log_clustering_field__';

  const getDefaultField = (fields: Field[]) => {
    const textFields = fields.filter((item) => item.type === 'text' && item.indexable);
    const priorityFields = ['message', 'data', 'msg'];
    const priorityField = priorityFields.map((name) => textFields.find((item) => item.field === name)).find(Boolean);
    return priorityField?.field || textFields[0]?.field || '';
  };

  const getInitialField = () => {
    const cached = localStorage.getItem(FIELD_CACHE_PREFIX + fieldCacheKey);
    if (cached && indexData.some((item) => item.field === cached)) {
      return cached;
    }
    return getDefaultField(indexData);
  };

  const [field, setField] = useState<string>(getInitialField);

  const setCachedField = (value: string) => {
    localStorage.setItem(FIELD_CACHE_PREFIX + fieldCacheKey, value);
    setField(value);
  };

  useEffect(() => {
    const cached = localStorage.getItem(FIELD_CACHE_PREFIX + fieldCacheKey);
    if (cached && indexData.some((item) => item.field === cached)) {
      setField(cached);
    } else {
      setField(getDefaultField(indexData));
    }
  }, [fieldCacheKey]);

  const [maxLogCount, setMaxLogCount] = useState<number>(DEFAULT_MAX_LOG_COUNT);
  const id_key = 'uuid'; // 数据唯一标识字段
  const [data, setData] = useState<ClusteringItem[]>([]);
  const [fullAggregateLoading, setFullAggregateLoading] = useState(false);
  useEffect(() => {
    getGlobalConfig('log_clustering_max').then((res) => {
      setMaxLogCount(isNaN(Number(res)) || Number(res) === 0 ? DEFAULT_MAX_LOG_COUNT : Number(res));
    });
  }, []);

  useEffect(() => {
    if (scope === 'current') {
      if (field) {
        getLogClustering(cate, datasourceValue, queryStrRef?.current || '', logs, field).then((res) => {
          setData(res);
        });
      }
    } else if (scope === 'full') {
      if (logTotal > maxLogCount) return;
      handleFullAggregation(field);
    }
  }, [logs, logsHash]);

  useEffect(() => {
    if (logTotal > maxLogCount) {
      setScope('current');
    }
  }, [logTotal]);

  useEffect(() => {
    setPatternHistogramState({ visible: false });
  }, [logsHash]);

  const handleFullAggregation = (clusterField: string) => {
    setFullAggregateLoading(true);
    getQueryClustering(cate, datasourceValue, queryStrRef?.current || '', clusterField)
      .then((res) => {
        setData(res.items);
        setScope('full');
        setTimeCost(res.time_cost);
      })
      .finally(() => {
        setFullAggregateLoading(false);
      });
  };

  const getColumns = () => {
    const TAG_PADDING = 14;
    const CELL_PADDING = 16;
    const MIN_COL_WIDTH = 200;

    let partsColWidth = MIN_COL_WIDTH;
    _.forEach(data, (row) => {
      let rowWidth = 0;
      _.forEach(row.parts, (part) => {
        const textWidth = getTextWidth(part.data);
        rowWidth += part.type === 'pattern' ? textWidth + TAG_PADDING : textWidth;
      });
      rowWidth += CELL_PADDING;
      if (rowWidth > partsColWidth) {
        partsColWidth = rowWidth;
      }
    });

    const columns: any[] = [
      {
        key: 'count',
        width: 40,
        name: t('clustering.count'),
      },
      {
        key: 'parts',
        name: t('clustering.log_data'),
        width: partsColWidth,
        minWidth: MIN_COL_WIDTH,
        formatter: ({ row }) => {
          return (
            <Space size={'small'}>
              {row.parts.map((part) => {
                if (part.type === 'pattern') {
                  if (scope === 'full') {
                    return (
                      <PatternPopover key={part.part_id} uuid={row.uuid} partId={part.part_id} title={part.data}>
                        <Tag className='mr-0 cursor-pointer' color='purple'>
                          {part.data}
                        </Tag>
                      </PatternPopover>
                    );
                  } else {
                    return (
                      <Tag className='mr-0' color='purple'>
                        {part.data}
                      </Tag>
                    );
                  }
                } else {
                  if (scope === 'full') {
                    return (
                      <ConstPopover key={part.part_id} value={part.data} field={field} cate={cate} onValueFilter={props.onValueFilter}>
                        <span className='cursor-pointer hover:underline'>{part.data}</span>
                      </ConstPopover>
                    );
                  } else {
                    return <span>{part.data}</span>;
                  }
                }
              })}
            </Space>
          );
        },
      },
    ];
    if (options?.lines === 'true') {
      columns.unshift({
        name: t('logs.settings.lines'),
        key: '___lines___',
        width: 40,
        resizable: false,
        formatter: ({ row }) => {
          const idx = _.findIndex(data, { [id_key]: row[id_key] });
          return idx + 1;
        },
      });
    }
    if (scope === 'full') {
      columns.unshift({
        name: '',
        key: 'chart',
        width: 40,
        resizable: false,
        formatter: ({ row }) => {
          return (
            <BarChartOutlined
              style={{ cursor: 'pointer' }}
              onClick={async () => {
                const idx = _.findIndex(data, { [id_key]: row[id_key] });
                setPatternHistogramState({ visible: true, uuid: row[id_key] as string, rowIndex: idx + 1 });
              }}
            />
          );
        },
      });
    }
    return columns;
  };

  const clusteringPortal = (
    <Space>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          border: '1px solid var(--fc-border-color2)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* 聚类字段 */}
        <span
          style={{
            padding: '0 8px',
            fontSize: 12,
            color: 'var(--fc-text-3)',
            background: 'var(--fc-fill-3)',
            borderRight: '1px solid var(--fc-border-color2)',
            whiteSpace: 'nowrap',
            lineHeight: '24px',
          }}
        >
          {t('clustering.field_label')}
        </span>
        <Select
          bordered={false}
          size='small'
          value={field}
          dropdownMatchSelectWidth={false}
          options={indexData.map((item) => ({ value: item.field, label: item.field }))}
          onChange={(value) => {
            setCachedField(value);
            if (scope === 'full') {
              handleFullAggregation(value);
            } else {
              getLogClustering(cate, datasourceValue, queryStrRef?.current || '', logs, value).then((res) => {
                setData(res);
              });
            }
          }}
          getPopupContainer={() => clusteringOptionsEleRef.current as HTMLElement}
          style={{ minWidth: 100 }}
          className='best-looking-scroll'
        />
        {/* 分隔线 */}
        <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--fc-border-color2)' }} />
        {/* 范围 */}
        <span
          style={{
            padding: '0 8px',
            fontSize: 12,
            color: 'var(--fc-text-3)',
            background: 'var(--fc-fill-3)',
            borderRight: '1px solid var(--fc-border-color2)',
            whiteSpace: 'nowrap',
            lineHeight: '24px',
          }}
        >
          {t('clustering.scope_label')}
        </span>
        <Select
          bordered={false}
          size='small'
          value={scope}
          optionLabelProp='title'
          options={[
            {
              value: 'current' as const,
              title: t('clustering.scope_current_page'),
              label: (
                <div style={{ padding: '2px 0' }}>
                  <div>{t('clustering.scope_current_page')}</div>
                  <div style={{ color: 'var(--fc-text-3)', fontSize: 12 }}>{t('clustering.scope_current_page_desc')}</div>
                </div>
              ),
            },
            {
              value: 'full' as const,
              title: t('clustering.scope_full'),
              label: (
                <div style={{ padding: '2px 0' }}>
                  <div>{t('clustering.scope_full')}</div>
                  <div style={{ color: 'var(--fc-text-3)', fontSize: 12 }}>
                    {logTotal > maxLogCount ? t('clustering.scope_full_desc_disable_prefix') : t('clustering.scope_full_desc_prefix')}{' '}
                    <span style={{ color: 'var(--fc-primary-color)' }}>{logTotal?.toLocaleString()}</span> {t('clustering.scope_full_desc_suffix')}
                  </div>
                </div>
              ),
              disabled: logTotal > maxLogCount,
            },
          ]}
          onChange={(value: 'current' | 'full') => {
            setScope(value);
            if (value === 'full') {
              handleFullAggregation(field);
            } else {
              getLogClustering(cate, datasourceValue, queryStrRef?.current || '', logs, field).then((res) => {
                setData(res);
              });
            }
          }}
          getPopupContainer={() => clusteringOptionsEleRef.current as HTMLElement}
          dropdownMatchSelectWidth={false}
        />
      </div>
    </Space>
  );

  return (
    <div className='min-h-0 h-full'>
      {clusteringOptionsEleRef.current && createPortal(clusteringPortal, clusteringOptionsEleRef.current)}
      {clusteringExtraEleRef.current &&
        createPortal(
          scope === 'full' ? (
            <Space size='small'>
              <span>{t('clustering.log_count')}</span>
              <span>{logTotal?.toLocaleString()}</span>
              <span>{t('clustering.duration')}</span>
              <span>{timeCost}s</span>
            </Space>
          ) : null,
          clusteringExtraEleRef.current,
        )}
      {fullAggregateLoading ? (
        <div className='h-full flex flex-col items-center justify-center bg-fc-200' style={{ minHeight: 300 }}>
          <SyncOutlined spin style={{ fontSize: 64, color: 'var(--fc-text-4)' }} />
          <div className='mt-6 text-base font-bold'>{t('clustering.loading_title')}</div>
          <div className='mt-2 text-l2'>
            {t('clustering.loading_info')}
            <span style={{ color: 'var(--fc-primary-color)', fontWeight: 'bold' }}>{logTotal?.toLocaleString()}</span>
            <span className='mx-1'>|</span>
            {t('clustering.loading_field')}
            {field}
          </div>
          <div className='mt-2 text-l2'>
            {t('clustering.loading_tip')}
            <a onClick={() => window.open(window.location.href, '_blank')}>{t('clustering.loading_new_tab')}</a>
            {t('clustering.loading_tip_suffix')}
          </div>
        </div>
      ) : (
        <RDGTable
          className='n9e-event-logs-table'
          rowKeyGetter={(row) => {
            return row[id_key] || '';
          }}
          columns={getColumns()}
          rows={data}
        />
      )}
    </div>
  );
}
