import React from 'react';
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
  const location = useLocation();
  const history = useHistory();
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const [variablesWithOptions, setVariablesWithOptions] = useGlobalState('variablesWithOptions');
  const { variableValueFixed, loading, renderBtns } = props;
  const dataWithoutConstant = _.filter(variablesWithOptions, (item) => item.type !== 'constant');

  return (
    <div className='flex flex-wrap items-center gap-2 px-2'>
      {_.map(dataWithoutConstant, (item) => {
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

                if (val !== undefined) {
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
                }

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
