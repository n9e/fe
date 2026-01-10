import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import classNames from 'classnames';

interface Props {
  disabled?: boolean;
  enableAddonBefore?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value?: string) => void;
}

export default function QueryInput(props: Props) {
  const [currentValue, setCurrentValue] = useState(props.value);

  const handleKeyDown = (e) => {
    // 按下 Enter 键且未按住 Shift 键
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行行为
      if (props.onChange) {
        props.onChange(currentValue);
      }
    }
    // 按下 Enter 键且按住 Shift 键：不阻止默认行为，允许换行
  };

  useEffect(() => {
    setCurrentValue(props.value);
  }, [props.value]);

  return (
    <Input.TextArea
      key={!props.value ? props.placeholder : undefined} // reset when placeholder changes
      className={classNames({
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
        if (currentValue !== props.value) {
          setTimeout(() => {
            props.onChange && props.onChange(currentValue);
          }, 100);
        }
      }}
      onKeyDown={handleKeyDown}
    />
  );
}
