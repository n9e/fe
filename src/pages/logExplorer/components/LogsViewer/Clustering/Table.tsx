// 日志聚类，目前仅支持了doris和es
import React, { useState, useEffect } from 'react';
import { Space, Tag, Dropdown, Button, Menu, Popover, Spin, Progress, Row, Col, Statistic, Tooltip } from 'antd';
import { CaretDownOutlined, MinusCircleOutlined, PlusCircleOutlined, CopyOutlined, BarChartOutlined, SyncOutlined } from '@ant-design/icons';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { NAME_SPACE } from '../../../constants';
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
  logs: { [index: string]: string }[];
  logsHash?: string;
  setPatternHistogramState: (v: { visible: boolean, uuid?: string, rowIndex?: number }) => void;
  logClusting: LogClusting;
}

// 日志聚类参数
export interface LogClusting {
  enabled: boolean;
  queryStrRef: React.RefObject<string>;
  logTotal: number;
  cate: DatasourceCateEnum;
  datasourceValue: number;
};

export default function TableCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logClusting, indexData, options, clusteringOptionsEleRef, logs, logsHash, setPatternHistogramState } = props;
  const { queryStrRef, logTotal, cate, datasourceValue } = logClusting;
  const [backEndCluster, setBackEndCluster] = useState<boolean>(false);
  const [timeCost, setTimeCost] = useState<number>(0);
  // 默认：首个文本类型的字段
  const [field, setField] = useState<string>(() => {
    const firstTextField = indexData.find((item) => item.type === 'text')?.field;
    return firstTextField || '';
  });
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
    getLogClustering(cate, datasourceValue, queryStrRef?.current || '', logs, field).then((res) => {
      setData(res);
      setBackEndCluster(false);
    });
  }, [logs, logsHash]);

  useEffect(() => {
    setPatternHistogramState({ visible: false });
  }, [logsHash]);

  const handleFullAggregation = () => {
    setFullAggregateLoading(true);
    getQueryClustering(cate, datasourceValue, queryStrRef?.current || '', field)
      .then((res) => {
        setData(res.items);
        setBackEndCluster(true);
        setTimeCost(res.time_cost);
      })
      .finally(() => {
        setFullAggregateLoading(false);
      });
  };

  const getColumns = () => {
    const columns: any[] = [
      {
        key: 'count',
        name: t('clustering.count'),
      },
      {
        key: 'parts',
        name: t('clustering.log_data'),
        formatter: ({ row }) => {
          const sortedParts = [...(row.parts ?? [])].sort((a, b) => {
            if (a.type === 'pattern' && b.type !== 'pattern') return -1;
            if (a.type !== 'pattern' && b.type === 'pattern') return 1;
            return 0;
          });
          return <Space size={'small'}>{sortedParts.map((part) => {
            if (part.type === 'pattern') {
              if (backEndCluster) {
                return (
                  <PatternPopover key={part.part_id} uuid={(row.uuid)} partId={part.part_id} title={part.data}>
                    <Tag className='mr-0 cursor-pointer' color='purple'>{part.data}</Tag>
                  </PatternPopover>
                );
              } else {
                return <Tag className='mr-0 cursor-pointer' color='purple'>{part.data}</Tag>
              }
            } else {
              if (backEndCluster) {
                return (
                  <ConstPopover key={part.part_id} value={part.data} field={field} cate={cate} onValueFilter={props.onValueFilter}>
                    <span className='cursor-pointer hover:underline'>{part.data}</span>
                  </ConstPopover>
                );
              } else {
                return <span >{part.data}</span>
              }
            }
          })}</Space>;
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
    if (backEndCluster) {
      columns.unshift({
        name: '',
        key: 'chart',
        width: 40,
        resizable: false,
        formatter: ({ row }) => {
          return <BarChartOutlined style={{ cursor: 'pointer' }} onClick={async () => {
            const idx = _.findIndex(data, { [id_key]: row[id_key] });
            setPatternHistogramState({ visible: true, uuid: row[id_key] as string, rowIndex: idx + 1 });
          }} />
        },
      });
    }
    return columns;
  };

  const currentLogClusterPortal = <Space>
    <span>{t('clustering.current_page_field')}</span>
    <Dropdown
      overlay={
        <Menu
          items={indexData.map(option => ({
            key: option.field,
            label: option.field,
          }))}
          onClick={({ key }) => {
            setField(key)
            getLogClustering(cate, datasourceValue, queryStrRef?.current || '', logs, key).then((res) => {
              setData(res);
            });
          }}
          style={{ maxHeight: '300px', overflowY: 'auto' }}
          className='best-looking-scroll'
        />
      }
      getPopupContainer={() => clusteringOptionsEleRef.current as HTMLElement}
    >
      <span>{field} <CaretDownOutlined /></span>
    </Dropdown>
    <span>{t('clustering.aggregate')}</span>

    {logTotal > maxLogCount ? (
      <>
        <span>{t('clustering.cannot_aggregate')}</span>
        <span style={{ color: 'var(--fc-primary-color)' }}>{logTotal?.toLocaleString()}</span>
        <span>{t('clustering.full_aggregate_logs')}</span>
      </>
    ) : (
      <>
        <span>{t('clustering.need_aggregate')}</span>
        <span style={{ color: 'var(--fc-primary-color)' }}>{logTotal?.toLocaleString()}</span>
        <span>{t('clustering.click_to_aggregate')}</span>
        <Button type="link" size='small' onClick={handleFullAggregation} className='pl-0'>
          {t('clustering.full_aggregate')}
        </Button>
      </>
    )}
  </Space>

  const backendClusterPortal = <Space>
    <span>{t('clustering.aggregate_field')}</span>
    <Dropdown
      overlay={
        <Menu
          items={indexData.map(option => ({
            key: option.field,
            label: option.field,
          }))}
          onClick={({ key }) => {
            setField(key);
            setFullAggregateLoading(true);
            getQueryClustering(cate, datasourceValue, queryStrRef?.current || '', key)
              .then((res) => {
                setData(res.items);
                setBackEndCluster(true);
                setTimeCost(res.time_cost);
              })
              .finally(() => {
                setFullAggregateLoading(false);
              });
          }}
          style={{ maxHeight: '300px', overflowY: 'auto' }}
          className='best-looking-scroll'
        />
      }
      getPopupContainer={() => clusteringOptionsEleRef.current as HTMLElement}
    >
      <span>{field} <CaretDownOutlined /></span>
    </Dropdown>
    <span>|</span>
    <span>{t('clustering.log_count')}</span>
    <span style={{ color: 'var(--fc-primary-color)' }}>{logTotal?.toLocaleString()}</span>
    <span>|</span>
    <span>{t('clustering.duration')}</span>
    <span>{timeCost}s</span>
  </Space>

  return (
    <div className='min-h-0 h-full'>
      {clusteringOptionsEleRef.current &&
        createPortal(
          backEndCluster ? backendClusterPortal : currentLogClusterPortal,
          clusteringOptionsEleRef.current,
        )}
      {fullAggregateLoading ? (
        <div className='h-full flex flex-col items-center justify-center bg-fc-200' style={{ minHeight: 300 }}>
          <SyncOutlined spin style={{ fontSize: 64, color: 'var(--fc-text-4)' }} />
          <div className='mt-6 text-base font-bold'>{t('clustering.loading_title')}</div>
          <div className='mt-2 text-l2'>
            {t('clustering.loading_info')}<span style={{ color: 'var(--fc-primary-color)', fontWeight: 'bold' }}>{logTotal?.toLocaleString()}</span>
            <span className='mx-1'>|</span>
            {t('clustering.loading_field')}{field}
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
