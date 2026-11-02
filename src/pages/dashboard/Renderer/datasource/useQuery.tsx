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
 */
import React, { useEffect, useRef, useState } from 'react';
import { useDebounceFn, useDeepCompareEffect } from 'ahooks';

import { CommonStateContext } from '@/App';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { useGlobalState } from '@/pages/dashboard/globalState';
import { getErrorMessage, isJsonValue } from '@/pages/dashboard/utils/json';
import { N9E_PATHNAME } from '@/utils/constant';

import type { ITarget } from '../../types';
import type { JsonObject, ScopedVariables } from '../../types';
import { buildDashboardQueryRequest, normalizeDashboardQueryResponse } from './contract';
import { fetchDashboardQuery } from './service';
import type { DashboardQueryHookResult, DashboardQueryState } from './types';
import { acceptDashboardQueryState, DashboardRequestSequence } from './requestState';

interface IProps {
  panelWidth?: number;
  id?: string;
  datasourceCate?: string;
  datasourceValue?: number | string;
  time: IRawTimeRange;
  targets: ITarget[];
  inViewPort?: boolean;
  spanNulls?: boolean;
  scopedVars?: ScopedVariables;
  type?: string;
  custom: JsonObject;
  maxDataPoints?: number;
  queryOptionsTime?: IRawTimeRange;
}

/** 从请求库错误对象中提取可在排查页安全展示的后端响应体。 */
function getInspectErrorResponse(error: unknown, message: string) {
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const response = record.response;
    const candidates = [record.data, response && typeof response === 'object' ? (response as Record<string, unknown>).data : undefined, record.error, record.err];
    const payload = candidates.find(isJsonValue);
    if (payload !== undefined) return { error: payload };
  }
  return { error: { message } };
}

export default function useQuery(props: IProps): DashboardQueryHookResult {
  const { time, targets, inViewPort, datasourceCate, datasourceValue, maxDataPoints, queryOptionsTime } = props;
  const { datasourceList } = React.useContext(CommonStateContext);
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
  const [variableExecution] = useGlobalState('variableExecution');
  const [state, setState] = useState<DashboardQueryState>({
    query: [],
    series: [],
    errorsByRef: {},
    error: '',
    loading: false,
    loaded: false,
    range: time,
    revision: 0,
  });

  const hasRequestedRef = useRef(false);
  const requestSequenceRef = useRef(new DashboardRequestSequence());
  const controllerRef = useRef<AbortController>();
  const mountedRef = useRef(true);
  // 记录已成功加载的查询参数标识：面板滚动进出视口时，若参数未变化则直接复用已加载数据，避免重复请求
  const loadedKeyRef = useRef<string | undefined>();

  const getQueryKey = () =>
    JSON.stringify({
      targets,
      time,
      variablesWithOptions,
      datasourceList,
      datasourceCate,
      datasourceValue,
      spanNulls: props.spanNulls,
      scopedVars: props.scopedVars,
      panelWidth: props.panelWidth,
      maxDataPoints,
      queryOptionsTime,
    });

  const { run: fetchData, cancel: cancelDebounce } = useDebounceFn(
    async () => {
      if (!targets?.length) return;

      const sequence = requestSequenceRef.current.begin();
      let requestData: ReturnType<typeof buildDashboardQueryRequest> | undefined;
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState((previous) => ({
        ...previous,
        loading: true,
      }));

      try {
        const builtRequest = buildDashboardQueryRequest({
          time,
          queryOptionsTime,
          targets,
          datasourceList,
          panelWidth: props.panelWidth,
          maxDataPoints,
          scopedVars: props.scopedVars,
          variables: variablesWithOptions,
          legacyDatasource: {
            cate: datasourceCate,
            id: datasourceValue,
          },
        });
        // 供 catch 判断请求是否已构建完成；闭包内无法使用 const 的收窄结果，故显式保留。
        requestData = builtRequest;
        if (!builtRequest.queries.length) {
          if (!mountedRef.current || !requestSequenceRef.current.isLatest(sequence)) return;
          setState((previous) => ({
            ...previous,
            // Keep the latest request for inspection without making drawer visibility a query dependency.
            query: [],
            requestReference: undefined,
            series: [],
            errorsByRef: {},
            error: '',
            loading: false,
            loaded: true,
            range: time,
          }));
          loadedKeyRef.current = getQueryKey();
          return;
        }
        const response = await fetchDashboardQuery(builtRequest, controller.signal);
        if (!mountedRef.current || !requestSequenceRef.current.isLatest(sequence)) return;
        const normalized = normalizeDashboardQueryResponse(response, targets, builtRequest, {
          spanNulls: props.spanNulls,
        });
        const error = Object.entries(normalized.errorsByRef)
          .map(([refId, item]) => `${refId}: ${item.message}${item.dependency_ref_ids?.length ? ` (${item.dependency_ref_ids.join(', ')})` : ''}`)
          .join('; ');
        setState((previous) =>
          acceptDashboardQueryState(previous, {
            query: [
              {
                type: 'Dashboard Query',
                request: {
                  url: `/api/${N9E_PATHNAME}/v2/query-batch`,
                  method: 'POST',
                  data: builtRequest,
                },
                response,
              },
            ],
            requestReference: undefined,
            series: normalized.series,
            errorsByRef: normalized.errorsByRef,
            error,
            loading: false,
            loaded: true,
            range: time,
          }),
        );
        loadedKeyRef.current = getQueryKey();
      } catch (error) {
        if (controller.signal.aborted || !mountedRef.current || !requestSequenceRef.current.isLatest(sequence)) return;
        const errorMessage = getErrorMessage(error);
        setState((previous) =>
          acceptDashboardQueryState(previous, {
            // 请求构建完成后才会发起接口调用。保留该次请求和错误响应，供排查页定位接口问题；
            // 构建前失败（例如缺失变量）则没有请求快照，排查页会直接展示客户端错误。
            query: requestData
              ? [
                  {
                    type: 'Dashboard Query',
                    request: {
                      url: `/api/${N9E_PATHNAME}/v2/query-batch`,
                      method: 'POST',
                      data: requestData,
                    },
                    response: getInspectErrorResponse(error, errorMessage),
                  },
                ]
              : [],
            requestReference: requestData
              ? undefined
              : {
                  request: {
                    url: `/api/${N9E_PATHNAME}/v2/query-batch`,
                    method: 'POST',
                    data: {
                      status: 'not_sent',
                      reason: errorMessage,
                      time_range: queryOptionsTime ?? time,
                      panel_datasource: datasourceCate || datasourceValue ? { cate: datasourceCate, id: datasourceValue } : undefined,
                      scoped_variables: props.scopedVars,
                      targets,
                    },
                  },
                },
            series: previous.series,
            errorsByRef: previous.errorsByRef,
            error: errorMessage,
            loading: false,
            loaded: true,
            range: time,
          }),
        );
      }
    },
    {
      wait: 500,
    },
  );

  useDeepCompareEffect(() => {
    if (variableExecution.isExecuting) {
      hasRequestedRef.current = false;
      requestSequenceRef.current.invalidate();
      cancelDebounce();
      controllerRef.current?.abort();
      return;
    }

    if (!targets?.length) {
      hasRequestedRef.current = false;
      loadedKeyRef.current = undefined;
      requestSequenceRef.current.invalidate();
      cancelDebounce();
      controllerRef.current?.abort();
      setState((previous) => {
        if (!previous.loading && previous.loaded && previous.series.length === 0 && previous.query.length === 0 && !previous.error) {
          return previous;
        }
        return acceptDashboardQueryState(previous, {
          query: [],
          requestReference: undefined,
          series: [],
          errorsByRef: {},
          error: '',
          loading: false,
          loaded: true,
          range: time,
        });
      });
      return;
    }
    if (inViewPort) {
      // 查询参数未变化且已成功加载过数据：滚动进出视口时直接复用已加载数据，不再重复请求
      if (loadedKeyRef.current === getQueryKey()) {
        hasRequestedRef.current = true;
        return;
      }
      hasRequestedRef.current = true;
      requestSequenceRef.current.invalidate();
      cancelDebounce();
      controllerRef.current?.abort();
      fetchData();
      return;
    }
    hasRequestedRef.current = false;
    requestSequenceRef.current.invalidate();
    cancelDebounce();
    controllerRef.current?.abort();
  }, [
    targets,
    time,
    variablesWithOptions,
    variableExecution,
    datasourceList,
    datasourceCate,
    datasourceValue,
    props.spanNulls,
    props.scopedVars,
    props.panelWidth,
    maxDataPoints,
    queryOptionsTime,
    inViewPort,
  ]);

  useEffect(() => {
    if (!variableExecution.isExecuting && inViewPort && !hasRequestedRef.current && loadedKeyRef.current !== getQueryKey()) {
      hasRequestedRef.current = true;
      fetchData();
    }
  }, [inViewPort, variableExecution, fetchData]);

  useEffect(
    () => () => {
      mountedRef.current = false;
      requestSequenceRef.current.invalidate();
      cancelDebounce();
      controllerRef.current?.abort();
    },
    [cancelDebounce],
  );

  /** Forces this panel to query again without changing the dashboard-wide time range. */
  const retry = React.useCallback(() => {
    if (!targets?.length || variableExecution.isExecuting || !inViewPort) return;
    loadedKeyRef.current = undefined;
    hasRequestedRef.current = true;
    requestSequenceRef.current.invalidate();
    cancelDebounce();
    controllerRef.current?.abort();
    fetchData();
  }, [cancelDebounce, fetchData, inViewPort, targets, variableExecution.isExecuting]);

  return {
    ...state,
    retry,
  };
}
