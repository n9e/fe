import React, { useState, useContext, useRef } from 'react';
import { Input, Tooltip, InputProps } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import useOnClickOutside from '../useOnClickOutside';
import { CommonStateContext } from '@/App';

export default function InputEnlarge({ disabled, value, onChange, ...props }: InputProps) {
  const { darkMode } = useContext(CommonStateContext);
  const [visible, setVisible] = useState(false);
  const eleRef = useRef<any>(null);

  useOnClickOutside(eleRef, () => {
    setVisible(false);
  });
  return (
    <div style={{ display: 'flex' }} ref={eleRef}>
      <Tooltip
        visible={visible}
        // @ts-ignore
        title={<Input.TextArea style={{ width: 600 }} autoSize={{ minRows: 2, maxRows: 6 }} value={value} onChange={onChange} />}
        getPopupContainer={() => eleRef.current}
        color={darkMode ? '#272a38' : '#fff'}
        overlayStyle={{ maxWidth: 615 }}
        overlayInnerStyle={{ width: 615 }}
        placement='topRight'
      >
        <Input disabled={disabled} value={value} onChange={onChange} addonAfter={<FullscreenOutlined onClick={() => setVisible(true)} />} {...props} />
      </Tooltip>
    </div>
  );
}
