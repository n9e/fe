#  MySQL文档说明

### 查询表格

和在终端登录 MySQL 之后，输入 SQL 查询类似，例如查询整个表的数据：
```sql
select * from database_name.table_name limit 10
```
### 查询时序图

1. 必须在 SQL 中使用 `as time` 的语法指定哪一列是时间列，然后 `group by time order by time desc` 对时间做排序，例如

```sql
select count(*) as count, trigger_time as time 
from n9e_v6_plus.alert_his_event 
group by time 
order by time 
desc LIMIT 100
```

2. 可以使用 where 条件，执行查询某一个时间段的数据，样例如下

> 2.1  查询最近一分钟的数据，也可以把 MINUTE 换成 SECOND、HOUR、DAY、WEEK、MONTH 等
```sql
SELECT count(*) AS count, trigger_time AS time FROM n9e_v6_plus.alert_his_event  WHERE FROM_UNIXTIME(trigger_time) >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
```
   
> 2.2 查询某一个时间段的数据，trigger_time 是 unix 时间戳 (1720061167) 的情况   
WHERE 语句可以直接写 WHERE trigger_time >= 1720060214 AND trigger_time < 1720061214   
或者 trigger_time >= $__unixEpochFrom() AND trigger_time < $__unixEpochTo(), $__unixEpochFrom() 表示开始的unix时间戳，$__unixEpochTo() 表示结束时间的unix时间戳

```sql
SELECT count(*) AS count, trigger_time AS time 
FROM n9e_v6_plus.alert_his_event  
WHERE trigger_time >= $__unixEpochFrom() AND trigger_time < $__unixEpochTo()
GROUP BY time 
ORDER BY time DESC
```

> 2.3 查询某一个时间段的数据，trigger_time 是 2024-07-04 10:48:01 字符串格式的情况   
WHERE 语句可以直接写 WHERE trigger_time >= "2024-07-04 09:48:01" AND trigger_time < "2024-07-04 11:48:01"
```sql
SELECT count(*) AS count, trigger_time AS time 
FROM n9e_v6_plus.alert_his_event  
WHERE trigger_time >= "2024-07-04 09:48:01" AND trigger_time < "2024-07-04 11:48:01"
GROUP BY time 
ORDER BY time DESC
```
   
> 2.4 查询最近 7 天每分钟产生的告警数量
```sql
SELECT FROM_UNIXTIME(trigger_time, '%Y-%m-%d %H:%i:00') AS alert_minute,COUNT(*) AS alert_count 
FROM n9e_v6_plus.alert_his_event 
WHERE trigger_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY)) 
GROUP BY alert_minute 
ORDER BY alert_minute DESC;
```
   
> 2.5 alert_his_event 样例表结构如下
```sql
CREATE TABLE `alert_his_event` (
    `id` bigint unsigned not null AUTO_INCREMENT,
    `cate` varchar(128) not null,
    `rule_id` bigint unsigned not null,
    `rule_name` varchar(255) not null,
    `prom_ql` varchar(8192) not null comment 'promql',
    `first_trigger_time` bigint,
    `trigger_time` bigint not null,
    `trigger_value` varchar(255) not null,
    PRIMARY KEY (`id`),
    KEY (`trigger_time`, `rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET = utf8mb4;
```

### 宏变量使用

在配置仪表盘的时候，一般我们要查询数据的时间范围不是固定的，需要随着仪表盘右上角的时间返回变化而变化，这个时候就需要使用和时间相关的宏变量了，下面是我们目前支持的宏变量以及使用说明
（备注：下面说明中的 1494410783 是前端传的 start_time，1494410983 是前端传的 end_time）

|  **宏变量**  |  **描述**  |
| --- | --- |
|  `$__timeFilter(dateColumn)`  |  如果 `dateColumn` 格式是 `%Y-%m-%d %H:%i:%s`，可以使用此宏变量，将被替换为  _dateColumn BETWEEN FROM\_UNIXTIME(1494410783) AND FROM\_UNIXTIME(1494410983)_  |
|  `$__timeFrom()`  |  如果时间列格式是`%Y-%m-%d %H:%i:%s`，可以使用此宏变量，将被替换为当前时间选择的开始时间。_FROM\_UNIXTIME(1494410783)_  |
|  `$__timeTo()`  |  如果时间列格式是`%Y-%m-%d %H:%i:%s`，可以使用此宏变量，将被替换为当前时间选择的结束时间。_FROM\_UNIXTIME(1494410983)_  |
|  `$__unixEpochFilter(dateColumn)`  |  如果 `dateColumn` 格式是 Unix时间戳。将会被替换为 _dateColumn > 1494410783 AND dateColumn < 1494497183_  |
|  `$__unixEpochFrom()`  |  将被替换为当前活动时间选择的开始时间,以Unix时间戳表示。例如,_1494410783_  |
|  `$__unixEpochTo()`  |  将被替换为当前活动时间选择的结束时间, 以Unix时间戳表示。例如,_1494497183_  |
|  `$__unixEpochNanoFilter(dateColumn)`  |  如果 `dateColumn` 格式是以纳秒时间戳表示。将会被替换为 _dateColumn > 1494410783152415214 AND dateColumn < 1494410983142514872_  |
|  `$__unixEpochNanoFrom()`  |  将被替换为当前活动时间选择的开始时间,以纳秒时间戳表示。例如,_1494410783152415214_  |
|  `$__unixEpochNanoTo()`  |  将被替换为当前活动时间选择的结束时间,以纳秒时间戳表示。例如,_1494410983142514872_  |
|  `$__timeGroup(dateColumn,'5m')`  |  在 group by 的时候使用，以 5m 为分组粒度，对数据进行计算  |
|  `$__unixEpochGroup(dateColumn,'5m')`  |  在 group by 的时候使用，以 5m 为分组粒度，对数据进行计算  |

#### 宏变量使用示例
以上面的 alert_his_event 表为例，查询一段时间范围内每分钟的告警数量的 SQL 如下

```sql
SELECT 
  $__unixEpochGroup(trigger_time, '1m') AS time,
  COUNT(*) AS alert_count
FROM 
  n9e_v6_plus.alert_his_event
WHERE 
  $__unixEpochFilter(trigger_time)
GROUP BY 
  time
ORDER BY 
  time
```
