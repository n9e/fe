# Unreleased

## 升级须知

- 文件日志上下文需要 Categraf v0.5.45 或以上版本输出文件流与序号字段，并配套升级 n9e-plus 后端。

## 日志检索与上下文

- Doris、Elasticsearch 日志行首支持直接打开文件上下文；详情页保留上下文按钮，缺少锚点字段时显示不可用原因。
- Elasticsearch 按 mapping 统一选择文件流查询和排序字段：keyword 使用主字段，text 使用 keyword 子字段，保证检索与上下文使用相同字段。
- Doris 表排序键不支持文件上下文时隐藏行首入口，并在详情按钮提示排序要求；原有日志分页和滚动加载保持可用。
