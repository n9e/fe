# QueryWorkspace

日志检索的通用查询工作区。视图组件只负责辅助开关、操作栏、双栏、预览和编辑器布局，不导入任何数据源插件。

`useQueryWorkspace<Metadata>` 管理操作流程，各数据源实现 `QueryWorkspaceAdapter<Metadata>`：

- `build()`：校验当前表单，返回 `{ statement, metadata }`。元数据由适配器自行定义。
- `applyGenerated(result)`：把生成语句及展示配置同步到数据源的查询表单，不执行查询。
- `resetBuilder()` / `clearStatement()`：分别重置辅助表单和手写语句。
- `execute()`：通过数据源已有的校验及查询流程执行当前语句。

数据源在页面层创建 Hook，通过 `contextKey` 标识数据源、库表等上下文。构建表单或时间范围变化时调用 `markDirty()`；历史记录、AI 等直接写入语句前调用 `enterManual()`。库表切换会自动重置表单及预览，并使旧生成请求失效。

工作区默认关闭辅助。`convert()` 只生成和应用，`run()` 在辅助模式下先生成再执行。关闭辅助保留表单、丢掉预览（回到辅助时是「待转换」而不是上次的转换结果）；`continueWriting()` 应用上次预览并进入手写。重置只影响当前模式，不自动查询。

生成失败会清掉上一次的预览（那条语句已不可信），仅执行失败时保留刚应用的结果；失败文案由数据源的适配器决定，工作区只负责在预览列里展示。

通过 `builder`、`editor` 注入数据源组件；`previewExtra`、`previewRef`、`below` 和 `queryButtonRef` 用于历史记录或 AI 等集成。`languageLabel`、`builderTitle`、`previewTitle` 可调整预览文案及标题；预览与手写编辑器同源（`SqlMonacoPreview`），只读展示生成的语句。

两种模式共用同一张卡片：32px 操作栏 + 200px 内容区。手写模式的内容区是 SQL 编辑器，辅助模式是等高的表单/预览双栏，切换时卡片高度不变。

已接入的数据源：Doris（首个示例，`src/plugins/doris/ExplorerNG/useQueryWorkspace.ts`）、ClickHouse（`src/plugins/clickHouse/ExplorerNG/useQueryWorkspace.ts`）、Elasticsearch 的 SQL 模式（`src/plugins/elasticsearch/ExplorerNG/useQueryWorkspace.ts`）。三者共用 `getErrorMessage` 把后端 err 还原成提示文案。
