# Codex Instructions

- After making code changes, do not run `npm run build` or `npx tsc` unless the user explicitly asks for it.
- If verification is useful, prefer lighter checks that are relevant to the changed files, or ask before running expensive project-wide commands.
- After modifying source files, run `./node_modules/.bin/prettier --write` on the changed files and verify them with `./node_modules/.bin/prettier --check` before delivery. Follow `.prettierrc.json`; do not leave formatting-only violations in changed files.
- Prefer native type-checking APIs over lodash for type narrowing: use `Array.isArray` instead of `_.isArray`, `typeof x === 'number'` instead of `_.isNumber`, `x == null` instead of `_.isNil`, etc. Lodash type guard functions are not recognized by TypeScript when `@types/lodash` is unavailable, leaving `unknown` types un-narrowed.

## 页面修改原则

- 所有页面修改都要检查视觉美观与周边协调，包括按钮间距、水平/垂直对齐、颜色、图标与文字的实际可见间距；不能只检查控件外框或功能是否可用。
- 提示浮窗按内容调整宽度：不超过 20 个字的短句尽量保持一行，避免过窄造成无意义换行；长文案与窄视口仍须合理换行，不能溢出屏幕。背景与箭头使用系统 Tooltip 的主题、颜色及透明度，与“筛选”旁的提示一致，不单独硬编码不透明背景。
- 所有修改都要控制影响范围，优先采用页面或组件局部作用域；检查相关状态、共用组件调用方与集成入口，避免修复一处却让其他位置回归，并完成与改动相关的验证。

## React Router Routes and Deployment Prefixes

- This project uses React Router's `basename` for subpath deployments. Use Router-provided paths for in-app routes. For example, with a `/flashcat` basename, `useLocation().pathname` and React Router's `history.location.pathname` are `/dial-analysis`, while `window.location.pathname` or global `location.pathname` is the full browser path `/flashcat/dial-analysis`.
- When building in-app navigation, calling React Router's `history.push` or `history.replace`, or preserving the current route, use Router-relative paths such as `useLocation()` or `history.location`. Do not use global `location.pathname` as a Router path or prepend `basename` to a Router path; either can duplicate the prefix and produce a URL such as `/flashcat/flashcat/polaris`.
- `useLocation()` is a snapshot for the current render. If an asynchronous callback needs the latest path or query string when it runs, read `history.location` from the corresponding Router history instead of relying on a stale value captured by a closure.
- Use `window.location` or global `location` only when browser-level URL semantics are needed, such as a full-page navigation, reload, or generating a browser URL that includes the deployment prefix. Their paths have different semantics from Router paths. The native History API on `window.history` is also different from React Router's `history`.
- For copied, shared, saved, or custom-generated URLs, first distinguish a Router path, an app-relative URL, and a fully qualified URL. Use the existing URL helpers (`getAppBaseUrl` and `addAppBasePrefix` in `src/utils/appUrl.ts`) instead of concatenating `basePrefix` ad hoc. The helper leaves absolute URLs untouched and avoids duplicating an existing prefix.
- `$local_url` is a fully qualified app base URL, including origin and deployment prefix. After expanding it, do not prepend `basePrefix` again. Likewise, `window.location.pathname` already includes the browser prefix, while `useLocation().pathname` does not.
- The Vite prefix plugin rewrites recognized URL sinks such as direct `window.open` calls; it does not rewrite URLs copied to the clipboard, displayed in inputs, stored in config/data objects, or passed through custom components. Handle those values explicitly with the URL helpers.

## Forms and temporary containers

- When closing temporary containers such as modals and drawers, explicitly reset form data and local state (for example, `form.resetFields()`, loading state, and temporary selections) to prevent stale values when reopening.
- `form.setFieldsValue` performs an incremental update. When editing a different entity or fully repopulating a form, call `form.resetFields()` before `form.setFieldsValue()`.
- Ant Design `Collapse.Panel` does not mount its content while initially collapsed. When a panel contains `Form.Item` or `Form.List` fields that must be validated, populated, or submitted, add `forceRender` so the fields register with the form. Purely presentational panel content does not need it.

## Alert rule form E2E

- When changing alert-rule form fields, defaults, validation, serialization, or edit-time restoration, update the config-driven E2E coverage under `e2e/add-alert-rule/` in the same change.
- Keep each meaningful non-default field in the JSON config, normalization, UI step/query handler, and persisted API assertions. Do not weaken or remove assertions just to make a test pass; document real UI/API transformations in the expected-value builder.
- The required regression set is `base`, `prometheus-v1`, `prometheus-v2`, `es-index`, `es-index-pattern`, and `host`; keep these cases runnable and passing when changing alert-rule forms or shared E2E behavior. Other datasource configs should be maintained and run when practical, but are best-effort because their test datasource instances or data may be unstable, and are not mandatory gates.
- After changing the coverage, verify test collection and run the required configs with `E2E_CONFIGS=base,prometheus-v1,prometheus-v2,es-index,es-index-pattern,host npm run e2e-test`. Run additional affected datasource configs when their test data is stable.

## Log explorer UX work

- All optimizations and fixes for the current `/log/explorer` UX task must be made on `feat/log-explorer-ux`. Check the branch before editing; do not perform this task on `main`, `pre`, or another branch.
- Shared background and regression requirements: [docs/log-explorer-ux.md](docs/log-explorer-ux.md). Change source files in `fe`, then sync to the generated `fe-merge-dev` workspace.
- Sync with `../dev-frontend.sh sync-srm`; do not directly rsync the Doris Query or LogsViewer files over generated output. Enterprise integration injects AI toolbar/row actions into those files, and a raw source copy removes those entry points. Verify both AI entries after syncing. For the current download-button dependency, copy `components/LogDownload/DownloadModal/index.tsx` from `../.worktrees/n9e-plus-fe-log-explorer-ux` into the ignored local `fe/src/plus/` integration cache before syncing, and into generated `src/plus/` if already running. Otherwise the background watcher copies the older cached component back over the new API. The canonical change remains in the plus feature worktree; never commit this ignored cache.

- For shared log UX changes, audit every `/log/explorer` data-source route, including the plus adapters. Shared rendering alone is insufficient: verify each Main has `data-log-query-main`, supported histogram downloads use the shared icon adapter, structured filters use the compact header slot and explicit confirmation, and existing stack actions use click-time validation. Preserve data-source-specific capabilities. Sync all changed plus adapter paths from the feature worktree into the ignored `src/plus` cache before `sync-srm`, not only the download component.
- `sync-srm` intentionally excludes integrated base files such as `src/utils/request.tsx`. Changes to those files require a full integration refresh before acceptance; a successful incremental sync alone does not prove that new exports reached the generated workspace. After a full sync copies the primary plus checkout, restore this task's changed plus adapter/component files from its canonical feature worktree into the ignored cache and run `sync-srm` again. Never patch generated files directly.

- Before pushing changes to FieldsList, field statistics/stacking providers, or filter editors, run `node --max-old-space-size=8192 scripts/check-log-explorer-types/index.js --with-plus` against the integrated source (or pass its workspace directory). Refresh the ignored plus cache from the canonical feature worktree first. This uses production TypeScript options, includes TSX tests and ambient declarations, and checks component/callback contracts; transpile-only Jest or `transpileModule` does not provide this assurance. The production config excludes `*.test.ts` but still compiles `*.test.tsx`; do not work around test fixture errors by disabling their checks.
