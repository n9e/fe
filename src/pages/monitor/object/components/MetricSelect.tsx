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
import { Button, Input, Tabs, Tooltip } from 'antd';
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { filterMetrics, matchMetrics } from '../utils';
import _ from 'lodash';

const { TabPane } = Tabs;
export default (props) => {
  const { metrics, metricDescs, selectedMetrics, handleMetricClick, handleRefreshMetrics } = props;
  const [searchValue, setSearchValue] = useState<string>('');
  const [activeKey, setActiveKey] = useState<string>('all');
  const handleMetricTabsChange = (key: string) => {
    setActiveKey(key);
  };
  const normalizMetrics = (key: string) => {
    let newMetrics = _.cloneDeep(metrics);
    if (key !== 'all') {
      return filterMetrics('prefix', `${key}_`, newMetrics);
    }
    return newMetrics;
  };
  const renderMetricList = (metrics = [], metricTabKey: string) => {
    return (
      <div className='tabPane' style={{ height: 240, overflow: 'auto' }}>
        {metrics.length ? (
          <ul className='metric-list' style={{ border: 'none' }}>
            {_.map(metrics, (metric, i) => {
              return (
                <li
                  className='item'
                  key={i}
                  onClick={() => {
                    handleMetricClick && handleMetricClick(metric);
                  }}
                >
                  <Tooltip key={`${metricTabKey}_${metric}`} placement='right' title={() => metricDescs[metric]}>
                    <span>{metric}</span>
                  </Tooltip>
                  {selectedMetrics.find((sm) => sm === metric) ? <span style={{ marginLeft: 8 }}>+1</span> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{ textAlign: 'center' }}>No data</div>
        )}
      </div>
    );
  };
  const renderMetricTabs = () => {
    let filteredMetrics = normalizMetrics(activeKey);
    // _.forEachRight(selectedMetrics, (value) => {
    //   const index = filteredMetrics.findIndex(metric => metric === value)
    //   const curMetric = filteredMetrics[index]
    //   if (curMetric) {
    //     filteredMetrics.splice(index,  1)
    //     filteredMetrics.unshift(curMetric)
    //   }
    // });
    let newMetrics = filteredMetrics;
    if (searchValue) {
      try {
        const reg = new RegExp(searchValue, 'i');
        newMetrics = _.filter(filteredMetrics, (item) => {
          return reg.test(item);
        });
      } catch (e) {
        newMetrics = [];
      }
    }
    const metricPrefixes = metrics
      .map((m) => {
        const a = m.split('_');
        return a[0];
      })
      .filter((m) => m);
    const metricPrefixesUnique: any[] = Array.from(new Set(metricPrefixes));
    const tabPanes = _.map(metricPrefixesUnique, (val) => {
      return (
        <TabPane tab={val} key={val}>
          {renderMetricList(newMetrics, val)}
        </TabPane>
      );
    });
    tabPanes.unshift(
      <TabPane tab='all' key='all'>
        {renderMetricList(newMetrics, 'all')}
      </TabPane>,
    );

    return metrics.length > 0 ? (
      <Tabs className='metric-tab' tabBarStyle={{ marginBottom: 10, height: 40 }} activeKey={activeKey} onChange={handleMetricTabsChange}>
        {tabPanes}
      </Tabs>
    ) : (
      <div className='metric-tab-empty'>
        请先选择监控对象，然后{' '}
        <a
          href='javascript:;'
          onClick={() => {
            handleRefreshMetrics && handleRefreshMetrics();
          }}
        >
          点击我刷新
        </a>
      </div>
    );
  };
  const handleMetricsSearch = (e: any) => {
    const { value } = e.target;
    setSearchValue(value);
  };
  return (
    <div className='metric-select'>
      <div className='top-bar'>
        <Input
          placeholder='搜索，空格分隔多个关键字'
          addonBefore={
            <>
              <div className='search-title'>监控指标</div>
              <SearchOutlined style={{ position: 'absolute', left: 78, zIndex: 2, top: 9 }} />
            </>
          }
          addonAfter={
            <SyncOutlined
              onClick={() => {
                // 不直接写成onClick={handleRefreshMetrics}是为了避免将事件对象e传给外面，造成不必要的麻烦
                handleRefreshMetrics && handleRefreshMetrics();
              }}
            />
          }
          className='metric-search'
          onChange={handleMetricsSearch}
        />
      </div>
      {renderMetricTabs()}
    </div>
  );
};
