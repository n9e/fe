import React, { useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Popover, Progress, Space, Spin, Tooltip, Row, Button, Alert, Col, Statistic, Divider } from 'antd';
import Icon, { PlusCircleOutlined, CalendarOutlined, QuestionOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

import { PRIMARY_COLOR } from '@/utils/constant';

import { NAME_SPACE } from '../../constants';
import { Field, StatsResult } from './types';
import QuickViewPopover from './QuickViewPopover';

interface Props {
  operType: 'show' | 'available';
  onOperClick: () => void;
  typeMap: Record<string, string>;
  field: Field;
  enableStats: boolean;
  onValueFilter?: (parmas: { key: string; value: string; operator: string }) => void;
  fetchStats?: (field: Field) => Promise<StatsResult>;
  renderStatsPopoverTitleExtra?: (options: {
    index: Field;
    stats?: {
      [index: string]: number;
    };
    setTopNVisible: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
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

export default function FieldsItem(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { operType, onOperClick, field, onValueFilter, typeMap, enableStats, fetchStats, renderStatsPopoverTitleExtra, renderFieldNameExtra, onStatisticClick } = props;
  const [topNVisible, setTopNVisible] = useState<boolean>(false);
  const [topNData, setTopNData] = useState<any[]>([]);
  const [topNLoading, setTopNLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<{
    [index: string]: number;
  }>();

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
            {/* <span className='text-hint'>{field.type2}</span> */}
          </Space>
          {topNVisible ? renderStatsPopoverTitleExtra?.({ index: field, stats, setTopNVisible }) : null}
        </div>
      }
      content={
        <div>
          <Spin spinning={topNLoading}>
            <Alert showIcon className='mb-2' type='info' message={t('field_popover_info_alert')} />
            <div className='bg-fc-200 p-4'>
              {stats?.unique_count !== undefined && stats?.exist_ratio !== undefined && (
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
            <div>
              <div className='my-2 text-l2 flex items-center justify-between'>
                <strong>{t('field_values_topn.title', { n: 5 })}</strong>
                <Space>
                  <QuickViewPopover
                    options={{
                      func: 'count',
                      group_by: field.field,
                      field: field.field,
                      ref: 'top5',
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
                      ref: 'top5',
                    }}
                    onStatisticClick={onStatisticClick}
                    setTopNVisible={setTopNVisible}
                  >
                    <a className='text-base'>{t('field_values_topn.quick_view_ratio')}</a>
                  </QuickViewPopover>
                </Space>
              </div>
              {_.isEmpty(topNData) && t('topn_no_data')}
              {_.map(topNData, (item) => {
                const fieldValue = item?.value;
                const emptyValueNotSupported = fieldValue === '' || fieldValue === null;
                const percent = _.floor(item.percent, 2);
                return (
                  <div key={fieldValue} className='flex gap-[10px] mb-2'>
                    <div className='flex-shrink-0' style={{ width: 'calc(100% - 64px)' }}>
                      <div className='flex justify-between'>
                        <Tooltip title={fieldValue}>
                          <div style={{ width: 'calc(100% - 50px)' }} className='truncate'>
                            {_.isEmpty(fieldValue) && !_.isNumber(fieldValue) ? '(empty)' : fieldValue}
                          </div>
                        </Tooltip>
                        <QuickViewPopover
                          options={{
                            func: 'count',
                            field: field.field,
                            field_filter: fieldValue,
                          }}
                          onStatisticClick={onStatisticClick}
                          setTopNVisible={setTopNVisible}
                        >
                          <a>{item.count}</a>
                        </QuickViewPopover>
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
                          <a>{percent}%</a>
                        </QuickViewPopover>
                      </div>
                    </div>
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
                  </div>
                );
              })}
            </div>
          </Spin>
        </div>
      }
      onVisibleChange={async (visible) => {
        if (enableStats && fetchStats && field.indexable) {
          setTopNVisible(visible);
          if (visible) {
            setTopNLoading(true);
            fetchStats(field)
              .then((res) => {
                const { topN, stats } = res;
                setTopNData(topN);
                setStats(stats);
              })
              .catch(() => {
                setTopNData([]);
                setStats({});
              })
              .finally(() => {
                setTopNLoading(false);
              });
          } else {
            setTopNData([]);
            setStats({});
          }
        }
      }}
    >
      <Tooltip placement='left' title={field.indexable === false ? t('unindexable') : t('field_tip')}>
        <div className='cursor-pointer min-h-[24px] flex items-center gap-[8px] pl-2 pr-1 group'>
          <Tooltip placement='top' title={field.type2}>
            <span className='w-[16px] h-[16px] flex-shrink-0 bg-fc-200 rounded flex justify-center items-center'>{typeIconMap[typeMap[field.type]] || <QuestionOutlined />}</span>
          </Tooltip>
          <span
            style={{
              width: 'calc(100% - 26px)',
            }}
            className='break-all wrap-anywhere leading-[1.2] hover:text-gray-400'
          >
            {field.field} {renderFieldNameExtra?.(field)}
          </span>
          <span
            className='cursor-pointer w-[20px] flex-shrink-0 invisible group-hover:visible'
            onClick={() => {
              onOperClick();
            }}
          >
            {operIconMap[operType]}
          </span>
        </div>
      </Tooltip>
    </Popover>
  );
}
