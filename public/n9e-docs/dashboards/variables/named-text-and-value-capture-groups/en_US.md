## Using named text and value capture groups

you can capture separate 'text' and 'value' parts from the options returned by the variable query. This allows the variable drop-down list to display user-friendly names while using the corresponding values for queries. Filter and modify using named text and value capture groups

For example, instead of displaying raw IDs in the dropdown, you can show descriptive city names. Consider the following variable query result:

```text
metric_name{city_id="1", city_name="Beijing"}
metric_name{city_id="2", city_name="Shanghai"}
metric_name{city_id="3", city_name="Guangzhou"}
```

When processed through the following regular expression:

```regex
/city_name="(?<text>[^"]+)|city_id="(?<value>[^"]+)/g
```

It produces the following user-friendly drop-down list:

| Display Name | Value |
| ------------ | ----- |
| Beijing      | 1     |
| Shanghai     | 2     |
| Guangzhou    | 3     |
