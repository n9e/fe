# AI Agent 管理 - 设计文档

## 背景

将 AI 配置中的"大模型管理"(LLMProvider) 升级为"Agent 管理"。Agent 是一级管理实体，内联 LLM 配置，二期支持引用 Skill、MCP、IM。

功能尚未上线，直接替换 LLMProvider，不做兼容。

## 数据模型

### ai_agent 表（替代 llm_provider）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键自增 |
| name | varchar | Agent 名称 |
| description | text | 描述 |
| api_type | varchar | LLM 提供商: openai / claude / gemini |
| api_url | varchar | LLM API 地址 |
| api_key | varchar | API Key |
| model | varchar | 模型名 |
| extra_config | text | JSON: { temperature, max_tokens, timeout_seconds } |
| skill_ids | text | 二期: JSON 数组，引用 ai_skill IDs |
| mcp_server_ids | text | 二期: JSON 数组，引用 mcp_server IDs |
| im_config | text | 二期: IM 配置 |
| is_default | int | 是否默认 (0/1) |
| enabled | int | 是否启用 (0/1) |
| created_at | bigint | 创建时间 |
| created_by | varchar | 创建人 |
| updated_at | bigint | 更新时间 |
| updated_by | varchar | 更新人 |

## 后端 API

### 新增路由（替代 llm-providers）

```
GET    /api/n9e/ai-agents          列表
POST   /api/n9e/ai-agents          新建
PUT    /api/n9e/ai-agent/:id       更新
DELETE /api/n9e/ai-agent/:id       删除
POST   /api/n9e/ai-agent/:id/test  测试 LLM 连接
```

### 删除的路由

```
GET    /api/n9e/llm-providers
POST   /api/n9e/llm-providers
PUT    /api/n9e/llm-provider/:id
DELETE /api/n9e/llm-provider/:id
POST   /api/n9e/llm-provider/:id/test
```

### 内部调用变更

- `router_aiagent.go` 中 `query-generator` 改为调用 `AIAgentGetDefault()` 获取 LLM 配置

## 前端改动

### 新增文件

- `src/pages/aiConfig/Agents/services.ts` - API 调用
- `src/pages/aiConfig/Agents/index.tsx` - Agent 列表页
- `src/pages/aiConfig/Agents/AgentDrawer.tsx` - 右侧 Drawer (600px)

### Drawer 布局

1. **基本信息区**: name, description, is_default, enabled
2. **LLM 配置区**: api_type, api_url, api_key, model, 高级配置(temperature/max_tokens/timeout), 测试连接按钮
3. **扩展区**(二期): Skill / MCP / IM 按钮置灰，显示"即将支持"

### 修改文件

- `src/pages/aiConfig/index.tsx` - 渲染 `<Agents />` 替代 `<LLMProvider />`
- `src/components/SideMenu/menu.tsx` - tab key 改为 `/ai-config/agents`, label 改为 `menu.ai_agents`
- `src/components/SideMenu/locale/` 5 个语言文件 - `ai_llm` → `ai_agents`
- `src/pages/aiConfig/locale/` 5 个语言文件 - 新增 `agent.*` 翻译
- `src/components/AICopilot/services.ts` - API 路径改为 `/api/n9e/ai-agents`

### 删除文件

- `src/pages/aiConfig/LLMProvider/` 整个目录（index.tsx, EditModal.tsx, services.ts）

## 后端文件变动

### 新增

- `models/ai_agent.go` - 模型定义 + CRUD 方法

### 修改

- `models/migrate/migrate.go` - AutoMigrate 中 LLMProvider → AIAgent
- `center/router/router_ai_config.go` - Agent 路由/Handler 替换 LLMProvider 路由/Handler
- `center/router/router_aiagent.go` - query-generator 改用 AIAgent

### 删除

- `models/llm_provider.go`
