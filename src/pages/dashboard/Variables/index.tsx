import React, { useState, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import _ from 'lodash';
import { message } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import { CommonStateContext } from '@/App';
import { getMonObjectList } from '@/services/targets';

import { useGlobalState } from '../globalState';
import { IVariable } from './types';
import adjustData from './utils/ajustData';
import isPlaceholderQuoted from './utils/isPlaceholderQuoted';
import { formatString, formatDatasource } from './utils/formatString';
import stringToRegex from './utils/stringToRegex';
import filterOptionsByReg from './utils/filterOptionsByReg';
import initializeVariablesValue from './utils/initializeVariablesValue';
import includes from './utils/includes';
import datasource from './datasource';
import EditModal from './EditModal';
import Main from './Main';

import './style.less';

export type { IVariable } from './types';

interface Props {
  queryParams: Record<string, any>;
  editable: boolean;
  value?: IVariable[];
  onChange?: (value: IVariable[]) => void;
  editModalVariablecontainerRef: React.RefObject<HTMLDivElement>;
  editModalVariablecontainerReady: boolean;
}

export default function index(props: Props) {
  const { t } = useTranslation('dashboard');
  const { queryParams, value, onChange, editable, editModalVariablecontainerRef } = props;
  const { groupedDatasourceList, datasourceList } = useContext(CommonStateContext);
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const [variablesWithOptions, setVariablesWithOptions] = useGlobalState('variablesWithOptions');
  const [range] = useGlobalState('range');
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refreshFlag_'));
  // const [initializedValue, setInitializedValue] = useState<IVariable[]>([]);
  const [editing, setEditing] = useState<boolean>(false);
  const latestVariablesWithOptionsRef = React.useRef<IVariable[]>(variablesWithOptions);

  // useEffect(() => {
  //   latestVariablesWithOptionsRef.current = variablesWithOptions;
  // });

  // const getData = async () => {
  //   let result: IVariable[] = [];
  //   const latestVariablesWithOptions = latestVariablesWithOptionsRef.current;
  //   if (!_.isEmpty(latestVariablesWithOptions)) {
  //     for (let idx = 0; idx < latestVariablesWithOptions.length; idx++) {
  //       const item = _.cloneDeep(latestVariablesWithOptions[idx]);
  //       const data = adjustData(result, {
  //         datasourceList: datasourceList,
  //         isPlaceholderQuoted: isPlaceholderQuoted(item.definition, item.name),
  //         isEscapeJsonString: true,
  //       });
  //       const compiledReg = item.regex ? formatString(item.regex, data) : null;
  //       let itemOptions: {
  //         label: string;
  //         value: string;
  //       }[] = [];

  //       if (item.type === 'query') {
  //         if (!item.datasource) {
  //           const errMsg = t('variable.error.datasourceNotFound', { name: item.name });
  //           console.error(errMsg);
  //           message.error(errMsg);
  //           result = _.concat(result, item);
  //           continue;
  //         }
  //         const datasourceCate = item.datasource.cate;
  //         const datasourceValue = formatDatasource(item.datasource.value as any, data);
  //         if (!datasourceValue) {
  //           const errMsg = t('variable.error.datasourceValueNotFound', { name: item.name });
  //           console.error(errMsg);
  //           message.error(errMsg);
  //           result = _.concat(result, item);
  //           continue;
  //         }
  //         const compiledDefinition = formatString(item.definition, data);
  //         let options: string[] = [];

  //         try {
  //           options = await datasource({
  //             datasourceCate,
  //             datasourceValue,
  //             datasourceList,
  //             variablesWithOptions: result,
  //             query: {
  //               ...item.query,
  //               range,
  //               query: compiledDefinition,
  //             },
  //           });
  //         } catch (error) {
  //           console.error('Error fetching item options:', error);
  //         }
  //         itemOptions = _.sortBy(filterOptionsByReg(_.map(options, _.toString), compiledReg), 'value');
  //       }
  //       // else if (item.type === 'custom') {
  //       //   const options = _.map(_.compact(_.split(item.definition, ',')), _.trim);
  //       //   itemOptions = _.sortBy(filterOptionsByReg(options, compiledReg), 'value');
  //       // }
  //       else if (item.type === 'datasource') {
  //         const regex = compiledReg ? stringToRegex(compiledReg) : null;
  //         let datasourceList = item.definition ? (groupedDatasourceList[item.definition] as any) : [];
  //         if (regex) {
  //           datasourceList = _.filter(datasourceList, (option) => {
  //             return regex.test(option.name);
  //           });
  //         }
  //         itemOptions = _.map(datasourceList, (ds) => {
  //           return { label: ds.name, value: ds.id }; // TODO value 实际是 number 类型
  //         });
  //       } else if (item.type === 'datasourceIdentifier') {
  //         let datasourceList = item.definition
  //           ? _.filter(groupedDatasourceList[item.definition] as any, (item) => {
  //               return item.identifier;
  //             })
  //           : [];
  //         const regex = compiledReg ? stringToRegex(compiledReg) : null;
  //         if (regex) {
  //           datasourceList = _.filter(datasourceList, (option) => {
  //             return regex.test(option.identifier);
  //           });
  //         }
  //         itemOptions = _.map(datasourceList, (ds) => {
  //           return { label: ds.name, value: ds.identifier };
  //         });
  //       }
  //       // else if (item.type === 'hostIdent') {
  //       //   let options: string[] = [];
  //       //   try {
  //       //     const res = await getMonObjectList({
  //       //       gids: dashboardMeta.group_id,
  //       //       p: 1,
  //       //       limit: 5000,
  //       //     });
  //       //     options = _.sortBy(_.uniq(_.map(res?.dat?.list, 'ident')));
  //       //   } catch (error) {
  //       //     console.error(error);
  //       //   }
  //       //   itemOptions = _.sortBy(filterOptionsByReg(_.map(options, _.toString), compiledReg), 'value');
  //       // }

  //       // 设置变量的可选项
  //       item.options = itemOptions;

  //       // 常量类型变量直接使用定义的值
  //       // if (item.type === 'constant') {
  //       //   item.value = item.definition;
  //       // }

  //       // 设置变量为空时的默认值
  //       // 同初始化 (initializeVariablesValue) 的区别是，这里从可选项或是变量设置的 defaultValue 等中选取
  //       // 如果 __variable_value_fixed 存在，则表示变量值是固定的，不需要再设置默认值
  //       if (queryParams.__variable_value_fixed === undefined) {
  //         // 变量值为空，或者不在可选项中 时，设置默认值
  //         if (item.value === undefined || (item.value && !_.isEmpty(itemOptions) && !includes(itemOptions, item.value))) {
  //           // 如果变量设置存在默认值，则使用默认值
  //           if (item.defaultValue) {
  //             item.value = item.defaultValue;
  //           } else {
  //             // 否则单选取第一个值，多选取第一个值或者 all
  //             const head = _.head(itemOptions)?.value || ''; // TODO 这里 || '' 是什么意思，怎么处理 datasource 类型？
  //             const defaultVal = item.multi ? (item.allOption ? ['all'] : head ? [head] : []) : head;
  //             item.value = defaultVal;
  //           }
  //         }
  //       }
  //       result = _.concat(result, item);
  //     }
  //   }
  //   setVariablesWithOptions(result);
  //   return result;
  // };

  // const { data, loading, mutate } = useRequest<IVariable[], any>(getData, {
  //   refreshDeps: [refreshFlag, JSON.stringify(range)],
  // });

  // useEffect(() => {
  //   if (value && dashboardMeta.dashboardId) {
  //     setInitializedValue(
  //       initializeVariablesValue(value, queryParams, {
  //         dashboardId: _.toNumber(dashboardMeta.dashboardId),
  //       }),
  //     );
  //   } else {
  //     setInitializedValue([]);
  //   }
  //   setRefreshFlag(_.uniqueId('refreshFlag_'));
  // }, [JSON.stringify(value), dashboardMeta.dashboardId]);

  const renderBtns = () => {
    if (editable) {
      if (_.isEmpty(variablesWithOptions)) {
        return (
          <a
            onClick={() => {
              setEditing(true);
            }}
          >
            {t('var.btn')}
          </a>
        );
      } else if (_.isEmpty(_.filter(variablesWithOptions, (item) => !item.hide && item.type !== 'constant'))) {
        return (
          <a
            onClick={() => {
              setEditing(true);
            }}
          >
            {t('var.title.edit')}
          </a>
        );
      } else {
        return (
          <EditOutlined
            className='n9e-dashboard-variable-edit-icon'
            onClick={() => {
              setEditing(true);
            }}
          />
        );
      }
    }
    return null;
  };

  console.log('variablesWithOptions', variablesWithOptions);

  return (
    <div className='n9e-dashboard-variables-container'>
      <Main
        variableValueFixed={queryParams.__variable_value_fixed}
        loading={false}
        data={variablesWithOptions}
        onChange={(newData, shouldRefetch) => {
          console.log(newData, shouldRefetch);
          setVariablesWithOptions(newData);
          if (shouldRefetch) {
            setRefreshFlag(_.uniqueId('refreshFlag_'));
          }
        }}
        renderBtns={renderBtns}
      />
      {/** 用 createPortal 复制渲染变量 */}
      {editModalVariablecontainerRef.current &&
        createPortal(
          <Main
            variableValueFixed={queryParams.__variable_value_fixed}
            loading={false}
            data={variablesWithOptions}
            onChange={(newData, shouldRefetch) => {
              setVariablesWithOptions(newData);
              if (shouldRefetch) {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }
            }}
          />,
          editModalVariablecontainerRef.current,
        )}
      <EditModal
        visible={editing}
        setVisible={setEditing}
        value={variablesWithOptions}
        onChange={(newVariables: IVariable[]) => {
          const normalizedValue = _.map(newVariables, (item) => {
            return _.omit(item, ['options', 'value']);
          });
          onChange?.(normalizedValue);
          setRefreshFlag(_.uniqueId('refreshFlag_'));
        }}
      />
    </div>
  );
}
