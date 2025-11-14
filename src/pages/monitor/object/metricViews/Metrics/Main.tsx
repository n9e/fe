import React, { useState } from 'react';
import { Button, Space, InputNumber, Tooltip } from 'antd';
import { SyncOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';

import { IMatch } from '../../types';
import Graph from '../Graph';

interface Props {
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  selectedMetrics: any[];
  setSelectedMetrics: (metrics: any[]) => void;
  datasourceValue: number;
  match: IMatch;
  panelWidth: number;
}

export default function Main(props: Props) {
  const { t } = useTranslation('objectExplorer');
  const { range, setRange, selectedMetrics, setSelectedMetrics, datasourceValue, match, panelWidth } = props;
  const [maxDataPoints, setMaxDataPoints] = useState<number | undefined>(undefined);
  const [minStep, setMinStep] = useState<number | undefined>(undefined);
  const parsedRange = parseRange(range);
  const start = moment(parsedRange.start).unix();
  const end = moment(parsedRange.end).unix();

  return (
    <>
      <div className='py-4 flex items-center justify-between'>
        <Space>
          <TimeRangePicker
            value={range}
            onChange={(e: IRawTimeRange) => {
              setRange(e);
            }}
          />
          <InputGroupWithFormItem
            label={
              <Space>
                Max data points
                <Tooltip title={t('dashboard:query.prometheus.maxDataPoints.tip_2')}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <InputNumber
              style={{ width: 70 }}
              placeholder={_.toString(panelWidth ?? 240)}
              min={1}
              value={maxDataPoints}
              onKeyDown={(e: any) => {
                if (e.code === 'Enter') {
                  if (e.target.value) {
                    setMaxDataPoints(_.toNumber(e.target.value));
                  } else {
                    setMaxDataPoints(undefined);
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value) {
                  setMaxDataPoints(_.toNumber(e.target.value));
                } else {
                  setMaxDataPoints(undefined);
                }
              }}
              controls={false}
            />
          </InputGroupWithFormItem>
          <InputGroupWithFormItem
            label={
              <Space>
                Min step
                <Tooltip title={t('dashboard:query.prometheus.minStep.tip')}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <InputNumber
              placeholder='15'
              style={{ width: 60 }}
              value={minStep}
              onKeyDown={(e: any) => {
                if (e.code === 'Enter') {
                  if (e.target.value) {
                    setMinStep(_.toNumber(e.target.value));
                  } else {
                    setMinStep(undefined);
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value) {
                  setMinStep(_.toNumber(e.target.value));
                } else {
                  setMinStep(undefined);
                }
              }}
              onStep={(value) => {
                setMinStep(value);
              }}
            />
          </InputGroupWithFormItem>
          <Button
            style={{ padding: '4px 8px' }}
            onClick={() => {
              setRange({
                ...range,
                refreshFlag: _.uniqueId('refreshFlag_'),
              });
            }}
            icon={<SyncOutlined />}
          ></Button>
        </Space>
        <Button
          onClick={() => {
            setSelectedMetrics([]);
          }}
          disabled={!selectedMetrics.length}
        >
          {t('metrics.clear')}
        </Button>
      </div>
      {_.map(selectedMetrics, (metric, i) => {
        return (
          <Graph
            key={metric}
            datasourceValue={datasourceValue}
            metric={metric}
            match={match}
            range={range}
            onClose={() => {
              const newselectedMetrics = [...selectedMetrics];
              newselectedMetrics.splice(i, 1);
              setSelectedMetrics(newselectedMetrics);
            }}
            stepParams={{
              maxDataPoints: maxDataPoints || panelWidth,
              minStep,
            }}
          />
        );
      })}
    </>
  );
}
