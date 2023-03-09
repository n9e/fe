import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { getDatasourceList } from '@/services/common';

export interface IDatasource {
  id: number;
  name: string;
}

export interface IGroupedDatasource {
  [index: string]: IDatasource[];
}

interface IProps {
  pluginTypes?: string[];
}

export default function useFetchDatasourceList(props?: IProps) {
  const { pluginTypes } = props || {};
  const [data, setData] = useState<{
    datasourceList: IDatasource[];
    groupedDatasourceList: IGroupedDatasource;
  }>({ datasourceList: [], groupedDatasourceList: {} });

  useEffect(() => {
    getDatasourceList(pluginTypes).then((res) => {
      const grouped = _.groupBy(res, 'plugin_type');
      setData({
        datasourceList: res,
        groupedDatasourceList: grouped,
      });
    });
  }, [pluginTypes]);
  return data;
}
