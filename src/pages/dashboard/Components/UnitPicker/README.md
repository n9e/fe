# CustomUnitPicker

`CustomUnitPicker` 是仪表盘使用的可搜索单位选择器。它基于 Ant Design `AutoComplete`，支持选择内置单位，也支持将用户输入的值作为自定义单位保存。

## 使用

```tsx
import { CustomUnitPicker } from '@/pages/dashboard/Components/UnitPicker';

function UnitField() {
  const [unit, setUnit] = React.useState('sishort');

  return <CustomUnitPicker value={unit} onChange={(nextValue) => setUnit(String(nextValue))} allowClear placeholder='SI short' />;
}
```

也可以直接放在 Ant Design `Form.Item` 中，由表单管理 `value` 和 `onChange`：

```tsx
<Form.Item name='unit'>
  <CustomUnitPicker allowClear placeholder='SI short' hideSIOption />
</Form.Item>
```

## 交互行为

- 搜索会匹配内置单位的名称和本地化描述，默认忽略大小写，并忽略搜索词首尾空格。
- 聚焦时会清空搜索输入，当前单位显示在 placeholder 中，下拉恢复内置选项。
- 输入与内置单位不完全匹配的值时，下拉会出现“使用该自定义单位”选项。选择该选项后才会提交自定义值；输入后直接失焦会丢弃搜索内容。
- 输入内容与内置单位的 `value` 或名称完全匹配时（忽略大小写和首尾空格），不会额外显示自定义单位选项。
- 清空选择遵循 Ant Design Select 语义，通过 `onChange(undefined, undefined)` 提交空值。

自定义单位的选项文案使用 `unitPicker:useCustomUnit` 翻译键，单位值通过 `{{unit}}` 插入。各语言文案位于本目录的 `locale/` 下。

## 属性

组件接收 Ant Design `AutoCompleteProps`，并增加以下属性：

| 属性               | 类型                                    | 默认值  | 说明                                                                                   |
| ------------------ | --------------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `hideOptionLabel`  | `boolean`                               | `false` | 隐藏内置选项中的单位名称，保留描述文本。                                               |
| `hideSIOption`     | `boolean`                               | `false` | 从下拉选项中隐藏 `SI short`（值为 `sishort`）。已保存的 `sishort` 值仍会显示可读名称。 |
| `ajustUnitOptions` | `(units: UnitOption[]) => UnitOption[]` | —       | 调整内置单位选项。属性名沿用现有拼写；`UnitOption` 定义在 `utils.tsx`。                |

其他 `AutoCompleteProps` 可以继续传入，例如 `placeholder`、`allowClear`、`disabled` 和 `onSelect`。注意：`onChange` 不会在每次输入搜索词时触发；只有选择不同的单位或清空时才触发。重复选择当前单位不会触发 `onChange`，但仍会转发 `onSelect`。自定义 `filterOption` 会替换默认过滤逻辑；如需保留描述搜索，请在过滤逻辑中使用选项的 `searchText` 字段。

## 内置选项

内置单位定义在 [`utils.tsx`](./utils.tsx) 的 `units` 中。`buildUnitOptions` 会为选项补充 `cleanLabel` 和 `searchText`：前者用于显示选中名称，后者由单位名称及当前语言的描述组成，用于搜索。

例如，`SI short` 的值是 `sishort`，描述说明其按 SI 前缀自动缩放（1000 进位）。隐藏该选项只影响下拉列表，不会让已有配置中的值变成不可读。

## 测试

组件单测和 jsdom 集成测试分别位于 `CustomUnitPicker.test.tsx` 与 `CustomUnitPicker.integration.test.tsx`。运行方式：

```bash
./node_modules/.bin/jest src/pages/dashboard/Components/UnitPicker/CustomUnitPicker.test.tsx src/pages/dashboard/Components/UnitPicker/CustomUnitPicker.integration.test.tsx --runInBand
```
