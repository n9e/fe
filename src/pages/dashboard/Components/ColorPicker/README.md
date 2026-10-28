# Dashboard ColorPicker

Dashboard 的颜色选择器支持内置主题色和自定义颜色。组件通过 Ant Design Form 常用的 `value` / `onChange` 接口接收和返回颜色值。

## Props

| 属性       | 类型                      | 默认值   | 说明                                           |
| ---------- | ------------------------- | -------- | ---------------------------------------------- |
| `value`    | `string`                  | `'#000'` | 当前颜色或内置颜色 token。                     |
| `onChange` | `(value: string) => void` | —        | 颜色变化时调用。                               |
| `builtin`  | `boolean`                 | `false`  | 开启内置主题色面板；关闭时只显示自定义取色器。 |

## 颜色值

启用 `builtin` 后，面板提供红、橙、黄、绿、蓝、紫六组主题色，以及 `text` 和 `transparent`。选择内置颜色会返回稳定的 token，例如 `blue-9`、`green-9`、`text`；选择自定义颜色仍返回 `rgba(...)`。打开面板时，当前值是内置 token 就默认显示 Colors，否则显示 Custom。

内置颜色通过 CSS 变量跟随主题变化。渲染器在使用阈值、x 轴阈值和值映射颜色前，会克隆面板配置，并将这些字段中的 token 解析为当前主题的实际颜色。解析不会改写原配置；Inspect 的 Panel JSON 展示原始 token。其他字段以及已有的十六进制、RGB 和 RGBA 颜色保持原值。

Grafana 仪表板导入会把 Grafana 内置颜色名按色相和明暗映射为 N9E token（例如 `green` → `green-9`、`semi-dark-blue` → `blue-10`）。自定义 hex、RGBA 以及未知颜色名仍原样保留。

## 使用位置和兼容性

| 使用位置                          | 模式           | 行为                                 |
| --------------------------------- | -------------- | ------------------------------------ |
| `Editor/Fields/Thresholds`        | `builtin`      | 阈值步骤保存主题色 token。           |
| `Editor/Fields/ValueMappings`     | `builtin`      | 值映射保存主题色 token。             |
| `Editor/Options/Text/GraphStyles` | 默认自定义模式 | 保持现有自定义取色流程和 RGBA 回调。 |

未传 `builtin` 的调用方继续使用自定义取色器。历史配置里的十六进制和 RGB/RGBA 颜色仍可读取和编辑。

## 测试

纯逻辑测试覆盖 token 识别、CSS 值映射、主题色解析、缓存、配置克隆、缺失 result 的值映射，以及阈值/x 轴阈值/值映射解析。jsdom 集成测试覆盖弹层、Tabs、色点选择、自定义取色回调和选中环主题对比度；Renderer 测试确认 Panel JSON 保留配置 token。

运行相关测试：

```sh
./node_modules/.bin/jest --runInBand \
  src/pages/dashboard/Components/ColorPicker/builtinColors.test.ts \
  src/pages/dashboard/Components/ColorPicker/index.test.tsx \
  src/pages/dashboard/Renderer/Renderer/Main.test.tsx
```
