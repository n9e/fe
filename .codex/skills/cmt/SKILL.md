---
name: cmt
description: When user uses /cmt slash command, commit current git changes using fast mode by default, or strict mode when requested. Fast mode reviews, shows summary, and waits for approval. Strict mode adds safe simplifications, full /cr review, and verification before approval.
---

# /cmt — Git Review & Commit

> **Override:** This skill replaces the default system commit workflow when `/cmt` is invoked. Follow this skill exactly.

When the user invokes `/cmt [mode]`, prepare a conventional commit for current git changes.

| Command       | Mode     | Behavior                                                                           |
| ------------- | -------- | ---------------------------------------------------------------------------------- |
| `/cmt`        | `fast`   | Default. Inspect changes, run `git diff --check`, show summary, wait for approval. |
| `/cmt fast`   | `fast`   | Same as default.                                                                   |
| `/cmt strict` | `strict` | Simplify safely, run full review, verify, wait for approval.                       |

Unknown modes: stop and list `fast` and `strict`.

## Workflow

### 1. Parse Mode And Check Status

Default to `fast` when no mode is provided.

```bash
git branch --show-current
git status --short --branch
```

Identify:

- current branch
- staged files
- unstaged changes
- untracked files
- merge conflicts

Stop if:

- working tree is clean → report "Nothing to commit"
- merge conflicts are present → report conflicts
- only untracked files with unclear purpose → ask before staging

Branch policy:

- `main` or `master`: always require extra-clear confirmation before commit.
- Feature branches (`feat*`): proceed through the selected mode, but still require explicit user approval.
- Other branches: use judgment; ask briefly if unclear.

If unrelated changes are mixed together, ask what to include before proceeding.

### 2. Inspect Current Changes

For staged changes:

```bash
git diff --staged
```

For unstaged changes:

```bash
git diff
```

Focus on:

- correctness and regressions
- accidental debug code, secrets, generated noise, or unrelated churn
- whether the change should be split into separate commits

If there are unstaged changes that belong to the same task, include them. If unrelated, ask before staging.

### 3. Fast Mode

Use this path for `/cmt` and `/cmt fast`.

Run:

```bash
git diff --check
```

Then show the user:

- changed file summary (files, insertions, deletions)
- staged vs unstaged scope
- any whitespace or conflict-marker issues from `git diff --check`
- draft commit message
- a note that full review and verification were skipped (suggest `/cmt strict` for thorough checks)

Stop and ask the user whether to:

- approve and commit
- switch to strict mode
- cancel

Do not commit until the user explicitly approves.

### 4. Strict Mode

Use this path for `/cmt strict`.

#### 4.1 Simplify Safely

If the diff contains safe, obvious simplifications, make them:

- remove dead code, redundant branches, duplicate variables, or unnecessary wrappers
- simplify naming or small conditionals without changing behavior
- tighten types or test mocks when needed for passing checks

Do **not** perform broad refactors or unrelated cleanup. Keep simplification scoped to the current diff.

**If any code was changed in this step, you MUST:**

1. Show the user exactly what was simplified (file, before → after)
2. Explain why each change is safe
3. Re-run `git diff` so the user sees the final state
4. Ask the user to approve the simplifications before continuing

Do not proceed past this step until simplifications are approved or skipped.

#### 4.2 Review

Run a thorough review on the current uncommitted changes:

- prefer project-local review rules when present (`.cursor/rules`, `AGENTS.md`, etc.)
- check type safety, error handling, duplicated logic, null safety, layout impact, and i18n
- classify findings as `blocker`, `warn`, or `info`

Show the review result:

- review summary
- blocker/warn/info findings with concrete suggested fixes
- simplifications already applied (if any)

Then ask the user:

- fix findings first
- continue committing as-is
- cancel

Do not continue until the user explicitly chooses.

If the user chooses to fix: make only requested fixes, re-review, and ask again.

#### 4.3 Verify

After user approval, run focused verification:

```bash
npm test -- --runInBand
# or
npm run build
# or
go test ./...
```

Prefer the smallest useful command. If verification fails, stop and ask whether to fix or continue. Do not commit after failed verification unless the user explicitly approves.

### 5. Generate Commit Message

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```text
<type>(<scope>): <short description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

Keep the first line under 72 characters. Add a body only when the change needs explanation.

### 6. Commit

Stage only the related files by name. Never use `git add -A` or `git add .`.

Use HEREDOC to avoid shell escaping issues:

```bash
git add <file1> <file2> ...
git commit -m "$(cat <<'EOF'
<type>(<scope>): <short description>

[optional body]
EOF
)"
```

Commit only after:

- the selected mode has completed
- results were shown to the user
- the user explicitly approved

After commit, report:

- commit hash and message
- mode used
- checks performed
- skipped checks (if any)
- known risks the user accepted (if any)

## Edge Cases

| Situation                       | Action                                                          |
| ------------------------------- | --------------------------------------------------------------- |
| Missing mode                    | Use `fast`                                                      |
| Unknown mode                    | Stop and list `fast` and `strict`                               |
| Clean working tree              | Report nothing to commit                                        |
| Merge conflicts                 | Do not commit; report conflicts                                 |
| Only unclear untracked files    | Ask before staging                                              |
| Mixed unrelated changes         | Ask what to include                                             |
| Strict review finds blockers    | Recommend fixing first; commit only if user explicitly approves |
| Strict verification fails       | Recommend fixing first; commit only if user explicitly approves |
| Fast mode on risky-looking diff | Show risk and suggest switching to `strict`                     |
| Simplification changes code     | Show before/after, get approval before continuing               |

## Summary

1. Parse mode: default `fast`, or `strict`.
2. Inspect branch and current changes.
3. In `fast`: lightweight checks → show summary → wait for approval.
4. In `strict`: simplify (show changes, get approval) → review → ask user → verify → wait for approval.
5. Generate conventional commit message.
6. Commit only after explicit user approval.
