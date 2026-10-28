# Codex Instructions

- After making code changes, do not run `npm run build` or `npx tsc` unless the user explicitly asks for it.
- If verification is useful, prefer lighter checks that are relevant to the changed files, or ask before running expensive project-wide commands.
- After modifying source files, run `./node_modules/.bin/prettier --write` on the changed files and verify them with `./node_modules/.bin/prettier --check` before delivery. Follow `.prettierrc.json`; do not leave formatting-only violations in changed files.
- Prefer native type-checking APIs over lodash for type narrowing: use `Array.isArray` instead of `_.isArray`, `typeof x === 'number'` instead of `_.isNumber`, `x == null` instead of `_.isNil`, etc. Lodash type guard functions are not recognized by TypeScript when `@types/lodash` is unavailable, leaving `unknown` types un-narrowed.

## Forms and temporary containers

- When closing temporary containers such as modals and drawers, explicitly reset form data and local state (for example, `form.resetFields()`, loading state, and temporary selections) to prevent stale values when reopening.
- `form.setFieldsValue` performs an incremental update. When editing a different entity or fully repopulating a form, call `form.resetFields()` before `form.setFieldsValue()`.
- Ant Design `Collapse.Panel` does not mount its content while initially collapsed. When a panel contains `Form.Item` or `Form.List` fields that must be validated, populated, or submitted, add `forceRender` so the fields register with the form. Purely presentational panel content does not need it.

## 私有云品牌展示与功能权限

- 新增或修改页面、入口、介绍文案、文档链接、空状态、自然语言查询及跨功能关联前，阅读 [私有云品牌展示与功能权限隐藏](docs/private-cloud-visibility-and-permissions.md)。
- 品牌展示配置与 `/api/n9e-plus/self/perms` 产品权限分别判断；Admin 仅豁免功能权限，介绍仍受展示开关控制。复用文档中的公共 gate，并保留隐藏字段的已有配置。
- 验收组件只在独立验收分支 / 工作区存在，不能进入正式发布；三个仓库同步维护该文档与相关入口覆盖。
