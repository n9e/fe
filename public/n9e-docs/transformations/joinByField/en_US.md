Use this transformation to merge multiple results into a single table, enabling the consolidation of data from different queries.

## Outer join

A tabular outer join combining tables so that the result includes matched and unmatched rows from either or both tables.

| ident      | cpu_usage_idle |
| ---------- | -------------- |
| dev-n9e-01 | 60             |
| dev-n9e-02 | 70             |
| dev-n9e-03 | 80             |

Can now be joined with:

| ident      | disk_used_percent |
| ---------- | ----------------- |
| dev-n9e-01 | 20                |
| dev-n9e-02 | 30                |
| dev-n9e-03 | 40                |

The result after applying the outer join transformation looks like the following:

| ident      | cpu_usage_idle | disk_used_percent |
| ---------- | -------------- | ----------------- |
| dev-n9e-01 | 60             | 20                |
| dev-n9e-02 | 70             | 30                |
| dev-n9e-03 | 80             | 40                |
