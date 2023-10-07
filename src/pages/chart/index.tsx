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
import React, { useEffect, useState, useRef, useContext } from 'react';
import semver from 'semver';
import { Space, Alert } from 'antd';
import { FieldNumberOutlined } from '@ant-design/icons';
import { useParams } from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { GetTmpChartData } from '@/services/metric';
import { TimeRangePickerWithRefresh, IRawTimeRange, isMathString } from '@/components/TimeRangePicker';
import Resolution from '@/components/Resolution';
import { CommonStateContext } from '@/App';
import Renderer from '../dashboard/Renderer/Renderer';
import { getStepByTimeAndStep } from '../dashboard/utils';
import './locale';
import './index.less';

export default function Chart() {
  const { t } = useTranslation('shareChart');
  const { datasourceCateOptions } = useContext(CommonStateContext);
  const { ids } =
    useParams<{
      ids: string;
    }>();
  const [chartData, setChartData] = useState<
    Array<{
      ref: any;
      dataProps: any;
    }>
  >([]);
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const datasourceCate = useRef<string>();
  const datasourceName = useRef<string>();

  useEffect(() => {
    initChart();
  }, []);

  const initChart = () => {
    GetTmpChartData(ids).then((res) => {
      const data = res.dat
        .filter((item) => !!item)
        .map((item) => {
          return { ...JSON.parse(item.configs), ref: React.createRef() };
        });
      datasourceCate.current = _.find(datasourceCateOptions, { value: data[0].dataProps.datasourceCate })?.label;
      datasourceName.current = data[0].dataProps.datasourceName;
      const curRange = data[0].dataProps.range;
      if (curRange) {
        if (isMathString(curRange?.start) && isMathString(curRange?.end)) {
          setRange(curRange);
        } else {
          setRange({
            start: moment(curRange?.start),
            end: moment(curRange?.end),
          });
        }
      }
      setChartData(data);
    });
  };

  return (
    <div className='chart-container'>
      {chartData && chartData.length > 0 ? (
        <>
          <div className='chart-container-header'>
            <div className='left'></div>
            <div className='right'>
              <Space>
                <span>
                  {t('common:datasource.type')}：{datasourceCate.current}
                </span>
                <span>
                  {t('common:datasource.id')}：{datasourceName.current}
                </span>
                <TimeRangePickerWithRefresh
                  // refreshTooltip={t('refresh_tip', { num: getStepByTimeAndStep(range, step) })}
                  onChange={setRange}
                  value={range}
                  dateFormat='YYYY-MM-DD HH:mm:ss'
                />
              </Space>
            </div>
          </div>
          {chartData.map((item: any, index) => {
            if (semver.valid(item.dataProps?.version)) {
              return (
                <div style={{ height: 740, border: '1px solid #efefef' }}>
                  <Renderer
                    dashboardId={item.id}
                    key={index}
                    time={range}
                    values={_.merge({}, item.dataProps, {
                      options: {
                        legend: {
                          displayMode: 'table',
                        },
                      },
                    })}
                    isPreview
                  />
                </div>
              );
            }
            return <Alert type='warning' message='v6 版本不再支持 < v5.4.0 的配置，请重新生成临时图' />;
          })}
        </>
      ) : (
        <h2 className='holder'>
          <FieldNumberOutlined
            style={{
              fontSize: '30px',
            }}
          />
          <span>{t('该分享链接无图表数据')}</span>
        </h2>
      )}
    </div>
  );
}
