# Doris 日志检索中的 VARIANT 划词与高亮

[返回 Doris 日志检索概览](README.md)

## 日志值、字段路径和拍平层级

读取整个 Doris VARIANT 列时，驱动收到的是 JSON 文本。N9E 的查询层将驱动返回的字节转换成字符串，因此日志接口在响应中以 JSON 字符串表示该值。「可用字段」来自独立的 Doris 字段接口，后端通过扩展 DESC 获取 `attr.host.arh` 等 VARIANT 子路径。高亮记录也以子路径为键，带标记的片段属于这个子字段的值。

例如，原始值是 `{"host":{"arh":"amd64","backup_arh":"amd64"}}`，后端返回以下高亮。

```json
{
  "attr.host.arh": ["a@n9e-highlighted-field@md6@/n9e-highlighted-field@4"]
}
```

| 字段拍平层级 | 显示包含目标值的字段 | 渲染方式                          |
| ------------ | -------------------- | --------------------------------- |
| 0            | `attr`               | 在原始 JSON 文本中定位 `host.arh` |
| 1            | `attr.host`          | 在当前 JSON 文本中定位 `arh`      |
| 2            | `attr.host.arh`      | 直接应用该字段的高亮              |

## 路径和字符位置

[划词解析](utils/resolveTextSelectionField.ts)使用选区的字符范围确定 JSON 值对应的子路径，匹配可用字段后将完整路径交给查询生成逻辑。[嵌套高亮解析](utils/resolveNestedHighlightRanges.ts)沿相反方向处理。它通过后端提供的完整子路径找到目标值，在该值内结合高亮片段的上下文定位命中范围，再把范围换算回显示的 JSON。这样两个子字段都包含 `amd64` 时，查询 `attr.host.arh:"md6"` 只会高亮 `arh` 里的 `md6`。

解析仅处理合法的 JSON 对象。当子路径不存在，或同一字段内有多处完全相同的片段上下文而无法定位时，该片段保持原样。JSON 转义会保留在显示文本中，高亮用 `mark` 包住对应的文本范围，划词仍使用同一套字符位置。

## 回归验证

在真实 Doris 的测试表中准备一行 `arh` 与 `backup_arh` 都为 `amd64` 的日志。执行 `attr.host.arh:"md6"`，切换字段拍平层级 0、1、2，确认只有 `arh` 中的 `md6` 高亮。再在层级 1 框选 `backup_arh` 中的 `md6`，确认添加的条件使用 `attr.host.backup_arh`。

自动化测试覆盖[嵌套高亮](utils/resolveNestedHighlightRanges.test.ts)、[划词路径解析](utils/resolveTextSelectionField.test.ts)和 [DOM 选区偏移](../../../pages/logExplorer/components/LogsViewer/components/LogFieldValue/textSelectionOffsets.test.ts)。
