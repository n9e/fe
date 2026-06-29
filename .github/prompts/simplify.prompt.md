---
name: simplify
description: 'When user uses /simplify slash command, review recently changed code for safe simplifications (dead code, redundant logic, naming, types), show every proposed change with before/after, and apply only after explicit user approval.'
---

# /simplify — Code Simplification

When the user invokes `/simplify [scope]`, review code for safe simplifications and apply them with user approval.

| Command            | Scope          | What gets reviewed                  |
| ------------------ | -------------- | ----------------------------------- |
| `/simplify`        | uncommitted    | Staged + unstaged changes (default) |
| `/simplify HEAD~N` | recent commits | Changes in the last N commits       |
| `/simplify <file>` | single file    | Only that file                      |

## Workflow

### 1. Determine Scope

Default to uncommitted changes when no argument is provided.

```bash
git status --short --branch
```

For uncommitted changes:

```bash
git diff --staged --name-only
git diff --name-only
```

For commit range (e.g., `HEAD~3`):

```bash
git diff HEAD~3 --name-only
```

For a single file, verify it exists and read it.

Stop if:

- no changed files in the requested scope
- merge conflicts are present

### 2. Read And Analyze

Read the full content of each changed file (not just the diff) so that simplifications are informed by surrounding context.

Look for:

| Category                 | Examples                                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dead code                | Unused imports, unreachable branches, commented-out blocks, unused variables/functions                                                                      |
| Redundant logic          | Duplicate conditions, double negation, unnecessary else after return, `if x return true else return false`                                                  |
| Naming                   | Misleading names, single-letter variables in non-trivial scope, inconsistent conventions within the file                                                    |
| Type tightening          | Overly broad types (`any`, `interface{}`), missing return types, unnecessary type assertions                                                                |
| Unnecessary wrappers     | Trivial wrapper functions, redundant intermediate variables, over-abstracted single-use helpers                                                             |
| Simplifiable expressions | Ternaries that can be boolean expressions, verbose null checks replaceable by optional chaining, long-form iterations replaceable by standard library calls |

Do NOT look for:

- architectural refactors or design changes
- performance optimizations (unless clearly wasteful, like allocating in a tight loop)
- style preferences not established in the codebase
- changes to code outside the requested scope

### 3. Propose Changes

If no simplifications are found, report that the code is already clean and stop.

Otherwise, present each proposed change as a numbered list:

````markdown
## Proposed Simplifications

### 1. Remove unused import (`src/utils/auth.ts:3`)

**Before:**
\```ts
import { validate, sanitize, normalize } from './helpers'
\```

**After:**
\```ts
import { validate } from './helpers'
\```

**Why safe:** `sanitize` and `normalize` are not referenced anywhere in this file.

---

### 2. ...
````

For each change, include:

- file path and line number
- before and after code
- one-line explanation of why the change is safe

Group changes by file. Order by confidence (highest first).

### 4. Wait For Approval

After showing all proposals, ask the user:

- **approve all** — apply every proposed change
- **approve selectively** — user picks which numbers to apply (e.g., "apply 1, 3, 5")
- **cancel** — make no changes

Do NOT apply any changes until the user explicitly approves.

### 5. Apply Approved Changes

Apply only the approved changes. After applying:

```bash
git diff
```

Show the final diff summary so the user can verify the result.

If any applied change causes a syntax error or obvious breakage, revert it immediately and report the issue.

### 6. Report

After applying, report:

- number of simplifications applied vs proposed
- files modified
- suggest running tests or `/cmt` to commit the result

## Edge Cases

| Situation                                        | Action                                             |
| ------------------------------------------------ | -------------------------------------------------- |
| No changes in scope                              | Report nothing to simplify                         |
| Merge conflicts                                  | Do not simplify; report conflicts                  |
| File is generated or vendored                    | Skip it; note in report                            |
| Change would alter public API                    | Flag as risky; do not include unless user confirms |
| Simplification conflicts with project lint rules | Skip it; note the conflict                         |
| Large scope (>20 files)                          | Ask user to narrow scope before proceeding         |

## Summary

1. Determine scope (uncommitted, commit range, or single file).
2. Read changed files in full context.
3. Propose numbered simplifications with before/after and safety explanation.
4. Wait for explicit user approval (all, selective, or cancel).
5. Apply approved changes and show final diff.
6. Report results and suggest next steps.
