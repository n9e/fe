import React, { ReactNode, useState, isValidElement } from 'react';
import { copy2ClipBoard } from '@/utils';
import './index.less';
interface Props {
  children: ReactNode;
}

// 目前不能放入太复杂的结构，支持的类型 e.g.
//  <Code>123</Code>
//  <Code><span>123</span></Code>
//  <Code>
//    <pre>curl -X POST \</pre>
//    <pre>http://yunyan.flashcat.cloud/v1/event/push \</pre>
//  </Code>
export default function Code(props: Props) {
  const { children } = props;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    if (!isValidElement(children) && typeof children === 'string') {
      copy2ClipBoard(children, true);
    } else if (isValidElement(children) && typeof (children.props as any).children === 'string') {
      copy2ClipBoard((children.props as any).children, true);
    } else if (Array.isArray(children)) {
      let text = '';
      children.forEach((item: ReactNode) => {
        if (isValidElement(item) && typeof item.props.children === 'string') {
          text += item.props.children + '\n';
        }
      });
      copy2ClipBoard(text, true);
    }
  };

  return (
    <div className='code-area'>
      <span className='code-text'>{children}</span>
      <span className='copy-btn' onClick={handleCopy}>
        {copied ? '复制成功' : '复制'}
      </span>
    </div>
  );
}
