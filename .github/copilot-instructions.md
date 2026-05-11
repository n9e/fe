---
name: copilot-instructions
description: This file describes the coding style and guidelines for the project, which will be used by GitHub Copilot to generate code suggestions that align with the project's standards.
applyTo: 'src/**/*.{ts,tsx}'
---

# N9E 前端项目

## 目录速览

```
src/
├── components/     # 通用 UI 与业务无关的基础组件
├── pages/          # 路由页面
├── plus/           # Plus 扩展（datasource、parcels 等，路径别名 plus:/*）
├── plugins/        # 数据源等插件化功能（含 Explorer/Dashboard 等）
├── store/          # Zustand 等状态
├── services/       # 接口与领域服务
├── utils/          # 工具函数
├── routers/        # 路由配置
├── theme/          # 主题与 CSS 变量（如 variable.css）
├── locales/        # 国际化资源
├── assets/         # 静态资源
├── types/          # 全局类型
├── App.tsx
└── main.tsx
```

## 技术栈与风格

- TypeScript + React Hooks；优先函数组件，避免 class 组件。
- 组件 Props 使用 `interface` 显式声明，避免 `any`。
- 遵循仓库既有格式与 Prettier 配置；改动保持最小范围，不重写无关模块。
- 不臆测接口或业务逻辑；上下文不足时说明缺口或反问。
- 数据转换函数必须保持幂等性（相同输入多次调用产生相同输出），如果函数会修改入参对象，首行使用 `_.cloneDeep(values)` 保护原始引用不被污染。
- 同一组件中应避免多次调用同一有副作用的转换函数，优先提取变量复用计算结果。

## 数据与错误

- 异步请求须有错误处理（`try/catch`、`.catch`、`onError` 等，与现有模式一致）。

## 样式与颜色

- 颜色、主题相关值使用 `src/theme/variable.css`（及现有主题体系）中的变量，避免魔法色值。

## Tailwind 与 Less 的分工

### 原则

1. **能直接用 Tailwind 表达的**（布局、间距、排版、圆角、常见交互态）→ 用 Tailwind。
2. **Tailwind 不划算或做不到的** → 少量 Less/CSS，选择器尽量收束在页面/模块根类名下。
3. **同一视觉属性**不要同时被 Tailwind 与 Less 争抢（避免难排查的覆盖问题）。

### 优先用 Tailwind

- 容器布局：`flex` / `grid` / `gap` / 内外边距 / 对齐。
- 业务界面：按钮、表单外观、文案层级、状态色（需与主题变量一致时，用已有 Tailwind 主题映射或 CSS 变量类，不硬编码色值）。
- 局部状态：`hover` / `focus` / `disabled` 等。
- 仅当前组件使用的展示类样式。

### 用 Less / 普通 CSS 更合适的情况

- 覆盖第三方组件内部结构（如 antd 深层节点、复杂表格头）。
- 全局或跨多页复用的 token、keyframes、无法用工具类清晰表达的动画。
- 强依赖复杂选择器（深层后代、兄弟组合、兼容向 hack 等）。

Less/CSS 侧要求：

- 选择器尽量局部化；嵌套不宜过深（**≤3 层**为宜）。
- 不复制一套与 Tailwind 等价的冗长规则。

### 实践技巧

- 可在 `className` 中使用 antd 定向写法（如 `[&_.ant-input-affix-wrapper]`）以减少裸 Less。
- 单处 `className` 过长时，抽成本地常量字符串或小组件，**不要**为此回到大段 Less。
- 改旧页面时优先**增量迁移**：先动当前需求触及的区块（如工具栏、列表行），再逐步收拢公共块。

### 自检

- 是否出现 Tailwind 与 Less **同时控制同一属性**？
- 是否新增了大段可被 Tailwind 替代的 Less？
- 明暗主题下视觉是否与现有变量体系一致？

## 测试

- 使用 Vitest + Testing Library（或现有测试框架）。
- 测试文件命名：`*.test.ts` / `*.test.tsx` 或 `*.spec.ts` / `*.spec.tsx`，与待测文件同目录或约定目录即可。
- 测试中的数据字面量优先使用 `as const` 收窄类型，防止字符串/数值被扩宽，从而在 IDE 中捕获拼写错误：
  ```typescript
  const input = { name: 'test', count: 1 } as const;
  ```
- 避免在测试数据中使用 `as any`。如果测试数据与函数签名类型不匹配，优先用 `satisfies` 验证结构，再通过函数本身的 `any` 参数兼容。
- 测试数据的工厂函数或内联对象中如包含 mock 函数（`jest.fn()` 等），不适合加 `as const`，保持原样即可。
- 不要在测试文件中定义与源码重复的本地类型/接口，优先使用源码导出的类型或 `Partial<T>`。
