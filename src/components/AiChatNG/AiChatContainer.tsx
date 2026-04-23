import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Drawer } from 'antd';

import { useAiChatContext } from './context';
import FloatingPanel from './components/FloatingPanel';
import { usePersistentPortal } from './components/usePersistentPortal';
import AiChat from './index';
import { buildPageFrom } from './recommend';

interface IAiChatContainerProps {
  drawerWidth?: number;
  floatingStorageKey?: string;
}

export default function AiChatContainer(props: IAiChatContainerProps) {
  const { drawerWidth = 900, floatingStorageKey = 'ai-chat-floating-panel' } = props;
  const { visible, mode, closeAiChat, queryPageFrom, queryAction, promptList, onExecuteQueryForQueryContent } = useAiChatContext();

  const DRAWER_MIN_WIDTH = 440;
  const DRAWER_WIDTH_STORAGE_KEY = 'ai-chat-drawer-width';

  const drawerSlotRef = useRef<HTMLDivElement | null>(null);
  const floatingSlotRef = useRef<HTMLDivElement | null>(null);
  const { setHost, render: renderPortal } = usePersistentPortal();

  const lastPageFromRef = useRef(queryPageFrom);
  useEffect(() => {
    if (queryPageFrom) {
      lastPageFromRef.current = queryPageFrom;
    }
  }, [queryPageFrom]);

  useEffect(() => {
    if (visible && !lastPageFromRef.current) {
      lastPageFromRef.current = buildPageFrom();
    }
  }, [visible]);

  const getDrawerMaxWidth = useCallback(() => {
    if (typeof window === 'undefined') return Math.max(DRAWER_MIN_WIDTH, drawerWidth);
    return Math.max(DRAWER_MIN_WIDTH, window.innerWidth - 80);
  }, [drawerWidth]);

  const initialDrawerWidth = useMemo(() => {
    if (typeof window === 'undefined') return Math.max(DRAWER_MIN_WIDTH, drawerWidth);
    const cached = Number(window.localStorage.getItem(DRAWER_WIDTH_STORAGE_KEY));
    if (Number.isFinite(cached) && cached > 0) {
      return Math.min(Math.max(DRAWER_MIN_WIDTH, cached), getDrawerMaxWidth());
    }
    return Math.min(Math.max(DRAWER_MIN_WIDTH, drawerWidth), getDrawerMaxWidth());
  }, [drawerWidth, getDrawerMaxWidth]);

  const [drawerWidthState, setDrawerWidthState] = useState<number>(initialDrawerWidth);
  const drawerWidthRef = useRef(drawerWidthState);

  useEffect(() => {
    drawerWidthRef.current = drawerWidthState;
  }, [drawerWidthState]);

  useEffect(() => {
    setDrawerWidthState((previous) => {
      const next = Math.min(Math.max(DRAWER_MIN_WIDTH, previous), getDrawerMaxWidth());
      return next;
    });
  }, [getDrawerMaxWidth]);

  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const clampDrawerWidth = useCallback(
    (nextWidth: number) => {
      const maxW = getDrawerMaxWidth();
      return Math.min(Math.max(DRAWER_MIN_WIDTH, nextWidth), maxW);
    },
    [getDrawerMaxWidth],
  );

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = drawerWidthState;
      document.body.style.userSelect = 'none';
    },
    [drawerWidthState],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const dx = e.clientX - startXRef.current;
      // Drawer 在右侧，拖拽左边界：向左拖（dx < 0）应增大宽度
      const nextWidth = clampDrawerWidth(startWidthRef.current - dx);
      setDrawerWidthState(nextWidth);
    };

    const onMouseUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      document.body.style.userSelect = '';
      try {
        window.localStorage.setItem(DRAWER_WIDTH_STORAGE_KEY, String(drawerWidthRef.current));
      } catch {
        // ignore
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [clampDrawerWidth, drawerWidthState]);

  const drawerContent = useCallback(
    (content: React.ReactNode) => {
      return (
        <div className='relative h-full min-h-0'>
          <div
            className={[
              'absolute left-[-16px] top-0 bottom-0 z-10 flex w-3 items-center justify-center',
              'cursor-[w-resize]',
              "after:content-[''] after:block after:h-9 after:w-1 after:rounded-sm after:bg-transparent after:transition-colors after:duration-150",
              'hover:after:bg-black/30',
            ].join(' ')}
            onMouseDown={startResize}
          />
          {content}
        </div>
      );
    },
    [startResize],
  );

  // 新模式：渲染单一 AiChat 实例，通过原生 DOM 在宿主间搬运
  const ensuredPageFrom = queryPageFrom ?? lastPageFromRef.current;

  const aichatContent = (
    <div className='ai-chat-container h-full min-h-0'>
      {ensuredPageFrom && (
        <AiChat
          key={`${ensuredPageFrom.url}-${JSON.stringify(ensuredPageFrom.param ?? {})}-${JSON.stringify(queryAction ?? {})}`}
          showClose
          onClose={closeAiChat}
          queryPageFrom={ensuredPageFrom}
          queryAction={queryAction}
          promptList={promptList}
          onExecuteQueryForQueryContent={onExecuteQueryForQueryContent}
        />
      )}
    </div>
  );

  const drawerSlotCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      drawerSlotRef.current = node;
      if (mode === 'drawer' && node) {
        setHost(node);
      }
    },
    [mode, setHost],
  );

  const floatingSlotCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      floatingSlotRef.current = node;
      if (mode === 'floating' && node) {
        setHost(node);
      }
    },
    [mode, setHost],
  );

  useEffect(() => {
    const target = mode === 'drawer' ? drawerSlotRef.current : floatingSlotRef.current;
    if (target) {
      setHost(target);
    }
  }, [mode, setHost]);

  const renderedAiChat = renderPortal(aichatContent);

  return (
    <>
      {renderedAiChat}

      <Drawer
        placement='right'
        width={drawerWidthState}
        visible={visible && mode === 'drawer'}
        onClose={closeAiChat}
        closable={false}
        destroyOnClose={false}
        forceRender
        zIndex={1001}
        bodyStyle={{ padding: 16 }}
      >
        {drawerContent(<div ref={drawerSlotCallbackRef} className='h-full min-h-0' />)}
      </Drawer>

      <FloatingPanel visible={visible && mode === 'floating'} storageKey={floatingStorageKey}>
        <div className='p-4 h-full min-h-0'>
          <div ref={floatingSlotCallbackRef} className='h-full min-h-0' />
        </div>
      </FloatingPanel>
    </>
  );
}
