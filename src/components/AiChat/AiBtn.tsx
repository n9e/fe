import { Tooltip } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const Drag_Threshold = 5;

interface IProps {
  onOpen: () => void;
}

export default function AiBtn(props: IProps) {
  const { t } = useTranslation('aiChat');
  const { onOpen } = props;

  const rafRef = useRef<number | null>(null);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startRight: 0,
    startBottom: 0,
    moved: false,
    dragging: false,
  });

  const [position, setPosition] = useState<{ right: number; bottom: number }>({ right: 25, bottom: 25 });
  const [draggingUI, setDraggingUI] = useState<boolean>(false);

  // 拖拽相关处理

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRight: position.right,
      startBottom: position.bottom,
      moved: false,
      dragging: true,
    };
    setDraggingUI(true);

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;

    const { startX, startY, startRight, startBottom } = dragRef.current;
    const dx = startX - e.clientX;
    const dy = startY - e.clientY;

    if (!dragRef.current.moved && (Math.abs(dx) > Drag_Threshold || Math.abs(dy) > Drag_Threshold)) {
      dragRef.current.moved = true;
    }

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        // if (pendingPosRef.current) {
        //   setPosition(pendingPosRef.current);
        //   pendingPosRef.current = null;
        // }

        setPosition({
          right: Math.max(0, startRight + dx),
          bottom: Math.max(0, startBottom + dy),
        });
        rafRef.current = null;
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = false;
    setDraggingUI(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 如果发生了拖拽移动，不触发点击事件
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onOpen();
  };

  return (
    <>
      <div
        className='ai-chat-btn-box'
        onClick={handleClick}
        style={{
          right: `${position.right}px`,
          bottom: `${position.bottom}px`,
          cursor: draggingUI ? 'grabbing' : 'grab',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <Tooltip title={t('aiBtn')} placement='left' getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}>
          <div className='ai-chat-btn'>
            <img src={'/image/ai-chat/ai_chat_icon.svg'} className='ai-chat-icon' />
            <img src={'/image/ai-chat/ai.gif'} className='ai-chat-gif' />
          </div>
        </Tooltip>
      </div>
    </>
  );
}
