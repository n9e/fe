# AI 配置模块 - 产品需求文档 (PRD)

> 版本：v1.0
> 日期：2026-03-11
> 模块路径：系统配置 → AI 配置
> 前端路由：`/ai-config/*`

## 1. 概述

AI 配置模块是 Nightingale 平台的 AI 能力管理中心，用于统一管理 AI Agent、LLM 大语言模型、Skill 技能、MCP Server 四大核心资源。用户可以在此配置 AI 对话所需的模型、技能和工具服务，并将它们组合为 Agent 对外提供 AI 服务。

模块包含四个 Tab 页：

| Tab | 路由 | 说明 |
|-----|------|------|
| Agent 管理 | `/ai-config/agents` | 管理 AI Agent，定义其关联的 LLM、Skill 和 MCP Server |
| LLM 管理 | `/ai-config/llm-configs` | 管理大语言模型配置，包含 API 连接信息和模型参数 |
| Skill 管理 | `/ai-config/skills` | 管理 Agent 可使用的技能（提示词指令） |
| MCP 管理 | `/ai-config/mcp-servers` | 管理 MCP (Model Context Protocol) 远程工具服务器 |

---

## 2. Agent 管理

### 2.1 页面说明

Agent 是 AI 对话的执行主体，它将 LLM、Skill、MCP Server 三者组合在一起，定义了一个完整的 AI 对话能力。

### 2.2 列表页

![Agent 列表](./images/01-agent-list.png)

列表以表格形式展示所有已配置的 Agent，支持以下列：

| 列名 | 字段 | 说明 |
|------|------|------|
| 名称 | `name` | Agent 的唯一标识名称 |
| 描述 | `description` | Agent 的用途描述，超长时省略显示 |
| LLM 配置 | `llm_config_id` | 关联的 LLM 配置名称。若为旧版数据，则显示 `api_type / model` |
| 用途 | `use_case` | Agent 的使用场景，当前支持"AI 对话" |
| 启用 | `enabled` | 开关切换，控制 Agent 是否可用（1=启用，0=禁用） |
| 操作 | - | 编辑（笔图标）、删除（垃圾桶图标） |

**页面操作**：
- 右上角「+ 新增 Agent」按钮，打开新增抽屉
- 启用列开关可直接在列表页切换 Agent 状态
- 删除前弹出确认对话框

### 2.3 新增/编辑抽屉

![Agent 编辑抽屉](./images/02-agent-edit-drawer.png)

抽屉从右侧滑出，包含以下表单字段：

| 字段 | 字段名 | 类型 | 必填 | 说明 |
|------|--------|------|------|------|
| 名称 | `name` | 文本输入 | 是 | Agent 的名称，用于标识和展示 |
| 用途 | `use_case` | 下拉选择 | 是 | Agent 的使用场景。当前可选值：`chat`（AI 对话）。带 tooltip 提示："该 Agent 主要用于哪个场景" |
| 描述 | `description` | 多行文本 | 否 | 描述该 Agent 的用途，placeholder："描述该 Agent 的用途..." |
| 启用 | `enabled` | 开关 | - | 默认启用。控制 Agent 是否激活 |
| 选择 LLM | `llm_config_id` | 下拉选择 | 是 | 选择一个已配置且已启用的 LLM。下拉选项格式：`{名称} ({提供商类型} / {模型})`。旁边有「新建 LLM」快捷链接，点击跳转到 LLM 管理 Tab |
| 关联 Skill | `skill_ids` | 多选下拉 | 否 | 选择关联的技能（仅显示已启用的 Skill）。tooltip 提示："关联的技能将优先被使用" |
| 关联 MCP Server | `mcp_server_ids` | 多选下拉 | 否 | 选择关联的 MCP Server（仅显示已启用的 MCP Server）。tooltip 提示："配置该 Agent 可使用的 MCP Server" |

**表单布局**：名称和用途在同一行，描述和启用各占一行，LLM 选择下方有分隔线与上方基础信息区分。

### 2.4 数据模型

```typescript
interface AIAgent {
  id: number;              // 自增主键
  name: string;            // Agent 名称
  description: string;     // 描述
  use_case: string;        // 用途，如 "chat"
  llm_config_id: number;   // 关联的 LLM 配置 ID
  skill_ids: number[];     // 关联的 Skill ID 列表
  mcp_server_ids: number[];// 关联的 MCP Server ID 列表
  enabled: number;         // 是否启用 (0/1)
  created_at: number;      // 创建时间戳
  created_by: string;      // 创建人
  updated_at: number;      // 更新时间戳
  updated_by: string;      // 更新人
}
```

### 2.5 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/n9e/ai-agents` | 获取所有 Agent 列表 |
| POST | `/api/n9e/ai-agents` | 新增 Agent |
| PUT | `/api/n9e/ai-agent/{id}` | 更新指定 Agent |
| DELETE | `/api/n9e/ai-agent/{id}` | 删除指定 Agent |
| POST | `/api/n9e/ai-agent/{id}/test` | 测试 Agent 的 LLM 连接 |

---

## 3. LLM 管理

### 3.1 页面说明

LLM 管理用于配置大语言模型的连接信息和参数，支持 OpenAI 兼容、Anthropic Claude、Google Gemini 三种提供商类型。

### 3.2 列表页

![LLM 列表](./images/03-llm-list.png)

| 列名 | 字段 | 说明 |
|------|------|------|
| 名称 | `name` | LLM 配置的名称 |
| 描述 | `description` | 配置描述，超长时省略显示 |
| 提供商类型 | `api_type` | 模型提供商类型，显示为翻译后的文本 |
| 模型 | `model` | 模型名称/ID |
| 启用 | `enabled` | 开关切换 |
| 操作 | - | 编辑、删除 |

**页面操作**：
- 右上角「+ 新增 LLM」按钮
- 启用列开关可直接切换状态

### 3.3 新增/编辑抽屉

#### 基础配置

![LLM 编辑 - 基础配置](./images/04-llm-edit-drawer.png)

| 字段 | 字段名 | 类型 | 必填 | 说明 |
|------|--------|------|------|------|
| 名称 | `name` | 文本输入 | 是 | LLM 配置的名称 |
| 启用 | `enabled` | 开关 | - | 是否启用该配置 |
| 描述 | `description` | 多行文本 | 否 | placeholder："描述该 LLM 配置的用途..." |
| 提供商类型 | `api_type` | 下拉选择 | 是 | 可选值见下表 |
| 模型 | `model` | 文本输入 | 是 | 模型名称或 ID，placeholder："gpt-4o" |
| API URL | `api_url` | 文本输入 | 是 | API 端点地址，placeholder："https://api.openai.com/v1" |
| API Key | `api_key` | 密码输入 | 新增时必填，编辑时可选 | API 认证密钥，以密文形式显示，可切换显示/隐藏 |

**提供商类型选项**：

| 值 | 显示名称 |
|----|----------|
| `openai` | OpenAI 兼容 |
| `claude` | Anthropic Claude |
| `gemini` | Google Gemini |

**测试连接按钮**：点击后向后端发起测试请求，返回结果以标签形式展示：
- 成功：绿色标签 "连接成功" + 响应耗时（ms）
- 失败：红色标签 "连接失败" + 错误信息

#### 高级配置（可折叠面板）

![LLM 编辑 - 高级配置](./images/06-llm-edit-advanced-bottom.png)

高级配置默认折叠，点击展开。所有高级参数存储在 `extra_config` JSON 字段中。

| 字段 | 字段名 | 类型 | 必填 | 说明 |
|------|--------|------|------|------|
| 超时时间(秒) | `timeout_seconds` | 数字输入 | 否 | 单次 API 请求的超时时间（秒），placeholder："e.g. 60" |
| 跳过 TLS 检查 | `skip_tls_verify` | 开关 | 否 | 跳过 SSL/TLS 证书验证，适用于自签名证书场景 |
| Proxy | `proxy` | 文本输入 | 否 | HTTP 代理地址，placeholder："http://proxy:8080" |
| 自定义 Header | `custom_headers` | 动态键值对列表 | 否 | 自定义 HTTP 请求头，支持添加多条。每条包含 Header 名称和 Header 值 |
| 自定义请求参数 | `custom_params` | 多行文本 | 否 | JSON 格式的自定义模型请求参数，如 `{"temperature": 1.0, "top_p": 1.0, "guided_choice": ["positive", "negative"]}` |
| Temperature | `temperature` | 数字输入 | 否 | 控制输出随机性，范围 0-2，步长 0.1。值越高输出越多样，值越低越确定性，placeholder："e.g. 0.7" |
| Max Tokens | `max_tokens` | 数字输入 | 否 | 模型单次响应的最大 token 数，最小值 1，placeholder："e.g. 4096" |
| 上下文长度 | `context_length` | 数字输入 | 否 | 模型支持的最大上下文窗口大小（token 数），最小值 1，placeholder："e.g. 128000" |

### 3.4 数据模型

```typescript
interface AILLMConfig {
  id: number;              // 自增主键
  name: string;            // 配置名称
  description: string;     // 描述
  api_type: string;        // 提供商类型："openai" | "claude" | "gemini"
  api_url: string;         // API 端点 URL
  api_key: string;         // API 密钥
  model: string;           // 模型名称
  extra_config: string;    // 高级配置 JSON 字符串，包含以下字段：
                           //   timeout_seconds: number
                           //   skip_tls_verify: boolean
                           //   proxy: string
                           //   custom_headers: {name: string, value: string}[]
                           //   custom_params: string (JSON)
                           //   temperature: number
                           //   max_tokens: number
                           //   context_length: number
  enabled: number;         // 是否启用 (0/1)
  created_at: number;      // 创建时间戳
  created_by: string;      // 创建人
  updated_at: number;      // 更新时间戳
  updated_by: string;      // 更新人
}
```

### 3.5 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/n9e/ai-llm-configs` | 获取所有 LLM 配置列表 |
| POST | `/api/n9e/ai-llm-configs` | 新增 LLM 配置 |
| PUT | `/api/n9e/ai-llm-config/{id}` | 更新指定 LLM 配置 |
| DELETE | `/api/n9e/ai-llm-config/{id}` | 删除指定 LLM 配置 |
| POST | `/api/n9e/ai-llm-config/{id}/test` | 测试 LLM 连接，请求体：`{id?, api_type, api_url, api_key, model}` |

---

## 4. Skill 管理

### 4.1 页面说明

Skill（技能）是一组提示词指令，定义了 Agent 在特定场景下的行为方式。技能分为"内置技能"和"自定义技能"两类。内置技能的名称不可修改，自定义技能可完全编辑和删除。

### 4.2 列表页（左右分栏布局）

![Skill 列表](./images/07-skill-list.png)

页面采用左右分栏布局，不同于其他 Tab 的表格布局：

**左侧面板（240px 宽度）**：
- 顶部标题"Skill 管理"，右侧有搜索图标和新增（+）图标
- 搜索：点击搜索图标展开搜索框，支持关键字搜索
- 新增下拉菜单：
  - 「自行编写技能」- 打开编写 Skill 弹窗
  - 「上传技能文件」- 通过文件导入 Skill
- 技能列表分组显示：
  - **内置技能**组：系统预置的技能
  - **自定义技能**组：用户自行创建的技能
- 每个技能项显示名称，未启用的技能旁显示 "off" 标签
- 点击选中某个技能，右侧显示详情

**右侧面板（详情区域）**：
- **标题行**：技能名称 + 启用开关 + 编辑按钮 + 删除按钮（仅自定义技能显示删除）
- **Description 区域**：显示技能的描述文字
- **Instructions 区域**：显示技能的提示词指令
  - 支持两种查看模式切换：
    - 预览模式（眼睛图标）：Markdown 渲染后的富文本
    - 源码模式（代码图标）：显示原始 Markdown 文本
- **资源文件区域**：
  - 标题"资源文件" + 「上传文件」按钮
  - 文件列表表格，列：文件名、大小、操作（预览/删除）
  - 文件大小自动格式化显示为 B、KB、MB
  - 支持的文件类型：`.md`, `.txt`, `.json`, `.yaml`, `.yml`, `.csv`
  - 点击预览（眼睛图标）在弹窗中显示文件内容

### 4.3 新增/编辑弹窗

![Skill 编辑弹窗](./images/08-skill-edit-modal.png)

| 字段 | 字段名 | 类型 | 必填 | 说明 |
|------|--------|------|------|------|
| Skill name | `name` | 文本输入 | 是 | 技能名称，placeholder："my-skill-name"。内置技能时该字段禁用不可编辑 |
| Description | `description` | 多行文本（3行） | 否 | 技能描述，placeholder："描述该技能的用途和触发场景..." |
| Instructions | `instructions` | 多行文本（10行，等宽字体） | 是 | 提示词指令内容，支持 Markdown 格式，placeholder："编写提示词指令，支持 Markdown 格式..." |

### 4.4 数据模型

```typescript
interface AISkill {
  id: number;              // 自增主键
  name: string;            // 技能名称
  description: string;     // 描述
  instructions: string;    // 提示词指令（Markdown 格式）
  is_builtin: number;      // 是否为内置技能 (0/1)
  enabled: number;         // 是否启用 (0/1)
  created_at: number;      // 创建时间戳
  created_by: string;      // 创建人
  updated_at: number;      // 更新时间戳
  updated_by: string;      // 更新人
}

interface AISkillFile {
  id: number;              // 文件 ID
  skill_id: number;        // 所属 Skill ID
  name: string;            // 文件名
  content?: string;        // 文件内容（查看时返回）
  size: number;            // 文件大小（字节）
  created_at: number;      // 创建时间戳
  created_by: string;      // 创建人
}
```

### 4.5 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/n9e/ai-skills` | 获取所有 Skill 列表，支持 `?search=` 关键字过滤 |
| GET | `/api/n9e/ai-skill/{id}` | 获取单个 Skill 详情 |
| POST | `/api/n9e/ai-skills` | 新增 Skill |
| PUT | `/api/n9e/ai-skill/{id}` | 更新指定 Skill |
| DELETE | `/api/n9e/ai-skill/{id}` | 删除指定 Skill |
| POST | `/api/n9e/ai-skills/import` | 导入 Skill 文件（FormData，字段名 `file`） |
| GET | `/api/n9e/ai-skill/{skillId}/files` | 获取 Skill 的资源文件列表 |
| POST | `/api/n9e/ai-skill/{skillId}/files` | 上传资源文件（FormData） |
| GET | `/api/n9e/ai-skill-file/{fileId}` | 获取资源文件内容 |
| DELETE | `/api/n9e/ai-skill-file/{fileId}` | 删除资源文件 |

---

## 5. MCP 管理

### 5.1 页面说明

MCP (Model Context Protocol) 管理用于配置远程 MCP Server，使 Agent 能够调用外部工具和服务。仅支持远程 MCP Server，Server 需无需认证或支持自定义 Authorization Header。

### 5.2 列表页

![MCP 列表](./images/09-mcp-list.png)

| 列名 | 字段 | 说明 |
|------|------|------|
| 名称 | `name` | MCP Server 名称 |
| MCP Server URL | `url` | Server 的远程访问地址，超长时省略显示 |
| 启用 | `enabled` | 开关切换 |
| 操作 | - | 测试连接（链接图标）、编辑（笔图标）、删除（垃圾桶图标） |

**页面操作**：
- 右上角「+ 新增 Server」按钮
- 操作列的测试连接图标：点击后弹窗显示测试结果
  - 测试成功时展示该 Server 提供的工具列表（工具名称 + 描述）
  - 测试失败时显示错误信息

### 5.3 新增/编辑弹窗

![MCP 编辑弹窗](./images/10-mcp-edit-modal.png)

| 字段 | 字段名 | 类型 | 必填 | 说明 |
|------|--------|------|------|------|
| 名称 | `name` | 文本输入 | 是 | MCP Server 名称，placeholder："请输入 MCP Server 名称" |
| 启用 | `enabled` | 开关 | - | 默认启用 |
| MCP Server URL | `url` | 文本输入 | 是 | Server 远程地址，placeholder："https://my.mcp.server.com/mcp" |
| HTTP Headers（可选） | `headers` | 动态键值对列表 | 否 | 自定义 HTTP 请求头，将随请求发送至 MCP Server。每条包含 Header 名称（placeholder: "Authorization"）和 Header 值（placeholder: "Bearer \<token\>"） |
| 描述 | `description` | 多行文本 | 否 | placeholder："简要描述该 MCP Server 的用途..." |

**信息提示框**（弹窗底部）：
- 标题："MCP Server 接入说明"
- 内容："仅支持远程 MCP Server。Server 需满足以下条件之一：无需认证、支持自定义 Authorization Header 认证。"

**测试连接按钮**（弹窗左下角）：
- 支持在保存前测试连接
- 测试成功时显示 Server 提供的可用工具列表
- 测试失败时显示错误信息和耗时

### 5.4 数据模型

```typescript
interface MCPServer {
  id: number;              // 自增主键
  name: string;            // Server 名称
  url: string;             // Server 远程地址
  headers: string;         // HTTP Headers JSON 字符串，格式：{"Header-Name": "value"}
  env_vars: string;        // 环境变量（预留字段）
  description: string;     // 描述
  enabled: number;         // 是否启用 (0/1)
  created_at: number;      // 创建时间戳
  created_by: string;      // 创建人
  updated_at: number;      // 更新时间戳
  updated_by: string;      // 更新人
}
```

### 5.5 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/n9e/mcp-servers` | 获取所有 MCP Server 列表 |
| POST | `/api/n9e/mcp-servers` | 新增 MCP Server |
| PUT | `/api/n9e/mcp-server/{id}` | 更新指定 MCP Server |
| DELETE | `/api/n9e/mcp-server/{id}` | 删除指定 MCP Server |
| POST | `/api/n9e/mcp-server/{id}/test` | 测试已保存的 MCP Server 连接 |
| POST | `/api/n9e/mcp-servers/test` | 测试 MCP Server 配置（未保存时），请求体：`{url, headers}` |
| GET | `/api/n9e/mcp-server/{id}/tools` | 获取 MCP Server 提供的工具列表 |

---

## 6. 模块关系图

```
┌─────────────────────────────────────────────┐
│                   Agent                      │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐ │
│  │   LLM   │  │  Skills  │  │MCP Servers │ │
│  │ (1个)   │  │ (多个)   │  │ (多个)     │ │
│  └────┬────┘  └────┬─────┘  └─────┬──────┘ │
└───────┼────────────┼──────────────┼─────────┘
        │            │              │
        ▼            ▼              ▼
   LLM 配置     Skill 配置    MCP Server 配置
   (api_type,   (instructions, (url, headers)
    model,       资源文件)
    api_key...)
```

- **Agent → LLM**：一对一关系，每个 Agent 必须关联一个 LLM 配置
- **Agent → Skill**：一对多关系，每个 Agent 可关联多个 Skill
- **Agent → MCP Server**：一对多关系，每个 Agent 可关联多个 MCP Server
- **Skill → 资源文件**：一对多关系，每个 Skill 可包含多个资源文件

---

## 7. 国际化支持

模块支持以下语言：

| 语言 | Locale 文件 |
|------|-------------|
| 简体中文 | `zh_CN.ts` |
| 英文 | `en_US.ts` |
| 繁体中文（香港） | `zh_HK.ts` |
| 日文 | `ja_JP.ts` |
| 俄文 | `ru_RU.ts` |

---

## 8. 权限说明

AI 配置模块位于「系统配置」菜单下，通常需要管理员权限才可访问。所有增删改操作均需要相应权限。

---

## 9. 公共字段说明

以下字段在所有资源中通用：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 自增主键，由后端生成 |
| `enabled` | number | 启用状态，0=禁用，1=启用 |
| `created_at` | number | 创建时间（Unix 时间戳） |
| `created_by` | string | 创建人用户名 |
| `updated_at` | number | 最后更新时间（Unix 时间戳） |
| `updated_by` | string | 最后更新人用户名 |
