使用 JSON 字符串编写查询定义。目前只支持 terms 查询，query 字段是 `Lucene query` 语法。

```json
{ "find": "terms", "field": "request", "query": "ident: host01" }
```

#### 排序

默认是根据字母顺序或数字顺序进行降序。如果要根据文档计数进行排序可添加 `orderBy: doc_count` 如果希望是升序则添加 `order: asc`。

```json
{ "find": "terms", "field": "request", "query": "ident: host01", "orderBy": "doc_count", "order": "asc" }
```

#### 限制

默认是最多返回 500 条数据，如果需要限制返回数据条数，可以添加 `size` 字段。考虑性能问题，建议不要设置太大。

```json
{ "find": "terms", "field": "request", "query": "ident: host01", "size": 10 }
```
