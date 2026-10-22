# Log Explorer UX regression guide

## Source and integration

Make changes on `feat/log-explorer-ux`. The open-source source is this repository;
enterprise data-source adapters live in the corresponding `n9e-plus-fe` feature
branch. `fe-merge-dev` is generated output, never a source checkout to edit.

In the local multi-repository development setup, sync with
`../dev-frontend.sh sync-srm`. Refresh changed plus adapter files in the ignored
`src/plus` cache first. Enterprise integration injects toolbar and row AI actions;
copying clean Doris Query or LogsViewer files directly over generated output
removes those actions. Base files excluded by incremental sync, including
`src/utils/request.tsx`, require a full integration refresh.

## Required behavior

- Original, table and clustering modes use the page's vertical scroll owner.
  Fullscreen results use their own scroll container. Entering and leaving
  fullscreen must rebind load-more listeners without another setting change.
- Load more only when the visible results reach the actual viewport bottom.
  A fresh query resets the actual scroll owner, including CLS, TLS, LTS and BLS.
  Legacy standalone table callers retain their internal scrolling behavior.
- Pinning the top region keeps query controls, filters, chart, result toolbar
  and headers visible. Fast scrolling must not show log rows through gaps or
  cover the header border. The left sidebar remains stationary.
- Expanded and collapsed sidebars retain form state. Every query row reserves
  room for the expand button through `log-explorer-query-row`; verify all six
  enterprise data sources as well as the open-source adapters.
- Histogram visibility is independent of pinning. Hide stack context when the
  chart is hidden; keep the stack help available after selecting a field.
  Filter and time controls share a row when space permits and wrap when needed.
- Field hover never queries cardinality. A stack click validates 2–10 distinct
  values in the current query interval, with loading, query-scoped caching,
  duplicate-request suppression and a dismissible warning.
- Real statistics failures reject and remain retryable in the same query scope.
  Missing/malformed optional cardinality preserves Top-5 and other statistics;
  a later stack click may fetch the strict count separately.
- Clearing the optional default search field preserves query text. Bare text
  requires a default field; field-qualified input remains usable independently.
- Filters apply only on Confirm. Cancel and outside dismissal discard drafts.
  Pagination dropdowns and row tips must not be clipped by sticky regions.
- Tooltip anchors follow the visible icon or text, not an entire tall row.
  Use the system tooltip theme and short, readable text with consistent spacing.
- Keep saved view selection during a reload; clear inaccessible IDs only after
  loading completes. Preserve both toolbar and per-row enterprise AI actions.

## Checks before pushing

Run relevant Jest suites, including provider/cache failures, actual LogsViewer
fullscreen transitions, saved-view reloads and enterprise scroll helpers. Format
only changed files with local Prettier (`--write`, then `--check`).

Run the production-options semantic check against the refreshed integrated
workspace:

```bash
node --max-old-space-size=8192 scripts/check-log-explorer-types/index.js --with-plus
```

The checker includes both Doris/ClickHouse filter editors, related TSX tests and
enterprise adapters. Keep tests type-correct; do not exclude them to hide errors.
Run the enterprise AI injection tests from the SRM source checkout after changes
to integration anchors. Do not run full builds or project-wide `tsc` unless the
user requests them.

For browser acceptance, check pin/unpin, chart show/hide, repeated up/down scroll,
fullscreen enter/exit and load-more, sidebar expansion/collapse, table tips and
the account menu. Inspect alignment, visible spacing and theme consistency.
Record which real backend/viewport cases were exercised; mocked geometry tests
do not replace real-page visual acceptance.
