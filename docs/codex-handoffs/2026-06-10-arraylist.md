# Codex Handoff: Arraylist

## Reactivation Prompt

```text
We are continuing from this handoff. Read this document first, inspect the current repo state, verify what still applies, and continue from the next steps without assuming the old chat context is available.
```

## Context

- Repo/path: `/home/cr89/Projects/personal/Arraylist`
- Branch: `main`
- Current goal: preserve the C dynamic-array library and docs-site context before archiving Codex history.
- Current git state at handoff time: dirty working tree with library, docs, tests, site, and agent-harness changes.

## What We Already Completed

- Hardened the README and library direction around checked APIs, strict-C portability, safer edge cases, and explicit compatibility APIs.
- Added or investigated compile tests for growth, nullable access, lvalue requirements, realloc behavior, checked get/set, unchecked convenience, and failure handling.
- Set up a Vite + React + Tailwind docs website under `site/` that renders Markdown docs from `docs/`.
- Added GitHub Pages deployment expectations for `site/dist` at `https://code5717.github.io/Arraylist/`.
- Produced review artifacts such as `LIBRARY_REVIEW.md` and `site/REVIEW.md`.

## Files Touched Or Investigated

- `array.h`
- `README.md`
- `docs/api-reference.md`, `docs/overview.md`, `docs/quickstart.md`, `docs/examples.md`
- `tests/compile/run.sh`
- `tests/compile/get_set_accessors.c`
- `tests/compile/growth_edges.c`
- `tests/compile/lvalue_requirement.c`
- `tests/compile/nullable_and_back.c`
- `tests/compile/realloc_interposer.c`
- `tests/compile/realloc_preserve.c`
- `tests/compile/test_with_realloc_failure.sh`
- `tests/compile/unchecked_convenience.c`
- `site/src/App.tsx`, `site/src/index.css`, `site/src/siteConfig.ts`, `site/src/tokens.css`
- `.agents/`, `site/.agents/`, `skills-lock.json`, `site/skills-lock.json`

## Commands And Checks Already Run

- `tests/compile/run.sh` is the documented strict-C compile verification command.
- `CC="zig cc" tests/compile/run.sh` is documented as an optional compiler check.
- `cd site && npm install && npm run dev` is documented for local site work.
- `cd site && npm run build` is documented for production site builds.
- Current handoff pass: `git status --short --branch` and README/file inspection.

## Known Errors, Warnings, Or Failing Checks

- Dirty files at handoff time:
  - Modified: `README.md`, `array.h`, `docs/api-reference.md`, `tests/compile/run.sh`
  - Untracked: `.agents/`, `LIBRARY_REVIEW.md`, `libarray.a`, `site/.agents/`, `site/REVIEW.md`, `site/skills-lock.json`, `skills-lock.json`, and multiple new compile tests
- `libarray.a` is untracked; decide whether it is intended build output before committing.
- No fresh compile or site build was run during this handoff implementation.

## Open Decisions

- Whether to commit the library hardening and docs-site changes together or split them into library/tests and site/docs commits.
- Whether `libarray.a` should be ignored, removed, or intentionally published.
- Whether repo-local `.agents` and skill lock files belong in this personal repo.
- Whether the checked API names and compatibility API split are final.

## Constraints, Preferences, And Do-Not-Touch Areas

- Preserve strict C11/C17 portability and avoid relying on GNU `typeof` for core APIs.
- Keep checked APIs as the recommended path and unchecked APIs as compatibility/performance-only.
- Do not discard existing array data on realloc failure.
- Treat `Slice(T)` as a range and `Span(T)`/element pointers as borrowed temporary views.
- Do not revert dirty work without explicit permission.

## Next Steps

1. Run `git status --short --branch` and review all untracked files, especially `libarray.a` and `.agents/`.
2. Run `tests/compile/run.sh`; optionally repeat with `CC="zig cc" tests/compile/run.sh`.
3. Review `array.h` against the README/API docs for naming and behavior consistency.
4. Run `cd site && npm run build` to verify the docs site still builds.
5. Decide commit boundaries: library/tests first, docs/site second, harness files separately or ignored.
6. Add ignore rules for generated outputs if `libarray.a` or `site/dist` should not be tracked.
