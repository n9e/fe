---
description: Tailwind 优先、Less 兜底；避免双写与深层选择器滥用
globs:
  - 'src/**/*.{ts,tsx,less,css}'
alwaysApply: false
---

# 样式：Tailwind 优先 + 少量 Less

全局约定（颜色变量、最小改动等）见 `.cursor/rules/app.mdc`。

## 原则

1. **能直接用 Tailwind 表达的**（布局、间距、排版、圆角、常见交互态）→ 用 Tailwind。
2. **Tailwind 不划算或做不到的** → 少量 Less/CSS，选择器尽量收束在页面/模块根类名下。
3. **同一视觉属性**不要同时被 Tailwind 与 Less 争抢（避免难排查的覆盖问题）。

## 优先用 Tailwind

- 容器布局：`flex` / `grid` / `gap` / 内外边距 / 对齐。
- 业务界面：按钮、表单外观、文案层级、状态色（需与主题变量一致时，用已有 Tailwind 主题映射或 CSS 变量类，不硬编码色值）。
- 局部状态：`hover` / `focus` / `disabled` 等。
- 仅当前组件使用的展示类样式。

## 用 Less / 普通 CSS 更合适的情况

- 覆盖第三方组件内部结构（如 antd 深层节点、复杂表格头）。
- 全局或跨多页复用的 token、keyframes、无法用工具类清晰表达的动画。
- 强依赖复杂选择器（深层后代、兄弟组合、兼容向 hack 等）。

Less/CSS 侧要求：

- 选择器尽量局部化；嵌套不宜过深（**≤3 层**为宜）。
- 不复制一套与 Tailwind 等价的冗长规则。

## 实践技巧

- 可在 `className` 中使用 antd 定向写法（如 `[&_.ant-input-affix-wrapper]`）以减少裸 Less。
- 单处 `className` 过长时，抽成本地常量字符串或小组件，**不要**为此回到大段 Less。
- 改旧页面时优先**增量迁移**：先动当前需求触及的区块（如工具栏、列表行），再逐步收拢公共块。

## 自检

- 是否出现 Tailwind 与 Less **同时控制同一属性**？
- 是否新增了大段可被 Tailwind 替代的 Less？
- 明暗主题下视觉是否与现有变量体系一致？
