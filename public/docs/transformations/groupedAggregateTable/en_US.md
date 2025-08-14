# Grouped Aggregate Table

## Overview

The Grouped Aggregate Table transformer can group table data by specified fields and apply aggregation functions to other fields. Through this transformer, you can convert raw detailed data into aggregated summary data for easier analysis and display.

## Features

- **Multi-field grouping**: Supports grouping data by one or more fields
- **Multiple aggregation functions**: Supports sum, average, count, max, min, last value, variance, standard deviation and other aggregation calculations
- **Flexible configuration**: Each field can be independently configured as a grouping field or aggregation field
- **Multiple aggregations support**: A single field can apply multiple aggregation functions simultaneously

## Supported Aggregation Functions

| Function | Description        | Example                                            |
| -------- | ------------------ | -------------------------------------------------- |
| sum      | Sum                | Add all numeric values                             |
| avg      | Average            | Calculate the average of numeric values            |
| count    | Count              | Count the number of non-empty values               |
| max      | Maximum            | Find the maximum numeric value                     |
| min      | Minimum            | Find the minimum numeric value                     |
| last     | Last value         | Take the last value                                |
| variance | Variance           | Calculate the variance of numeric values           |
| stdDev   | Standard deviation | Calculate the standard deviation of numeric values |

## Usage Examples

### Basic Grouping Example

**Scenario:** Group by server and calculate the average and maximum CPU usage

**Configuration:**

- Grouping field: server
- Aggregation field: cpu_usage (calculate average and maximum)

## Data Transformation Examples

### Input Data

Raw monitoring data:

| Server  | CPU Usage | Memory Usage |
| ------- | --------- | ------------ |
| server1 | 80%       | 60%          |
| server2 | 75%       | 55%          |
| server1 | 85%       | 65%          |
| server2 | 70%       | 50%          |

### Output Data

Results after grouped aggregation transformation:

| Server  | CPU Usage (Average) | CPU Usage (Maximum) |
| ------- | ------------------- | ------------------- |
| server1 | 82.5%               | 85%                 |
| server2 | 72.5%               | 75%                 |

### Multi-field Grouping Example

**Scenario:** Group by server and region, calculate multiple metrics

**Configuration:**

- Grouping fields: server, region
- Aggregation fields:
  - cpu_usage: calculate average, maximum, minimum
  - memory_usage: calculate last value and average
  - request_count: calculate sum and count

**Input Data:**

| Server  | Region  | CPU Usage | Memory Usage | Request Count |
| ------- | ------- | --------- | ------------ | ------------- |
| server1 | us-east | 80%       | 60%          | 100           |
| server1 | us-east | 85%       | 65%          | 120           |
| server1 | us-west | 75%       | 55%          | 90            |
| server2 | us-east | 70%       | 50%          | 80            |
| server2 | us-west | 78%       | 58%          | 110           |

**Output Data:**

| Server  | Region  | CPU(Avg) | CPU(Max) | CPU(Min) | Memory(Last) | Memory(Avg) | Request Sum | Request Count |
| ------- | ------- | -------- | -------- | -------- | ------------ | ----------- | ----------- | ------------- |
| server1 | us-east | 82.5%    | 85%      | 80%      | 65%          | 62.5%       | 220         | 2             |
| server1 | us-west | 75%      | 75%      | 75%      | 55%          | 55%         | 90          | 1             |
| server2 | us-east | 70%      | 70%      | 70%      | 50%          | 50%         | 80          | 1             |
| server2 | us-west | 78%      | 78%      | 78%      | 58%          | 58%         | 110         | 1             |

## Configuration

### Field Operation Types

| Operation Type | Description       | Purpose                                             |
| -------------- | ----------------- | --------------------------------------------------- |
| groupby        | Grouping field    | Dimension field used for data grouping              |
| aggregate      | Aggregation field | Numeric field that requires aggregation calculation |
