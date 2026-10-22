import React from 'react';
import IconFont from '@/components/IconFont';
import { Button } from 'antd';
import './style.less';

import { FullscreenContext } from './context';

// 自定义 hook 来使用 Context
const useFullscreen = () => {
  const context = React.useContext(FullscreenContext);
  if (!context) {
    throw new Error('useFullscreen must be used within FullscreenButton.Provider');
  }
  return context;
};

export default function FullscreenButton() {
  const { viewModalVisible, setViewModalVisible } = useFullscreen();

  // esc key listener to close the modal
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && viewModalVisible) {
        setViewModalVisible(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewModalVisible]);

  return (
    <Button
      size='small'
      type='text'
      onClick={() => {
        setViewModalVisible(!viewModalVisible);
      }}
      icon={!viewModalVisible ? <IconFont type='icon-ArrowFullScreen' /> : <IconFont type='icon-ArrowOffScreen' />}
    />
  );
}

/** Own fullscreen state and the results scroll shell without remounting children. */
function Provider(props: { children: React.ReactNode; autoHeight?: boolean }) {
  const [viewModalVisible, setViewModalVisible] = React.useState(false);

  return (
    <FullscreenContext.Provider value={{ viewModalVisible, setViewModalVisible }}>
      <div
        data-log-viewer-shell
        className={'flex flex-col min-h-0' + (props.autoHeight ? ' n9e-log-results-auto-height' : ' h-full') + (viewModalVisible ? ' n9e-logs-view-modal' : ' relative')}
      >
        {props.children}
      </div>
    </FullscreenContext.Provider>
  );
}

FullscreenButton.Provider = Provider;
