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

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import _ from 'lodash';
import { BaseParams } from './types';

export function getDatabases(data: BaseParams): Promise<string[]> {
  return request('/api/n9e/tdengine-databases', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
}

export function getTables(
  data: BaseParams & {
    db: string;
    is_stable: boolean;
  },
): Promise<string[]> {
  return request('/api/n9e/tdengine-tables', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
}

export function getColumns(
  data: BaseParams & {
    db: string;
    table: string;
  },
): Promise<
  {
    name: string;
    type: string;
    size: number;
  }[]
> {
  return request('/api/n9e/tdengine-columns', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
}

export function getDsQuery(
  data: BaseParams & {
    query: {
      query: string;
      from: string;
      to: string;
      keys: {
        metricKey: string;
        labelKey: string;
        timeFormat: string;
      };
    }[];
  },
): Promise<any> {
  return request('/api/n9e/ds-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
}

export function getLogsQuery(
  data: BaseParams & {
    query: {
      query: string;
      from: string;
      to: string;
      keys: {
        timeFormat: string;
      };
    }[];
  },
): Promise<any> {
  return request('/api/n9e/logs-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
}

export function getSqlTemplate(): Promise<{ [index: string]: string }> {
  return request('/api/n9e/sql-template?cate=tdengine', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
}
