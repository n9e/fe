# Time Series to Table

This transformation converts time series data (TimeSeries) into aggregated table data by performing statistical calculations on specified fields in the data to generate one or more aggregated values.

## Configuration Options

### Operation Types (operations)

Select the calculation operations to apply to the data, supporting multiple operations simultaneously:

- **max** - Calculate maximum value
- **min** - Calculate minimum value
- **avg** - Calculate average value
- **sum** - Calculate sum
- **count** - Count number of data points
- **last** - Get last value
- **variance** - Calculate variance
- **stdDev** - Calculate standard deviation

## Examples

### Original Time Series Data

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

### After Applying Multiple Operations

Configuration:

```typescript
{
  operations: ['max', 'min', 'avg'],
  fieldName: 'cpu'
}
```

Result:

| name      | cpu_max | cpu_min | cpu_avg | instance  | region  |
| --------- | ------- | ------- | ------- | --------- | ------- |
| cpu_usage | 30      | 5       | 18      | server-01 | us-east |
