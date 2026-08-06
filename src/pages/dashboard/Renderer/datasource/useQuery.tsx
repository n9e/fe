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
import { N9E_PATHNAME } from '@/utils/constant';

import type { ITarget } from '../../types';
import type { JsonObject, ScopedVariables } from '../../types';
import { buildDashboardQueryRequest, normalizeDashboardQueryResponse } from './contract';
import { fetchDashboardQuery } from './service';
import type { DashboardQueryState } from './types';
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
  inspect?: boolean;
  type?: string;
  custom: JsonObject;
  maxDataPoints?: number;
  queryOptionsTime?: IRawTimeRange;
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const value = error as { message?: unknown; name?: unknown };
    if (typeof value.message === 'string') return value.message;
    if (typeof value.name === 'string') return value.name;
  }
  return String(error);
};

export default function useQuery(props: IProps) {
  const { time, targets, inViewPort, datasourceCate, datasourceValue, maxDataPoints, queryOptionsTime } = props;
  const { datasourceList } = React.useContext(CommonStateContext);
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
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

  const { run: fetchData, cancel: cancelDebounce } = useDebounceFn(
    async () => {
      if (!targets?.length) return;

      const sequence = requestSequenceRef.current.begin();
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState((previous) => ({
        ...previous,
        loading: true,
      }));

      try {
        const requestData = buildDashboardQueryRequest({
          time,
          queryOptionsTime,
          targets,
          datasourceList,
          panelWidth: props.panelWidth,
          maxDataPoints,
          scopedVars: props.scopedVars,
          legacyDatasource: {
            cate: datasourceCate,
            id: datasourceValue,
          },
        });
        if (!requestData.queries.length) {
          if (!mountedRef.current || !requestSequenceRef.current.isLatest(sequence)) return;
          setState((previous) => ({
            ...previous,
            query: [],
            series: [],
            errorsByRef: {},
            error: '',
            loading: false,
            loaded: false,
            range: time,
          }));
          return;
        }
        const response = await fetchDashboardQuery(requestData, controller.signal);
        if (!mountedRef.current || !requestSequenceRef.current.isLatest(sequence)) return;
        const normalized = normalizeDashboardQueryResponse(response, targets);
        const error = Object.entries(normalized.errorsByRef)
          .map(([refId, item]) => `${refId}: ${item.message}${item.dependency_ref_ids?.length ? ` (${item.dependency_ref_ids.join(', ')})` : ''}`)
          .join('; ');
        setState((previous) =>
          acceptDashboardQueryState(previous, {
            query: props.inspect
              ? [
                  {
                    type: 'Dashboard Query',
                    request: {
                      url: `/api/${N9E_PATHNAME}/v2/query-batch`,
                      method: 'POST',
                      data: requestData,
                    },
                    response,
                  },
                ]
              : [],
            series: normalized.series,
            errorsByRef: normalized.errorsByRef,
            error,
            loading: false,
            loaded: true,
            range: time,
          }),
        );
      } catch (error) {
        if (controller.signal.aborted || !mountedRef.current || !requestSequenceRef.current.isLatest(sequence)) return;
        setState((previous) =>
          acceptDashboardQueryState(previous, {
            query: [],
            series: [],
            errorsByRef: {},
            error: getErrorMessage(error),
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
    if (!targets?.length) {
      hasRequestedRef.current = false;
      requestSequenceRef.current.invalidate();
      cancelDebounce();
      controllerRef.current?.abort();
      setState((previous) => {
        if (!previous.loading && previous.loaded && previous.series.length === 0 && previous.query.length === 0 && !previous.error) {
          return previous;
        }
        return acceptDashboardQueryState(previous, {
          query: [],
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
    datasourceList,
    datasourceCate,
    datasourceValue,
    props.spanNulls,
    props.scopedVars,
    props.panelWidth,
    props.inspect,
    maxDataPoints,
    queryOptionsTime,
    inViewPort,
  ]);

  useEffect(() => {
    if (inViewPort && !hasRequestedRef.current) {
      hasRequestedRef.current = true;
      fetchData();
    }
  }, [inViewPort, fetchData]);

  useEffect(
    () => () => {
      mountedRef.current = false;
      requestSequenceRef.current.invalidate();
      cancelDebounce();
      controllerRef.current?.abort();
    },
    [cancelDebounce],
  );

  return state;
}
