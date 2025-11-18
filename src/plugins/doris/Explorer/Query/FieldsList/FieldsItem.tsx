import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Popover, Progress, Space, Spin, Tooltip, Statistic, Row, Col, Form, Button } from 'antd';
import Icon, { PlusCircleOutlined, CalendarOutlined, QuestionOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

import { DatasourceCateEnum, PRIMARY_COLOR } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import { format } from '@/pages/dashboard/Renderer/utils/byteConverter';

import { NAME_SPACE, TYPE_MAP } from '../../../constants';
import { Field, getDorisLogsQuery } from '../../../services';

interface Props {
  record: Field;
  onValueFilter: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
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

export default function FieldsItem(props: Props) {
  const { t } = useTranslation('explorer');
  const { record, onValueFilter } = props;
  const [topNVisible, setTopNVisible] = useState<boolean>(false);
  const [topNData, setTopNData] = useState<any[]>([]);
  const [topNLoading, setTopNLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<
    {
      [index: string]: string | number;
    }[]
  >();
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch('query');

  return (
    <Popover
      placement='right'
      trigger={['click']}
      overlayInnerStyle={{
        width: 360,
      }}
      visible={topNVisible}
      title={record.field}
      content={
        <div>
          <Spin spinning={topNLoading}>
            <div className='n9e-fill-color-3 p-4'>
              <Row>
                {_.map(stats, (item) => {
                  const statName = _.keys(item)?.[0];
                  const statValue = item?.[statName];
                  if (statName === 'unique_count') {
                    return (
                      <Col span={24} key={statName}>
                        <Statistic title={t(`${NAME_SPACE}:logs.stats.${statName}`)} value={statValue} />
                      </Col>
                    );
                  }
                  return (
                    <Col span={12} key={statName}>
                      <Statistic title={t(`${NAME_SPACE}:logs.stats.${statName}`)} value={statValue} />
                    </Col>
                  );
                })}
              </Row>
            </div>
            <div>
              <div className='my-2 text-l2'>
                <strong>{t('log.fieldValues_topn')}</strong>
              </div>
              {_.isEmpty(topNData) && t(`${NAME_SPACE}:logs.fieldValues_topnNoData`)}
              {_.map(topNData, (item) => {
                const name = item?.[record.field];
                const emptyValueNotSupported = name === '' || name === null;
                const percent = _.floor(_.toNumber(item.ratio), 2);
                return (
                  <div key={name} className='flex gap-[10px] mb-2'>
                    <div style={{ width: 'calc(100% - 40px)' }}>
                      <div className='flex justify-between'>
                        <Tooltip title={name}>
                          <div style={{ width: 'calc(100% - 50px)' }} className='nowrap overflow-hidden text-ellipsis'>
                            {_.isEmpty(name) && !_.isNumber(name) ? '(empty)' : name}
                          </div>
                        </Tooltip>
                        <div className='text-primary'>{item.count}</div>
                      </div>
                      <div className='flex justify-between'>
                        <div style={{ width: 'calc(100% - 50px)' }} className='nowrap overflow-hidden text-ellipsis flex items-center'>
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
                              onValueFilter({
                                key: record.field,
                                value: name,
                                operator: 'AND',
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
                              onValueFilter({
                                key: record.field,
                                value: name,
                                operator: 'NOT',
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
        if (record.indexable && datasourceValue && queryValues) {
          setTopNVisible(visible);
          if (visible) {
            setTopNLoading(true);
            try {
              const range = parseRange(queryValues.range);
              let funcs = ['unique_count', 'max', 'min', 'avg', 'sum', 'top5'];
              if (TYPE_MAP[record.type] !== 'number') {
                funcs = ['unique_count', 'top5'];
              }
              const requestParams = {
                cate: DatasourceCateEnum.doris,
                datasource_id: datasourceValue,
                query: _.map(funcs, (func) => {
                  return {
                    database: queryValues.database,
                    table: queryValues.table,
                    time_field: queryValues.time_field,
                    query: queryValues.query,
                    from: moment(range.start).unix(),
                    to: moment(range.end).unix(),
                    field: record.field,
                    func,
                    ref: func,
                  };
                }),
              };
              const result = await getDorisLogsQuery(requestParams as any);
              const top5Result = _.filter(result.list, (item) => {
                return item.ref === 'top5';
              });
              const statsResult = _.map(
                _.filter(result.list, (item) => {
                  return item.ref !== 'top5';
                }),
                (item) => {
                  const statName = item.ref;
                  const statValue = item?.[item.ref];
                  if (!_.isNaN(statValue) && _.isNumber(statValue)) {
                    return {
                      [statName]: format(statValue, {
                        type: 'si',
                        decimals: 2,
                      }).text,
                    };
                  } else {
                    return {
                      [statName]: '-',
                    };
                  }
                },
              );
              setTopNData(top5Result || []);
              setStats(statsResult);
            } catch (error) {
              setTopNData([]);
              setStats([]);
            }
            setTopNLoading(false);
          } else {
            setTopNData([]);
            setStats([]);
          }
        }
      }}
    >
      <Tooltip placement='left' title={record.indexable === false && t(`${NAME_SPACE}:logs.fieldLabelTip`)}>
        <div className='cursor-pointer min-h-[24px] flex items-center gap-[8px] pl-2 pr-4'>
          <span className='w-[16px] h-[16px] flex-shrink-0 n9e-fill-color-3 rounded flex justify-center items-center'>
            {typeIconMap[TYPE_MAP[record.type]] || <QuestionOutlined />}
          </span>
          <span
            style={{
              width: 'calc(100% - 26px)',
            }}
            className='wrap-anywhere leading-[1.2] hover:text-gray-400'
          >
            {record.field}
          </span>
        </div>
      </Tooltip>
    </Popover>
  );
}
