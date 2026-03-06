---
name: copilot-instructions
description: This file describes the coding style and guidelines for the project, which will be used by GitHub Copilot to generate code suggestions that align with the project's standards.
applyTo: 'src/**/*.{ts,tsx}'
---

# N9E 前端项目

## 项目结构

```
src/
├── components/         # 通用组件库（表单、图表、输入框、弹窗等）
├── pages/              # 页面级组件（account、dashboard、datasource、explorer 等）
├── plus/               # 扩展模块（datasource、parcels 等插件化功能）
├── utils/              # 工具函数库
├── routers/            # 路由配置
├── plugins/            # Vite 插件
├── theme/              # 主题配置（颜色、尺寸等）
├── locales/            # 国际化翻译文件
├── App.tsx             # 根组件
└── main.tsx            # 应用入口
```

## 核心约定

- 严格遵循项目规范，参考既有代码风格。
- 禁止凭空假设接口或逻辑，发现上下文不足时要主动询问或提示补充。
- 不允许使用 hardcode 的颜色，如果需要使用颜色，应该使用 theme/variable.css 中定义的颜色变量。
- 遵循项目下的 prettier 规范
- 前端统一使用 TypeScript + React Hooks。
- 优先函数式写法，避免 class 组件。
- 所有异步请求必须包含错误处理。
- 生成测试时使用 Vitest + Testing Library。
- 修改代码时尽量最小改动，不重写无关模块。
- React 组件 Props 必须用 interface 显式定义，禁止使用 any。
- 测试文件命名规范：_.test.ts 或 _.spec.ts。
