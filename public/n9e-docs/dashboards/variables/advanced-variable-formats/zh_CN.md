# 高级变量格式

仪表盘变量可使用 `${变量名:格式}` 指定插值结果；兼容旧写法 `[[变量名:格式]]`。不指定格式时，沿用数据源的默认插值规则。

以下示例假定变量 `servers` 的值为 `test1`、`test2`，显示名称分别为 `Server 1`、`Server 2`。

## 通用格式

| 格式 | 用法 | 说明与示例 |
| --- | --- | --- |
| `csv` | `${servers:csv}` | 用逗号连接原始值：`test1,test2`。 |
| `distributed` | `${servers:distributed}` | 用于 Graphite 分布式查询；第一个值保持原样，后续值带变量名：`test1,servers=test2`。 |
| `doublequote` | `${servers:doublequote}` | 每个值用双引号包裹，并转义值中的双引号：`"test1","test2"`。 |
| `glob` | `${servers:glob}` | Graphite glob 格式；多值为 `{test1,test2}`，单值保持原样。也是未知格式的回退结果。 |
| `join` | `${servers:join:&}` | 使用指定分隔符连接值；未指定分隔符时使用逗号。示例结果：`test1&test2`。 |
| `json` | `${servers:json}` | 输出 JSON 数组：`["test1","test2"]`。 |
| `lucene` | `${servers:lucene}` | 输出 Lucene OR 表达式，并转义 Lucene 特殊字符：`("test1" OR "test2")`。 |
| `percentencode` | `${servers:percentencode}` | 对逗号连接后的值进行 URL 百分号编码：`test1%2Ctest2`。 |
| `pipe` | `${servers:pipe}` | 用竖线连接值：`test1|test2`。 |
| `queryparam` | `${servers:queryparam}` | 输出 URL 查询参数：`var-servers=test1&var-servers=test2`。 |
| `customqueryparam` | `${servers:customqueryparam:v-servers:x-}` | 自定义 URL 参数名和可选值前缀：`v-servers=x-test1&v-servers=x-test2`。参数名省略时使用 `var-变量名`。 |
| `raw` | `${servers:raw}` | 原样用逗号连接值：`test1,test2`；适用于数据源或查询语言已自行处理转义的场景。 |
| `regex` | `${servers:regex}` | 输出正则分组，并转义正则特殊字符：`(test1|test2)`。 |
| `singlequote` | `${servers:singlequote}` | 每个值用单引号包裹，内部单引号使用反斜杠转义：`'test1','test2'`。 |
| `sqlstring` | `${servers:sqlstring}` | 每个值用单引号包裹，内部单引号按 SQL 规则加倍；适用于 SQL 字符串字面量。 |
| `text` | `${servers:text}` | 使用选项的显示名称（label/text），多值用 ` + ` 连接：`Server 1 + Server 2`。 |

变量选择了 **All** 且未设置自定义 All 值时，格式化会使用符合变量正则筛选条件的全部选项。设置自定义 All 值时，除 `text` 和 `percentencode` 外，格式化直接使用该自定义值。

## Doris SQL

在 Doris 图表查询条件和 Doris 查询变量中，普通多选变量默认会被格式化为 SQL 字符串列表。例如 `${host}` 会得到 `'host01', 'host02'`，可以直接用于：

```sql
WHERE host IN (${host})
```

此外，Doris 提供仅在这些入口生效的 LIKE 扩展。字段名必须是合法的列名或 `table.column`：

| 格式 | 示例结果 |
| --- | --- |
| `${host:sql_like_or:description}` | `description LIKE '%host01%' OR description LIKE '%host02%'` |
| `${host:sql_like_and:table.description}` | `table.description LIKE '%host01%' AND table.description LIKE '%host02%'` |

LIKE 扩展会对值中的单引号和反斜杠进行 SQL 转义；在非 Doris 数据源中不会替换这两种格式。
