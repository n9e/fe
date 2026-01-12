import React, { useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Popover, Progress, Space, Spin, Tooltip, Row, Button, Alert } from 'antd';
import Icon, { PlusCircleOutlined, CalendarOutlined, QuestionOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

import { PRIMARY_COLOR } from '@/utils/constant';

import { NAME_SPACE } from '../../constants';
import { Field, StatsResult } from './types';
import StatisticPopover from './StatisticPopover';

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
  onStatisticClick?: (type: string, statName: string, field: Field) => void;
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
          {field.field}
          {topNVisible ? renderStatsPopoverTitleExtra?.({ index: field, stats, setTopNVisible }) : null}
        </div>
      }
      content={
        <div>
          <Spin spinning={topNLoading}>
            <Alert showIcon className='mb-2' type='info' message={t('field_popover_info_alert')} />
            <div className='bg-fc-200 p-4'>
              <Row>
                {_.map(stats, (statValue, statName) => {
                  return (
                    <StatisticPopover key={statName} statName={statName} statValue={statValue} field={field} onStatisticClick={onStatisticClick} setTopNVisible={setTopNVisible} />
                  );
                })}
              </Row>
            </div>
            <div>
              <div className='my-2 text-l2'>
                <strong>{t('field_values_topn.title', { n: 5 })}</strong>
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
                        <div className='text-primary'>{item.count}</div>
                      </div>
                      <div className='flex justify-between'>
                        <div style={{ width: 'calc(100% - 50px)' }} className='truncate flex items-center'>
                          <Progress percent={percent} size='small' showInfo={false} strokeColor={PRIMARY_COLOR} />
                        </div>
                        <div className='text-primary'>{percent}%</div>
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
          <span className='w-[16px] h-[16px] flex-shrink-0 bg-fc-200 rounded flex justify-center items-center'>{typeIconMap[typeMap[field.type]] || <QuestionOutlined />}</span>
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
