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
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Form } from 'antd';
import { useDebounceFn } from 'ahooks';

import { IRawTimeRange } from '@/components/TimeRangePicker';
import { datasource as tdengineQuery } from '@/plugins/TDengine';
import { datasource as ckQuery } from '@/plugins/clickHouse';
import flatten from '@/utils/flatten';
import { useGlobalState } from '@/pages/dashboard/globalState';

import { ITarget } from '../../types';
import prometheusQuery from './prometheus';
import elasticsearchQuery from './elasticsearch';

// @ts-ignore
import plusDatasource from 'plus:/parcels/Dashboard/datasource';

interface IProps {
  panelWidth?: number;
  id?: string;
  datasourceCate: string;
  datasourceValue?: number;
  time: IRawTimeRange;
  targets: ITarget[];
  inViewPort?: boolean;
  spanNulls?: boolean;
  scopedVars?: any;
  inspect?: boolean;
  type?: string;
  custom: any;
}

export default function useQuery(props: IProps) {
  const { datasourceCate, time, targets, inViewPort, spanNulls, datasourceValue } = props;
  const form = Form.useFormInstance();
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
  // beta.5 新增 range 状态，用于 uplot 图表更新时 time 和 data 同时更新
  // 解决之前 time 先更新后面 data 再更新导致 x 轴时间范围会变成 data 的时间范围
  const [range, setRange] = useState<IRawTimeRange>(time);
  const [series, setSeries] = useState<any[]>([]);
  const [query, setQuery] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const flag = useRef(false);

  const fetchQueryProps = {
    ...props,
    variablesWithOptions,
  };
  const fetchQueryMap = {
    prometheus: prometheusQuery,
    elasticsearch: elasticsearchQuery,
    tdengine: tdengineQuery,
    ck: ckQuery,
    ...plusDatasource,
  };
  const { run: fetchData } = useDebounceFn(
    async () => {
      if (!datasourceCate) return;
      // 如果在编辑状态，需要校验表单
      if (form && typeof form.validateFields === 'function') {
        try {
          // 2024-07-16 暂时关闭表单校验，因为会导致一些表单项无法获取标签数据
          // await form.validateFields();
        } catch (e) {
          return;
        }
      }
      setLoading(true);
      fetchQueryMap[datasourceCate](fetchQueryProps)
        .then(({ series, query }: { series: any[]; query: any[] }) => {
          setSeries(
            _.map(series, (item) => {
              return {
                ...item,
                metric: flatten(item.metric), // 日志数据可能会有多层嵌套，这里统一展开
              };
            }),
          );
          setQuery(query);
          setError('');
        })
        .catch((e) => {
          setSeries([]);
          setQuery([]);
          setError(e.message);
          console.error(e);
        })
        .finally(() => {
          setRange(time);
          setLoading(false);
          setLoaded(true);
        });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    // 配置变化时且图表在可视区域内重新请求数据，同时重置 flag
    if (inViewPort) {
      fetchData();
    } else {
      flag.current = false;
    }
    // TODO 这里 JSON.stringify(variablesWithOptions) 可能会有性能问题
  }, [JSON.stringify(targets), JSON.stringify(time), JSON.stringify(variablesWithOptions), spanNulls, datasourceValue]);

  useEffect(() => {
    // 如果图表在可视区域内并且没有请求过数据，则请求数据
    if (inViewPort && !flag.current) {
      flag.current = true;
      fetchData();
    }
  }, [inViewPort]);

  return { query, series, error, loading, loaded, range };
}
