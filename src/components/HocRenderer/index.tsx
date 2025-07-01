import React, { useImperativeHandle, useState } from 'react';
import ReactDOM from 'react-dom';

export interface HocRendererHandle {
  render: (node: React.ReactNode) => void;
  clear: () => void;
}

export const hocRendererRef = React.createRef<HocRendererHandle>();

export default function HocRenderer() {
  const [element, setElement] = useState<React.ReactNode>(null);

  useImperativeHandle(hocRendererRef, () => ({
    render: (node) => setElement(node),
    clear: () => setElement(null),
  }));

  const container = typeof window !== 'undefined' ? document.getElementById('hoc-renderer-root') : null;

  return <div id='hoc-renderer-root'>{element && container ? ReactDOM.createPortal(element, container) : null}</div>;
}

function destroy() {
  if (!hocRendererRef?.current) {
    console.warn('HocRenderer ref is not attached yet.');
    return;
  }
  hocRendererRef.current.clear();
}

export interface ICreatePortalLauncherProps {
  visible: boolean;
  destroy: () => void;
}

export function CreatePortalLauncher<T extends object>(WrappedComponent: React.FC<T & ICreatePortalLauncherProps>): (props: T & { language: string }) => { destroy: () => void } {
  return function (props: T & { language: string }) {
    if (!hocRendererRef.current) {
      console.warn('HocRenderer ref is not attached yet.');
    } else {
      const childProps = { ...props, visible: true, destroy };
      hocRendererRef?.current?.render(<WrappedComponent {...childProps} />);
    }
    return {
      destroy,
    };
  };
}
