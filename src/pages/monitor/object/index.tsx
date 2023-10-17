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
import React, { useState, useContext } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Select, Result } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { getDefaultDatasourceValue, setDefaultDatasourceValue } from '@/utils';
import { IMatch } from './types';
import List from './metricViews/List';
import LabelsValues from './metricViews/LabelsValues';
import Metrics from './metricViews/Metrics';
import './locale';
import './style.less';

export default function index() {
  const { t } = useTranslation('objectExplorer');
  const [match, setMatch] = useState<IMatch>();
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const [rerenderFlag, setRerenderFlag] = useState(_.uniqueId('rerenderFlag_'));
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const datasources = groupedDatasourceList.prometheus;
  const [datasourceValue, setDatasourceValue] = useState<number>(getDefaultDatasourceValue('prometheus', groupedDatasourceList));

  if (!datasourceValue) {
    return (
      <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Result title={t('common:datasource.empty_modal.title')} />
      </div>
    );
  }

  return (
    <PageLayout
      title={t('title')}
      icon={<LineChartOutlined />}
      rightArea={
        <div
          style={{
            marginRight: 20,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {t('common:datasource.name')}：
          <Select
            dropdownMatchSelectWidth={false}
            value={datasourceValue}
            onChange={(val) => {
              setDatasourceValue(val);
              setDefaultDatasourceValue('prometheus', _.toString(val));
              setRerenderFlag(_.uniqueId('rerenderFlag_'));
            }}
          >
            {_.map(datasources, (item) => {
              return (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              );
            })}
          </Select>
        </div>
      }
    >
      <div className='n9e-metric-views' key={rerenderFlag}>
        <List
          datasourceValue={datasourceValue}
          onSelect={(record: IMatch) => {
            setMatch(record);
          }}
          range={range}
        />
        {match ? (
          <>
            <LabelsValues
              datasourceValue={datasourceValue}
              range={range}
              value={match}
              onChange={(val) => {
                setMatch(val);
              }}
            />
            <Metrics datasourceValue={datasourceValue} range={range} setRange={setRange} match={match} />
          </>
        ) : null}
      </div>
    </PageLayout>
  );
}
