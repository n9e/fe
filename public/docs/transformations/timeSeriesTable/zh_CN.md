# 时序数据转表格

该转换将时序数据 (TimeSeries) 转换为聚合表格数据，通过对数据中的指定字段进行统计计算，生成一个或多个聚合值。

## 配置选项

### 操作类型 (operations)

选择对数据进行的计算操作，支持多个操作同时执行：

- **max** - 计算最大值
- **min** - 计算最小值
- **avg** - 计算平均值
- **sum** - 计算总和
- **count** - 计算数据点数量
- **last** - 获取最后一个值
- **variance** - 计算方差
- **stdDev** - 计算标准差

## 示例

### 原始时序数据

```
Metric: cpu_usage
Labels: {instance: "server-01", region: "us-east"}
Values:
  - 2021-10-01 10:00:00: 10
  - 2021-10-01 10:01:00: 20
  - 2021-10-01 10:02:00: 30
  - 2021-10-01 10:03:00: 5
  - 2021-10-01 10:04:00: 25
```

### 应用多个操作转换后

配置：

```typescript
{
  operations: ['max', 'min', 'avg'],
  fieldName: 'cpu'
}
```

结果：

| name      | cpu_max | cpu_min | cpu_avg | instance  | region  |
| --------- | ------- | ------- | ------- | --------- | ------- |
| cpu_usage | 30      | 5       | 18      | server-01 | us-east |
