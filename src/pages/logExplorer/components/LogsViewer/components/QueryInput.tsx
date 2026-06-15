import React from 'react';
import { Input } from 'antd';

interface Props {
  disabled?: boolean;
  autoSize?: {
    minRows?: number;
    maxRows?: number;
  };
  placeholder?: string;
  value?: string;
  onChange?: (value?: string) => void;
}

export default function QueryInput(props: Props) {
  const [currentValue, setCurrentValue] = React.useState(props.value);
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
      disabled={props.disabled}
      autoSize={props.autoSize ?? { minRows: 1, maxRows: 4 }}
      placeholder={props.placeholder}
      value={currentValue}
      onChange={(e) => setCurrentValue(e.target.value)}
      onBlur={() => {
        if (props.onChange && currentValue !== props.value) {
          props.onChange(currentValue);
        }
      }}
      onKeyDown={handleKeyDown}
    />
  );
}
