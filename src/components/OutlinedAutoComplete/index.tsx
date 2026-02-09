import React, { useState, useCallback, useContext } from 'react';
import { AutoComplete } from 'antd';
import type { AutoCompleteProps } from 'antd';
import type { FormItemStatusContextProps } from 'antd/lib/form/context';
import './style.less';

interface OutlinedAutoCompleteProps extends Omit<AutoCompleteProps, 'placeholder'> {
  label: string | React.ReactNode; // 浮动标签文本
  required?: boolean; // 是否必填(影响标签显示)
  suffix?: React.ReactNode; // 后缀
}

// Antd 4.x 的 Form Item Status Context
const FormItemInputContext = React.createContext<FormItemStatusContextProps>({});

const OutlinedAutoComplete = (props: OutlinedAutoCompleteProps) => {
  const { label, required, suffix, value, onChange, onFocus, onBlur, className, ...restProps } = props;

  // 状态管理
  const [focused, setFocused] = useState(false);

  // 判断是否有值
  const hasValue = React.useMemo(() => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.length > 0;
    return !!value;
  }, [value]);

  // 尝试获取 Form Item 状态 (Antd 4.x 方式)
  const formItemContext = useContext(FormItemInputContext);
  const formStatus = formItemContext?.status;

  // 处理聚焦事件
  const handleFocus = useCallback(
    (e: any) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  // 处理失焦事件
  const handleBlur = useCallback(
    (e: any) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  // 计算 label 类名
  const labelClassName = `outlined-autocomplete-label ${hasValue || focused ? 'floating' : ''}`;

  // 计算 AutoComplete 类名
  const autoCompleteClassName = ['outlined-autocomplete', focused ? 'focused' : '', formStatus === 'error' ? 'error' : '', className || ''].filter(Boolean).join(' ');

  return (
    <div className='outlined-autocomplete-wrapper'>
      <label className={labelClassName}>
        {label}
        {required && <span className='outlined-autocomplete-required'>*</span>}
      </label>
      <div className='outlined-autocomplete-content'>
        <AutoComplete {...restProps} value={value} onChange={onChange} onFocus={handleFocus} onBlur={handleBlur} className={autoCompleteClassName} />
        {suffix && <div className='outlined-autocomplete-suffix'>{suffix}</div>}
      </div>
    </div>
  );
};

export default OutlinedAutoComplete;
