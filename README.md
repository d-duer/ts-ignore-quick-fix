# README
VS Code extension to add `// @ts-nocheck` and `// @ts-ignore` options to the Quick Fix dialog

## Settings

- `ts-ignore-quick-fix.ignoreOrExpect`: `"ts-ignore"` (default) or `"ts-expect-error"`. Controls which directive the line-level Quick Fix inserts. Use `"ts-expect-error"` if your linter enforces `@typescript-eslint/ban-ts-comment`.