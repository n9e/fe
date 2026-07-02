---
name: n9e-alert-rule-e2e
description: Maintain config-driven Midscene + Playwright E2E tests for n9e alert-rule creation when new alert rule config JSON is added, including form filling, persistence assertions, and datasource/query-condition handlers.
---

# n9e Alert Rule E2E

Use this skill when the user provides a new n9e alert rule config, asks to add a file such as `e2e/add-alert-rule/configs/prometheus-v2.json`, or asks to complete the Add Alert Rule E2E coverage for a config.

The current E2E is config-driven:

- Config files live in `e2e/add-alert-rule/configs/*.json`.
- `e2e/add-alert-rule/config-loader.ts` loads every JSON config.
- `e2e/add-alert-rule/index.test.ts` dynamically creates one `test()` per config.
- Datasource/query-condition filling is delegated through `e2e/add-alert-rule/queries/index.ts`.
- Per-cate or per-version handlers live in `e2e/add-alert-rule/queries/*.ts`; shared query/trigger behavior lives in `e2e/add-alert-rule/common-query-trigger.ts`.

## Workflow

1. Read the new config and compare it with the existing files under `e2e/add-alert-rule/configs/`.
2. Inspect the relevant FormNG UI code before editing tests:
   - Start at `src/pages/alertRules/FormNG/index.tsx`.
   - For metric/query behavior, inspect `src/pages/alertRules/FormNG/Rule/**`.
   - For trigger behavior, inspect `src/pages/alertRules/FormNG/components/Triggers/**`.
   - For notify/effective/pipeline behavior, inspect the matching `FormNG` section.
3. Add or update the config JSON under `e2e/add-alert-rule/configs/`. Keep exported/list API metadata out of test configs when possible (`create_at`, `update_at`, `uuid`, event counts, nicknames, etc.) unless the persistence assertion must explicitly tolerate it.
4. Run `npx playwright test e2e/add-alert-rule/index.test.ts --list` after adding the config. It must show one new generated test named from `cate` and `name`.
5. If the config contains fields not currently filled or asserted, update the E2E code; never silently ignore a non-default config value.

## Core Files

- `e2e/fixture.ts`: exports `test`, `expect`, `BASE_URL`, `loginAndSetTokens(page)`, and `fetchReferenceData(page)`. Keep `forceChromeSelectRendering: false` in `PlaywrightAiFixture` to avoid Midscene style-injection races during SPA navigation.
- `e2e/add-alert-rule/types.ts`: extend `AlertRuleConfig` and `NormalizedAlertRuleConfig` when a new config shape needs typed normalized fields.
- `e2e/add-alert-rule/index.test.ts`: common add-rule flow, normalization, default detection, save response checks, persistence subset assertion, and cleanup.
- `e2e/add-alert-rule/queries/index.ts`: maps `cate` to condition handlers and has a registry coverage test.
- `e2e/add-alert-rule/queries/{cate}.ts`: use for datasource-specific query/condition UI. Add a new file when a cate or cate+version needs behavior that `common-query-trigger.ts` cannot safely handle.

## Normalization Rules

Normalize config values before sending labels to Midscene or comparing visible UI:

- `group_id` -> business group name from `/api/n9e/busi-groups`.
- `datasource_queries[].values` and `datasource_ids` -> datasource names from `/api/n9e/datasource/brief`.
- `rule_config.version` -> visible rule mode label, e.g. `v1` -> `普通模式`.
- `rule_config.queries[].severity` -> visible severity label, e.g. `2` -> `二级报警（Warning）`.
- `notify_rule_ids` -> notification rule names from `/api/n9e/notify-rules`.
- `notify_groups` -> team names from `/api/n9e/user-groups`.
- `notify_channels` -> channel labels from `/api/n9e/notify-channels`.

If an ID cannot be resolved, throw a clear error. Do not ask Midscene to infer numeric IDs.

When the config adds a new ID-backed field, update `fetchReferenceData(page)` in `e2e/fixture.ts` if needed, add a normalized visible-name field, then use that normalized value in the fill/check logic.

## Midscene API Choices

Prefer Midscene methods for visible UI interactions and visibility checks. The tests should be resilient to DOM/class/role changes as long as the visible product text remains stable.

For the complete Midscene API reference, consult `docs/midscene-llms-full.txt` before adding a new interaction pattern. Useful sections in that document include:

- `交互方法`: auto planning vs instant actions.
- `agent.aiTap()`, `agent.aiInput()`, `agent.aiScroll()`, `agent.aiKeyboardPress()`, `agent.aiHover()`, `agent.aiDoubleClick()`, `agent.aiRightClick()`.
- `agent.aiQuery()`, `agent.aiBoolean()`, `agent.aiNumber()`, `agent.aiString()` for extracting UI data.
- `agent.aiAssert()` for assertions.
- `agent.aiLocate()` when a later deterministic Playwright action needs a located position.
- `agent.aiWaitFor()` for waiting until a visible condition becomes true.

- Use `aiTap` for buttons, sidebar steps, radio cards, switches, selects, dropdown options, tabs, and save. Example: use `aiTap('告警条件')`, not `page.getByRole('button', { name: /告警条件/ }).click()`.
- Use `aiInput` for normal visible text inputs, textareas, number inputs, and search fields.
- Use `aiAssert` for visible-state assertions expressed in product language. Example: use `aiAssert('存在普通模式')`, not `expect(page.getByRole('radio', { name: '普通模式' })).toBeVisible()`.
- Use `aiWaitFor` for page/section readiness and post-action visible states.
- Use `aiScroll` to move between `基础配置`, `数据源`, `告警条件`, `生效配置`, and `通知配置`.
- Use `aiQuery` to extract list/table rows, then assert with Playwright `expect` when structured comparison is needed.

Use Playwright operations only where they are meaningfully more reliable than visual interaction:

- Filling complex editors such as CodeMirror/Monaco (`page.getByRole('textbox', { name: 'Editor content' }).fill(...)`).
- API requests and response assertions for final persistence checks.
- Exact value assertions where the backend payload must be compared to the config.

Use `aiAct` only for a genuinely hard-to-decompose UI sequence. Do not use broad `agent.ai()` calls for normal form filling.

## Extending Config Coverage

When a new config is added:

1. Put the raw alert rule under `e2e/add-alert-rule/configs/<short-name>.json`.
2. Run `--list` to confirm a generated test appears.
3. Run the test and let failures identify unsupported fields.
4. For each unsupported non-default field:
   - Inspect the FormNG component that renders it.
   - Add deterministic fill logic in `index.test.ts` for shared sections such as base, datasource, effective, notify, pipeline, annotations, relabel, and cron.
   - Add or update query-condition handlers for rule-specific sections.
   - Add persistence normalization in `buildExpectedAlertRule()` only for real backend transformations, not as a shortcut around missing UI fill.
5. Keep cleanup intact: after successful creation, delete the created rule and assert it is gone.

## Query Handler Rules

The handler contract is `AlertRuleConditionHandler({ page, uiConfig, aiAssert, aiTap, aiInput?, aiScroll?, aiWaitFor? })`.

Keep the handler fixture method types derived from `PlayWrightAiFixtureType` in `e2e/add-alert-rule/types.ts` instead of hand-writing `any`. This preserves autocomplete for all Midscene methods when future configs need APIs such as `aiHover`, `aiLocate`, `aiKeyboardPress`, `aiBoolean`, `aiNumber`, `aiString`, `aiQuery`, `runYaml`, or `setAIActionContext`.

- If a cate is already in `COMMON_QUERY_TRIGGER_CATES`, use `common-query-trigger.ts` only when the form shape is actually query text + triggers.
- For a new datasource cate with unique UI, add `e2e/add-alert-rule/queries/<cate>.ts`, export a handler, import it in `queries/index.ts`, and add it to `HANDLERS`.
- For an existing cate with a new rule mode, branch inside that cate handler by `uiConfig.ruleVersionName` or `uiConfig.ruleConfig.version`.
- Prometheus examples:
  - v1 (`普通模式`) uses `rule_config.queries[].prom_ql`, severity radio checks, optional unit advanced settings, and `prom_for_duration`.
  - v2 (`高级模式`) uses `rule_config.queries[].query` plus `rule_config.triggers`. Inspect `PrometheusV2.tsx` and `components/Triggers` before implementing or extending it.
- For a newly supported trigger shape, update the relevant handler or `common-query-trigger.ts` to fill it and assert required config values. If a trigger mode is unsupported, throw a `TODO` error that names the exact config path.

## Test Shape

- `beforeEach`: call `loginAndSetTokens(page)`.
- Each generated test calls `page.goto(`${BASE_URL}/alert-rules/add/${config.group_id}`)` for its own config.
- In the test, call `fetchReferenceData(page)` and `normalizeAlertRuleForUi(config, refs)`.
- Fill only non-default sections. For unsupported non-default fields, fail with a `TODO` error rather than silently ignoring them.
- Save with `page.waitForResponse` around the Midscene save tap, filtering for `POST /api/n9e/busi-group/{id}/alert-rules`; parse the response body and fail immediately on business errors.
- After save, verify persistence with `GET /api/n9e/busi-group/{id}/alert-rules` because the list page's visible rows depend on the selected business-group context. UI search can still be kept as a visual smoke step.

## Current Defaults

Treat these as default and skip filling unless the config differs:

- `cron_pattern: "@every 60s"`.
- Effective time: Local timezone, all weekdays, `00:00` to `00:00`, `enable_in_bg: 0`.
- Notify v1: no `notify_rule_ids`, `notify_recovered: 1`, `recover_duration: 0`, `notify_repeat_step: 60`, `notify_max_number: 0`.

If a new config differs from these defaults, implement the fill and assertion for that section.

## Validation

Use the narrowest validation that proves the change:

- Always run `npx playwright test e2e/add-alert-rule/index.test.ts --list`.
- For handler/normalization changes, run `npx playwright test e2e/add-alert-rule/index.test.ts`.
- If a full browser flow is needed, run the same command with `--headed`.

Do not leave generated tests hidden behind skipped tests. A config file in `configs/` should either pass end-to-end or fail with a precise TODO naming the unsupported field.
