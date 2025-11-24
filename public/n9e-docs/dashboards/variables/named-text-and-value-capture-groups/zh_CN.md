## 使用命名文本和值捕获组

使用命名捕获组，您可以从变量查询返回的选项中分别捕获"文本"和"值"部分。这允许变量下拉列表在显示用户友好名称的同时，使用相应的值进行查询。

例如，您可以在下拉列表中显示描述性的城市名称，而不是显示原始 ID。考虑以下变量查询结果：

```text
metric_name{city_id="1", city_name="Beijing"}
metric_name{city_id="2", city_name="Shanghai"}
metric_name{city_id="3", city_name="Guangzhou"}
```

通过以下正则表达式处理：

```regex
/city_name="(?<text>[^"]+)|city_id="(?<value>[^"]+)/g
```

它会生成以下用户友好的下拉列表：

| 显示名称  | 值  |
| --------- | --- |
| Beijing   | 1   |
| Shanghai  | 2   |
| Guangzhou | 3   |
