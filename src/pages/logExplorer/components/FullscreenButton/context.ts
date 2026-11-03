import { createContext } from 'react';

export const FullscreenContext = createContext<{
  viewModalVisible: boolean;
  setViewModalVisible: (visible: boolean) => void;
} | null>(null);
