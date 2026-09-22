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
├── globalState.ts                   # 仪表盘实例运行时（Provider + store 工厂），见「运行时边界」
├── index.tsx                        # 模块入口（路由挂载）
├── types.ts                         # 核心类型：IDashboardConfig / IPanel / ITarget 等
├── updateSchema.ts                  # 配置 schema 升级
├── Components/                      # 仪表盘内部通用组件（QueryExtraActions、LegendInput、Markdown 等）
├── DashboardLinks/                  # 仪表盘链接
├── Detail/                          # 仪表盘详情页
│   └── utils/
│       ├── dashboardMigrator.ts     # 旧版配置迁移到当前版本
│       └── index.ts                 # 详情页工具（getDatasourceValue 等）
├── Editor/                          # 仪表盘编辑器（查看态不得静态依赖此目录）
│   ├── Options/                     # 图表选项面板，按类型动态加载
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
│   ├── registry/                    # 图表注册表：类型、渲染器、选项加载器与默认配置
│   │   ├── panelTypes.ts            # 可视化类型顺序（展示顺序的唯一来源）
│   │   ├── defaults.ts              # 各类型默认 custom/options 与阈值默认值（纯数据）
│   │   ├── panelCharts.tsx          # 图表适配层，常用图表同步、低频图表按需加载
│   │   ├── lazyPanelChart.tsx       # 动态加载占位、失败提示与重试
│   │   ├── PanelErrorBoundary.tsx   # 面板级错误边界
│   │   └── PanelRenderer.tsx        # 按类型渲染，未知类型给出提示
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

## 运行时边界

`globalState.ts` 提供 `DashboardRuntimeProvider` 与 `createDashboardRuntimeStore`：每个仪表盘实例在挂载时创建自己的运行时 store，保存 `dashboardMeta`、`variablesWithOptions`、`variableExecution`、`range`、`series` 以及表格/图例编辑辅助状态。约束如下：

- 组件只能通过 `useGlobalState` / `useDashboardRuntimeStore` 读取当前实例的状态；缺少 Provider 时直接抛错，**不回落**到任何模块级共享状态，也不再导出模块级单例。
- 弹窗、分享页、独立图表等由独立 React root 挂载的入口，必须显式取得并传入所属实例的 store，不能假定自动继承 Context。
- 变量执行状态带有会话 ID，用于丢弃已卸载实例的迟到回调；面板查询由 `useQuery` 负责，运行时数据（时间范围、变量、scopedVars）显式取自所属实例。
- 面板渲染的静态依赖不得进入 `Editor/`：图表注册表用 `loadOptions` 动态加载编辑器选项面板，低频图表按需加载。该边界由 `Renderer/registry/viewEditorBoundary.test.ts` 守护。

## 配置保存流程

- 面板编辑、增删、复制、粘贴、拖拽、缩放、变量配置和详情设置**只更新页面状态**（`dashboard.configs`），不写后端；仓库中已不存在自动保存入口（`dashboardSaveMode` 已移除）。
- 只有显式保存（顶栏保存、离开确认时的保存）以及列表页创建、导入才会调用配置持久化接口；顶栏与离开提示共用同一个保存函数。
- 保存需要元数据与配置两个接口都成功后才提示成功；接口不具备事务能力，前端不宣称原子保存。请求失败时保留页面修改以避免重复提交，并保留权限判断与版本过期检查。
- 未保存标记使用配置修订计数：只有当前修订仍等于提交时修订才清除标记。普通编辑会标记未保存并触发离开提醒；row 折叠可随手动保存持久化，单独折叠既不触发提醒，也不清除已有提醒。
- 持久化配置只包含面板定义：repeat 派生面板、`scopedVars`、变量运行时选中值和查询结果都不进入配置。

## 测试

- **栈**：Jest + ts-jest；组件/集成用例用 `/** @jest-environment jsdom */` + @testing-library/react。
- **运行**：`npx jest src/pages/dashboard`（全量 `npx jest`）。
- **三层覆盖**：
  1. **单测**（node）：迁移器、请求构建、校验、target/step 工具、转换器等纯函数；
  2. **数据驱动**：对全部 22 个受支持数据源 cate 跑「3.4.0 老配置 → v4.0.0 迁移 → 请求载荷」断言；
  3. **渲染集成**（jsdom）：挂载 `Renderer`，mock 图表与 service，验证老配置全链路请求与渲染。
- **图表注册表**：`Renderer/registry/` 下覆盖类型顺序与默认配置、动态加载占位/失败重试、面板级错误边界、未知类型提示、特殊 props 与表格导出 ref 透传，以及「查看态静态依赖不进入 Editor」的结构约束。
- 详细方案见 `docs/dashboard-compat-tests-plan.md`。

## 相关文档

- [CHANGELOG.md](./CHANGELOG.md)：配置版本变更记录，含各版本不兼容更新说明
- [VARIABLES.md](./VARIABLES.md)：变量子系统架构（依赖图、执行模型、插值）
- [VARIABLE_VALUE_FLOW.md](./VARIABLE_VALUE_FLOW.md)：变量取值范围与 URL / localStorage 优先级
- [DATASOURCE_QUERY_AND_SERIES_PROCESSING.md](./DATASOURCE_QUERY_AND_SERIES_PROCESSING.md)：多数据源查询请求与序列处理
- [LLMs.txt](./LLMs.txt)：生成仪表盘配置时的最小字段说明
- [Variables/README.md](./Variables/README.md)：变量目录内的补充说明
