/**
 * React 18 升级 — 第三方库类型兼容补丁
 *
 * @types/react@18 类型更严格，导致部分第三方库（未及时更新类型）出现误报。
 * 此文件通过 module augmentation 提供类型兼容性补丁。
 */

import 'react-draggable';
import 'react-sortable-hoc';
import 'antd';
import 'rc-segmented';
import type { ChangeEvent } from 'react';

/* ===== react-draggable =====
 * Draggable 是 class 组件，使用 Partial<DraggableProps>，
 * React 18 的 JSX.LibraryManagedAttributes 对 class defaultProps 检查更严格，
 * 导致 DraggableDefaultProps 中的字段被视为必需。添加可选声明解决。
 */
declare module 'react-draggable' {
  interface DraggableProps {
    axis?: 'both' | 'x' | 'y' | 'none';
    bounds?: any;
    defaultClassName?: string;
    defaultClassNameDragging?: string;
    defaultClassNameDragged?: string;
    defaultPosition?: any;
    positionOffset?: any;
    onDrag?: any;
    onMouseDown?: any;
    onStop?: any;
    grid?: any;
    scale?: number;
    cancel?: string;
    offsetParent?: HTMLElement;
    handle?: string;
    nonce?: string;
  }
}

/* ===== react-sortable-hoc =====
 * SortableContainer / SortableElement 的 Props 类型未声明 children，
 * React 18 的 JSX 检查要求 children 在 Props 类型中显式声明。
 */
declare module 'react-sortable-hoc' {
  interface SortableContainerProps {
    children?: React.ReactNode;
  }
  interface SortableElementProps {
    children?: React.ReactNode;
  }
}

/* ===== antd Segmented =====
 * SegmentedProps 继承 RCSegmentedProps → Omit<React.HTMLProps<HTMLDivElement>, 'onChange'>，
 * React 18 新增 onPointerEnterCapture / onPointerLeaveCapture 到 DOMAttributes，
 * 使 JSX 检查误报这些属性缺失。添加可选声明解决。
 */
declare module 'rc-segmented' {
  interface SegmentedProps {
    onPointerEnterCapture?: React.PointerEventHandler<HTMLDivElement>;
    onPointerLeaveCapture?: React.PointerEventHandler<HTMLDivElement>;
  }
}

/* ===== antd Input =====
 * React 18 中 React.Key 类型包含 bigint，
 * 而 InputProps.value 原本只接受 string | number | readonly string[]，
 * 扩宽以兼容 selectedKeys[0]（类型为 Key）直接赋值给 <Input value={...} />。
 */
declare module 'antd' {
  export interface InputProps {
    value?: string | number | readonly string[] | bigint;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  }
}

/* ===== antd Input.TextArea =====
 * 同上，TextAreaProps.value 一并扩宽。
 */
declare module 'antd/es/input/TextArea' {
  export interface TextAreaProps {
    value?: string | number | readonly string[] | bigint;
  }
}

/* ===== antd Form =====
 * React 18 中 TypeScript 编译器内置检查（TS2746）对 children: ReactNode 的组件
 * 传入多个兄弟节点会报错。FormProps 的 children 扩宽为 ReactNode | ReactNode[]，
 * 使 isArrayOrTupleLikeType 判断为真从而绕过检查。
 * 注：ModalProps 因类型交叉（typeof OriginModal & ModalStaticFunctions & {...}) 导致
 * 同一 augmentation 不生效，改用 <> 包裹多 children。
 */
declare module 'antd/lib/form/Form' {
  interface FormProps {
    children?: React.ReactNode | React.ReactNode[];
  }
}
