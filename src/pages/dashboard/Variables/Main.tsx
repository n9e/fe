import React from 'react';
import _ from 'lodash';
import { Spin } from 'antd';
import queryString from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';

import { useGlobalState } from '../globalState';
import shouldRefetchData from './utils/shouldRefetchData';
import Variable from './Variable';
import { IVariable } from './index';

interface Props {
  variableValueFixed: boolean;
  loading: boolean;
  data?: IVariable[];
  onChange: (data: IVariable[], shouldRefetch?: boolean) => void;
  renderBtns?: () => React.ReactNode;
}

export default function Main(props: Props) {
  const location = useLocation();
  const history = useHistory();
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const { variableValueFixed, loading, data, onChange, renderBtns } = props;
  const dataWithoutConstant = _.filter(data, (item) => item.type !== 'constant');

  return (
    <div className='flex flex-wrap items-center gap-2 px-2'>
      {_.map(dataWithoutConstant, (item, index) => {
        return (
          <Variable
            key={item.name}
            variableValueFixed={variableValueFixed}
            item={item}
            value={item.value}
            onChange={(update) => {
              // console.log(item, update);
              const newData = _.map(data, (dataItem) => {
                if (dataItem.name === item.name) {
                  return {
                    ...dataItem,
                    ...update,
                  };
                }
                return dataItem;
              });

              // 更新 data
              onChange(newData, shouldRefetchData(item, index, dataWithoutConstant));

              const val = update.value;

              if (val === undefined) return;

              // localStorage 本地保存
              if (dashboardMeta.dashboardId) {
                localStorage.setItem(`dashboard_v6_${dashboardMeta.dashboardId}_${item.name}`, typeof val === 'string' ? val : JSON.stringify(val));
              }

              // replace url 参数
              const newQueryParams = location.search ? queryString.parse(location.search) : {};
              const dataToQueryParams = _.reduce(
                _.filter(newData, (item) => item.type !== 'constant' && item.value !== undefined && item.value !== null && item.value !== ''),
                (result, dataItem) => {
                  result[dataItem.name] = dataItem.value;
                  return result;
                },
                {},
              );
              history.replace({
                pathname: location.pathname,
                search: queryString.stringify(_.assign(newQueryParams, dataToQueryParams)),
              });
            }}
          />
        );
      })}
      {renderBtns && renderBtns()}
      <Spin spinning={loading} />
    </div>
  );
}
