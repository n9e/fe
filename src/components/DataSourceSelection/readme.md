# 数据源选择组件

`DataSourceSelection` 是公共数据源选择组件的集合目录，包含三个同级、可独立使用的组件。各组件从自己的子目录直接导入；业务方负责布局、类型筛选和选择联动。

| 组件                 | 展示形态           | 选择方式       |
| -------------------- | ------------------ | -------------- |
| `DataSourceTypeList` | 数据源类型卡片列表 | 类型单选       |
| `DataSourceList`     | 数据源实例卡片列表 | 实例单选       |
| `DataSourceSelect`   | 数据源实例下拉框   | 实例单选或多选 |

```tsx
import DataSourceTypeList from '@/components/DataSourceSelection/DataSourceTypeList';
import DataSourceList from '@/components/DataSourceSelection/DataSourceList';
import DataSourceSelect from '@/components/DataSourceSelection/DataSourceSelect';
import type { DataSourcePickerSource, DataSourcePickerType } from '@/components/DataSourceSelection/types';
```

三个组件各自加载所需样式，不依赖其他组件包裹。集合目录不提供统一转发入口。

## 业务方组合

父页面管理类型和选中值，提前筛选数据源；类型切换时是否清空、保留或恢复历史选择，由业务方决定。下面示例在切换类型时清空实例，并通过 `key` 重置卡片列表的搜索状态：

```tsx
const currentSources = sources.filter((source) => source.type === selectedType);

<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
  <DataSourceTypeList
    types={types}
    value={selectedType}
    onChange={(type) => {
      setSelectedType(type);
      setSelectedSource(undefined);
    }}
  />
  <DataSourceList key={selectedType} sources={currentSources} value={selectedSource?.id} onChange={setSelectedSource} />
</div>;
```

需要下拉形式时，将实例卡片列表替换为 `DataSourceSelect`；不需要选择实例的虚拟类型，由业务方隐藏实例组件。下拉框的单选、多选及表单接入见 [DataSourceSelect 使用说明](./DataSourceSelect/readme.md)。

## 类型列表

```tsx
<DataSourceTypeList types={types} value={selectedType} onChange={setSelectedType} />
```

类型格式为 `{ value: string, label: ReactNode, icon?: ReactNode }`。可通过 `typeFilter` 筛选类型，通过 `disabled` 禁止更换类型。

## 实例卡片列表

```tsx
<DataSourceList sources={sources} value={selectedSource?.id} onChange={setSelectedSource} />
```

数据源格式为 `{ id: string | number, name: string, type: string, raw: T, icon?: ReactNode, disabled?: boolean, status?: string }`。

独立列表直接展示传入的全部实例，不要求传入类型，也不按 `type` 过滤。需要只展示某一类时，由调用方提前过滤。当前值与数据源 ID 的类型必须一致；同一列表内 ID 应唯一。`onChange` 返回完整的数据源对象，业务数据可从 `source.raw` 读取。

列表自带名称搜索、长名称提示、选中状态、禁用与缺失数据源展示。可选参数如下：

| 参数                                     | 用途                                       |
| ---------------------------------------- | ------------------------------------------ |
| `loading`、`error`                       | 加载中与加载失败状态                       |
| `onSearch(query)`                        | 400ms 防抖的远程搜索回调；不传时仅本地搜索 |
| `onRefresh()`、`refreshing`              | 刷新按钮及刷新状态，支持异步回调           |
| `onAccess()`                             | 显示数据接入按钮                           |
| `fallbackIcon`                           | 实例未提供图标时的默认图标                 |
| `emptyDescription`、`noMatchDescription` | 自定义空列表和搜索无匹配提示               |
| `disabled`                               | 禁止更换实例；搜索、刷新与接入入口仍可用   |

缺失占位只表示当前 `sources` 不包含选中的 ID；远程搜索和分页调用方需保留已选数据源，并自行确认其真实删除状态。

## 样式与依赖

- 类型列表作用域是 `.data-source-type-list-box`，实例卡片列表作用域是 `.data-source-list-box`；各自导入所在目录的 `style.less`。
- 保留 36px 卡片高度、8px 圆角、选中边框、禁用与删除状态、名称省略、168px 滚动区域及底部渐变。实例按容器宽度使用 6 / 4 / 2 / 1 列。
- 下拉框使用独立的 `.data-source-selection-select-box` 等作用域，包含选择框、下拉 portal、选项、标签和提示的样式。
- 颜色沿用项目的 `--fc-*` 主题变量，滚动条样式由实例列表自己提供。
- 仍依赖 React、Ant Design、图标库、`classnames`、`react-i18next`；卡片提示使用 Ant Design Tooltip，不依赖 SRM 专用 Tooltip。类型和卡片列表使用 `dataSourceSelection` namespace，下拉框使用 `dataSourceSelectionSelect` namespace，由项目的国际化扫描机制注册。
- 卡片名称显式继承卡片颜色，避免融合后旧选择器的裸样式覆盖整体禁用颜色。卡片 Tooltip 保留长名称才显示、150ms 延时和独立样式作用域。缺失提示参与布局，避免长文案覆盖 ID。

## 验证

在仓库根目录执行：

```sh
npx jest --runInBand --runTestsByPath \
  src/components/DataSourceSelection/integration.test.tsx \
  src/plus/pages/DiallAnalysis/pages/AddDial/BaseInfo.test.tsx \
  src/plus/pages/DiallAnalysis/pages/AddDial/index.test.tsx \
  src/plus/pages/DiallAnalysis/services/index.test.ts
```

## 融合与维护

此目录包含完整的三个组件、类型及两套局部 locales。当前 `integrate.js` 会保留 n9e 已有的同名目录，融合后的 SRM 与 n9e 业务都会引用这里的组件，不需要修改融合脚本。后续调整公共接口或组件实现时，应同步检查两仓版本。

n9e 的候选接口可能按权限过滤，因此卡片列表及 Select 的缺失提示统一为“已删除或无权访问”，始终保留原始 ID。使用远程搜索或分页时，调用方仍需补齐已选实例，避免把未返回误判为缺失。
