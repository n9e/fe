# 仪表盘变量 E2E Gherkin 模板

本文档已改写为 Gherkin 版本，并按变量类型拆分到目录 `e2e/dashboard-variable-e2e-template/`，便于阅读、按类型生成用例，以及逐类 review 现有 E2E。

## 全局测试上下文

- 默认 dashboard 页面：`/dashboards/794`
- 默认 localStorage 清理规则：`dashboard_v6_794_${var_name}`
- 默认 Query Prometheus 数据源 ID：`639`
- 默认 Query Prometheus 指标：`cpu_usage_idle`
- 默认 Query Prometheus series 接口：`/api/n9e-plus/proxy/639/api/v1/series`

说明：

- 后续所有 `.feature` 中出现的“默认 dashboard 页面”“默认 localStorage 清理规则”“默认 Query Prometheus 测试上下文”等语义化描述，均引用本节定义。
- 如果未来 dashboard id、localStorage key 规则、Prometheus 数据源 ID 或接口路径变化，只需要修改本节，不需要逐个修改各个 `.feature` 文件。

## 推荐命名约定

- 推荐 Query 上游变量名称：`region`
- 推荐 Query 上游变量别名：`地域`
- 推荐 Query 下游变量名称：`ident`
- 推荐 Query 下游变量别名：`机器`
- 推荐 Query 联动 panel 内容模板：`region=${region}, ident=${ident}`
- 推荐 Query 单值候选命名：优先直接使用真实 series 中提取出的 label 值，不额外造假值
- 推荐 Query 上游可区分值表示：使用“上游候选值 A / 上游候选值 B”这类语义描述，只有在真实 series 中确认具体值后才替换为真实值

说明：
- 本节是推荐默认命名，不是强制硬编码。
- 如果真实 series 数据提取出的字段名和字段值更适合做联动测试，可以替换推荐命名，但同一个 feature 内必须保持一致。
- 如果 AI 未能从真实数据中稳定抽取更好的命名，优先回退到本节定义的推荐命名约定。

## 使用说明

- 所有变量测试都基于真实页面交互方式编写。
- 登录方法 `e2e/utils/loginIfNeeded.ts`，基础 URL `e2e/utils/getBaseURL.ts`。
- 变量相关断言优先基于真实接口和真实页面数据，不使用 mock 数据伪造候选项、数据源和依赖关系。
- 所有变量测试都不点击仪表盘级“保存”。
- 允许在变量编辑弹窗内点击“保存”，让配置在当前会话内生效。
- 渲染测试和交互测试默认补一个“文本卡片” panel，在“内容”中通过变量 `name` 引用待测变量。
- 每个 feature 执行结束后都需要清空当前 feature 产生的变量、panel、临时配置和 localStorage。
- 如果同一 feature 内前后两个场景互不依赖，那么每个场景执行结束后也要立即清空环境数据，保证下一个场景从干净环境开始。

## 文档目录

- 通用规则：`e2e/dashboard-variable-e2e-template/common.feature`
- `textbox`：`e2e/dashboard-variable-e2e-template/textbox.feature`
- `custom`：`e2e/dashboard-variable-e2e-template/custom.feature`
- `constant`：`e2e/dashboard-variable-e2e-template/constant.feature`
- `query`：`e2e/dashboard-variable-e2e-template/query.feature`
- `datasource`：`e2e/dashboard-variable-e2e-template/datasource.feature`
- `datasourceIdentifier`：`e2e/dashboard-variable-e2e-template/datasource-identifier.feature`
- `hostIdent`：`e2e/dashboard-variable-e2e-template/host-ident.feature`
- AI review 清单：`e2e/dashboard-variable-e2e-template/review.feature`

## 建议使用方式

1. 先读 `common.feature`，统一测试边界和术语。
2. 再按变量类型读取对应 `.feature` 文件。
3. 生成 E2E 用例时，优先复用 `场景大纲` 和 `例子` 中的字段。
4. review 现有用例时，对照 `review.feature` 输出 `已覆盖 / 部分覆盖 / 未覆盖 / 不适用`。

## 测试数据营造

### Prometheus 查询数据获取

1. 先通过真实页面登录并进入“默认 dashboard 页面”。
2. 确认用于 Query 变量测试的 Prometheus 数据源为“默认 Query Prometheus 数据源 ID”。
3. 使用指标 `cpu_usage_idle` 获取 series 数据，请求示例：

```text
GET /api/n9e-plus/proxy/639/api/v1/series?start=${start}&end=${end}&match%5B%5D=cpu_usage_idle&limit=40000
```

4. `start` 和 `end` 应取当前测试时间范围对应的真实值，不要写死无效时间。
5. 如果接口未返回有效 series 数据，测试应立即报错并终止，不要继续生成变量依赖场景。
6. 依赖联动场景所需的 `region`、`ident` 等候选值，应从这批真实 series 数据中提取和组织。
7. 只有当真实 series 数据中能够找到可区分的上游值和下游结果时，才生成对应的依赖联动用例。
