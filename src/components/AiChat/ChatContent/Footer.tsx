import React from 'react';

interface IProps {
  children: React.ReactNode;
}

export default function Footer(props: IProps) {
  const { children } = props;
  return <div className='ai-chat-footer'>{children}</div>;
}
