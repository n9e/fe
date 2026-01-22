import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import classNames from 'classnames';

interface Props {
  disabled?: boolean;
  enableAddonBefore?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value?: string) => void;
  onEnterPress?: (value?: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export default function QueryInput(props: Props) {
  const [currentValue, setCurrentValue] = useState(props.value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行行为
      if (props.onEnterPress) {
        // 回车时更新 value
        props.onChange && props.onChange(currentValue);
        // 调用回车事件
        props.onEnterPress(currentValue);
      }
    }
  };

  useEffect(() => {
    setCurrentValue(props.value);
  }, [props.value]);

  return (
    <Input.TextArea
      key={!props.value ? props.placeholder : undefined} // reset when placeholder changes
      className={classNames('doris-log-explorer-query-input', {
        'pl-[32px]': props.enableAddonBefore,
      })}
      autoSize={{ minRows: 1, maxRows: 10 }}
      disabled={props.disabled}
      placeholder={props.placeholder}
      value={currentValue}
      onChange={(e) => {
        setCurrentValue(e.target.value);
      }}
      onBlur={() => {
        props.onBlur && props.onBlur();
        if (currentValue !== props.value) {
          props.onChange && props.onChange(currentValue);
        }
      }}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        props.onFocus && props.onFocus();
      }}
    />
  );
}
