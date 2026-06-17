// 日志聚类，目前仅支持了doris和es
import React, { useState, useEffect } from 'react';
import { Space, Tag, Select, Divider, Button } from 'antd';
import IconFont from '@/components/IconFont';
import DocumentDrawer from '@/components/DocumentDrawer';
import { BarChartOutlined, SyncOutlined } from '@ant-design/icons';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { NAME_SPACE } from '../../../constants';
import getTextWidth from '@/utils/getTextWidth';
import { getLogClustering, ClusteringItem, getQueryClustering } from '../../../services';
import { OnValueFilterParams, OptionsType } from '../types';
import { Field } from '@/plugins/doris/ExplorerNG/types';
import RDGTable from '../components/Table';
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
  const { logClusting, indexData, options, clusteringOptionsEleRef, logs, logsHash, setPatternHistogramState, clusteringExtraEleRef } = props;
  const { queryStrRef, logTotal, cate, datasourceValue, fieldCacheKey } = logClusting;
  const [scope, setScope] = useState<'current' | 'full'>('current');
  const [timeCost, setTimeCost] = useState<number>(0);
  const FIELD_CACHE_PREFIX = 'log_clustering_field__';
  const [isSampled, setIsSampled] = useState<boolean>(false);

  const getDefaultGroupByFields = (fields: Field[]) => {
    const textFields = fields.filter((item) => item.type === 'text' && item.indexable);
    const priorityFields = ['message', 'data', 'msg'];
    const priorityField = priorityFields.map((name) => textFields.find((item) => item.field === name)).find(Boolean);
    const defaultField = priorityField?.field || textFields[0]?.field || fields[0]?.field || '';
    return defaultField ? [defaultField] : [];
  };

  const normalizeGroupByFields = (fields: string[]) => {
    const availableFields = new Set(indexData.map((item) => item.field));
    return _.uniq(fields).filter((item) => item && availableFields.has(item));
  };

  const getCachedGroupByFields = () => {
    const cached = localStorage.getItem(FIELD_CACHE_PREFIX + fieldCacheKey);
    if (!cached) {
      return [];
    }
    try {
      const parsed = JSON.parse(cached);
      if (_.isArray(parsed)) {
        return parsed;
      }
      if (_.isString(parsed)) {
        return [parsed];
      }
    } catch {
      return [cached];
    }
    return [];
  };

  const getInitialGroupByFields = () => {
    const cachedFields = normalizeGroupByFields(getCachedGroupByFields());
    return cachedFields.length > 0 ? cachedFields : getDefaultGroupByFields(indexData);
  };

  const [groupByFields, setGroupByFields] = useState<string[]>(() => getInitialGroupByFields());

  const setCachedGroupByFields = (value: string[]) => {
    const nextFields = normalizeGroupByFields(value);
    if (_.isEmpty(nextFields)) {
      return;
    }
    localStorage.setItem(FIELD_CACHE_PREFIX + fieldCacheKey, JSON.stringify(nextFields));
    setGroupByFields(nextFields);
  };

  useEffect(() => {
    const nextFields = getInitialGroupByFields();
    setGroupByFields((prev) => (_.isEqual(prev, nextFields) ? prev : nextFields));
  }, [fieldCacheKey, indexData]);

  const id_key = 'uuid'; // 数据唯一标识字段
  const [data, setData] = useState<ClusteringItem[]>([]);
  const [fullAggregateLoading, setFullAggregateLoading] = useState(false);

  const handleFullAggregation = (clusterFields: string[]) => {
    if (_.isEmpty(clusterFields)) {
      setData([]);
      return;
    }
    setFullAggregateLoading(true);
    getQueryClustering(cate, datasourceValue, queryStrRef?.current || '', clusterFields)
      .then((res) => {
        setData(res.items);
        setTimeCost(res.time_cost);
        setIsSampled(res.is_sampled);
      })
      .finally(() => {
        setFullAggregateLoading(false);
      });
  };

  useEffect(() => {
    if (_.isEmpty(groupByFields)) {
      setData([]);
      return;
    }
    if (scope === 'current') {
      getLogClustering(cate, datasourceValue, queryStrRef?.current || '', logs, groupByFields).then((res) => {
        setData(res);
      });
    } else if (scope === 'full') {
      handleFullAggregation(groupByFields);
    }
  }, [logs, logsHash, groupByFields, scope]);

  useEffect(() => {
    setPatternHistogramState({ visible: false });
  }, [logsHash]);

  const getColumns = () => {
    const TAG_PADDING = 14;
    const CELL_PADDING = 16;
    const MIN_COL_WIDTH = 200;
    const SPACE_GAP = 8;

    const getPartsByField = (row: ClusteringItem, groupByField: string) => {
      const parts = row.parts || [];
      const partsByField = parts.filter((part) => part.field === groupByField);
      if (_.isEmpty(partsByField) && groupByFields.length === 1) {
        return parts;
      }
      return partsByField;
    };

    const getPartsColumnWidth = (groupByField: string) => {
      let partsColWidth = Math.max(MIN_COL_WIDTH, getTextWidth(groupByField) + CELL_PADDING * 2);
      _.forEach(data, (row) => {
        let rowWidth = 0;
        _.forEach(getPartsByField(row, groupByField), (part) => {
          const textWidth = getTextWidth(part.data || '');
          rowWidth += part.type === 'pattern' ? textWidth + TAG_PADDING + SPACE_GAP : textWidth + SPACE_GAP;
        });
        rowWidth += CELL_PADDING;
        if (rowWidth > partsColWidth) {
          partsColWidth = rowWidth;
        }
      });
      return partsColWidth + 15;
    };

    const renderParts = (row: ClusteringItem, groupByField: string) => {
      return (
        <Space size='small'>
          {getPartsByField(row, groupByField).map((part, index) => {
            const partField = part.field || groupByField;
            const key = `${partField}-${part.part_id}-${index}`;
            if (part.type === 'pattern') {
              return (
                <PatternPopover key={key} uuid={row.uuid || ''} partId={part.part_id} title={part.data}>
                  <Tag className='mr-0 cursor-pointer' color='purple'>
                    {part.data}
                  </Tag>
                </PatternPopover>
              );
            }
            return (
              <ConstPopover key={key} value={part.data} field={partField} cate={cate} onValueFilter={props.onValueFilter}>
                <span className='cursor-pointer hover:underline'>{part.data}</span>
              </ConstPopover>
            );
          })}
        </Space>
      );
    };

    const columns: any[] = [
      {
        key: 'count',
        width: 40,
        name: t('clustering.count'),
      },
      ...groupByFields.map((groupByField) => ({
        key: `parts_${groupByField}`,
        name: groupByField,
        width: getPartsColumnWidth(groupByField),
        minWidth: MIN_COL_WIDTH,
        formatter: ({ row }) => renderParts(row, groupByField),
      })),
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
          mode='multiple'
          bordered={false}
          size='small'
          value={groupByFields}
          dropdownMatchSelectWidth={false}
          maxTagCount='responsive'
          showSearch
          optionFilterProp='label'
          options={indexData.map((item) => ({ value: item.field, label: item.field }))}
          onChange={(value) => {
            setCachedGroupByFields(value);
          }}
          getPopupContainer={() => clusteringOptionsEleRef.current as HTMLElement}
          style={{ minWidth: 240, maxWidth: 360 }}
          className='best-looking-scroll log-clustering-group-by-select'
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
                    {t('clustering.scope_full_desc_prefix')} <span style={{ color: 'var(--fc-primary-color)' }}>{logTotal?.toLocaleString()}</span>{' '}
                    {t('clustering.scope_full_desc_suffix')}
                  </div>
                </div>
              ),
            },
          ]}
          onChange={(value: 'current' | 'full') => {
            setScope(value);
          }}
          getPopupContainer={() => clusteringOptionsEleRef.current as HTMLElement}
          dropdownMatchSelectWidth={false}
        />
      </div>
      <Button
        className='document-open-button'
        type='link'
        size='small'
        icon={<IconFont type='icon-ic_book_one' />}
        onClick={() =>
          DocumentDrawer({
            title: t('common:page_help'),
            type: 'iframe',
            documentPath: '/docs/content/flashcat/log/discover/log-clustering/',
          })
        }
      >
        {t('说明文档')}
      </Button>
    </Space>
  );

  return (
    <div className='min-h-0 h-full'>
      {clusteringOptionsEleRef.current && createPortal(clusteringPortal, clusteringOptionsEleRef.current)}
      {clusteringExtraEleRef.current &&
        createPortal(
          scope === 'full' ? (
            <Space size='small'>
              {isSampled ? (
                <>
                  {t('clustering.sampled_tip')}
                  <Divider type='vertical' />
                </>
              ) : null}
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
            {groupByFields.join(', ')}
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
