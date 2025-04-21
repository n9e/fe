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
import { N9E_PATHNAME } from '@/utils/constant';
import { FieldConfig, FieldConfigVersion2 } from './types';

export const getESIndexPatterns = function (datasource_id?: number) {
  return request(`/api/${N9E_PATHNAME}/es-index-pattern-list`, {
    method: RequestMethod.Get,
    params: {
      datasource_id,
    },
  }).then((res) => res.dat);
};

export const getESIndexPattern = function (id: number) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Get,
    params: {
      id,
    },
  }).then((res) => res.dat);
};

export const postESIndexPattern = function (data: any) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Post,
    data,
  });
};

export const putESIndexPattern = function (id, data: any) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Put,
    params: {
      id,
    },
    data,
  });
};

export const deleteESIndexPattern = function (id: number) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Delete,
    data: { ids: [id] },
  });
};

function transforVersion2To1(fieldConfig2: FieldConfigVersion2): FieldConfig {
  var fieldConfig1 = {
    attrs: {},
    formatMap: {},
    version: 1,
  };
  if (fieldConfig2.arr) {
    for (var i = 0; i < fieldConfig2.arr.length; i++) {
      var fieldConfig = fieldConfig2.arr[i];
      fieldConfig1.attrs[fieldConfig.field] = fieldConfig.attrs;
      fieldConfig1.formatMap[fieldConfig.field] = fieldConfig.formatMap;
      // const linkArr = fieldConfig2.linkArr.filter(i=> i.field === fieldConfig.field)
      // if (linkArr.length > 0 && fieldConfig1.formatMap[fieldConfig.field]) {
      //   fieldConfig1.formatMap[fieldConfig.field].paramsArr = linkArr
      // }
    }
  }
  if (fieldConfig2.linkArr) {
    for (var i = 0; i < fieldConfig2.linkArr.length; i++) {
      const field = fieldConfig2.linkArr[i].field;
      if (fieldConfig1.formatMap[field]) {
        fieldConfig1.formatMap[field].paramsArr = fieldConfig2.linkArr.filter((i) => i.field === field);
        fieldConfig1.formatMap[field].regExtractArr = fieldConfig2.regExtractArr;
      } else {
        fieldConfig1.formatMap[field] = {
          paramsArr: fieldConfig2.linkArr.filter((i) => i.field === field),
          regExtractArr: fieldConfig2.regExtractArr,
          type: 'url',
        };
      }
    }
  }
  return fieldConfig1;
}

export function standardizeFieldConfig(fieldConfig: FieldConfig | FieldConfigVersion2): FieldConfig {
  if (fieldConfig.version === 1) {
    return fieldConfig as FieldConfig;
  }

  if (fieldConfig.version === 2) {
    return transforVersion2To1(fieldConfig as FieldConfigVersion2);
  }
  return {
    attrs: {},
    formatMap: {},
    version: 1,
  };
}
