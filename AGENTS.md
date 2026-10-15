# Codex Instructions

- After making code changes, do not run `npm run build` or `npx tsc` unless the user explicitly asks for it.
- If verification is useful, prefer lighter checks that are relevant to the changed files, or ask before running expensive project-wide commands.
- After modifying source files, run `./node_modules/.bin/prettier --write` on the changed files and verify them with `./node_modules/.bin/prettier --check` before delivery. Follow `.prettierrc.json`; do not leave formatting-only violations in changed files.
- Prefer native type-checking APIs over lodash for type narrowing: use `Array.isArray` instead of `_.isArray`, `typeof x === 'number'` instead of `_.isNumber`, `x == null` instead of `_.isNil`, etc. Lodash type guard functions are not recognized by TypeScript when `@types/lodash` is unavailable, leaving `unknown` types un-narrowed.

## Forms and temporary containers

- When closing temporary containers such as modals and drawers, explicitly reset form data and local state (for example, `form.resetFields()`, loading state, and temporary selections) to prevent stale values when reopening.
- `form.setFieldsValue` performs an incremental update. When editing a different entity or fully repopulating a form, call `form.resetFields()` before `form.setFieldsValue()`.
- Ant Design `Collapse.Panel` does not mount its content while initially collapsed. When a panel contains `Form.Item` or `Form.List` fields that must be validated, populated, or submitted, add `forceRender` so the fields register with the form. Purely presentational panel content does not need it.

## Alert rule form E2E

- When changing alert-rule form fields, defaults, validation, serialization, or edit-time restoration, update the config-driven E2E coverage under `e2e/add-alert-rule/` in the same change.
- Keep each meaningful non-default field in the JSON config, normalization, UI step/query handler, and persisted API assertions. Do not weaken or remove assertions just to make a test pass; document real UI/API transformations in the expected-value builder.
- The required regression set is `base`, `prometheus-v1`, `prometheus-v2`, `es-index`, `es-index-pattern`, and `host`; keep these cases runnable and passing when changing alert-rule forms or shared E2E behavior. Other datasource configs should be maintained and run when practical, but are best-effort because their test datasource instances or data may be unstable, and are not mandatory gates.
- After changing the coverage, verify test collection and run the required configs with `E2E_CONFIGS=base,prometheus-v1,prometheus-v2,es-index,es-index-pattern,host npm run e2e-test`. Run additional affected datasource configs when their test data is stable.
