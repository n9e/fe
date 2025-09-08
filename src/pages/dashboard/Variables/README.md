1. datasource、datasourceIdentifier、query 类型的变量的查询条件、值改变后需要重新查询 query 类型变量，更新其 options 和 value
2. 所有 query 类型的变量要同步查询 options
3. 变量值为 undefined 代表变量没有设置为值，分别在查询到变量配置和变量的 options 数据后要设置默认值。当用户交互清空变量值时，单选的为空字符，多选的为空数组。
