import { useSize } from 'ahooks';
import React, { useRef } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function Panel(props: Props) {
  const { children } = props;
  const containerEleRef = useRef<HTMLDivElement>(null);
  const containerEleSize = useSize(containerEleRef);

  return (
    <div className='w-full h-full' ref={containerEleRef}>
      {containerEleSize?.width
        ? React.cloneElement(children as React.ReactElement, {
            panelWidth: containerEleSize.width,
          })
        : null}
    </div>
  );
}
