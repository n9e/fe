---
name: cr
description: 'When user uses /cr slash command, review uncommitted code changes with reusable language-aware rules, preferring project-local review commands or rules when they exist.'
---

# /cr - Generic Code Review

When the user invokes `/cr`, review the current repository's uncommitted changes. This skill is intentionally generic: it focuses on review rules and changed code, not branch comparison or release workflow.

## Project-Local Rules First

Before applying the generic checklist, look for project-specific review rules and prefer them when present.

Check likely locations:

```bash
find . -maxdepth 4 \( -path './node_modules' -o -path './.git' \) -prune -o \
  \( -path './.cursor/commands/cr.md' -o -path './.cursor/rules' -o -name 'AGENTS.md' -o -name 'CLAUDE.md' \) -print
```

If a project-local `/cr` command or review rules exist:

- Read and apply them first.
- Use generic `/cr` rules only as a fallback or supplement.
- In the report, state which project-local files were applied.
- If project-local rules conflict with this generic skill, project-local rules win.

## Scope

Review uncommitted changes only:

```bash
git status -sb
git diff --name-status
git diff --stat
git diff
git diff --staged --name-status
git diff --staged --stat
git diff --staged
git ls-files --others --exclude-standard
```

Do not compare against upstream branches, merge bases, or release targets unless the user explicitly asks. If there are no staged, unstaged, or relevant untracked changes, report that there is nothing to review.

For untracked files, inspect them when they look like source, config, migration, test, or documentation files related to the change.

## Language Profiles

Infer active profiles from changed files and project layout. Apply all matching profiles.

### React / TypeScript Frontend

Use for `ts`, `tsx`, `js`, `jsx`, `css`, `less`, `scss`, route, i18n, and frontend config changes.

Focus on:

- Type safety: props, hooks, API responses, generics, casts, `any`, and stale interfaces.
- React behavior: hook dependencies, stale closures, memoization misuse, controlled inputs, key stability, effects with async work, and cleanup.
- Error and loading states: failed requests, empty states, retries, disabled controls, and user-facing feedback.
- Null safety: optional data, arrays, refs, DOM access, nested API fields, and conditional rendering.
- Feature flags and environment gates for new behavior.
- State consistency: React Query cache invalidation, Zustand/store updates, URL state, local storage, and cross-tab behavior.
- Layout impact: overflow, responsive behavior, fixed heights, table columns, modals, z-index, and style leakage.
- i18n: missing keys, hard-coded user-facing text, wrong locale file updates, and malformed translation keys.
- Tests: missing focused tests for changed formatting, branching, hooks, reducers, or regressions.

### Go Server

Use for `go`, `mod`, `sum`, API, worker, cron, persistence, and service-layer changes.

Focus on:

- Error handling: ignored errors, wrapped context, retry boundaries, rollback/cleanup, and user-safe error messages.
- Context propagation: `context.Context`, timeout/cancel handling, goroutine lifetime, and request-scoped values.
- Nil and zero-value safety: pointer fields, map/slice access, optional config, and interface nil traps.
- Concurrency: data races, goroutine leaks, channel close/send order, lock scope, shared caches, and idempotency.
- API contracts: request validation, response compatibility, pagination, auth checks, tenant isolation, and backward compatibility.
- Database and storage: transactions, migrations, indexes, N+1 queries, scan nullability, and partial failure behavior.
- Observability: structured logs, useful metrics, trace context, and avoiding noisy or sensitive logs.
- Security: permission checks, secret leakage, SSRF/path traversal, injection, unsafe deserialization, and rate limits.
- Tests: table-driven cases for edge inputs, permission failures, error paths, concurrency, and migration compatibility.

### Shared Product Rules

Apply regardless of language:

- Check whether new functionality needs a feature flag, edition check, tenant check, or environment guard.
- Watch for duplicated logic and copy-paste bugs.
- Verify changed behavior is covered by focused tests or has a clear manual verification path.
- Do not flag speculative issues as facts. If context is missing, mark as `info`.
- Prefer concrete fixes over broad refactor suggestions.

## Severity

Use:

| Severity  | Meaning                                              |
| --------- | ---------------------------------------------------- |
| `blocker` | Must fix before commit, push, or merge.              |
| `warn`    | Should fix soon or explicitly accept the tradeoff.   |
| `info`    | Observation, cleanup suggestion, or missing context. |

## Output

Return Markdown:

```markdown
## 代码审查报告

### 审查总结

说明本次审查范围、使用的项目规则/语言 profile、整体结论。若有 blocker，明确提示先修复再提交。

### 风险列表

#### blocker

- **问题标题** (`path/to/file.go:12`)
  - 描述：...
  - 影响：...
  - 建议：...

#### warn

- ...

#### info

- ...

### 统计数据

- 变更文件数：X
- 新增代码行数：X
- 删除代码行数：X
- blocker：X
- warn：X
- info：X

### 修复建议

1. ...
```

If no material issues are found, say that clearly and mention any residual test or context gaps.
