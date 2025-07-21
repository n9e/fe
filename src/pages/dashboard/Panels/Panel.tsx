import React, { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function Panel(props: Props) {
  const { children } = props;
  const containerEleRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState<number>(0);

  useEffect(() => {
    if (containerEleRef.current) {
      setPanelWidth(containerEleRef.current.clientWidth);
    }
  }, []);

  return (
    <div className='w-full h-full' ref={containerEleRef}>
      {panelWidth
        ? React.cloneElement(children as React.ReactElement, {
            panelWidth,
          })
        : null}
    </div>
  );
}
