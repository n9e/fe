# 数据源 Select

独立的受控数据源下拉选择器，支持单选、多选、搜索、刷新和新增。位于公共 `DataSourceSelection` 目录，可由各业务页面直接引用。

## 单选

```tsx
import DataSourceSelect from '@/components/DataSourceSelection/DataSourceSelect';
import type { DataSourceSelectValue } from '@/components/DataSourceSelection/DataSourceSelect/types';

const [sourceId, setSourceId] = useState<DataSourceSelectValue>();

<DataSourceSelect
  label='数据源'
  sources={sources}
  types={types}
  value={sourceId}
  onChange={(id, source) => {
    setSourceId(id);
    // source?.raw 为业务数据；清空时 id 和 source 均为 undefined。
  }}
  onRefresh={reloadSources}
  onAdd={openCreateDataSource}
/>;
```

## 多选

```tsx
const [sourceIds, setSourceIds] = useState<DataSourceSelectValue[]>([]);

<DataSourceSelect
  mode='multiple'
  showSelectAll
  sources={sources}
  types={types}
  value={sourceIds}
  onChange={(ids, selectedSources) => setSourceIds(ids)}
  onRefresh={reloadSources}
  onAdd={openCreateDataSource}
/>;
```

`showSelectAll` 仅支持多选，默认不显示。开启后，下拉顶部提供全选复选框和半选状态，范围始终为传入 `sources` 中全部可用项，不受本地搜索影响。全选追加尚未选中的可用项；取消全选清空全部已选项，包括禁用项和已删除 ID。禁用项和已删除项可以通过已选标签的关闭按钮移除，但不能重新勾选。组件禁用、加载、刷新、出错或没有可用项时，全选不可操作。

也可直接放在 `<Form.Item name='data_source_id'>` 或 `<Form.Item name='data_source_ids'>` 内，由 Form 注入 `value`、`onChange`。组件不主动调用业务接口。

## 数据与选项展示

`sources` 沿用旧选择器的数据结构：

```tsx
const sources = [
  {
    id: 1,
    name: 'prod-prometheus',
    type: 'prometheus',
    raw: originalSource,
    disabled: true,
    disabledReason: '维护期间停用',
    extra: <RecommendIcon />,
  },
];

const types = [{ value: 'prometheus', label: 'Prometheus Like', icon: prometheusIcon }];
```

- 下拉选项左侧为图标和名称，右侧为类型名称与状态；已选值保留图标、名称和状态。
- `source.extra` 可在下拉选项名称旁展示推荐标记等附加内容，已选值和多选标签中不展示。
- `types` 为可选展示配置，不会过滤数据源。图标优先使用 `source.icon`，其次使用对应类型图标。
- 类型名称优先使用 `source.typeLabel`，其次使用类型配置的 `label`，最后回退到 `source.type`。
- `disabled` 优先决定禁用状态；未指定时，存在且不为 `enabled` 的 `status` 视为禁用。
- 禁用项仍展示，悬停可查看 `disabledReason`，不能新增选择。已选禁用项允许移除或清空。
- 搜索在完整的 `sources` 内按名称、ID、类型和文本类型名称过滤，不会因为搜索未命中而标记删除。

## 删除与加载状态

加载成功后，已选 ID 不在 `sources` 中时会显示 `ID: xxx` 和红色“已删除或无权访问”，保留原始 ID，不触发自动清空。多选标签可独立移除这些无效项。

传入 `loading`、`refreshing` 或 `error` 时，不会把缺失 ID 标记为已删除。调用方需要提供完整候选列表；如果使用接口分页或远程过滤，应将当前已选的数据源补入 `sources`，再由接口确认真实删除状态。

ID 保留原始类型，数字 `0` 是有效值，数字 `1` 与字符串 `'1'` 不会相互替代。同一列表的 ID 应唯一。多选 `onChange` 的第一参数始终包含全部选中 ID，第二参数只包含当前 `sources` 中能找到的实例。

## 标题与操作栏

- 可选 `label` 展示在选择框上方左侧；刷新、数据接入按钮在同一行右侧，选择框占满下一行。
- 传入 `onRefresh` 后显示“刷新”，传入 `onAdd` 后显示“数据接入”；两者均为 24px 高的图标加文字按钮。
- 使用组件 `label` 时，外层 `Form.Item` 不再重复设置同名 label，校验仍由 Form 管理。组件优先使用传入的 `id`，未传时生成 ID，将标题与输入框关联。
- 两个回调支持返回 Promise，执行期间相应按钮显示 loading 并防止重复点击；失败后显示提示并恢复按钮。
- 内部刷新失败后，父组件提供新的 `sources` 数组，或结束 `loading`／`refreshing` 且没有 `error` 时，会清除内部失败状态；父组件仍需准确传入加载和错误状态。
- 刷新、新增后的列表由父组件通过 `sources` 更新。新增回调可以打开新增弹窗或跳转到接入页面。
- `disabled` 会禁止选择、清空、标签移除和两个操作按钮。
- 组件自带独立样式作用域，选择框、下拉 portal、选项、标签和提示分别隔离，使用项目 `--fc-*` 主题变量。
- 文案位于当前目录的 `locales`，使用 `dataSourceSelectionSelect` namespace。

## 验证

```sh
npx jest --runInBand --runTestsByPath \
  src/plus/pages/DiallAnalysis/pages/AddDial/BaseInfo.test.tsx \
  src/plus/pages/DiallAnalysis/pages/AddDial/index.test.tsx \
  src/plus/pages/DiallAnalysis/services/index.test.ts
```

## n9e 接入说明

组件实现与 SRM `src/components/DataSourceSelection/DataSourceSelect` 同步。此仓库已包含完整的类型列表、实例卡片列表和 Select，可按需分别引用。

拨测 brief 接口会按权限过滤，因此此仓库将缺失提示调整为“已删除或无权访问”。加载与刷新逻辑由业务调用方负责，已选值始终保留原始 ID。
