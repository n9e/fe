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
import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import { DatasourceCateEnum } from '@/utils/constant';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { Dashboard } from '@/store/dashboardInterface';
import { getMonObjectList } from '@/services/targets';

import { convertExpressionToQuery, replaceExpressionVars, getVaraiableSelected, setVaraiableSelected, filterOptionsByReg, stringToRegex } from './constant';
import { IVariable } from './definition';
import DisplayItem from './DisplayItem';
import EditItems from './EditItems';
import datasource from './datasource';
import './index.less';

interface IProps {
  id: string;
  editable?: boolean;
  value?: IVariable[];
  range: IRawTimeRange;
  onChange: (data: IVariable[], needSave: boolean, options?: IVariable[]) => void;
  onOpenFire?: () => void;
  isPreview?: boolean;
  dashboard: Dashboard;
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

function index(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { groupedDatasourceList, datasourceList } = useContext(CommonStateContext);
  const query = queryString.parse(useLocation().search);
  const { id, editable = true, range, onChange, onOpenFire, isPreview = false, dashboard } = props;
  const [editing, setEditing] = useState<boolean>(false);
  const [data, setData] = useState<IVariable[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const dataWithoutConstant = _.filter(data, (item) => item.type !== 'constant');
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refreshFlag_'));
  const value = _.map(props.value, (item) => {
    return {
      ...item,
      type: item.type || 'query',
    };
  });
  const renderBtns = () => {
    if (editable && !isPreview) {
      if (_.isEmpty(data)) {
        return (
          <a
            onClick={() => {
              setEditing(true);
              onOpenFire && onOpenFire();
            }}
          >
            {t('var.btn')}
          </a>
        );
      } else if (_.isEmpty(_.filter(data, (item) => !item.hide && item.type !== 'constant'))) {
        return (
          <a
            onClick={() => {
              setEditing(true);
              onOpenFire && onOpenFire();
            }}
          >
            {t('var.title.edit')}
          </a>
        );
      } else {
        return (
          <EditOutlined
            className='icon'
            onClick={() => {
              setEditing(true);
              onOpenFire && onOpenFire();
            }}
          />
        );
      }
    }
    return null;
  };

  useEffect(() => {
    if (value) {
      let result: IVariable[] = [];
      (async () => {
        setLoading(true);
        for (let idx = 0; idx < value.length; idx++) {
          const item = _.cloneDeep(value[idx]);
          if (item.type === 'query') {
            const datasourceCate = item.datasource?.cate;
            const datasourceValue = result.length
              ? (replaceExpressionVars({
                  text: item?.datasource?.value as any,
                  variables: result,
                  limit: result.length,
                  dashboardId: id,
                  datasourceList,
                }) as any)
              : item?.datasource?.value;
            let definition =
              idx > 0
                ? replaceExpressionVars({
                    text: item.definition,
                    variables: result,
                    limit: idx,
                    dashboardId: id,
                    isEscapeJsonString: true,
                  })
                : item.definition;
            let options: string[] = [];

            /**
             * v8
             * prometheus、es 还是通过老的 convertExpressionToQuery 去查询
             * 其他数据源通过 统一在 datasource 文件里处理
             */
            if (_.includes([DatasourceCateEnum.prometheus, DatasourceCateEnum.elasticsearch], datasourceCate)) {
              try {
                options = await convertExpressionToQuery(
                  definition,
                  range,
                  {
                    ...item,
                    datasource: {
                      ...(item?.datasource || {}),
                      value: datasourceValue,
                    },
                  },
                  id,
                  groupedDatasourceList,
                );
                options = datasourceCate === 'prometheus' ? _.sortBy(_.uniq(options)) : _.uniq(options);
                options = _.map(options, _.toString); // 2024-09-03 统一将选项转为字符串，以防一些数据返回非字符串类型，比如 ES 的 status: 200
              } catch (error) {
                console.error(error);
              }
            } else {
              try {
                options = await datasource({
                  dashboardId: id,
                  datasourceCate,
                  datasourceValue,
                  variables: result,
                  query: {
                    ...item.query,
                    range,
                    definition,
                  },
                });
                options = _.sortBy(_.uniq(options));
                options = _.map(options, _.toString);
              } catch (error) {
                console.error(error);
              }
            }

            const regFilterOptions = filterOptionsByReg(options, item.reg, result, idx, id);
            result[idx] = item;
            result[idx].fullDefinition = definition;
            result[idx].options = regFilterOptions;
            result[idx].options = _.sortBy(regFilterOptions, 'value');
            // 当仪表盘变量值为空时，设置默认值
            // 如果已选项不在待选项里也视做空值处理
            const selected = getVaraiableSelected(item, id);
            if (query.__variable_value_fixed === undefined) {
              if (selected === null || (selected && !_.isEmpty(regFilterOptions) && !includes(regFilterOptions, selected))) {
                const head = regFilterOptions?.[0]?.value || ''; // 2014-01-22 添加默认值（空字符）
                const defaultVal = item.multi ? (item.allOption ? ['all'] : head ? [head] : []) : head;
                setVaraiableSelected({ name: item.name, value: defaultVal, id, urlAttach: true });
              }
            }
          } else if (item.type === 'custom') {
            result[idx] = item;
            result[idx].options = _.map(_.map(_.compact(_.split(item.definition, ',')), _.trim), (item) => {
              return {
                label: item,
                value: item,
              };
            });
            const selected = getVaraiableSelected(item, id);
            if (selected === null && query.__variable_value_fixed === undefined) {
              const head = _.head(result[idx].options)?.value;
              const defaultVal = item.multi ? (item.allOption ? ['all'] : head ? [head] : []) : head;
              setVaraiableSelected({ name: item.name, value: defaultVal, id, urlAttach: true });
            }
          } else if (item.type === 'textbox') {
            result[idx] = item;
            const selected = getVaraiableSelected(item, id);
            if (selected === null && query.__variable_value_fixed === undefined) {
              setVaraiableSelected({ name: item.name, value: item.defaultValue!, id, urlAttach: true });
            }
          } else if (item.type === 'constant') {
            result[idx] = item;
            if (query.__variable_value_fixed === undefined) {
              setVaraiableSelected({ name: item.name, value: item.definition, id, urlAttach: true });
            }
          } else if (item.type === 'datasource') {
            const options = item.definition ? (groupedDatasourceList[item.definition] as any) : [];
            const regex = item.regex ? stringToRegex(item.regex) : null;
            result[idx] = item;
            if (regex) {
              result[idx].options = _.filter(options, (option) => {
                return regex.test(option.name);
              });
            } else {
              result[idx].options = options;
            }
            const selected = getVaraiableSelected(item, id);
            if (selected === null) {
              if (item.defaultValue) {
                setVaraiableSelected({ name: item.name, value: item.defaultValue, id, urlAttach: true });
              } else {
                if (query.__variable_value_fixed === undefined) {
                  setVaraiableSelected({ name: item.name, value: options?.[0]?.id, id, urlAttach: true });
                }
              }
            }
          } else if (item.type === 'datasourceIdentifier') {
            const options = item.definition
              ? _.filter(groupedDatasourceList[item.definition] as any, (item) => {
                  return item.identifier;
                })
              : [];
            const regex = item.regex ? stringToRegex(item.regex) : null;
            result[idx] = item;
            if (regex) {
              result[idx].options = _.filter(options, (option) => {
                return regex.test(option.identifier);
              });
            } else {
              result[idx].options = options;
            }
            const selected = getVaraiableSelected(item, id);
            if (selected === null) {
              if (item.defaultValue) {
                setVaraiableSelected({ name: item.name, value: item.defaultValue, id, urlAttach: true });
              } else {
                if (query.__variable_value_fixed === undefined) {
                  setVaraiableSelected({ name: item.name, value: options?.[0]?.identifier, id, urlAttach: true });
                }
              }
            }
          } else if (item.type === 'hostIdent') {
            let options: string[] = [];
            try {
              const res = await getMonObjectList({
                gids: dashboard.group_id,
                p: 1,
                limit: 5000,
              });
              options = _.sortBy(_.uniq(_.map(res?.dat?.list, 'ident')));
            } catch (error) {
              console.error(error);
            }
            const regFilterOptions = filterOptionsByReg(options, item.reg, result, idx, id);
            result[idx] = item;
            result[idx].options = regFilterOptions;
            const selected = getVaraiableSelected(item, id);
            if (query.__variable_value_fixed === undefined) {
              if (selected === null || (selected && !_.isEmpty(regFilterOptions) && !includes(regFilterOptions, selected))) {
                const head = regFilterOptions?.[0]?.value || ''; // 2014-01-22 添加默认值（空字符）
                const defaultVal = item.multi ? (item.allOption ? ['all'] : head ? [head] : []) : head;
                setVaraiableSelected({ name: item.name, value: defaultVal, id, urlAttach: true });
              }
            }
          } else if ((item.type as any) === 'businessGroupIdent') {
            // @deprecated 兼容旧版已经配置的 businessGroupIdent 变量，这里直接该变量的值统一设置为空字符串
            result[idx] = item;
            const selected = getVaraiableSelected(item, id);
            if (selected === null && query.__variable_value_fixed === undefined) {
              setVaraiableSelected({ name: item.name, value: '', id, urlAttach: true });
            }
          }
        }

        // 设置变量默认值，优先从 url 中获取，其次是 localStorage
        result = _.map(_.compact(result), (item) => {
          return {
            ...item,
            value: getVaraiableSelected(item, id),
          };
        });
        setData(result);
        onChange(value, false, result);
        setLoading(false);
      })();
    }
  }, [JSON.stringify(value), refreshFlag, JSON.stringify(range)]);

  return (
    <div className='tag-area'>
      <div className={classNames('tag-content', 'tag-content-close')}>
        {_.map(dataWithoutConstant, (item) => {
          return (
            <DisplayItem
              key={item.name}
              expression={item}
              value={item.value}
              onChange={(val) => {
                // 缓存变量值，更新 url 里的变量值
                setVaraiableSelected({
                  name: item.name,
                  value: val,
                  id,
                  urlAttach: true,
                  vars: dataWithoutConstant,
                });
                setData(
                  _.map(data, (subItem) => {
                    if (subItem.name === item.name) {
                      return {
                        ...item,
                        value: val,
                      };
                    }
                    return subItem;
                  }),
                );
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            />
          );
        })}
        {renderBtns()}
        <Spin spinning={loading} />
      </div>
      <EditItems
        visible={editing}
        setVisible={setEditing}
        value={value}
        onChange={(v: IVariable[]) => {
          if (v) {
            onChange(v, true);
            setRefreshFlag(_.uniqueId('refreshFlag_')); // 2023-01-25 变量配置修改后，重新初始化后再设置变量值
          }
        }}
        range={range}
        id={id}
        dashboard={dashboard}
      />
    </div>
  );
}

export type { IVariable } from './definition';
export { replaceExpressionVars } from './constant';
export default React.memo(index);
