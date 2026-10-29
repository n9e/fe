# Advanced variable formats

Use `${variable:format}` to control a dashboard variable's interpolation result. The legacy `[[variable:format]]` syntax is also supported. Without a format, the datasource's default interpolation is used.

The examples below assume that `servers` has values `test1` and `test2`, with display labels `Server 1` and `Server 2`.

## General formats

| Format | Usage | Description and example |
| --- | --- | --- |
| `csv` | `${servers:csv}` | Joins raw values with commas: `test1,test2`. |
| `distributed` | `${servers:distributed}` | For Graphite distributed queries; keeps the first value and prefixes later values with the variable name: `test1,servers=test2`. |
| `doublequote` | `${servers:doublequote}` | Wraps every value in double quotes and escapes embedded double quotes: `"test1","test2"`. |
| `glob` | `${servers:glob}` | Graphite glob format: `{test1,test2}` for multiple values, or the value itself for one. It is also the fallback for an unknown format. |
| `join` | `${servers:join:&}` | Joins values with the given separator; a comma is used when no separator is given. Example: `test1&test2`. |
| `json` | `${servers:json}` | Produces a JSON array: `["test1","test2"]`. |
| `lucene` | `${servers:lucene}` | Produces a Lucene OR expression and escapes Lucene special characters: `("test1" OR "test2")`. |
| `percentencode` | `${servers:percentencode}` | Percent-encodes the comma-joined values for use in a URL: `test1%2Ctest2`. |
| `pipe` | `${servers:pipe}` | Joins values with a pipe: `test1|test2`. |
| `queryparam` | `${servers:queryparam}` | Produces URL query parameters: `var-servers=test1&var-servers=test2`. |
| `customqueryparam` | `${servers:customqueryparam:v-servers:x-}` | Sets a custom URL parameter name and optional value prefix: `v-servers=x-test1&v-servers=x-test2`. When the name is omitted, `var-variableName` is used. |
| `raw` | `${servers:raw}` | Joins values as-is with commas: `test1,test2`; use when the datasource or query language handles escaping itself. |
| `regex` | `${servers:regex}` | Produces a regular-expression group and escapes regex special characters: `(test1|test2)`. |
| `singlequote` | `${servers:singlequote}` | Wraps each value in single quotes and backslash-escapes embedded single quotes: `'test1','test2'`. |
| `sqlstring` | `${servers:sqlstring}` | Wraps each value in single quotes and doubles embedded single quotes according to SQL string-literal rules. |
| `text` | `${servers:text}` | Uses option display labels (text), joining multiple values with ` + `: `Server 1 + Server 2`. |

When **All** is selected without a custom All value, formatting uses all options that match the variable's regex filter. With a custom All value, every format except `text` and `percentencode` directly uses that custom value.

## Doris SQL

In Doris chart query conditions and Doris query variables, an ordinary multi-value variable is formatted by default as a SQL string list. For example, `${host}` becomes `'host01', 'host02'`, so it can be used directly in:

```sql
WHERE host IN (${host})
```

Doris also provides these LIKE extensions only in those Doris entry points. The field must be a valid column name or `table.column`:

| Format | Example result |
| --- | --- |
| `${host:sql_like_or:description}` | `description LIKE '%host01%' OR description LIKE '%host02%'` |
| `${host:sql_like_and:table.description}` | `table.description LIKE '%host01%' AND table.description LIKE '%host02%'` |

The LIKE extensions SQL-escape single quotes and backslashes in values. They are not replaced for non-Doris datasources.
