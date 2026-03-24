import React, { useState, useRef, useEffect, ReactNode } from 'react';
import './index.less';

interface PanelProps {
  children?: ReactNode;
  defaultSize?: string | number;
  min?: string | number;
  max?: string | number;
}

interface SplitterProps {
  children: [ReactNode, ReactNode];
  className?: string;
  style?: React.CSSProperties;
}

const Panel: React.FC<PanelProps> = ({ children }) => {
  return <>{children}</>;
};

const Splitter: React.FC<SplitterProps> & { Panel: typeof Panel } = ({ children, className, style }) => {
  const [leftWidth, setLeftWidth] = useState<number>(50); // 百分比
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      const percentage = (offsetX / containerRect.width) * 100;

      // 限制范围在 10% 到 90% 之间
      const newWidth = Math.min(Math.max(percentage, 10), 90);
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const [leftPanel, rightPanel] = React.Children.toArray(children);

  return (
    <div ref={containerRef} className={`n9e-splitter ${className || ''} ${isDragging ? 'n9e-splitter-dragging' : ''}`} style={style}>
      <div className='n9e-splitter-panel n9e-splitter-panel-left' style={{ width: `${leftWidth}%` }}>
        {leftPanel}
      </div>
      <div className='n9e-splitter-resizer' onMouseDown={handleMouseDown}>
        <div className='n9e-splitter-resizer-bar' />
      </div>
      <div className='n9e-splitter-panel n9e-splitter-panel-right' style={{ width: `${100 - leftWidth}%` }}>
        {rightPanel}
      </div>
    </div>
  );
};

Splitter.Panel = Panel;

export default Splitter;
