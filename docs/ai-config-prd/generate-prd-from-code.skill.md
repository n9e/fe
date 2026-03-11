# generate-prd-from-code

根据前端源代码自动生成或更新产品需求文档（PRD）。适用于需要将已实现的前端页面反向整理为结构化 PRD 文档的场景。

## 触发条件

当用户要求以下操作时使用此技能：

- 根据前端代码生成 PRD 文档
- 更新已有 PRD 文档使之与最新代码一致
- 为某个前端模块编写产品文档
- 补充 PRD 中的字段详情、交互说明、截图

## 工作流程

### 第一步：定位代码文件

1. 根据模块路径，用 `Glob` 找到所有相关的 `.tsx` 组件文件
2. 找到对应的 `services.ts` 接口定义文件（数据模型 + API 路由）
3. 找到 `locale/` 目录下的 i18n 翻译文件（`zh_CN.ts`、`en_US.ts`）

```
示例目录结构：
src/pages/模块名/
├── index.tsx              # 入口/列表页
├── 子模块A/
│   ├── index.tsx          # 列表组件
│   ├── EditDrawer.tsx     # 编辑抽屉/弹窗
│   └── services.ts        # 接口 + 数据模型
├── 子模块B/
│   └── ...
└── locale/
    ├── zh_CN.ts
    └── en_US.ts
```

### 第二步：阅读代码提取信息

并行读取所有文件，从中提取：

**从组件文件提取：**
- 页面布局结构（表格列定义、表单字段、抽屉/弹窗配置）
- 每个表单字段的：类型、是否必填、placeholder、tooltip、默认值、校验规则
- 每个按钮的：位置、图标、类型（primary/default/dashed/danger）、触发的交互行为
- 组件间的关联关系（如 Agent 编辑抽屉内嵌 LLM 配置抽屉）

**从 services.ts 提取：**
- TypeScript interface 定义（数据模型）
- API 路由路径和 HTTP 方法
- 请求/响应数据结构

**从 locale 文件提取：**
- 所有翻译 key 对应的实际显示文本（中英文）
- 将代码中的 `t('xxx.yyy')` 映射为真实文案

### 第三步：生成/更新 PRD 文档

按以下结构组织文档内容，每个子模块包含：

```markdown
## N. 模块名称

### N.1 页面说明
简要描述该模块的功能定位。

### N.2 列表页
![截图](./images/xxx.png)

表格列定义表 + 按钮与交互表。

### N.3 新增/编辑表单
![截图](./images/xxx.png)

表单字段表（包含 7 列）：
| 字段 | 字段名 | 类型 | 必填 | Placeholder | Tooltip | 说明 |

底部按钮交互表。

### N.4 数据模型
TypeScript interface 代码块。

### N.5 API 接口
| 方法 | 路径 | 说明 |
```

**字段表编写规则：**
- Placeholder：从代码中的 `placeholder` prop 或 i18n key 提取，无则标注"（无）"
- Tooltip：从 `tooltip` prop 或 `<Tooltip title={...}>` 提取，记录完整文案
- 类型：标注 Antd 组件名和关键 props，如 `InputNumber（min={0}, max={2}, step={0.1}）`
- 说明：补充布局信息（同行排列、占几列）、联动逻辑、数据过滤条件等

### 第四步：截图补充（可选）

如果有可访问的测试环境，使用 Playwright 逐页截图：

1. **登录系统** → 导航到目标模块页面
2. **按顺序截图每个状态：**
   - 列表页（默认状态）
   - 新增表单（空表单，展示 placeholder）
   - 编辑表单（数据回填状态）
   - 删除确认框
   - 可折叠面板展开状态
   - 下拉菜单展开状态
   - 测试连接结果（成功/失败）
   - 视图切换（如预览/源码模式）
3. **截图命名规范：** `{序号}-{模块}-{状态}.png`
   - 主截图：`01-agent-list.png`、`02-agent-edit-drawer.png`
   - 补充截图：`01b-agent-delete-confirm.png`、`07c-skill-add-dropdown.png`
4. **将截图引用插入文档对应位置**

### 第五步：补充通用章节

文档末尾添加：
- 模块关系图（ASCII 图示）
- 国际化支持说明
- 权限说明
- 公共字段说明（id, enabled, created_at 等）
- 通用交互模式汇总（开关切换、删除确认、表单提交等跨模块的一致性行为）

## 注意事项

- 以代码实际实现为准，不要臆测功能
- Placeholder 和 Tooltip 必须从代码或 i18n 文件中提取原文，不要自己编造
- 关注代码中的条件渲染逻辑（如"仅自定义技能显示删除按钮"、"编辑时 API Key 非必填"）
- 数据模型以 services.ts 中的 interface 为准，注意前端表单字段名与接口字段名可能不同（如表单 `timeout` → 接口 `extra_config.timeout_seconds`）
- 截图时确保页面完全加载（等待关键文本出现），滚动到底部截取完整内容

## 示例

```
/generate-prd-from-code src/pages/aiConfig docs/ai-config-prd
```
