## label_values(`<label_name>`)

返回指定时间范围内的所有 label 值。

### 示例

```promql
label_values(instance)
```

## label_values(`<promql>`, `<label_name>`)

返回指定时间范围内，符合 promql 查询条件的所有 label 值。

### 示例

```promql
label_values(up{job="prometheus"}, instance)
```

## query_result(`<promql>`)

返回指定时间范围内，符合 promql 查询条件的所有时间序列，格式为：`<metric_name> {<label1>="<value1>", <label2>="<value2>", ...} <timestamp> <value>`。

**注意**：此函数仅处理 instant vector 类型的查询结果，对于 range vector (matrix) 类型的数据将返回空结果。

### 示例

```promql
query_result(up{job="prometheus"})
```

## label_names()

返回指定时间范围内的所有 label 名称。

## metrics(`<metric_regex>`)

返回指定时间范围内，符合 metric_regex 正则表达式的所有指标名称，不填写则返回所有指标名称。
