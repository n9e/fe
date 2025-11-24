Use this transformation to combine the results from multiple queries into a single result, which is particularly useful when using the table panel visualization. This transformation merges values into the same row if the shared fields contain the same data.

Here's an example illustrating the impact of the Merge series/tables transformation on two queries returning table data:

### Query A:

| \_\_time            | ident      | \_\_value\_#A |
| ------------------- | ---------- | ------------- |
| 2025-07-01 09:01:00 | dev-n9e-01 | 81            |
| 2025-07-01 09:02:00 | dev-n9e-02 | 82            |
| 2025-07-01 09:03:00 | dev-n9e-03 | 83            |

### Query B:

| \_\_time            | ident      | \_\_value\_#B |
| ------------------- | ---------- | ------------- |
| 2025-07-01 09:01:00 | dev-n9e-01 | 41            |
| 2025-07-01 09:02:00 | dev-n9e-02 | 42            |
| 2025-07-01 09:04:00 | dev-n9e-03 | 43            |

Here is the result after applying the Merge transformation.

### Merged Result:

| \_\_time            | ident      | \_\_value\_#A | \_\_value\_#B |
| ------------------- | ---------- | ------------- | ------------- |
| 2025-07-01 09:01:00 | dev-n9e-01 | 81            | 41            |
| 2025-07-01 09:02:00 | dev-n9e-02 | 82            | 42            |
| 2025-07-01 09:03:00 | dev-n9e-03 | 83            |               |
| 2025-07-01 09:04:00 | dev-n9e-03 |               | 43            |
