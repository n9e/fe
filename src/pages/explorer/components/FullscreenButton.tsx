import React from 'react';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';

// 创建 Context
const FullscreenContext = React.createContext<{
  viewModalVisible: boolean;
  setViewModalVisible: (visible: boolean) => void;
} | null>(null);

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
    <span
      className='cursor-pointer'
      onClick={() => {
        setViewModalVisible(!viewModalVisible);
      }}
    >
      {!viewModalVisible ? <FullscreenOutlined /> : <FullscreenExitOutlined />}
    </span>
  );
}

function Provider(props: { children: React.ReactNode }) {
  const [viewModalVisible, setViewModalVisible] = React.useState(false);

  return (
    <FullscreenContext.Provider value={{ viewModalVisible, setViewModalVisible }}>
      <div className={'flex flex-col min-h-0' + (viewModalVisible ? ' n9e-logs-view-modal' : '')}>{props.children}</div>
    </FullscreenContext.Provider>
  );
}

FullscreenButton.Provider = Provider;
