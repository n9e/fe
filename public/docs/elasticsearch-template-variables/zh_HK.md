使用 JSON 字串編寫查詢定義。目前只支援 terms 查詢，query 欄位是 `Lucene query` 語法。

```json
{ "find": "terms", "field": "request", "query": "ident: host01" }
```

#### 排序

預設是根據字母順序或數字順序進行降序。如果要依照文件計數進行排序可新增 `orderBy: doc_count` 如果希望是升序則新增 `order: asc`。

```json
{ "find": "terms", "field": "request", "query": "ident: host01", "orderBy": "doc_count", "order": "asc" }
```

#### 限制

預設是最多傳回 500 條數據，如果需要限制傳回資料條數，可以新增 `size` 欄位。考慮效能問題，建議不要設定太大。

```json
{ "find": "terms", "field": "request", "query": "ident: host01", "size": 10 }
```
