import React, { useContext, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

interface IHocLayer {
  key: string;
  node: React.ReactNode;
}

export interface HocRendererHandle {
  push: (key: string, node: React.ReactNode) => void;
  remove: (key: string) => void;
  clear: () => void;
  size: () => number;
}

export const hocRendererRef = React.createRef<HocRendererHandle>();

/** 每叠加一层，下层向内平移的距离，与 antd Drawer push 的默认值保持一致 */
const PUSH_DISTANCE = 180;
const BASE_Z_INDEX = 1000;
const Z_INDEX_STEP = 10;

const LayerContext = React.createContext({ index: 0, total: 1 });

/**
 * 栈内 Drawer 按所在层级取 zIndex 与层叠位移。
 * antd 自带的 push 依赖 DrawerContext 建立父子关系，而栈内各层是兄弟节点连不上，故在此复刻同样的位移。
 * 栈外直接渲染的组件读到默认值（单层），行为与改造前一致。
 */
export function useHocLayer(placement: 'left' | 'right' = 'right') {
  const { index, total } = useContext(LayerContext);
  return useMemo(() => {
    const covered = total - 1 - index;
    const distance = covered * PUSH_DISTANCE;
    return {
      isBottom: index === 0,
      isTop: covered === 0,
      zIndex: BASE_Z_INDEX + index * Z_INDEX_STEP,
      style: {
        transform: distance ? `translateX(${placement === 'left' ? distance : -distance}px)` : undefined,
        transition: 'transform 0.3s',
      } as React.CSSProperties,
    };
  }, [index, total, placement]);
}

export default function HocRenderer() {
  const [stack, setStack] = useState<IHocLayer[]>([]);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  useImperativeHandle(
    hocRendererRef,
    () => ({
      push: (key, node) => setStack((prev) => [...prev, { key, node }]),
      remove: (key) => setStack((prev) => prev.filter((item) => item.key !== key)),
      clear: () => setStack([]),
      size: () => stackRef.current.length,
    }),
    [],
  );

  const container = document.getElementById('hoc-renderer-root');
  if (!container || stack.length === 0) return null;

  return ReactDOM.createPortal(
    stack.map((item, index) => (
      <LayerContext.Provider key={item.key} value={{ index, total: stack.length }}>
        {item.node}
      </LayerContext.Provider>
    )),
    container,
  );
}

export interface ICreatePortalLauncherProps {
  visible: boolean;
  destroy: () => void;
}

let layerSeed = 0;

export function CreatePortalLauncher<T extends object>(WrappedComponent: React.FC<T & ICreatePortalLauncherProps>): (props: T & { language: string }) => { destroy: () => void } {
  return function (props: T & { language: string }) {
    if (!hocRendererRef.current) {
      console.warn('HocRenderer ref is not attached yet.');
      return {
        destroy: () => {},
      };
    }

    layerSeed += 1;
    const key = `hoc-layer-${layerSeed}`;
    // 只弹掉自己这一层，下层保持挂载，关闭后可继续查看
    const destroy = () => {
      hocRendererRef.current?.remove(key);
    };

    hocRendererRef.current.push(key, <WrappedComponent {...(props as T)} visible destroy={destroy} />);

    return {
      destroy,
    };
  };
}

/** 离开当前页面等场景下，一次性关掉所有叠加的抽屉 */
export function destroyAllPortalLayers() {
  hocRendererRef.current?.clear();
}

/** 当前已叠加的层数，供"URL 只由最外层维护"之类的判断使用 */
export function getPortalLayerCount() {
  return hocRendererRef.current?.size() ?? 0;
}
