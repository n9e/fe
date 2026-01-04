import React, { useState, useCallback, useContext } from 'react';
import { Select, Input } from 'antd';
import type { SelectProps } from 'antd';
import type { FormItemStatusContextProps } from 'antd/lib/form/context';
import './style.less';

interface OutlinedSelectProps<VT = any> extends Omit<SelectProps<VT>, 'placeholder'> {
  label: string | React.ReactNode; // 浮动标签文本
  required?: boolean; // 是否必填(影响标签显示)
  suffix?: React.ReactNode; // 后缀
}

// Antd 4.x 的 Form Item Status Context
const FormItemInputContext = React.createContext<FormItemStatusContextProps>({});

export const OutlinedSelect = <VT extends any = any>(props: OutlinedSelectProps<VT>) => {
  const { label, required, suffix, value, onChange, onFocus, onBlur, className, ...restProps } = props;

  // 状态管理
  const [focused, setFocused] = useState(false);

  // 判断是否有值 (支持多选模式的数组值)
  const hasValue = React.useMemo(() => {
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== '';
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
  const labelClassName = `outlined-select-label ${hasValue || focused ? 'floating' : ''}`;

  // 计算 Select 类名
  const selectClassName = ['outlined-select', focused ? 'focused' : '', formStatus === 'error' ? 'error' : '', className || ''].filter(Boolean).join(' ');

  return (
    <div className='outlined-select-wrapper'>
      <label className={labelClassName}>
        {label}
        {required && <span className='outlined-select-required'>*</span>}
      </label>
      <div className='outlined-select-content'>
        <Select {...restProps} value={value} onChange={onChange} onFocus={handleFocus} onBlur={handleBlur} className={selectClassName} />
        {suffix}
      </div>
    </div>
  );
};
