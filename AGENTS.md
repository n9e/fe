# Codex Instructions

- After making code changes, do not run `npm run build` or `npx tsc` unless the user explicitly asks for it.
- If verification is useful, prefer lighter checks that are relevant to the changed files, or ask before running expensive project-wide commands.
- After modifying source files, run `./node_modules/.bin/prettier --write` on the changed files and verify them with `./node_modules/.bin/prettier --check` before delivery. Follow `.prettierrc.json`; do not leave formatting-only violations in changed files.
- Prefer native type-checking APIs over lodash for type narrowing: use `Array.isArray` instead of `_.isArray`, `typeof x === 'number'` instead of `_.isNumber`, `x == null` instead of `_.isNil`, etc. Lodash type guard functions are not recognized by TypeScript when `@types/lodash` is unavailable, leaving `unknown` types un-narrowed.

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
