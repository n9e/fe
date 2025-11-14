## label_values(`<label_name>`)

Returns all label values within the specified time range.

### Example

```promql
label_values(instance)
```

## label_values(`<promql>`, `<label_name>`)

Returns all label values within the specified time range that match the promql query conditions.

### Example

```promql
label_values(up{job="prometheus"}, instance)
```

## query_result(`<promql>`)

Returns all time series within the specified time range that match the promql query conditions, in the format: `<metric_name> {<label1>="<value1>", <label2>="<value2>", ...} <timestamp> <value>`.

**Note**: This function only processes instant vector type query results. For range vector (matrix) type data, it will return empty results.

### Example

```promql
query_result(up{job="prometheus"})
```

## label_names()

Returns all label names within the specified time range.

## metrics(`<metric_regex>`)

Returns all metric names within the specified time range that match the metric_regex regular expression. If not specified, returns all metric names.
