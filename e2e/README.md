# E2E 测试说明

基于 [Playwright](https://playwright.dev/) + [Midscene](https://midscenejs.com/) 的端到端测试。  
Midscene 提供 AI 驱动的页面操作能力（`aiTap` / `aiAssert` / `aiScroll` / `aiWaitFor`）。

## 目录结构

```
e2e/
├── fixture.ts          # Playwright + Midscene fixture，提供 test/expect/loginAndSetTokens 等
├── helpers.ts          # 通用页面操作工具（填写输入框、选择下拉等）
├── types.ts            # 公共类型（MidsceneFixtureMethods、AiTap 等）
├── config-loader.ts    # 从 JSON 文件目录加载测试配置（支持白名单过滤）
└── add-alert-rule/     # 告警规则创建测试套件
    ├── index.test.ts
    ├── normalizer.ts   # API 数据 → UI 展示值转换
    ├── types.ts
    ├── helpers/        # 套件内工具（填写触发器、选择数据源等）
    ├── queries/        # 按数据源类型分发的条件填写逻辑
    └── configs/        # 测试用 JSON 配置文件
```

## 环境变量

| 变量                      | 默认值                  | 说明                                                                                  |
| ------------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| `E2E_BASE_URL`            | `http://localhost:8765` | 被测页面的根地址                                                                      |
| `E2E_USERNAME`            | `root`                  | 登录用户名                                                                            |
| `E2E_PASSWORD`            | `root`                  | 登录密码                                                                              |
| `E2E_CONFIGS`             | 不过滤                  | 逗号分隔的配置文件名（不含 `.json`），只运行匹配的用例，例如 `es-index,prometheus-v1` |
| `MIDSCENE_MODEL_NAME`     | —                       | AI 模型名称，例如 `qwen3.7-plus`                                                      |
| `MIDSCENE_MODEL_API_KEY`  | —                       | AI 服务的 API Key                                                                     |
| `MIDSCENE_MODEL_BASE_URL` | —                       | AI 服务的 base URL（兼容 OpenAI 接口）                                                |
| `MIDSCENE_MODEL_FAMILY`   | —                       | 模型系列，例如 `qwen3`，影响 Midscene 内部提示词策略                                  |

> 本地开发时可在项目根目录创建 `.env` 文件写入上述变量，fixture 会通过 `dotenv/config` 自动加载。

## 运行测试

```bash
# 运行全部 e2e 测试
npm run e2e-test

# 只运行 es-index 配置
E2E_CONFIGS=es-index npm run e2e-test

# 指定目标环境
E2E_BASE_URL=http://your-server npm run e2e-test
```

## 添加新测试配置

在 `add-alert-rule/configs/` 下新增 JSON 文件（参考已有文件结构），测试会自动发现并运行。

## 添加新数据源类型的测试

1. 在 `add-alert-rule/queries/` 下新建 `<cate>.ts`，实现 `AlertRuleConditionHandler`
2. 在 `add-alert-rule/queries/index.ts` 中注册到 `HANDLERS` 映射
3. 在 `add-alert-rule/configs/` 下添加对应的 JSON 配置文件
