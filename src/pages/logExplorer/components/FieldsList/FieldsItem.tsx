import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Popover, Progress, Space, Spin, Tooltip, Row, Button, Alert, Col, Statistic, Divider, Tag } from 'antd';
import Icon, { PlusCircleOutlined, CalendarOutlined, QuestionOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

import { PRIMARY_COLOR } from '@/utils/constant';

import { NAME_SPACE } from '../../constants';
import renderFieldValue from '../../utils/renderFieldValue';
import { Field, StatsResult, FieldActionOptions } from './types';
import QuickViewPopover from './QuickViewPopover';

const DEFAULT_TOP_NUMBER = 5;

interface Props {
  operType: 'show' | 'available';
  onOperClick: () => void;
  typeMap: Record<string, string>;
  field: Field;
  enableStats: boolean;
  disableEmptyValueClick?: boolean;
  onValueFilter?: (parmas: { key: string; value: string; operator: string }) => void;
  fetchStats?: (field: Field) => Promise<StatsResult>;
  getUniqueCount?: (field: Field) => Promise<number>;
  statsScope?: object;
  renderStatsPopoverTitleExtra?: (options: FieldActionOptions) => React.ReactNode;
  renderFieldNameExtra?: (field: Field) => React.ReactNode;
  onStatisticClick?: (
    type: string,
    options: {
      func: string;
      field?: string;
      field_filter?: string; // field value
      ref?: string;
      group_by?: string;
    },
  ) => void;
}

const FieldBooleanSvg = () => (
  <svg width='1em' height='1em' fill='currentColor' viewBox='0 0 76 76'>
    <path d='M 36,23L 30,23L 30,40L 25,40L 25,23L 19,23L 19,19L 36,19L 36,23 Z M 57,40L 50,40L 50,45L 56,45L 56,49L 50,49L 50,57L 45,57L 45,36L 57,36L 57,40 Z M 44,19L 48.5,19L 32.5,57L 28,57L 44,19 Z ' />
  </svg>
);
const FieldBooleanIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={FieldBooleanSvg} {...props} />;

export const typeIconMap = {
  string: (
    <span className='explorer-fields-item-field' style={{ color: '#4a7194' }}>
      t
    </span>
  ),
  number: (
    <span className='explorer-fields-item-field' style={{ color: '#387765' }}>
      #
    </span>
  ),
  date: <CalendarOutlined style={{ color: '#7b705a' }} />,
  boolean: <FieldBooleanIcon style={{ color: '#996130', fontSize: 18 }} />,
};

const operIconMap = {
  show: <MinusCircleOutlined />,
  available: <PlusCircleOutlined />,
};

// 正常情况下，我们会将空字符串、null 和 'null' 视为 empty value
const isEmptyValue = (value: string | null) => {
  return value === '' || value === null || value === 'null';
};

export default function FieldsItem(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const {
    operType,
    onOperClick,
    field,
    onValueFilter,
    typeMap,
    enableStats,
    fetchStats,
    renderStatsPopoverTitleExtra,
    renderFieldNameExtra,
    onStatisticClick,
    disableEmptyValueClick = true,
  } = props;
  const [topNVisible, setTopNVisible] = useState<boolean>(false);
  const [topNumber, setTopNumber] = useState<number>(DEFAULT_TOP_NUMBER);
  const [topNData, setTopNData] = useState<any[]>([]);
  const [topNLoading, setTopNLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<{
    [index: string]: number;
  }>();

  const statsRequest = useRef<Promise<StatsResult> | undefined>();
  const statsLoaded = useRef(false);
  const requestVersion = useRef(0);
  const actionsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // The cache changes fetchStats when the datasource/query/time range changes.
    requestVersion.current += 1;
    statsRequest.current = undefined;
    statsLoaded.current = false;
    setStats(undefined);
    setTopNData([]);
    setTopNLoading(false);
    setTopNVisible(false);
    return () => {
      requestVersion.current += 1;
    };
  }, [fetchStats, field.field]);

  // Keep every action in a fixed slot; only reserve label space for visible actions.
  useLayoutEffect(() => {
    const actions = actionsRef.current;
    const row = actions?.parentElement;
    if (!actions || !row) return;
    const measure = () => {
      const bounds = actions.getBoundingClientRect();
      const activeButtons = Array.from(actions.querySelectorAll('button[aria-pressed="true"]'));
      const activeWidth = activeButtons.length ? bounds.right - Math.min(...activeButtons.map((button) => button.getBoundingClientRect().left)) + 8 : 0;
      row.style.setProperty('--log-field-actions-width', `${bounds.width + 8}px`);
      row.style.setProperty('--log-field-active-width', `${activeWidth}px`);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(actions);
    return () => observer.disconnect();
  });

  const loadStats = () => {
    if (!enableStats || !fetchStats || !field.indexable || statsLoaded.current || statsRequest.current) return;
    const version = requestVersion.current;
    setTopNLoading(true);
    const request = Promise.resolve().then(() => fetchStats(field));
    statsRequest.current = request;
    request
      .then((res) => {
        if (version !== requestVersion.current) return;
        setTopNumber(res.topNumber ?? DEFAULT_TOP_NUMBER);
        setTopNData(res.topN);
        setStats(res.stats);
        statsLoaded.current = true;
      })
      .catch(() => {
        if (version !== requestVersion.current) return;
        setTopNData([]);
        setStats(undefined);
      })
      .finally(() => {
        if (version !== requestVersion.current) return;
        statsRequest.current = undefined;
        setTopNLoading(false);
      });
  };

  return (
    <Popover
      placement='right'
      trigger={['click']}
      overlayInnerStyle={{
        width: 360,
      }}
      visible={topNVisible}
      title={
        <div className='flex justify-between items-center'>
          <Space>
            <span>{field.field}</span>
          </Space>
        </div>
      }
      content={
        <div>
          <Spin spinning={topNLoading}>
            {stats && (
              <>
                {onStatisticClick && <Alert showIcon className='mb-2' type='info' message={t('field_popover_info_alert')} />}
                <div className='bg-fc-200 p-4'>
                  {stats?.unique_count !== undefined && (
                    // && stats?.exist_ratio !== undefined
                    <Row gutter={[16, 16]}>
                      {['unique_count', 'exist_ratio'].map((statName) => {
                        const statValue = stats?.[statName];
                        if (statValue === undefined) return null;
                        return (
                          <QuickViewPopover
                            key={statName}
                            options={{
                              func: statName,
                              field: field.field,
                            }}
                            onStatisticClick={onStatisticClick}
                            setTopNVisible={setTopNVisible}
                          >
                            <Col span={12} key={statName}>
                              <Statistic
                                className='n9e-logexplorer-field-statistic text-center hover:bg-fc-100 cursor-pointer'
                                title={t(`stats.${statName}`)}
                                value={statValue}
                                suffix={statName === 'exist_ratio' ? '%' : undefined}
                              />
                            </Col>
                          </QuickViewPopover>
                        );
                      })}
                    </Row>
                  )}
                  {Object.keys(_.omit(stats, ['unique_count', 'exist_ratio'])).length > 0 && <Divider />}
                  <Row gutter={[16, 16]}>
                    {_.map(_.omit(stats, ['unique_count', 'exist_ratio']), (statValue, statName) => {
                      return (
                        <QuickViewPopover
                          key={statName}
                          options={{
                            func: statName,
                            field: field.field,
                          }}
                          onStatisticClick={onStatisticClick}
                          setTopNVisible={setTopNVisible}
                        >
                          <Col span={8} key={statName}>
                            <Statistic className='n9e-logexplorer-field-statistic text-center hover:bg-fc-100 cursor-pointer' title={t(`stats.${statName}`)} value={statValue} />
                          </Col>
                        </QuickViewPopover>
                      );
                    })}
                  </Row>
                </div>
              </>
            )}
            <div>
              <div className='my-2 text-l2 flex items-center justify-between'>
                <strong>{t('field_values_topn.title', { n: topNumber })}</strong>
                {onStatisticClick && (
                  <Space>
                    <QuickViewPopover
                      options={{
                        func: 'count',
                        group_by: field.field,
                        field: field.field,
                        ref: `top${topNumber}`,
                      }}
                      onStatisticClick={onStatisticClick}
                      setTopNVisible={setTopNVisible}
                    >
                      <a className='text-base'>{t('field_values_topn.quick_view_count')}</a>
                    </QuickViewPopover>
                    <QuickViewPopover
                      options={{
                        func: 'ratio',
                        group_by: field.field,
                        field: field.field,
                        ref: `top${topNumber}`,
                      }}
                      onStatisticClick={onStatisticClick}
                      setTopNVisible={setTopNVisible}
                    >
                      <a className='text-base'>{t('field_values_topn.quick_view_ratio')}</a>
                    </QuickViewPopover>
                  </Space>
                )}
              </div>
              {_.isEmpty(topNData) && t('topn_no_data')}
              {_.map(topNData, (item) => {
                const fieldValue = item?.value;
                const emptyValueNotSupported = disableEmptyValueClick ? isEmptyValue(fieldValue) : false;
                const percent = _.floor(item.percent, 2);
                return (
                  <div key={fieldValue} className='flex gap-[10px] mb-2'>
                    <div className='flex-shrink-0' style={{ width: onValueFilter ? 'calc(100% - 64px)' : '100%' }}>
                      <div className='flex justify-between'>
                        <Tooltip title={fieldValue}>
                          <div style={{ width: 'calc(100% - 50px)' }} className='truncate'>
                            {renderFieldValue(fieldValue)}
                          </div>
                        </Tooltip>
                        {item.count !== undefined && (
                          <QuickViewPopover
                            options={{
                              func: 'count',
                              field: field.field,
                              field_filter: fieldValue,
                            }}
                            onStatisticClick={onStatisticClick}
                            setTopNVisible={setTopNVisible}
                          >
                            <Button type='link' size='small' className='p-0' disabled={emptyValueNotSupported}>
                              {item.count}
                            </Button>
                          </QuickViewPopover>
                        )}
                      </div>
                      <div className='flex justify-between'>
                        <div style={{ width: 'calc(100% - 50px)' }} className='truncate flex items-center'>
                          <Progress percent={percent} size='small' showInfo={false} strokeColor={PRIMARY_COLOR} />
                        </div>
                        <QuickViewPopover
                          options={{
                            func: 'ratio',
                            field: field.field,
                            field_filter: fieldValue,
                          }}
                          onStatisticClick={onStatisticClick}
                          setTopNVisible={setTopNVisible}
                        >
                          <Button type='link' size='small' className='p-0' disabled={emptyValueNotSupported}>
                            {percent}%
                          </Button>
                        </QuickViewPopover>
                      </div>
                    </div>
                    {onValueFilter && (
                      <div style={{ width: 64 }}>
                        <Space size={0}>
                          <Tooltip title={emptyValueNotSupported ? t('empty_value_not_supported_tip') : ''}>
                            <Button
                              className='p-0'
                              type='text'
                              icon={<PlusCircleOutlined />}
                              disabled={emptyValueNotSupported}
                              onClick={() => {
                                onValueFilter?.({
                                  key: field.field,
                                  value: fieldValue,
                                  operator: 'and',
                                });
                                setTopNVisible(false);
                              }}
                            />
                          </Tooltip>
                          <Tooltip title={emptyValueNotSupported ? t('empty_value_not_supported_tip') : ''}>
                            <Button
                              className='p-0'
                              type='text'
                              icon={<MinusCircleOutlined />}
                              disabled={emptyValueNotSupported}
                              onClick={() => {
                                onValueFilter?.({
                                  key: field.field,
                                  value: fieldValue,
                                  operator: 'not',
                                });
                                setTopNVisible(false);
                              }}
                            />
                          </Tooltip>
                        </Space>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Spin>
        </div>
      }
      onVisibleChange={(visible) => {
        if (enableStats && fetchStats && field.indexable) {
          setTopNVisible(visible);
          if (visible) loadStats();
        }
      }}
    >
      <div className='n9e-log-field-row cursor-pointer min-h-[24px] flex items-center pl-2 pr-1 group'>
        <Tooltip
          placement='left'
          mouseLeaveDelay={0}
          overlayStyle={{ pointerEvents: 'none' }}
          title={
            <div className='break-all'>
              {field.type2 && (
                <div>
                  <Space align='start'>
                    <span className='whitespace-nowrap'>{t('field_type')}:</span>
                    {field.type2}
                  </Space>
                </div>
              )}
              <div>{field.indexable === false ? t('unindexable') : t('field_tip')}</div>
            </div>
          }
        >
          <span className='n9e-log-field-label flex min-w-0 flex-1 items-center gap-[8px]'>
            {field.type && (
              <span className='w-[16px] h-[16px] flex-shrink-0 bg-fc-200 rounded flex justify-center items-center'>{typeIconMap[typeMap[field.type]] || <QuestionOutlined />}</span>
            )}
            <span
              style={{
                minWidth: 0,
                flex: '1 1 0',
              }}
              title={field.field}
              className='truncate leading-[1.2] hover:text-gray-400'
            >
              {field.field} {renderFieldNameExtra?.(field)}
            </span>
          </span>
        </Tooltip>
        <span
          ref={actionsRef}
          className='n9e-log-field-actions flex items-center flex-shrink-0'
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {field.indexable &&
            renderStatsPopoverTitleExtra?.({
              index: field,
              stats,
              loading: topNLoading,
              setTopNVisible,
              getUniqueCount: props.getUniqueCount ? () => props.getUniqueCount!(field) : undefined,
              statsScope: props.statsScope,
            })}
          <Tooltip mouseEnterDelay={0.6} title={t(operType === 'show' ? 'field_list.remove_field' : 'field_list.add_field')}>
            <Button
              type='text'
              size='small'
              aria-label={t(operType === 'show' ? 'field_list.remove_field' : 'field_list.add_field')}
              icon={operIconMap[operType]}
              onClick={onOperClick}
            />
          </Tooltip>
        </span>
      </div>
    </Popover>
  );
}
