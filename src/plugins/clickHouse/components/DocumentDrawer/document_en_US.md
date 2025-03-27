# MySQL Documentation

### Querying Tables

Similar to logging into MySQL via terminal and entering SQL queries, for example, to query the entire table's data:

```sql
SELECT * FROM database_name.table_name LIMIT 10
```

### Querying Time Series Data

1. You must use the `AS time` syntax in SQL to specify which column is the time column, then use `GROUP BY time ORDER BY time DESC` to sort by time, for example:

```sql
SELECT COUNT(*) AS count, trigger_time AS time 
FROM n9e_v6_plus.alert_his_event 
GROUP BY time 
ORDER BY time 
DESC LIMIT 100
```

2. You can use WHERE conditions to query data for a specific time period, examples as follows:

> 2.1 Query data from the last minute, you can also replace MINUTE with SECOND, HOUR, DAY, WEEK, MONTH, etc.

```sql
SELECT COUNT(*) AS count, trigger_time AS time 
FROM n9e_v6_plus.alert_his_event  
WHERE FROM_UNIXTIME(trigger_time) >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
```

> 2.2 Query data for a specific time period, when trigger_time is a Unix timestamp (1720061167) The WHERE clause can be written directly as WHERE trigger_time >= 1720060214 AND trigger_time < 1720061214 Or trigger_time >= $__unixEpochFrom() AND trigger_time < $__unixEpochTo(), where $__unixEpochFrom() represents the starting Unix timestamp, and $__unixEpochTo() represents the ending Unix timestamp

```sql
SELECT COUNT(*) AS count, trigger_time AS time 
FROM n9e_v6_plus.alert_his_event  
WHERE trigger_time >= $__unixEpochFrom() AND trigger_time < $__unixEpochTo()
GROUP BY time 
ORDER BY time DESC
```

> 2.3 Query data for a specific time period, when trigger_time is in the string format "2024-07-04 10:48:01" The WHERE clause can be written directly as WHERE trigger_time >= "2024-07-04 09:48:01" AND trigger_time < "2024-07-04 11:48:01"

```sql
SELECT COUNT(*) AS count, trigger_time AS time 
FROM n9e_v6_plus.alert_his_event  
WHERE trigger_time >= "2024-07-04 09:48:01" AND trigger_time < "2024-07-04 11:48:01"
GROUP BY time 
ORDER BY time DESC
```

> 2.4 Query the number of alerts generated every minute for the last 7 days

```sql
SELECT FROM_UNIXTIME(trigger_time, '%Y-%m-%d %H:%i:00') AS alert_minute, COUNT(*) AS alert_count 
FROM n9e_v6_plus.alert_his_event 
WHERE trigger_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY)) 
GROUP BY alert_minute 
ORDER BY alert_minute DESC;
```

> 2.5 Sample table structure for alert_his_event

```sql
CREATE TABLE `alert_his_event` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `cate` varchar(128) NOT NULL,
    `rule_id` bigint unsigned NOT NULL,
    `rule_name` varchar(255) NOT NULL,
    `prom_ql` varchar(8192) NOT NULL COMMENT 'promql',
    `first_trigger_time` bigint,
    `trigger_time` bigint NOT NULL,
    `trigger_value` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    KEY (`trigger_time`, `rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Using Macro Variables

When configuring dashboards, we usually need to query data for a time range that is not fixed but changes with the time range in the upper right corner of the dashboard. This is where time-related macro variables come in handy. Below are the macro variables we currently support and instructions for their use.

(Note: In the following explanations, 1494410783 is the start_time passed by the frontend, and 1494410983 is the end_time passed by the frontend)

```
Macro VariableDescription
$__timeFilter(dateColumn)If dateColumn is in the format %Y-%m-%d %H:%i:%s, you can use this macro variable. It will be replaced with dateColumn BETWEEN FROM_UNIXTIME(1494410783) AND FROM_UNIXTIME(1494410983)
$__timeFrom()If the time column is in the format %Y-%m-%d %H:%i:%s, you can use this macro variable. It will be replaced with the start time of the current time selection. FROM_UNIXTIME(1494410783)
$__timeTo()If the time column is in the format %Y-%m-%d %H:%i:%s, you can use this macro variable. It will be replaced with the end time of the current time selection. FROM_UNIXTIME(1494410983)
$__unixEpochFilter(dateColumn)If dateColumn is in Unix timestamp format. It will be replaced with dateColumn > 1494410783 AND dateColumn < 1494497183
$__unixEpochFrom()Will be replaced with the start time of the current active time selection, represented as a Unix timestamp. For example, 1494410783
$__unixEpochTo()Will be replaced with the end time of the current active time selection, represented as a Unix timestamp. For example, 1494497183
$__unixEpochNanoFilter(dateColumn)If dateColumn is in nanosecond timestamp format. It will be replaced with dateColumn > 1494410783152415214 AND dateColumn < 1494410983142514872
$__unixEpochNanoFrom()Will be replaced with the start time of the current active time selection, represented as a nanosecond timestamp. For example, 1494410783152415214
$__unixEpochNanoTo()Will be replaced with the end time of the current active time selection, represented as a nanosecond timestamp. For example, 1494410983142514872
$__timeGroup(dateColumn,'5m')Used in GROUP BY, calculates data with a grouping granularity of 5 minutes
$__unixEpochGroup(dateColumn,'5m')Used in GROUP BY, calculates data with a grouping granularity of 5 minutes
```

#### Example of Using Macro Variables

Using the alert_his_event table above as an example, the SQL to query the number of alerts per minute within a time range is as follows:

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
