import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Field } from './utils';
import { AutoComplete } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';

interface Props {
  fields: Field[];
  onExecute: () => void;
  value?: string;
  onChange?: (val) => void;
}

enum IOptionType {
  History = 1,
  Field = 2,
}

interface IOption {
  label: string;
  value: string;
  type: IOptionType;
}

// 默认只显示历史（保存10条)
// 输入时，关联字段自动加在最后(替换部分输入内容)
// 选择历史时，覆盖所有内容
function InputFilter(props: Props, ref) {
  const { t } = useTranslation('explorer');
  const { fields, onExecute, onChange, value } = props;
  const [data, setData] = useState<IOption[]>([]);
  const [searchData, setSearchData] = useState('');

  const KEY_HISTORY = 'explorer_es_filter_history';
  const MAX_HISTORY = 10;

  // 保存历史查询信息
  const onCallback = (): void => {
    if (!value) {
      return;
    }
    let hisCache: any[] = getHistory();
    const finded = _.find(hisCache, { value: value });
    if (finded) {
      // 先删除
      hisCache = _.filter(hisCache, (item) => item.value !== value);
    }

    hisCache.unshift({ value: value });
    if (hisCache.length > MAX_HISTORY) {
      hisCache.pop();
    }
    try {
      localStorage.setItem(KEY_HISTORY, JSON.stringify(hisCache));
    } catch {}
    rebuildOptions();
  };

  const getHistory = (): any => {
    const cacheStr = localStorage.getItem(KEY_HISTORY) || '';
    let result: any[] = [];
    if (cacheStr) {
      try {
        result = JSON.parse(cacheStr);
      } catch {}
    }

    return result;
  };

  useImperativeHandle(
    ref,
    () => ({
      onCallback,
    }),
    [value],
  );

  useEffect(() => {
    rebuildOptions();
  }, [fields]);

  const rebuildOptions = (): void => {
    const newData: IOption[] = [];
    // 读取fields
    _.map(fields, (item) => {
      newData.push({ label: item.name, value: item.name, type: IOptionType.Field });
    });
    // 读取history
    _.map(getHistory(), (item) => {
      // 如果已经有数据了，不继续显示
      if (!_.find(newData, { value: item.value })) {
        newData.push({ label: item.value, value: item.value, type: IOptionType.History });
      }
    });

    setData(newData);
  };

  const options: any[] = [];
  _.map(data, (item) => {
    if (item.type === IOptionType.History) {
      options.push({
        label: (
          <span>
            <HistoryOutlined style={{ marginRight: '5px' }} />
            {item.label}
          </span>
        ),
        value: item.value,
      });
    } else {
      if (value) {
        options.push({
          label: item.label,
          value: item.value,
        });
      }
    }
  });

  const getSearchData = (val): string => {
    let newValue = val;
    const ss = _.split(value, ' ');
    if (ss.length > 1) {
      newValue = ss[ss.length - 1];
    }
    return newValue;
  };

  const triggerChange = (val) => {
    let newValue = val;
    newValue = _.replace(newValue, / AND /i, ' AND ');
    newValue = _.replace(newValue, / OR /i, ' OR ');
    newValue = _.replace(newValue, / NOT /i, ' NOT ');
    newValue = _.replace(newValue, / NOT:/i, ' NOT:');

    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <AutoComplete
      {...props}
      onChange={triggerChange}
      dropdownMatchSelectWidth={false}
      allowClear={true}
      options={_.filter(options, (item) => {
        if (searchData) {
          return _.includes(item.value, searchData);
        }
        return true;
      })}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onCallback();
          onExecute();
        }
      }}
      onSearch={(val) => {
        // 取可用的数据
        setSearchData(getSearchData(val));
      }}
      onSelect={(val) => {
        // 如果选择的在字段中不存在，就表示全部选择，否则选择字段
        let newValue = val;
        const hisData = getHistory();
        if (_.filter(hisData, (item) => item.value === val).length === 0) {
          // fields中搜索
          // value中取出搜索和无效数据
          const ss = _.split(value, ' ');
          if (ss.length > 1) {
            newValue = _.join(_.slice(ss, 0, ss.length - 1), ' ') + ' ' + val;
          }
        }
        if (onChange) {
          onChange(newValue);
        }
      }}
      onDropdownVisibleChange={(open) => {
        if (!open) {
          setSearchData('');
        } else {
          setSearchData(getSearchData(value));
        }
      }}
    />
  );
}

export default forwardRef(InputFilter);
