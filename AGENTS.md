# Codex Instructions

- After making code changes, do not run `npm run build` or `npx tsc` unless the user explicitly asks for it.
- If verification is useful, prefer lighter checks that are relevant to the changed files, or ask before running expensive project-wide commands.
- Prefer native type-checking APIs over lodash for type narrowing: use `Array.isArray` instead of `_.isArray`, `typeof x === 'number'` instead of `_.isNumber`, `x == null` instead of `_.isNil`, etc. Lodash type guard functions are not recognized by TypeScript when `@types/lodash` is unavailable, leaving `unknown` types un-narrowed.
