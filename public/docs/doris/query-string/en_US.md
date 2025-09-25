## Query Mode

Query Mode is a quick query syntax developed by Flashcat for Apache Doris log retrieval scenarios.

#### Introduction

Query Mode reduces usage costs through simplified input. You only need to specify `database`, `table`, and `date field`, combined with a time picker to complete a query. When you need to search for a specific field, simply input a Query String in the format `key:"value"`.

### Query Syntax

#### Multiple key equals

```
-- Colon ":" represents equals, AND is the logical AND for multiple conditions
key1:"value1" AND key2:"value2" AND key3:"value3"
```

#### Fuzzy search

```
-- .* represents fuzzy matching
key1:"prefix.*"
```

#### One key, multiple values

```
-- OR is the logical OR for multiple conditions
key1:"value1" OR key1:"value2" OR key1:"value3"
```

#### Nested multiple condition groups

```
-- Use parentheses to determine precedence
(key1:"value1") AND (key2:"value2" OR key3:"value3")
```

#### Numerical comparison

```
-- Note that the syntax for equals is ":", not "="
key1 > 100 AND key2 < 10 AND key3 >= 100 AND key4:100
```

### SQL Mode

The Flashcat platform supports [Doris SQL syntax](https://doris.apache.org/zh-CN/docs/3.0/sql-manual/basic-element/sql-data-types/data-type-overview) by default. In SQL mode, you can both view raw logs and perform statistical analysis and chart visualization.

SQL mode is relatively complex when used in log retrieval scenarios. For example, when querying raw logs from the last 5 minutes, you need to input:

```
SELECT *
FROM database.online_logs
WHERE created_at >= NOW() - INTERVAL 5 MINUTE;
```

If the time range is adjusted to a specific moment, you need to manually modify the SQL, which may encounter input errors, unfamiliar syntax, and other issues.

```
SELECT *
FROM database.online_logs
WHERE created_at BETWEEN '2025-10-01 18:00:00' AND '2025-10-01 18:20:00';
```

If you want to search for a specific field, such as key1 being a string type, key2 being a numeric type, and key3 being a sub-key of a map type, the syntax logic becomes more complex and requires consulting documentation to resolve.

```
SELECT *
FROM database.online_logs
WHERE created_at BETWEEN '2025-10-01 18:00:00' AND '2025-10-01 18:20:00'
	AND key1 = 'value1'
	AND key2 > value2
	AND key3['key32'] = 'value3';
```

#### Time Macros

SQL mode supports quickly modifying query time through `time macros` + time picker. Please refer to the documentation under `Query Conditions` in SQL mode for details.

For example, the above SQL can be corrected to:

```
SELECT *
FROM database.online_logs
WHERE $__timeFilter(created_at);
-- This will be replaced during execution with created_at BETWEEN FROM_UNIXTIME(1494410783) AND FROM_UNIXTIME(1494410983)
-- Where 1494410783 and 1494410983 correspond to the start and end times of the time picker
```
