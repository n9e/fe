---
name: n9e-config-driven-e2e
description: Maintain config-driven Nightingale E2E tests that convert JSON config data into UI-readable normalized values, drive Playwright + Midscene interactions, and verify persistence through APIs.
---

# n9e Config-Driven E2E

Use this skill when working on Nightingale config-driven E2E flows. This includes alert-rule creation under `e2e/add-alert-rule`, and should also guide future flows that start from structured JSON config data. The general pattern is:

`JSON 配置数据 -> normalizer 转换为 UI 可读/可操作值 -> Playwright + Midscene 执行页面操作 -> API 回查验证保存结果`

This skill is no longer only about adding one alert-rule JSON file. Treat it as the standard way to build E2E coverage for product forms whose source of truth is an exported/API JSON config.

## Architecture

- Config files live under a feature-specific `configs/` directory, currently `e2e/add-alert-rule/configs/*.json`.
- `config-loader.ts` discovers config files and supports `E2E_CONFIGS=<stem>` filtering.
- `reference-data.ts` resolves ID-backed fields into visible UI labels.
- `normalizer.ts` converts API/export JSON into a UI-readable normalized model and builds the expected persisted payload.
- Step files under `steps/` fill page cards or sections from the normalized model.
- Datasource-specific query/condition behavior lives under `queries/`.
- The main test file orchestrates: load config, fetch references, normalize, fill steps, save, API 回查, subset assert, cleanup.

## Core Principle

Never silently skip a non-default config field.

If JSON contains a meaningful field, do one of these:

- Fill it into the UI through the correct step handler.
- Normalize it into the exact visible UI value first, then fill it.
- Document a real FormNG/API transformation in `buildExpectedAlertRule()`.
- Fail with a precise TODO only when no UI path exists yet.

Do not delete expected fields merely to make assertions pass.

## Source-Code First

Before changing E2E logic, inspect the product code that owns the form:

- Start with `src/pages/alertRules/FormNG/index.tsx`.
- For API/export config shape vs page form shape, inspect `src/pages/alertRules/Form/utils.ts`.
  - `processInitialValues()` shows how API/export data becomes FormNG form values.
  - `processFormValues()` shows how FormNG values become save payload.
- For step-card UI:
  - Basic/datasource/rule: `FormNG/index.tsx`, `FormNG/Rule/**`, datasource plugins.
  - Query/trigger: `FormNG/Rule/**`, `FormNG/components/Triggers/**`.
  - Event handling: `FormNG/PipelineConfigsNG/**`.
  - Effective config: `FormNG/Effective/index.tsx`.
  - Notify config: `FormNG/Notify/**`.

When a persisted field differs from the JSON config, first check whether `processInitialValues()` or `processFormValues()` explains the difference.

## Normalizer Responsibilities

`normalizer.ts` should bridge machine JSON and UI operations:

- Convert IDs into display labels before sending them to Midscene or Playwright:
  - `group_id` -> business group name.
  - `datasource_queries[].values` / `datasource_ids` -> datasource names.
  - `notify_rule_ids` -> notification rule names.
  - `notify_groups` -> team names.
  - `notify_channels` -> channel labels.
  - `pipeline_configs[].pipeline_id` -> event processor/workflow names.
  - `extra_config.service_cal_configs[].service_cal_ids` -> service calendar names.
  - Index-pattern IDs and similar datasource-specific IDs -> visible names.
- Convert enum/numeric fields into UI text:
  - `rule_config.version` -> `普通模式` / `高级模式`.
  - severity numbers -> visible severity labels.
  - datasource match type/operator -> visible labels.
- Convert API/export structures into UI-friendly lists:
  - `annotations: Record<string,string>` -> `{ key, value }[]`.
  - `enable_stimes` + `enable_etimes` + `enable_days_of_weeks` -> effective time ranges.
  - `rule_config.event_relabel_config` -> Relabel form rows.
  - service calendar config -> visible calendar names plus time ranges.

`buildExpectedAlertRule()` should only apply true persistence transformations, for example:

- Remove export/list metadata such as `id`, `create_at`, `update_at`, `uuid`, event counts, nicknames.
- Remove duplicated non-form copies when the UI writes the canonical field, e.g. top-level `event_relabel_config` vs `rule_config.event_relabel_config`.
- Apply documented FormNG add-page defaults when no UI control exists, e.g. `prom_eval_interval` uses the FormNG default.
- Remove fields that are genuinely not part of the add form, such as `rule_config.task_tpls`, only with a comment explaining the source-code reason.

## Reference Data

When a config adds an ID-backed field, update `reference-data.ts`.

Fetch reference data via API, build ID/name maps, and make missing IDs fail loudly with field paths such as:

- `pipeline_configs.pipeline_id`
- `extra_config.service_cal_configs.service_cal_ids`
- `notify_rule_ids`

Do not ask Midscene to infer IDs or click numeric values when the UI shows names.

## Step Handler Rules

Step files should map normalized config into actual UI controls:

- Prefer stable Playwright locators for deterministic Ant Design controls, especially Form.Item labels, Form.List rows, TimePicker, InputNumber, Switch, Select, and tags Select.
- Use Midscene for visible navigation and product-language interactions where it is robust:
  - sidebar cards such as `基础配置`, `数据源`, `告警条件`, `事件处理`, `生效配置`, `通知配置`;
  - high-level waits/assertions.
- Keep each step responsible for one form card or coherent section.
- Do not put form-card details back into `index.test.ts`; the main file should orchestrate.

Current add-alert-rule steps:

- `steps/basic.ts`: rule name, business group, note, append tags.
- `steps/datasource.ts`: datasource type/filter.
- `steps/rule.ts`: datasource query handler plus execution frequency/duration.
- `steps/pipeline.ts`: event processor, Relabel, annotations.
- `steps/effective.ts`: timezone, effective windows, service calendar, `enable_in_bg`.
- `steps/notify.ts`: notification rules, recovery notification, repeat/max settings.

## Midscene and Playwright Choices

Prefer Midscene methods for product-language navigation and visible state checks:

- `aiTap()` for sidebar steps, section titles, high-level buttons, and simple visible options.
- `aiWaitFor()` for page/section readiness.
- `aiAssert()` for visible state assertions.

Prefer Playwright for deterministic controls:

- CodeMirror/Monaco textboxes.
- Ant Design Select/AutoComplete when there are adjacent or repeated selects.
- Form.List rows, indexed time pickers, switches, spinbuttons, tags selects.
- API requests, save response parsing, persisted payload assertions, cleanup.

Use shared helpers in `e2e/helpers.ts` before adding one-off locators. If a helper is missing for a recurring Ant Design pattern, add a helper rather than duplicating fragile XPath.

## Add-Rule Test Shape

For `e2e/add-alert-rule/index.test.ts`:

- `beforeEach`: call `loginAndSetTokens(page)`.
- Navigate to `BASE_URL/alert-rules/add/${config.group_id}`.
- Fetch references with `fetchReferenceData(page, config.group_id)`.
- Build `uiConfig = normalizeAlertRuleForUi(config, refs)`.
- Fill steps in FormNG order.
- Save with `page.waitForResponse` around `POST /api/n9e/busi-group/{id}/alert-rules`.
- Parse save response and fail on business errors immediately.
- Query `/api/n9e/busi-group/{id}/alert-rules`.
- Find by created ID or generated unique name.
- Assert persisted subset against `buildExpectedAlertRule(config, uiConfig)`.
- Delete created rule and assert cleanup.

## Extending Config Coverage

When adding or expanding a config:

1. Read the JSON and identify every non-default or ID-backed field.
2. Inspect the corresponding FormNG source and `Form/utils.ts`.
3. Add reference data for new ID-backed fields.
4. Add normalized visible fields to `types.ts` / `normalizer.ts`.
5. Fill the field in the appropriate step or query handler.
6. Add documented expected-payload transformation only for real FormNG/API behavior.
7. Run `npx playwright test e2e/add-alert-rule/index.test.ts --list`.
8. Run the target test and let failures reveal missing UI fill or real persistence differences.

## Defaults

Known add-alert-rule defaults:

- `cron_pattern: "@every 60s"`.
- Effective config: Local timezone, all weekdays, `00:00` to `00:00`, `enable_in_bg: 0`.
- Notify v1: no `notify_rule_ids`, `notify_recovered: 1`, `recover_duration: 0`, `notify_repeat_step: 60`, `notify_max_number: 0`.
- FormNG add page does not expose every exported field. Confirm missing fields in source before applying expected-payload transformations.

## Validation

Use the narrowest validation that proves the change:

- Always run `npx playwright test e2e/add-alert-rule/index.test.ts --list`.
- For normalizer, step, helper, reference-data, or query handler changes, run `npx playwright test e2e/add-alert-rule/index.test.ts`.
- If a visual interaction is flaky, inspect Playwright error context and FormNG source before changing the assertion model.

Do not leave generated tests hidden behind skipped tests. A config file in `configs/` should either pass end-to-end or fail with a precise unsupported-field error.
