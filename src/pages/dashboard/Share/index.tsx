import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import { CommonStateContext } from '@/App';
import Detail from '@/pages/dashboard/Detail/Detail';

function searchV5toV6(search, datasourceVar: any, datasourceList?: any[]) {
  const params: {
    [key: string]: string | null;
  } = {};
  const queryParams = new URLSearchParams(search);
  queryParams.forEach((value, key) => {
    if (value === null) {
      params[key] = null;
    } else {
      try {
        params[key] = JSON.parse(value);
      } catch (e) {
        if (key === '__cluster') {
          const finded = _.find(datasourceList, { name: value });
          if (finded) {
            params[datasourceVar.name] = finded.id;
          } else {
            params[datasourceVar.name] = datasourceVar.defaultValue;
          }
        } else {
          params[key] = value;
        }
      }
    }
  });
  return queryString.stringify(params);
}

export default function index() {
  const { search } = useLocation();
  const { groupedDatasourceList } = useContext(CommonStateContext);

  return (
    <Detail
      isPreview
      onLoaded={(configs) => {
        const firstDatasourceVar = _.find(configs?.var, { type: 'datasource', definition: 'prometheus' });
        /**
         * 兼容 v5 版本生成的 URL
         * 这里通过 search 中是否有双引号来判断是否是 v5 版本生成的 URL
         * 如果是 v5 的 URL，需要将 search 中的参数转换成 v6 的格式并且刷新该页面。
         * 同时页面给出提示，让用户有需要的话保存新的 URL
         */
        if (/"/.test(decodeURIComponent(search)) && search.indexOf('__variable_value_fixed=true') && firstDatasourceVar) {
          try {
            const newSearch = searchV5toV6(search, firstDatasourceVar, groupedDatasourceList?.prometheus);
            window.location.href = `${window.location.origin}${window.location.pathname}?${newSearch}`;
            return true;
          } catch (e) {
            // 如果转换失败，降级为正常渲染页面
            console.error(e);
            return true;
          }
        }
        return true;
      }}
    />
  );
}
