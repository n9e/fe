# 在业务页面中嵌入仪表盘

在详情页、侧拉板或标签页中展示站内仪表盘时，直接渲染 `@/pages/dashboard/Detail/Detail`，并传入 `embedded`。这就是网络设备详情「仪表盘」标签页使用的入口。嵌入模式对仪表盘配置只读，仍可查看图表、切换普通变量、调整时间范围、时区和刷新频率。

## 接入普通仪表盘

先在仪表盘中定义业务变量，并让面板查询引用它。下面以 `ident` 为例，实际变量名以目标仪表盘配置为准。普通仪表盘 ID 可从站内 `/dashboards/:id` 链接取得。

```tsx
import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const DashboardDetail = lazy(() => import('@/pages/dashboard/Detail/Detail'));

interface Props {
  dashboardId: string;
  ident: string;
}

export default function ResourceDashboardTab({ dashboardId, ident }: Props) {
  const search = new URLSearchParams({ ident, __from: 'now-1h', __to: 'now' }).toString();

  return (
    <Suspense fallback={<Spin />}>
      <DashboardDetail embedded={{ dashboardId, search }} />
    </Suspense>
  );
}
```

在现有页签内，等侧拉板打开、标签页激活、业务记录和仪表盘 ID 就绪后再挂载。`record.id` 是当前业务记录的标识。用它作为 `key`，同一张仪表盘用于不同记录时也会重新初始化。

```tsx
<Tabs.TabPane key='dashboard' tab='仪表盘'>
  {visible && activeTab === 'dashboard' && record && dashboardId && <ResourceDashboardTab key={record.id} dashboardId={dashboardId} ident={record.ident} />}
</Tabs.TabPane>
```

组件放在应用现有的 React Router 和 `CommonStateContext` 内，沿用当前账号的鉴权与数据源上下文。组件负责加载仪表盘配置和执行面板查询，并提供加载失败后的重试。

## 选择仪表盘来源和变量参数

| 参数                       | 用法                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `embedded.dashboardId`     | 普通仪表盘的 ID，传字符串。                                                                                                                |
| `embedded.builtinUUID`     | 内置组件中仪表盘模板的 payload UUID，传数字。与 `dashboardId` 二选一。                                                                     |
| `embedded.search`          | URL 查询字符串，用于初始变量值和时间设置。变量名直接作键，时间参数用 `__from`、`__to`、`__refresh`（秒）和 `__timezone`。                  |
| `embedded.fixedVariables`  | 按变量名传入固定值，例如 `{ ident }`。已有同名变量会在当前实例里显示为不可编辑的常量。仪表盘配置里缺少同名变量时会跳过。                   |
| `getInitialVariableValues` | 可选回调，接收仪表盘变量定义并返回 `{ [变量名]: 字符串 }`，适合按业务记录推荐数据源。`search` 中的同名参数优先，固定变量始终使用其固定值。 |
| `onLoaded`                 | 可选回调，接收加载并处理后的仪表盘配置。检查变量定义后返回 `true` 继续渲染，返回 `false` 中止本次加载。                                    |
| `onVariablesChange`        | 可选回调，接收当前实例的变量及选项，初始化时可能先收到空数组。需要记录用户选择时，由宿主按业务记录和仪表盘保存。                           |

如果详情里的图表必须始终查询当前对象，把 `ident` 放进 `fixedVariables`。普通仪表盘也支持这个参数。网络设备的内置模板就是用这种方式固定当前设备 IP。

```tsx
<DashboardDetail embedded={{ builtinUUID, fixedVariables: { ident } }} />
```

如果只需预选数据源并允许用户切换，使用 `search` 或 `getInitialVariableValues`。`datasource` 变量传数据源 ID 的字符串形式，`datasourceIdentifier` 变量传数据源的 `identifier`。异步取得的推荐值如果必须参与首次查询，应等它就绪后再挂载。`getInitialVariableValues` 在加载配置时使用。

把 `embedded.search` 当作初始化输入。更改 `embedded` 的序列化值会重建仪表盘运行时。如果用 `onVariablesChange` 保存选择或生成新窗口链接，应将这些值存到宿主自己的状态里，避免回填到当前实例的 `embedded.search` 触发重建。嵌入实例与宿主路由及普通仪表盘的变量、时间范围、时区缓存隔离。

## 侧拉板布局和操作

- 普通页面可以使用组件自带的嵌入高度。需要铺满侧拉板剩余空间时，给 Drawer 内容区明确高度，并将标签页内容区到仪表盘的容器设为纵向 flex。可收缩的中间层设 `flex: 1; min-height: 0`，活动的 tab pane 设 `height: 100%`。在宿主样式作用域内，将 `.dashboard-detail-embedded` 设为 `flex: 1; height: 100%; min-height: 0`，由仪表盘内容区负责滚动。
- 退出标签页时通过条件渲染卸载仪表盘。使用 Ant Design `Drawer` 时可设置 `destroyOnClose`，让关闭侧拉板也卸载正文。
- 「打开完整仪表盘」等业务操作可以放在宿主的 `Tabs.tabBarExtraContent`。嵌入模式使用简化标题栏，`headerLeadingActions` 属于完整详情页标题栏。

## 从链接接入

如果配置里存的是站内 `/dashboards/:id` 链接，解析出 ID 和 `URL.search` 后分别传给 `dashboardId` 和 `search`。URL 中的业务值可用 `URLSearchParams` 编码。生成「打开完整仪表盘」的新窗口地址或保存链接时，使用 `addAppBasePrefix` 处理部署前缀。React Router 的 `<Link to>` 使用应用内路径。

如果业务同时支持外部仪表盘链接，例如 Grafana，可按网络设备的做法由宿主校验 HTTP(S) 地址，再使用带 `title` 的 `<iframe>`。目标站点需要允许当前应用嵌入。网络设备的 `board_url` 占位符替换、SNMP 模板匹配和数据源记忆由网络设备页签管理，其他页面可以直接使用共享详情组件。

## 接入后验证

- 打开标签页后，确认图表查询引用了当前记录的变量值。切换记录或仪表盘后，确认时间、筛选和图表按新实例初始化。
- 切换变量、时间或时区时，确认宿主页面 URL 保留原值，并检查旁边的另一个仪表盘实例和完整详情页的设置。
- 切出标签页或关闭侧拉板后，确认嵌入内容卸载。用窄窗口检查标题、时间控件和内部滚动，用子路径部署检查「打开完整仪表盘」的链接。
- 用实际使用账号检查仪表盘和数据源的访问权限，并验证加载失败时的提示、重试和无数据状态。

## 源码参考

- [共享仪表盘入口及参数](./Detail/Detail.tsx)
- `src/plus/` 子仓库中的接入参考。[网络设备仪表盘页签](../../plus/pages/networkDevices/DetailTabs/Dashboard.tsx) · [详情标签页容器](../../plus/pages/networkDevices/DeviceDetailContent.tsx) · [标签页布局样式](../../plus/pages/networkDevices/style.less)
- [应用部署前缀工具](../../utils/appUrl.ts)
