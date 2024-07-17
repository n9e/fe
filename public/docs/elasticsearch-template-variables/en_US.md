Write query definitions using JSON strings. Currently only terms query is supported, and the query field is `Lucene query` syntax.

```json
{ "find": "terms", "field": "request", "query": "ident: host01" }
```

#### Order

The default is descending alphabetical or numerical order. If you want to sort based on document count add `orderBy: doc_count` or if you want ascending order add `order: asc`.

```json
{ "find": "terms", "field": "request", "query": "ident: host01", "orderBy": "doc_count", "order": "asc" }
```

#### Limit

The default is to return a maximum of 500 data. If you need to limit the number of returned data, you can add the `size` field. For performance reasons, it is recommended not to set it too large.

```json
{ "find": "terms", "field": "request", "query": "ident: host01", "size": 10 }
```
