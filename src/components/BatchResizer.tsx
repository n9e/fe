import { useCallback, useEffect, useRef } from 'react';
import { NodeResizeControl, Node, useReactFlow } from '@xyflow/react';
import {
  useNodeResizeStore,
  selectSelectedNodes,
  selectIsResizing,
  selectResizeMode,
  selectResizeDirection,
  selectStartPosition,
  selectStartSizes,
} from '../store/useNodeResizeStore';

interface BatchResizerProps {
  nodeId: string;
  nodeWidth: number;
  nodeHeight: number;
  onResize: (width: number, height: number) => void;
}

export function BatchResizer({ nodeId, nodeWidth, nodeHeight, onResize }: BatchResizerProps) {
  const { getNodes, setNodes } = useReactFlow();
  const resizeControlRef = useRef<HTMLDivElement>(null);

  // 使用状态管理
  const selectedNodes = useNodeResizeStore(selectSelectedNodes);
  const isResizing = useNodeResizeStore(selectIsResizing);
  const resizeMode = useNodeResizeStore(selectResizeMode);
  const resizeDirection = useNodeResizeStore(selectResizeDirection);
  const startPosition = useNodeResizeStore(selectStartPosition);
  const startSizes = useNodeResizeStore(selectStartSizes);

  const { setSelectedNodes, setIsResizing, setResizeMode, setResizeDirection, setStartPosition, setStartSizes, resetResizeState } = useNodeResizeStore();

  const handleResizeStart = useCallback(
    (event: React.MouseEvent) => {
      const nodes = getNodes();
      const selectedNodes = nodes.filter((node) => node.selected);

      setSelectedNodes(selectedNodes);
      setIsResizing(true);
      setResizeMode(selectedNodes.length > 1 ? 'batch' : 'single');
      setResizeDirection('both');
      setStartPosition({ x: event.clientX, y: event.clientY });

      // 记录所有选中节点的初始尺寸
      const initialSizes = new Map<string, { width: number; height: number }>();
      selectedNodes.forEach((node) => {
        initialSizes.set(node.id, {
          width: node.width || 0,
          height: node.height || 0,
        });
      });
      setStartSizes(initialSizes);
    },
    [getNodes, setSelectedNodes, setIsResizing, setResizeMode, setResizeDirection, setStartPosition, setStartSizes],
  );

  const handleResize = useCallback(
    (event: MouseEvent) => {
      if (!isResizing || !startPosition || !startSizes.size) return;

      const deltaX = event.clientX - startPosition.x;
      const deltaY = event.clientY - startPosition.y;

      if (resizeMode === 'batch') {
        const nodes = getNodes();
        const updatedNodes = nodes.map((node) => {
          if (!node.selected) return node;

          const initialSize = startSizes.get(node.id);
          if (!initialSize) return node;

          const newWidth = Math.max(100, initialSize.width + deltaX);
          const newHeight = Math.max(100, initialSize.height + deltaY);

          return {
            ...node,
            width: newWidth,
            height: newHeight,
          };
        });

        setNodes(updatedNodes);
      } else {
        const newWidth = Math.max(100, nodeWidth + deltaX);
        const newHeight = Math.max(100, nodeHeight + deltaY);
        onResize(newWidth, newHeight);
      }
    },
    [isResizing, startPosition, startSizes, resizeMode, getNodes, setNodes, nodeWidth, nodeHeight, onResize],
  );

  const handleResizeEnd = useCallback(() => {
    resetResizeState();
  }, [resetResizeState]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResize, handleResizeEnd]);

  return <NodeResizeControl ref={resizeControlRef} minWidth={100} minHeight={100} onResizeStart={handleResizeStart} onResize={handleResize} onResizeEnd={handleResizeEnd} />;
}
