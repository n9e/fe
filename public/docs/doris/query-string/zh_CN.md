## Query 模式

Query 模式是 Flashcat 面向 Apache Doris 日志检索场景、自研的快捷查询语法。

#### 简介

Query 模式通过简化输入来降低使用成本，只需要指定`database`、`table`、`日期字段`，配合时间选择器即可完成一次查询。当需要搜索某个字段时，输入形如`key:"value"`的 Query String 即可。

### 查询语法

#### 多个 key 的等于

```
-- 冒号":"代表等于，AND 是多个条件的且
key1:"value1" AND key2:"value2" AND key3:"value3"
```

#### 模糊搜索

```
-- .*代表模糊匹配
key1:"prefix.*"
```

#### 一个 key、多个值

```
-- OR 是多个条件的或
key1:"value1" OR key1:"value2" OR key1:"value3"
```

#### 多组条件嵌套

```
-- 通过括号确定优先级
(key1:"value1") AND (key2:"value2" OR key3:"value3")
```

#### 数值比较

```
-- 注意等于的语法是":", 不是"="
key1 > 100 AND key2 < 10 AND key3 >= 100 AND key4:100
```

### SQL 模式

Flashcat 平台默认支持[Doris SQL 语法](https://doris.apache.org/zh-CN/docs/3.0/sql-manual/basic-element/sql-data-types/data-type-overview)，SQL 模式下既可以查看日志原文，也可以统计数值、绘制图表。

SQL 模式在日志检索场景中使用时比较复杂，比如当查询最近 5 分钟的日志原文时需输入：

```
SELECT *
FROM database.online_logs
WHERE created_at >= NOW() - INTERVAL 5 MINUTE;
```

如果时间范围调整为某个具体时刻，需要手动修改 SQL，此时可能遇到输入错误、语法不熟悉等问题。

```
SELECT *
FROM database.online_logs
WHERE created_at BETWEEN '2025-10-01 18:00:00' AND '2025-10-01 18:20:00';
```

如果要对某个字段做检索，比如 key1 是字符串类型、key2 是数值类型、key3 是 map 类型的子 key，其语法逻辑将变得更加复杂，此时需翻阅手册才能解决。

```
SELECT *
FROM database.online_logs
WHERE created_at BETWEEN '2025-10-01 18:00:00' AND '2025-10-01 18:20:00'
	AND key1 = 'value1'
	AND key2 > value2
	AND key3['key32'] = 'value3';
```

#### 时间宏

SQL 模式下支持通过`时间宏`+时间选择器快速修改查询时间，具体请参考 SQL 模式下`查询条件`处的文档。

比如上文 SQL 可以修正为：

```
SELECT *
FROM database.online_logs
WHERE $__timeFilter(created_at);
-- 此处执行时将被替换为 created_at BETWEEN FROM_UNIXTIME(1494410783) AND FROM_UNIXTIME(1494410983)
-- 其中 1494410783 和 1494410983 对应的是时间选择器的开始、结束时间
```
