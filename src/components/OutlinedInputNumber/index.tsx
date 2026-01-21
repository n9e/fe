import React, { useState, useCallback, useContext } from 'react';
import { InputNumber } from 'antd';
import type { InputNumberProps } from 'antd';
import type { FormItemStatusContextProps } from 'antd/lib/form/context';
import './style.less';

interface OutlinedInputNumberProps extends Omit<InputNumberProps, 'placeholder'> {
  label: string | React.ReactNode; // 浮动标签文本
  required?: boolean; // 是否必填(影响标签显示)
  suffix?: React.ReactNode; // 后缀
}

// Antd 4.x 的 Form Item Status Context
const FormItemInputContext = React.createContext<FormItemStatusContextProps>({});

const OutlinedInputNumber: React.FC<OutlinedInputNumberProps> = (props) => {
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
  const labelClassName = `outlined-inputnumber-label ${hasValue || focused ? 'floating' : ''}`;

  // 计算 InputNumber 类名
  const inputNumberClassName = ['outlined-inputnumber', focused ? 'focused' : '', formStatus === 'error' ? 'error' : '', className || ''].filter(Boolean).join(' ');

  return (
    <div className='outlined-inputnumber-wrapper'>
      <label className={labelClassName}>
        {label}
        {required && <span className='outlined-inputnumber-required'>*</span>}
      </label>
      <div className='outlined-inputnumber-content'>
        <InputNumber {...restProps} value={value} onChange={onChange} onFocus={handleFocus} onBlur={handleBlur} className={inputNumberClassName} />
        {suffix && <div className='outlined-inputnumber-suffix'>{suffix}</div>}
      </div>
    </div>
  );
};

export default OutlinedInputNumber;
