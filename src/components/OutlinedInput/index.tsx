import React, { useState, useCallback, useContext } from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd';
import type { FormItemStatusContextProps } from 'antd/lib/form/context';
import './style.less';

interface OutlinedInputProps extends Omit<InputProps, 'placeholder'> {
  label: string | React.ReactNode; // 浮动标签文本
  required?: boolean; // 是否必填(影响标签显示)
  suffix?: React.ReactNode; // 后缀
}

// Antd 4.x 的 Form Item Status Context
const FormItemInputContext = React.createContext<FormItemStatusContextProps>({});

const OutlinedInput: React.FC<OutlinedInputProps> = (props) => {
  const { label, required, suffix, value, onChange, onFocus, onBlur, className, ...restProps } = props;

  // 状态管理
  const [focused, setFocused] = useState(false);

  // 判断是否有值
  const hasValue = React.useMemo(() => {
    if (value === undefined || value === null) return false;
    return value !== '';
  }, [value]);

  // 尝试获取 Form Item 状态 (Antd 4.x 方式)
  const formItemContext = useContext(FormItemInputContext);
  const formStatus = formItemContext?.status;

  // 处理聚焦事件
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  // 处理失焦事件
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  // 计算 label 类名
  const labelClassName = `outlined-input-label ${hasValue || focused ? 'floating' : ''}`;

  // 计算 Input 类名
  const inputClassName = ['outlined-input', focused ? 'focused' : '', formStatus === 'error' ? 'error' : '', className || ''].filter(Boolean).join(' ');

  return (
    <div className='outlined-input-wrapper'>
      <label className={labelClassName}>
        {label}
        {required && <span className='outlined-input-required'>*</span>}
      </label>
      <div className='outlined-input-content'>
        <Input {...restProps} value={value} onChange={onChange} onFocus={handleFocus} onBlur={handleBlur} className={inputClassName} />
        {suffix && <div className='outlined-input-suffix'>{suffix}</div>}
      </div>
    </div>
  );
};

export default OutlinedInput;
