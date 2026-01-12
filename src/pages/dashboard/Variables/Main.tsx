import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import { Spin } from 'antd';
import queryString from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';

import { useGlobalState } from '../globalState';
import Variable from './Variable';

interface Props {
  variableValueFixed: boolean;
  loading: boolean;
  renderBtns?: () => React.ReactNode;
}

export default function Main(props: Props) {
  const history = useHistory();
  const location = useLocation();
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const [variablesWithOptions, setVariablesWithOptions] = useGlobalState('variablesWithOptions');
  const { variableValueFixed, loading, renderBtns } = props;
  const shouldUpdateUrl = useRef(false);

  // 只提取 name 和 value，用于优化 useEffect 依赖
  const variableNameValues = React.useMemo(() => _.map(variablesWithOptions, (item) => ({ name: item.name, value: item.value, type: item.type })), [variablesWithOptions]);

  // 监听变量 name-value 变化，更新 URL
  useEffect(() => {
    if (!shouldUpdateUrl.current) return;

    let newQueryParams = location.search ? queryString.parse(location.search) : {};
    newQueryParams = _.omit(newQueryParams, _.map(variableNameValues, 'name')); // 先移除之前的变量参数

    const dataToQueryParams = _.reduce(
      _.filter(variableNameValues, (dataItem) => dataItem.type !== 'constant' && dataItem.value !== undefined && dataItem.value !== null && dataItem.value !== ''),
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

    shouldUpdateUrl.current = false;
  }, [variableNameValues, location.search]);

  return (
    <div className='flex flex-wrap items-center gap-2 px-2'>
      {_.map(variablesWithOptions, (item) => {
        return (
          <Variable
            key={item.name}
            variableValueFixed={variableValueFixed}
            item={item}
            value={item.value}
            onChange={(update) => {
              setVariablesWithOptions((currentVariablesWithOptions) => {
                const newData = _.map(currentVariablesWithOptions, (dataItem) => {
                  if (dataItem.name === item.name) {
                    return {
                      ...dataItem,
                      ...update,
                    };
                  }
                  return dataItem;
                });

                const val = update.value;

                // localStorage 本地保存
                if (dashboardMeta.dashboardId && val !== undefined) {
                  localStorage.setItem(`dashboard_v6_${dashboardMeta.dashboardId}_${item.name}`, typeof val === 'string' ? val : JSON.stringify(val));
                }

                // 标记需要更新 URL
                shouldUpdateUrl.current = true;

                return newData;
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
