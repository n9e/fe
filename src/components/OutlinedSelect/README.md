# OutlinedSelect 组件

基于 Antd Select 组件封装的 Material-UI 风格的 Outlined Select,支持浮动标签动画、完整的 Select 属性继承以及 Form 错误状态处理。

## 特性

- ✅ **浮动标签动画**: 未选中时 label 在 Select 内部,选中后自动浮动到上边框
- ✅ **完整类型支持**: 继承 Antd Select 的所有属性,支持 TypeScript 泛型
- ✅ **Form 集成**: 自动处理 Form 验证错误状态
- ✅ **主题适配**: 使用 CSS 变量,自动支持亮色/暗色/金色主题
- ✅ **多种模式**: 支持单选、多选、搜索等所有 Select 模式
- ✅ **尺寸支持**: 支持 small、middle、large 三种尺寸

## 基础使用

```tsx
import { OutlinedSelect } from '@/components/OutlinedSelect';

function App() {
  const [age, setAge] = useState<string>();

  return (
    <OutlinedSelect
      label='年龄'
      value={age}
      onChange={setAge}
      options={[
        { label: 'Twenty', value: '20' },
        { label: 'Thirty', value: '30' },
      ]}
    />
  );
}
```

## 在 Form 中使用

```tsx
import { Form } from 'antd';
import { OutlinedSelect } from '@/components/OutlinedSelect';

function FormExample() {
  const [form] = Form.useForm();

  return (
    <Form form={form}>
      <Form.Item name='age' rules={[{ required: true, message: '请选择年龄' }]}>
        <OutlinedSelect label='年龄' required options={ageOptions} />
      </Form.Item>
    </Form>
  );
}
```

## API

### OutlinedSelectProps

继承 Antd `SelectProps` 的所有属性,额外添加:

| 属性     | 说明                | 类型      | 默认值  |
| -------- | ------------------- | --------- | ------- |
| label    | 浮动标签文本 (必填) | `string`  | -       |
| required | 是否显示必填标记 \* | `boolean` | `false` |

### 继承的常用属性

| 属性       | 说明             | 类型                               | 默认值     |
| ---------- | ---------------- | ---------------------------------- | ---------- |
| value      | 选中的值         | `VT \| VT[]`                       | -          |
| onChange   | 值变化时的回调   | `(value: VT, option: any) => void` | -          |
| options    | 选项数据         | `{ label: string; value: any }[]`  | -          |
| mode       | 模式             | `'multiple' \| 'tags'`             | -          |
| disabled   | 是否禁用         | `boolean`                          | `false`    |
| allowClear | 是否显示清除按钮 | `boolean`                          | `false`    |
| showSearch | 是否可搜索       | `boolean`                          | `false`    |
| size       | 选择框大小       | `'large' \| 'middle' \| 'small'`   | `'middle'` |

完整的 API 请参考 [Antd Select 文档](https://4x.ant.design/components/select-cn/)

## 高级用法

### 多选模式

```tsx
<OutlinedSelect label='城市 (多选)' mode='multiple' value={cities} onChange={setCities} options={cityOptions} />
```

### 搜索模式

```tsx
<OutlinedSelect
  label='搜索用户'
  showSearch
  value={userId}
  onChange={setUserId}
  options={userOptions}
  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
/>
```

### 自定义尺寸

```tsx
<OutlinedSelect
  label="小尺寸"
  size="small"
  value={value}
  onChange={setValue}
  options={options}
/>

<OutlinedSelect
  label="大尺寸"
  size="large"
  value={value}
  onChange={setValue}
  options={options}
/>
```

### 禁用状态

```tsx
<OutlinedSelect label='禁用的选择框' disabled value='value' options={options} />
```

## 样式定制

组件使用 CSS 变量实现主题适配,主要变量:

- `--fc-fill-2`: 标签背景色
- `--fc-text-placeholder`: 标签文本色(未激活)
- `--fc-primary-color`: 标签文本色(激活)和边框聚焦色
- `--fc-border-color2`: 边框正常颜色
- `--fc-red-5-color`: 错误状态颜色
- `--fc-geekblue-4-color`: 悬停状态颜色

这些变量在 `src/theme/variable.css` 中定义,会根据主题自动切换。

## 注意事项

1. **不支持 placeholder**: 由于使用了浮动标签,不需要也不支持 `placeholder` 属性
2. **必填标记**: `required` 属性只影响 label 的显示,实际验证需要在 `Form.Item` 的 `rules` 中配置
3. **Form 集成**: 在 Form.Item 内使用时会自动识别错误状态,不需要手动处理
4. **主题兼容**: 确保项目已引入 `src/theme/variable.css`

## 示例

完整的使用示例请参考 `demo.tsx` 文件。
