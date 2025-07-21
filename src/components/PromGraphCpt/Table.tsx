/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import moment from 'moment';
import _ from 'lodash';
import { Input, DatePicker, List, Space } from 'antd';
import UnitPicker from '@/pages/dashboard/Components/UnitPicker';
import valueFormatter from '@/pages/dashboard/Renderer/utils/valueFormatter';
import { instantInterpolateString } from '@/components/PromQLInputNG';

import { getPromData } from './services';
import { QueryStats } from './components/QueryStatsView';

interface IProps {
  url: string;
  datasourceValue: number;
  promql?: string;
  setQueryStats?: (stats: QueryStats) => void;
  setErrorContent: (content: string) => void;
  contentMaxHeight?: number;
  timestamp?: number;
  setTimestamp: (timestamp?: number) => void;
  refreshFlag?: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  defaultUnit?: string;
  showUnitPicker?: boolean; // 是否显示单位选择器
  controlsPortalDomNode?: HTMLDivElement | null; // 用于渲染控件的容器节点
}
type ResultType = 'matrix' | 'vector' | 'scalar' | 'string' | 'streams';

const LIMIT = 1000;

function getListItemLabel(resultType, record) {
  const { metric } = record;
  if (resultType === 'scalar') return 'scalar';
  if (resultType === 'string') return 'string';
  const metricName = metric?.__name__;
  const labels = _.keys(metric)
    .filter((ml) => ml !== '__name__')
    .map((label, i, labels) => (
      <span key={i}>
        <strong className='prom-graph-table-label-key'>{label}</strong>="{metric[label]}"{i === labels.length - 1 ? '' : ', '}
      </span>
    ));
  return (
    <>
      <span className='prom-graph-table-metric-name'>{metricName}</span>
      <span className='prom-graph-table-bracket'>{'{'}</span>
      {labels}
      <span className='prom-graph-table-bracket'>{'}'}</span>
    </>
  );
}

// step 只取整数部分(秒)
function toFixedNoRound(num1 = 0, num2 = 0) {
  const num1Str = num1.toFixed(0);
  const num2Str = num2.toFixed(0);
  return _.toNumber(num1Str) - _.toNumber(num2Str);
}

function formatValue(val, unit) {
  const num = _.toNumber(val);
  if (_.isNaN(num)) return '-';
  const { text } = valueFormatter({ unit }, num);
  return text;
}

function getListItemValue(resultType, record, unit) {
  if (resultType === 'scalar' || resultType === 'string') {
    return formatValue(_.get(record, '[1]'), unit);
  }
  if (resultType === 'vector') {
    return formatValue(_.get(record, 'value[1]'), unit);
  }
  if (resultType === 'matrix' || resultType === 'streams') {
    const values = _.get(record, 'values');
    return (
      <div style={{ display: 'table' }}>
        {_.map(values, (value, i: number) => {
          const timestamp = _.get(value, 0);
          return (
            <div key={i} style={{ display: 'table-row' }}>
              <span style={{ display: 'table-cell', padding: '0 4px' }}>{formatValue(_.get(value, 1), unit)}</span>
              <span style={{ display: 'table-cell', padding: '0 4px' }}>@{timestamp || '-'}</span>
              <span style={{ display: 'table-cell', padding: '0 4px' }}>{moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>
              <span style={{ display: 'table-cell', padding: '0 4px' }}>{i > 0 ? `+${toFixedNoRound(timestamp, _.get(values[i - 1], 0))}` : ''}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

export default function Table(props: IProps) {
  const {
    url,
    datasourceValue,
    promql,
    setQueryStats,
    setErrorContent,
    contentMaxHeight,
    timestamp,
    setTimestamp,
    refreshFlag,
    loading,
    setLoading,
    defaultUnit,
    showUnitPicker = true,
    controlsPortalDomNode,
  } = props;
  const [data, setData] = useState<{
    resultType: ResultType;
    result: any[];
  }>({
    resultType: 'matrix',
    result: [],
  });
  const [unit, setUnit] = useState(defaultUnit || 'sishort');
  const controls = (
    <div className='prom-graph-table-controls'>
      <Space>
        <Input.Group>
          <span className='ant-input-group-addon'>Time</span>
          <DatePicker
            value={timestamp ? moment.unix(timestamp) : undefined}
            onChange={(val) => {
              setTimestamp(val ? val.unix() : undefined);
            }}
            showTime
            placeholder='Evaluation time'
            getPopupContainer={() => document.body}
            disabledDate={(current) => current > moment()}
          />
        </Input.Group>
        {showUnitPicker && (
          <Input.Group>
            <span className='ant-input-group-addon'>Unit</span>
            <UnitPicker
              dropdownMatchSelectWidth={false}
              value={unit}
              onChange={(val) => {
                setUnit(val);
              }}
            />
          </Input.Group>
        )}
      </Space>
    </div>
  );

  useEffect(() => {
    if (datasourceValue && promql) {
      const queryStart = Date.now();
      setLoading(true);
      getPromData(`${url}/${datasourceValue}/api/v1/query`, {
        time: timestamp || moment().unix(),
        query: instantInterpolateString({
          query: promql,
          time: timestamp ? moment.unix(timestamp) : undefined,
        }),
      })
        .then((res) => {
          const { resultType } = res;
          let { result } = res;
          let tooLong = false;
          let maxLength = 0;
          if (result) {
            if (result.length > LIMIT) {
              tooLong = true;
              maxLength = result.length;
              result = result.slice(0, LIMIT);
            }
            result.forEach((item) => {
              if (item.values && item.values.length > LIMIT) {
                tooLong = true;
                if (item.values.length > maxLength) {
                  maxLength = item.values.length;
                }
                item.values = item.values.slice(0, LIMIT);
              }
            });
          }
          if (tooLong) {
            setErrorContent(`Warning：Fetched ${maxLength} metrics, only displaying first ${LIMIT}`);
          } else {
            setErrorContent('');
          }
          if (resultType === 'scalar' || resultType === 'string') {
            setData({ resultType, result: [result] });
          } else {
            setData({ resultType, result });
          }
          setQueryStats &&
            setQueryStats({
              loadTime: Date.now() - queryStart,
              resultSeries: result.length,
            });
        })
        .catch((err) => {
          const msg = _.get(err, 'message');
          setErrorContent(`Error executing query: ${msg}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [timestamp, datasourceValue, promql, refreshFlag]);

  useEffect(() => {
    if (defaultUnit) {
      setUnit(defaultUnit);
    }
  }, [defaultUnit]);

  return (
    <div className='prom-graph-table-container'>
      {controlsPortalDomNode ? createPortal(controls, controlsPortalDomNode) : controls}
      <List
        className='prom-graph-table-list'
        style={{
          maxHeight: contentMaxHeight,
        }}
        size='small'
        loading={loading}
        dataSource={data ? data.result : []}
        renderItem={(item) => {
          return (
            <List.Item
              style={{
                wordBreak: 'break-all',
                gap: 40,
              }}
            >
              {data?.resultType != 'streams' && <div>{getListItemLabel(data?.resultType, item)}</div>}
              <div
                style={{
                  flexShrink: 0,
                }}
              >
                {getListItemValue(data?.resultType, item, unit)}
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
