> 12/20/2024 创建 CHANGELOG.md 文件用于记录无法兼容的更新说明

## 3.1.0

- 新增版本迁移方法 `src/pages/dashboard/Detail/utils/dashboardMigrator.ts`

### BarGauge

- feat: 新增 "显示模式" 设置项，原默认为基础模式同时新增 Retro LCD 模式
- refactor: 去除 "最大值" 设置项，由 "高级设置" 中的 "最大值" 设置项代替
- refactor: 去除 "基础颜色" 设置项，新增 "阈值" 设置项，基础颜色由 "阈值" 设置项的基础颜色代替

## 3.2.0

### 仪表盘变量组件重构

- refactor: 单个查询条件里的选项（最大数据点数 maxDataPoints、自定义时间 time）改到面板全局的查询选项里（最大数据点数 maxDataPoints、查询时间范围 queryOptionsTime）
- refactor: 新增 Variables 组件，废弃 VariableConfig 组件
- feat: 新增变量预览功能
- perf: 优化变量数据查询和渲染

## 3.3.0

- fix: 修正一些错别字（noraml -> normal, unit -> unit）

## 3.4.0

- fix: 修复分组里的面板没有做 maxDataPoints、queryOptionsTime 迁移的问题

## 4.0.0

### 多数据源查询

- feat: 每个查询 target 支持独立数据源（`targets[].datasource`），单个面板可混用多种数据源（面板 `datasourceCate` 为 `mixed`），通过新接口 `/api/n9e/dashboard/query` 一次提交多个数据源查询，并在服务端计算跨数据源表达式
- refactor: 旧版表达式 target 迁移为新结构：`__mode__: '__expr__'` 与 `expr` 统一为 `kind: 'expression'` + `expression` 字段
- refactor: Elasticsearch/OpenSearch 查询的 `query.syntax`（kuery/kql/lucene）迁移为 `query.filter_language`（kql/lucene）
- feat: 查询 target 新增 `resultType`（`time_series` | `logs`），按查询模式自动推断
- refactor: Elasticsearch/OpenSearch 多值 target（`query.values` 含多个值）在请求时展开为多个单值查询，首个值保留原 refId，其余分配唯一子 refId

## 4.1.0

- refactor: 使用 `dashboard.version` 作为唯一配置版本，移除面板版本字段
- fix: 修正 4.1.0 前仪表盘分组面板的折叠状态语义
