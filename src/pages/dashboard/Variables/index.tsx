import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import _ from 'lodash';
import { Spin, message } from 'antd';

import { CommonStateContext } from '@/App';
import { getMonObjectList } from '@/services/targets';

import { useGlobalState } from '../globalState';
import { IVariable } from './types';
import adjustData from './utils/ajustData';
import isPlaceholderQuoted from './utils/isPlaceholderQuoted';
import { interpolateString, interpolateDatasource } from './utils/interpolateString';
import stringToRegex from './utils/stringToRegex';
import filterOptionsByReg from './utils/filterOptionsByReg';
import initializeVariablesValue from './utils/initializeVariablesValue';
import datasource from './datasource';

interface Props {
  queryParams: Record<string, any>;
  editable?: boolean;
  value?: IVariable[];
  onChange?: (value: IVariable[]) => void;
}

function includes(
  source: {
    label: string;
    value: string;
  }[],
  target,
) {
  if (_.isArray(target)) {
    // 不为空则有交集
    return !_.isEmpty(_.intersection(_.map(source, 'value'), target));
  }
  return _.includes(_.map(source, 'value'), target);
}

export default function index(props: Props) {
  const { queryParams, value, onChange } = props;
  const { groupedDatasourceList, datasourceList } = useContext(CommonStateContext);
  const { t } = useTranslation('dashboard');
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const [range] = useGlobalState('range');
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refreshFlag_'));
  const [initializedValue, setInitializedValue] = useState<IVariable[]>([]);

  const getData = async () => {
    let result: IVariable[] = [];
    if (!_.isEmpty(initializedValue)) {
      for (let idx = 0; idx < initializedValue.length; idx++) {
        const item = _.cloneDeep(initializedValue[idx]);
        const data = adjustData(result, {
          isPlaceholderQuoted: isPlaceholderQuoted(item.definition, item.name),
          datasourceList: datasourceList,
          isEscapeJsonString: true,
        });
        const compiledReg = item.regex ? interpolateString(item.regex, data) : null;
        let itemOptions: {
          label: string;
          value: string;
        }[] = [];

        if (item.type === 'query') {
          if (!item.datasource) {
            const errMsg = t('variable.error.datasourceNotFound', { name: item.name });
            console.error(errMsg);
            message.error(errMsg);
            result = _.concat(result, item);
            continue;
          }
          const datasourceCate = item.datasource.cate;
          const datasourceValue = interpolateDatasource(item.datasource.value as any, data);
          if (!datasourceValue) {
            const errMsg = t('variable.error.datasourceValueNotFound', { name: item.name });
            console.error(errMsg);
            message.error(errMsg);
            result = _.concat(result, item);
            continue;
          }
          const compiledDefinition = interpolateString(item.definition, data);
          let options: string[] = [];

          try {
            options = await datasource({
              dashboardId: dashboardMeta.dashboardId,
              datasourceCate,
              datasourceValue,
              datasourceList,
              variables: result,
              query: {
                ...item.query,
                range,
                query: compiledDefinition,
              },
            });
          } catch (error) {
            console.error('Error fetching item options:', error);
          }
          itemOptions = _.sortBy(filterOptionsByReg(_.map(options, _.toString), compiledReg), 'value');
        } else if (item.type === 'custom') {
          const options = _.map(_.compact(_.split(item.definition, ',')), _.trim);
          itemOptions = _.sortBy(filterOptionsByReg(options, compiledReg), 'value');
        } else if (item.type === 'datasource') {
          const regex = compiledReg ? stringToRegex(compiledReg) : null;
          let datasourceList = item.definition ? (groupedDatasourceList[item.definition] as any) : [];
          if (regex) {
            datasourceList = _.filter(datasourceList, (option) => {
              return regex.test(option.name);
            });
          }
          itemOptions = _.map(datasourceList, (ds) => {
            return { label: ds.name, value: ds.id }; // TODO value 实际是 number 类型
          });
        } else if (item.type === 'datasourceIdentifier') {
          let datasourceList = item.definition
            ? _.filter(groupedDatasourceList[item.definition] as any, (item) => {
                return item.identifier;
              })
            : [];
          const regex = compiledReg ? stringToRegex(compiledReg) : null;
          if (regex) {
            datasourceList = _.filter(datasourceList, (option) => {
              return regex.test(option.identifier);
            });
          }
          itemOptions = _.map(datasourceList, (ds) => {
            return { label: ds.name, value: ds.identifier };
          });
        } else if (item.type === 'hostIdent') {
          let options: string[] = [];
          try {
            const res = await getMonObjectList({
              gids: dashboardMeta.group_id,
              p: 1,
              limit: 5000,
            });
            options = _.sortBy(_.uniq(_.map(res?.dat?.list, 'ident')));
          } catch (error) {
            console.error(error);
          }
          itemOptions = _.sortBy(filterOptionsByReg(_.map(options, _.toString), compiledReg), 'value');
        }

        // 设置变量的可选项
        item.options = itemOptions;

        // 常量类型变量直接使用定义的值
        if (item.type === 'constant') {
          item.value = item.definition;
        }

        // 设置变量为空时的默认值
        // 同初始化 (initializeVariablesValue) 的区别是，这里从可选项或是变量设置的 defaultValue 等中选取
        // 如果 __variable_value_fixed 存在，则表示变量值是固定的，不需要再设置默认值
        if (queryParams.__variable_value_fixed === undefined) {
          // 变量值为空，或者不在可选项中 时，设置默认值
          if (item.value === undefined || (item.value && !_.isEmpty(itemOptions) && !includes(itemOptions, item.value))) {
            // 如果变量设置存在默认值，则使用默认值
            if (item.defaultValue) {
              item.value = item.defaultValue;
            } else {
              // 否则单选取第一个值，多选取第一个值或者 all
              const head = _.head(itemOptions)?.value || ''; // TODO 这里 || '' 是什么意思，怎么处理 datasource 类型？
              const defaultVal = item.multi ? (item.allOption ? ['all'] : head ? [head] : []) : head;
              item.value = defaultVal;
            }
          }
        }
        result = _.concat(result, item);
      }
    }
    return result;
  };

  const { data, loading } = useRequest<IVariable[], any>(getData, {
    refreshDeps: [JSON.stringify(initializedValue), refreshFlag, JSON.stringify(range)],
  });

  const dataWithoutConstant = _.filter(data, (item) => item.type !== 'constant');

  useEffect(() => {
    if (value && dashboardMeta.dashboardId) {
      setInitializedValue(
        initializeVariablesValue(value, queryParams, {
          dashboardId: _.toNumber(dashboardMeta.dashboardId),
        }),
      );
    } else {
      setInitializedValue([]);
    }
  }, [JSON.stringify(value), JSON.stringify(queryParams), dashboardMeta.dashboardId]);

  console.log('data', data, loading);

  return (
    <div className='flex flex-wrap items-center'>
      {_.map(dataWithoutConstant, (item) => {
        return <div>{item.name}</div>;
      })}
      <Spin spinning={loading} />
    </div>
  );
}
