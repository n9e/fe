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
    if (search.cate === 'elasticsearch' && search.indexPatternId) {
      getESIndexPattern(search.indexPatternId).then((res) => {
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
          }
        });
      }
    }
  }, [dep]);
  return fieldConfig;
}
