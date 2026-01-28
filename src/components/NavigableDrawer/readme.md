## NavigableDrawer

该组件支持Antd Drawer的全部props，并且支持上下键导航，有以下4个props，业务组件内的行为可以自己定义

```
hasPrev?: boolean;
hasNext?: boolean;
onPrev?: () => void;
onNext?: () => void;
```
组件内默认关闭了mask=false，所以点击左侧内容不会关闭抽屉，需要手动关闭。

```
const drawerRef = useRef<HTMLDivElement>(null);

  useClickAway(
    () => {
        setOpen(false);
    },
    [drawerRef],
    ['click'],
  );

// 然后把drawerRef 挂到需要点击关闭的div上
```
