# MySQL 文檔說明

### 查詢表格

和在終端登錄 MySQL 之後，輸入 SQL 查詢類似，例如查詢整個表的數據：

```sql
select * from database_name.table_name limit 10
```

### 查詢時序圖

1. 必須在 SQL 中使用 `as time` 的語法指定哪一列是時間列，然後 `group by time order by time desc` 對時間做排序，例如

```sql
select count(*) as count, trigger_time as time 
from n9e_v6_plus.alert_his_event 
group by time 
order by time 
desc LIMIT 100
```

2. 可以使用 where 條件，執行查詢某一個時間段的數據，樣例如下

> 2.1 查詢最近一分鐘的數據，也可以把 MINUTE 換成 SECOND、HOUR、DAY、WEEK、MONTH 等

```sql
SELECT count(*) AS count, trigger_time AS time FROM n9e_v6_plus.alert_his_event  WHERE FROM_UNIXTIME(trigger_time) >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
```

> 2.2 查詢某一個時間段的數據，trigger_time 是 unix 時間戳 (1720061167) 的情況
>  WHERE 語句可以直接寫 WHERE trigger_time >= 1720060214 AND trigger_time < 1720061214
>  或者 trigger_time >= $__unixEpochFrom() AND trigger_time < $__unixEpochTo(), $__unixEpochFrom() 表示開始的 unix 時間戳，$__unixEpochTo() 表示結束時間的 unix 時間戳

```sql
SELECT count(*) AS count, trigger_time AS time 
FROM n9e_v6_plus.alert_his_event  
WHERE trigger_time >= $__unixEpochFrom() AND trigger_time < $__unixEpochTo()
GROUP BY time 
ORDER BY time DESC
```

> 2.3 查詢某一個時間段的數據，trigger_time 是 2024-07-04 10:48:01 字符串格式的情況
>  WHERE 語句可以直接寫 WHERE trigger_time >= "2024-07-04 09:48:01" AND trigger_time < "2024-07-04 11:48:01"

```sql
SELECT count(*) AS count, trigger_time AS time 
FROM n9e_v6_plus.alert_his_event  
WHERE trigger_time >= "2024-07-04 09:48:01" AND trigger_time < "2024-07-04 11:48:01"
GROUP BY time 
ORDER BY time DESC
```

> 2.4 查詢最近 7 天每分鐘產生的告警數量

```sql
SELECT FROM_UNIXTIME(trigger_time, '%Y-%m-%d %H:%i:00') AS alert_minute,COUNT(*) AS alert_count 
FROM n9e_v6_plus.alert_his_event 
WHERE trigger_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY)) 
GROUP BY alert_minute 
ORDER BY alert_minute DESC;
```

> 2.5 alert_his_event 樣例表結構如下

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

### 宏變量使用

在配置儀表板的時候，一般我們要查詢數據的時間範圍不是固定的，需要隨著儀表板右上角的時間返回變化而變化，這個時候就需要使用和時間相關的宏變量了，下面是我們目前支持的宏變量以及使用說明 （備註：下面說明中的 1494410783 是前端傳的 start_time，1494410983 是前端傳的 end_time）

```
宏變量描述
$__timeFilter(dateColumn)如果 dateColumn 格式是 %Y-%m-%d %H:%i:%s，可以使用此宏變量，將被替換為 dateColumn BETWEEN FROM_UNIXTIME(1494410783) AND FROM_UNIXTIME(1494410983)
$__timeFrom()如果時間列格式是%Y-%m-%d %H:%i:%s，可以使用此宏變量，將被替換為當前時間選擇的開始時間。FROM_UNIXTIME(1494410783)
$__timeTo()如果時間列格式是%Y-%m-%d %H:%i:%s，可以使用此宏變量，將被替換為當前時間選擇的結束時間。FROM_UNIXTIME(1494410983)
$__unixEpochFilter(dateColumn)如果 dateColumn 格式是 Unix時間戳。將會被替換為 dateColumn > 1494410783 AND dateColumn < 1494497183
$__unixEpochFrom()將被替換為當前活動時間選擇的開始時間，以Unix時間戳表示。例如，1494410783
$__unixEpochTo()將被替換為當前活動時間選擇的結束時間，以Unix時間戳表示。例如，1494497183
$__unixEpochNanoFilter(dateColumn)如果 dateColumn 格式是以納秒時間戳表示。將會被替換為 dateColumn > 1494410783152415214 AND dateColumn < 1494410983142514872
$__unixEpochNanoFrom()將被替換為當前活動時間選擇的開始時間，以納秒時間戳表示。例如，1494410783152415214
$__unixEpochNanoTo()將被替換為當前活動時間選擇的結束時間，以納秒時間戳表示。例如，1494410983142514872
$__timeGroup(dateColumn,'5m')在 group by 的時候使用，以 5m 為分組粒度，對數據進行計算
$__unixEpochGroup(dateColumn,'5m')在 group by 的時候使用，以 5m 為分組粒度，對數據進行計算
```

#### 宏變量使用示例

以上面的 alert_his_event 表為例，查詢一段時間範圍內每分鐘的告警數量的 SQL 如下

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
