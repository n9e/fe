import { create } from 'zustand';
import { Node } from '@xyflow/react';

interface NodeResizeState {
  // 当前选中的节点
  selectedNodes: Node[];
  // 是否正在调整大小
  isResizing: boolean;
  // 调整大小的模式（批量或单个）
  resizeMode: 'batch' | 'single';
  // 调整大小的方向
  resizeDirection: 'horizontal' | 'vertical' | 'both' | null;
  // 调整大小的起始位置
  startPosition: { x: number; y: number } | null;
  // 调整大小的起始尺寸
  startSizes: Map<string, { width: number; height: number }>;

  // Actions
  setSelectedNodes: (nodes: Node[]) => void;
  setIsResizing: (isResizing: boolean) => void;
  setResizeMode: (mode: 'batch' | 'single') => void;
  setResizeDirection: (direction: 'horizontal' | 'vertical' | 'both' | null) => void;
  setStartPosition: (position: { x: number; y: number } | null) => void;
  setStartSizes: (sizes: Map<string, { width: number; height: number }>) => void;
  resetResizeState: () => void;
}

const initialState = {
  selectedNodes: [],
  isResizing: false,
  resizeMode: 'single' as const,
  resizeDirection: null as 'horizontal' | 'vertical' | 'both' | null,
  startPosition: null,
  startSizes: new Map<string, { width: number; height: number }>(),
};

export const useNodeResizeStore = create<NodeResizeState>((set) => ({
  ...initialState,

  setSelectedNodes: (nodes) => set({ selectedNodes: nodes }),

  setIsResizing: (isResizing) => set({ isResizing }),

  setResizeMode: (mode) => set({ resizeMode: mode }),

  setResizeDirection: (direction) => set({ resizeDirection: direction }),

  setStartPosition: (position) => set({ startPosition: position }),

  setStartSizes: (sizes) => set({ startSizes: sizes }),

  resetResizeState: () =>
    set({
      isResizing: false,
      resizeDirection: null,
      startPosition: null,
      startSizes: new Map(),
    }),
}));

// 选择器函数，用于优化性能
export const selectSelectedNodes = (state: NodeResizeState) => state.selectedNodes;
export const selectIsResizing = (state: NodeResizeState) => state.isResizing;
export const selectResizeMode = (state: NodeResizeState) => state.resizeMode;
export const selectResizeDirection = (state: NodeResizeState) => state.resizeDirection;
export const selectStartPosition = (state: NodeResizeState) => state.startPosition;
export const selectStartSizes = (state: NodeResizeState) => state.startSizes;
