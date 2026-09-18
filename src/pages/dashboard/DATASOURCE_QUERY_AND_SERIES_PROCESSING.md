# 仪表盘数据源查询与时序数据处理

本文说明仪表盘面板从 target 配置构建统一查询请求、处理不同数据源的查询条件，以及将响应转换为时序图数据的规则。实现入口如下：

- 请求构建：[Renderer/datasource/contract.ts](./Renderer/datasource/contract.ts)
- 数据源注册、序列化和就绪校验：[Renderer/datasource/registry.ts](./Renderer/datasource/registry.ts)
- 请求执行与响应归一化：[Renderer/datasource/useQuery.tsx](./Renderer/datasource/useQuery.tsx)
- 时序图数据帧组装：[Renderer/Renderer/TimeSeriesNG/utils/getDataFrameAndBaseSeries.ts](./Renderer/Renderer/TimeSeriesNG/utils/getDataFrameAndBaseSeries.ts)

## 总体流程

```mermaid
flowchart LR
  A[面板 targets] --> B[构建 query-batch 请求]
  B --> C[POST /api/n9e-plus/v2/query-batch]
  C --> D[按 RefID 归一化响应]
  D --> E[Prom 按 step 标记真实缺点]
  E --> F[时序图合并横轴]
  F --> G[uPlot 绘制]
```

一次面板查询共用 `from`、`to`，但每个 target 都可指定自己的 `datasource.cate` 与 `datasource.id`。因此混合数据源不是多次独立请求，而是同一个 `query-batch` 请求中的多个 `queries` 项。

`queryOptionsTime` 存在时覆盖面板时间范围；否则使用面板时间范围。时间范围会被转换为 Unix 秒时间戳。

## 通用 target 处理

### 数据源、RefID 与结果类型

1. 优先读取 target 的 `datasource`；旧面板没有该字段时，回退到面板级默认数据源。
2. 数据源 ID 会先替换数据源变量。替换结果不是数字时，该 target 静默跳过。
3. 未配置 `refId` 时按 `A`、`B`、… 自动生成；同一请求内 RefID 必须唯一。
4. `resultType` 为 `time_series` 或 `logs`。`query.mode` 为 `raw` / `logs`，或查询 values 中包含 `rawData` 时，推断为日志；否则默认为时序。
5. `kind: expression`（或旧字段 `__mode__: '__expr__'`）是表达式 target，不携带数据源查询条件。表达式可引用其他时序 RefID，不能引用日志 RefID，也不能形成循环依赖。

如果某个源 target 因条件未就绪而被跳过，依赖它的表达式也会被移除；不影响同一面板内其他可执行 target。

### 条件序列化与变量替换

每个可执行的源 target 会按对应数据源注册项序列化：

- 以 `target.query` 为基础，并合并必要的 target 顶层查询字段；编辑器专用的 `builderConfig` 不会发送。
- `keys` 中的数组值会拼接为字符串，以满足后端查询协议。
- `target.queries`（例如 CloudWatch 的多查询配置）会深拷贝到请求体。
- 前端变量、内置时间变量和数据源变量会在发送前替换；替换会递归处理对象和数组。
- `timezone`、`max_data_points`、`interval_ms`、`request_id` 不参与该递归替换，避免覆盖后端协议字段。
- 数据源插件如实现变量转换器，会在通用替换前接管该数据源的查询转换。

后端 SQL 宏（例如 `$__timeFilter(...)`）不是前端变量；前端保留它们，交由后端 SQL 宏处理器展开。前端内置变量与 SQL 宏的区别见 [VARIABLE_VALUE_FLOW.md](./VARIABLE_VALUE_FLOW.md)。

## 数据源类型差异

下表只描述前端在构建 `query-batch` 前执行的差异；具体语法与最终查询由各数据源后端处理。

| 数据源类别                                         | 可执行条件                                                                                           | 请求构造差异                                                                                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prometheus                                         | `expr` 非空                                                                                          | 写入 `expr`、`instant` 和计算出的 `step`。                                                                                                                     |
| Elasticsearch / OpenSearch                         | 非 SQL：需要索引（或 index pattern）与时间字段；SQL：raw 需要 SQL，时序还需要 SQL 与 `keys.valueKey` | 非 SQL 时将 `syntax` 归一为 `filter_language`（Lucene / KQL）；计算 `interval`；`values` 数组会展开为多个 query。                                              |
| IoTDB、TDengine                                    | `query.query` 非空                                                                                   | 按注册表序列化，查询文本原样交给对应后端。                                                                                                                     |
| ClickHouse、MySQL                                  | `query.query` 非空                                                                                   | 编辑器保存的 `query` 会改名为后端使用的 `sql`。                                                                                                                |
| Doris                                              | `query.query` 或 `query.sql` 非空                                                                    | SQL 策略下将 `query` 改名为 `sql`；仅 `queryStrategy: 'query'` 的 Doris 日志查询保留 `query` 字段。Doris 时序 SQL 可以稀疏返回时间桶，前端不从 SQL 推导 step。 |
| PostgreSQL、Oracle、SQL Server、Redshift、InfluxDB | `query.sql` 非空                                                                                     | SQL 字段原样发送。                                                                                                                                             |
| 阿里云 SLS                                         | `project`、`logstore`、`mode` 都存在                                                                 | 带默认时序相关字段，例如 `time_series`。                                                                                                                       |
| 腾讯 CLS、火山 TLS、华为 LTS、百度 BLS             | 分别需要 `topic_id`、`topic_id/topic`、`stream_id`、`logstore`                                       | 带各自日志主题或流标识。                                                                                                                                       |
| CloudWatch Logs                                    | `region`、`log_group_names`、`query_string` 都存在                                                   | 日志查询参数原样序列化。                                                                                                                                       |
| Zabbix                                             | raw 需要 `method`；item IDs 时序需要 `itemids`；其余时序需要 group / host / item filter              | 按 mode 与 subMode 校验。                                                                                                                                      |
| CloudWatch                                         | `queries` 至少含一条完整指标查询；Metric Insights / 编辑模式 1 仅要求表达式                          | 原样携带多查询数组。                                                                                                                                           |
| GCM                                                | PromQL 模式需要 `promql`；其他模式需要 `project_id`、`service`、`metric_type`                        | 按查询模式校验。                                                                                                                                               |

## Prometheus 时序处理

### step 的来源

Prometheus 的 `step` 由面板有效时间范围、`maxDataPoints` 或面板宽度，以及 target 的 `step`（最小步长）计算。默认最小步长为 15 秒，同时保护 Prometheus 单次查询的点数上限。

`instant: true` 表示即时查询；仍会序列化该标志，返回通常只有一个或少量时刻的样本。范围查询则使用 `step` 形成预期的评估时间点。

### 单指标

“单指标”通常指一个 Prom target / 一个表达式 / 一个 RefID，例如 `A: rate(http_requests_total[5m])`。一个 RefID 仍可能因不同标签集返回多条 series。

响应归一化时，对同一 Prom query 返回的每一条 series 单独执行以下规则：

1. 当“连接空值”关闭时，按该 RefID 请求中的 `step` 检查相邻样本。
2. 若相邻时间差大于 step，在缺口起始的下一个预期时间点插入一个显式 `[timestamp, null]`。一个连续缺口只需插入一个 `null`，即可让图表断线。
3. 当“连接空值”开启时，不额外补点；后端明确返回的 `null` 仍会保留。

### 多指标

“多指标”通常指多个 Prom target / 多个 RefID；每个 target 独立计算并携带自己的 `step`，并按自己的 `step` 补 Prom 缺点。一个 target 内按标签展开出的多条 series 也独立处理。

这意味着某个 Prom target 的真实缺点会成为 `null`。Prom target，以及只依赖 Prom target 的表达式，在共同横轴上的缺失位置同样按 `null` 处理，以保持旧版 uPlot 的 Prom 绘制语义；非 Prom 的对齐占位规则见下一节。

Elasticsearch / OpenSearch 的 `values` 展开是另一种“多指标”：同一个 target 的多个 values 被拆成多个 query，第一个沿用原 RefID，其余使用 `A__value_1` 等唯一子 RefID，避免与表达式和其他 target 冲突。

## 混合数据源与绘制数据帧

### 统一请求，独立返回

混合数据源面板可同时包含 Prometheus、Doris 等 target。请求层仍共用面板时间范围，但每项携带自己的 `datasource`；响应也按 RefID 独立返回。响应归一化会保留 series 的 RefID、标签、名称和样本，并为 ES / OpenSearch 保留其 bucket interval。

时序图需要共享横轴以支持统一缩放、十字线和 tooltip。绘图层会收集全部 series 的时间戳、排序并去重，然后将每条 series 映射到这个共同时间数组。

例如：

```text
Prom 返回：  10:00:00  10:00:15  10:00:30
Doris 返回： 10:00:00            10:00:30
共同横轴：   10:00:00  10:00:15  10:00:30
```

### `null` 与 `undefined` 的约定

| 值          | 含义                                                                  | “连接空值”关闭时的结果       |
| ----------- | --------------------------------------------------------------------- | ---------------------------- |
| 数值        | 数据源在该时间戳明确返回了值                                          | 正常绘制。                   |
| `null`      | 数据源明确返回为空、Prom 按自身 step 判定为真实缺点，或 Prom 对齐占位 | 断线。                       |
| `undefined` | 仅由其他 series 提供的横轴时间戳，且当前 series 为非 Prom 数据源      | 不作为断点，跨过该位置连接。 |

Dashboard 组装共同横轴时，Prometheus series 的缺失位置填 `null`，维持旧版 Prom 的 uPlot 断线行为；Doris 等非 Prom 数据源的缺失位置填 `undefined`。只依赖 Prom 的表达式继承 Prom 语义；包含非 Prom 依赖的表达式按非 Prom 处理。后者不解析 SQL 中可能存在的时间分组，也不假定某个 step；只要没有明确返回 `null`，混入 Prom 的完整时间轴也不会改变其连线结果。

因此，Prom target 之间不同 step 的时间戳会保留为 `null` 对齐占位；而非 Prom target 不会因其他数据源的时间戳被额外断开。

`getDataFrameAndBaseSeries` 同时被 Explorer 复用。它的默认对齐占位仍是 `null`，保持原有 Explorer 行为；只有 Dashboard 显式传入上述数据源级别策略。

## TODO：Prometheus 长缺口的完整裁剪

当前 `completeBreakpoints(step, data)` 对相邻 Prom 样本之间的长缺口只插入第一个缺失 step 的 `null`。这足以标记“存在缺口”，但在 uPlot 中可能只裁掉该 `null` 附近的一小段路径，留下从裁切边缘连向下一个真实样本的斜线；裁切边缘不是样本点，因此不会显示圆点。

只在原始 Prom 数据中补首尾两个 `null`，仅在二者之间没有其他横轴时间点时有效。混合数据源场景下，非 Prom series 可能在两者之间贡献 `undefined` 对齐占位，uPlot 不会将其视为连续 `null`，仍可能把缺口拆成多个小裁切区间。

后续应将 Prom 的真实缺口保存为时间范围，并在共同横轴组装完成后，把该范围内属于此 Prom series 的全部对齐位置覆盖为连续 `null`。这既保留“非 Prom 稀疏返回不补点”的规则，也能稳定裁掉 Prom 的完整缺口。

## 排查建议

面板开启“检查”后，可直接查看 `Dashboard Query`：

1. 确认请求的 `from`、`to` 与每个 query 的 `datasource`、`ref_id`。
2. 对 Prom 确认 `step`、`instant` 和表达式；检查缺口是否超过该 step。
3. 对 SQL / Doris 检查原始 SQL、时间过滤与实际返回的 `samples`；不要依据 SQL 文本猜测前端步长。
4. 比较同一 RefID 的原始 `samples` 与绘图数据帧：Prom 的显式、补出或对齐 `null` 会形成视觉断线；非 Prom 因其他 series 引入的时间戳应是 `undefined` 对齐占位。
