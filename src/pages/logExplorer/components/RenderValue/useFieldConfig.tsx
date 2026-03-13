/**
 * Changes:
 *
 * 2025-03-13
 * 存在竞态条件，当 ES 数据源类型时 indexPatternId 还没准备好时值是错误的
 * 会走 isPlus 分支，调用 searchDrilldown 接口
 * 等 indexPatternId 准备好后，会调用 getESIndexPattern 接口
 * 这两个接口 都会设置 fieldConfig，导致最终 fieldConfig 的值不确定
 */

import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';
import { getESIndexPattern, standardizeFieldConfig } from '@/pages/log/IndexPatterns/services';

import { IFieldSearch } from './types';
// @ts-ignore
import { searchDrilldown } from 'plus:/pages/LogExploreLinkSetting/services';

export default function useFieldConfig(search: IFieldSearch, dep: any): FieldConfigVersion2 | undefined {
  const [fieldConfig, setFieldConfig] = useState<FieldConfigVersion2>();
  const { isPlus } = useContext(CommonStateContext);

  useEffect(() => {
    let cancelled = false;
    if (search.cate === 'elasticsearch' && search.indexPatternId) {
      getESIndexPattern(search.indexPatternId).then((res) => {
        if (cancelled) return;
        let fieldConfig;
        try {
          fieldConfig = standardizeFieldConfig(JSON.parse(res.fields_format));
        } catch (error) {
          console.error(error);
        }
        setFieldConfig(fieldConfig);
      });
    } else if (isPlus) {
      const isESAvailable = search.cate === 'elasticsearch' && search.resource;
      const isLokiAvailable = search.cate === 'loki' && search.query;
      const isSLSAvailable = search.cate === 'aliyun-sls' && search.resource;
      const isDorisAvailable = search.cate === 'doris' && search.resource;
      if (isESAvailable || isLokiAvailable || isSLSAvailable || isDorisAvailable) {
        searchDrilldown(search).then((res) => {
          if (cancelled) return;
          if (res.length > 0) {
            try {
              let configs = JSON.parse(res[0].configs);
              setFieldConfig({
                arr: [],
                version: 2,
                linkArr: configs.linkArr,
                mappingParamsArr: configs.mappingParamsArr,
                regExtractArr: configs.regExtractArr,
              });
            } catch (error) {
              console.error(error);
            }
          } else {
            setFieldConfig(undefined);
          }
        });
      }
    }
    return () => {
      cancelled = true;
    };
  }, [dep]);
  return fieldConfig;
}
