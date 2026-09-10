# 仪表盘（Dashboard）

仪表盘模块：负责仪表盘的列表、详情、编辑、面板渲染与查询，以及数据转换（transformations）。当前配置版本 `4.1.0`（多数据源查询）。

## 目录结构

```
src/pages/dashboard/
├── CHANGELOG.md                     # 版本变更记录（含各版本无法兼容的更新说明）
├── LLMs.txt
├── VARIABLES.md                     # 变量子系统架构（含架构图与关键约束）
├── config.tsx                       # 仪表盘模块配置
├── external-modules.d.ts
├── globalState.ts                   # 仪表盘全局状态
├── index.tsx                        # 模块入口（路由挂载）
├── types.ts                         # 核心类型：IDashboardConfig / IPanel / ITarget 等
├── updateSchema.ts                  # 配置 schema 升级
├── Components/                      # 仪表盘内部通用组件（QueryExtraActions、LegendInput 等）
├── DashboardLinks/                  # 仪表盘链接
├── Detail/                          # 仪表盘详情页
│   └── utils/
│       ├── dashboardMigrator.ts     # 旧版配置迁移到当前版本
│       └── index.ts                 # 详情页工具（getDatasourceValue 等）
├── Editor/                          # 仪表盘编辑器
│   ├── QueryEditor/                 # 查询编辑器（按数据源 cate 分发 QueryBuilder）
│   ├── Components/ExpressionPanel/  # 表达式面板
│   ├── Fields/Overrides/            # 字段覆盖
│   ├── TransformationsEditorNG/     # 转换编辑器
│   └── upgradeTableToNG…            # table → tableNG 升级（Editor 内并行兼容路径）
├── List/                            # 仪表盘列表页
├── Panels/                          # 面板布局（react-grid-layout、row 分组等）
├── Renderer/                        # 面板渲染
│   ├── datasource/                  # 4.0.0 多数据源查询核心
│   │   ├── contract.ts              # buildDashboardQueryRequest / normalizeDashboardQueryResponse
│   │   ├── registry.ts              # 22 个数据源 cate 注册表（就绪/默认/序列化）
│   │   ├── useQuery.tsx             # 查询 Hook（500ms 防抖、revision 驱动）
│   │   ├── service.ts               # fetchDashboardQuery（POST /api/n9e/dashboard/query）
│   │   └── elasticsearch/           # ES/opensearch 查询适配
│   ├── Renderer/                    # 面板渲染最上层（集成测试挂载点）
│   ├── TableNG/  TimeSeriesNG/      # 表格 / 时序图渲染
│   └── utils/                       # 渲染工具（valueFormatter 等）
├── Share/                           # 分享
├── VariableConfig/                  # 变量配置（v3.2 起废弃，由 Variables 取代）
├── Variables/                       # 变量（v3.2 重构），架构见 VARIABLES.md
├── hooks/                           # 模块内 Hook
├── locale/                          # 国际化资源
├── test/fixtures/                   # 仪表盘专属测试数据
│   ├── legacyDashboards.ts          # 老仪表盘「黄金样本」fixture
│   ├── legacyDashboardsByCate.ts    # 22 个数据源 cate 的数据驱动 fixture 生成器
│   └── dashboardQuery.ts            # 查询请求/响应 mock 工厂
├── transformations/                 # 数据转换器（Organize / Merge / GroupBy / Reduce 等 20+ 个）
└── utils/                           # 工具函数（upgradeTableToNG、json、validateDashboardConfig 等）
```

## 版本约定

`dashboard.version` 是唯一的持久化 schema 版本。仪表盘及其全部面板结构迁移均由该版本驱动，面板不单独保存版本字段。

## 运行时状态与多实例限制

`globalState.ts` 基于 `react-hooks-global-state` 创建模块级单例。它保存的并不只是本次变量联动的 `variableExecution`，还包括 `dashboardMeta`、`variablesWithOptions`、`range`、`series`、表格字段和图例编辑状态等。因此，同一个 React 树内并存多个仪表盘运行时实例目前**不受支持**：后挂载实例会覆盖前一个实例的变量、时间范围、元数据和编辑辅助状态，面板查询也可能使用错误的变量值。

当前路由使用方式是一页只挂载一个仪表盘实例。变量执行状态通过会话 ID 防止已卸载实例的异步链回调覆盖新页面的暂停/恢复状态，但这不是多实例隔离方案。若产品需要在同一 React 树内并列展示多个仪表盘，应将上述全局状态迁移为以仪表盘实例为边界的 `DashboardRuntimeContext`，并让变量、面板渲染与编辑器共享该 Context。

## 测试

- **栈**：Jest + ts-jest；组件/集成用例用 `/** @jest-environment jsdom */` + @testing-library/react。
- **运行**：`npx jest src/pages/dashboard`（全量 `npx jest`）。
- **三层覆盖**：
  1. **单测**（node）：迁移器、请求构建、校验、target/step 工具、转换器等纯函数；
  2. **数据驱动**：对全部 22 个受支持数据源 cate 跑「3.4.0 老配置 → v4.0.0 迁移 → 请求载荷」断言；
  3. **渲染集成**（jsdom）：挂载 `Renderer`，mock 图表与 service，验证老配置全链路请求与渲染。
- 详细方案见 `docs/dashboard-compat-tests-plan.md`。
