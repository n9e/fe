import React, { useState, useEffect, useMemo } from 'react';
import { Space, Tag, Dropdown, Button, Menu, Popover, Spin, Progress, Row, Col, Statistic, Tooltip } from 'antd';
import { CaretDownOutlined, MinusCircleOutlined, PlusCircleOutlined, CopyOutlined, BarChartOutlined } from '@ant-design/icons';
import { copy2ClipBoard } from '@/utils';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { PRIMARY_COLOR } from '@/utils/constant';
import { NAME_SPACE } from '../../../constants';
import { getLogClustering, ClusteringItem, getQueryClustering, getLogPattern, getLogHistogram } from '../../../services';
import { ClusterPattern } from '../../../types';
import { getGlobalConfig } from '@/plus/components/LogDownload/service';
import { OnValueFilterParams, OptionsType } from '../types';
import { Field } from '@/plugins/doris/ExplorerNG/types';
import RDGTable from '../components/Table';
const DEFAULT_MAX_LOG_COUNT = 10000000;

interface Props {
  onValueFilter: (condition: OnValueFilterParams) => void;
  queryStrRef: React.RefObject<string> | undefined;
  indexData: Field[];
  logTotal: number;
  options?: OptionsType;
  clusteringOptionsEleRef: React.RefObject<HTMLDivElement>;
  logs: { [index: string]: string }[];
  logsHash?: string;
  setPatternHistogramState: (v: { visible: boolean, uuid?: string, rowIndex?: number }) => void;
}

export default function TableCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { queryStrRef, indexData, logTotal, options, clusteringOptionsEleRef, logs, logsHash, setPatternHistogramState } = props;
  const [backEndCluster, setBackEndCluster] = useState<boolean>(false);
  // 默认：首个文本类型的字段
  const [field, setField] = useState<string>(() => {
    const firstTextField = indexData.find((item) => item.type === 'text')?.field;
    return firstTextField || '';
  });
  const [maxLogCount, setMaxLogCount] = useState<number>(DEFAULT_MAX_LOG_COUNT);
  const id_key = 'uuid'; // 数据唯一标识字段
  const [data, setData] = useState<ClusteringItem[]>([]);
  useEffect(() => {
    getGlobalConfig('log_clustering_max').then((res) => {
      setMaxLogCount(isNaN(Number(res)) || Number(res) === 0 ? DEFAULT_MAX_LOG_COUNT : Number(res));
    });
  }, []);

  useEffect(() => {
    getLogClustering(logs, field).then((res) => {
      setData(res);
      setBackEndCluster(false);
    });
  }, [logs, logsHash]);

  useEffect(() => {
    setPatternHistogramState({ visible: false });
  }, [logsHash]);

  const handleFullAggregation = () => {
    // TODO: 实现全量聚合逻辑
    getQueryClustering('doris', queryStrRef?.current || '', field).then((res) => {
      setData(res);
      setBackEndCluster(true);
    });
  };

  const PatternPopover = ({ uuid, partId, children, title }: { uuid: string; partId: number; children: React.ReactNode; title: string }) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [patternData, setPatternData] = useState<ClusterPattern | null>(null);

    const handleVisibleChange = (v: boolean) => {
      setVisible(v);
      if (v && !patternData) {
        setLoading(true);
        getLogPattern(uuid, partId)
          .then((res) => {
            setPatternData(res);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };

    const content = (
      <div style={{ width: 320 }}>
        <Spin spinning={loading}>
          {patternData && (
            <>
              <div className='bg-fc-200 p-4'>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic className='n9e-logexplorer-field-statistic text-center' title={t('stats.unique_count')} value={patternData.count} />
                  </Col>
                  <Col span={12}>
                    <Statistic className='n9e-logexplorer-field-statistic text-center' title={t('stats.exist_ratio')} value={patternData.percentage} suffix='%' />
                  </Col>
                </Row>
              </div>
              <div>
                <div className='my-2 text-l2'>
                  <strong>{t('clustering.top5_title')}</strong>
                </div>
                {_.isEmpty(patternData.top5) && t('clustering.no_data')}
                {_.map(_.orderBy(patternData.top5, ['count'], ['desc']), (item) => {
                  const percent = _.floor(item.percentage, 2);
                  return (
                    <div key={item.value} className='mb-2'>
                      <div className='flex justify-between'>
                        <Tooltip title={item.value}>
                          <div style={{ width: 'calc(100% - 80px)' }} className='truncate'>
                            {_.isEmpty(item.value) && !_.isNumber(item.value) ? '(empty)' : item.value}
                          </div>
                        </Tooltip>
                        <span>{item.count?.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <div style={{ width: 'calc(100% - 60px)' }}>
                          <Progress percent={percent} size='small' showInfo={false} strokeColor={PRIMARY_COLOR} />
                        </div>
                        <span>{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Spin>
      </div>
    );

    return (
      <Popover trigger='click' visible={visible} onVisibleChange={handleVisibleChange} content={content} title={title}>
        {children}
      </Popover>
    );
  };

  const ConstPopover = ({ value, children }: { value: string; children: React.ReactNode }) => {
    const [popoverVisible, setPopoverVisible] = useState(false);
    return (
      <Popover
        visible={popoverVisible}
        onVisibleChange={setPopoverVisible}
        trigger='click'
        overlayClassName='explorer-origin-field-val-popover'
        content={
          <ul className='ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light'>
            <li
              className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
              onClick={() => {
                setPopoverVisible(false);
                copy2ClipBoard(`${field}:${value}`);
              }}
            >
              <Space>
                <CopyOutlined />
                {t('common:btn.copy')}
              </Space>
            </li>
            <li
              className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
              onClick={() => {
                setPopoverVisible(false);
                props.onValueFilter({
                  key: field,
                  value,
                  assignmentOperator: '=',
                  operator: 'AND',
                });
              }}
            >
              <Space>
                <PlusCircleOutlined />
                {t('logs.filterAllAnd')}
              </Space>
            </li>
            <li
              className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
              onClick={() => {
                setPopoverVisible(false);
                props.onValueFilter({
                  key: field,
                  value,
                  assignmentOperator: '=',
                  operator: 'NOT',
                });
              }}
            >
              <Space>
                <MinusCircleOutlined />
                {t('logs.filterAllNot')}
              </Space>
            </li>
          </ul>
        }
      >
        {children}
      </Popover>
    );
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
          const sortedParts = row.parts?.sort((a, b) => {
            if (a.type === 'pattern' && b.type !== 'pattern') return -1;
            if (a.type !== 'pattern' && b.type === 'pattern') return 1;
            return 0;
          });
          return <Space size={'small'}>{sortedParts?.map((part) => {
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
                  <ConstPopover key={part.part_id} value={part.data}>
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
            getLogClustering(logs, key).then((res) => {
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
            setField(key)
            getQueryClustering('doris', queryStrRef?.current || '', field).then((res) => {
              setData(res);
              setBackEndCluster(true);
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
    {/* todo: 获取耗时 */}
    <span>30s</span>
  </Space>

  return (
    <div className='min-h-0 h-full'>
      {clusteringOptionsEleRef.current &&
        createPortal(
          backEndCluster ? backendClusterPortal : currentLogClusterPortal,
          clusteringOptionsEleRef.current,
        )}
      <RDGTable
        className='n9e-event-logs-table'
        rowKeyGetter={(row) => {
          return row[id_key] || '';
        }}
        columns={getColumns()}
        rows={data}
      />
    </div>
  );
}
