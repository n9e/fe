import React from 'react';
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
  const [currentValue, setCurrentValue] = React.useState(props.value);
  const [foucsed, setFocused] = React.useState(false);
  const textAreaRef = React.useRef<any>(null);

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

  React.useEffect(() => {
    setCurrentValue(props.value);
  }, [props.value]);

  return (
    <Input.TextArea
      ref={textAreaRef}
      className={classNames('absolute top-0 doris-log-explorer-query-input', {
        'resize-none': !foucsed,
        'overflow-y-hidden': !foucsed,
        'pl-[32px]': props.enableAddonBefore,
      })}
      disabled={props.disabled}
      autoSize={{ minRows: 1, maxRows: foucsed ? 4 : 1 }}
      value={currentValue}
      onChange={(e) => setCurrentValue(e.target.value)}
      onBlur={() => {
        setFocused(false);
        // 失去焦点时将滚动条重置到顶部
        if (textAreaRef.current && textAreaRef.current.resizableTextArea && textAreaRef.current.resizableTextArea.textArea) {
          textAreaRef.current.resizableTextArea.textArea.scrollTop = 0;
        }

        if (currentValue !== props.value) {
          setTimeout(() => {
            props.onChange && props.onChange(currentValue);
          }, 100);
        }
      }}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        setFocused(true);
      }}
      placeholder={props.placeholder}
    />
  );
}
