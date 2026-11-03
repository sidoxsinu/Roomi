# Git Workflow

## The rule

Commit after every change. A change is one logical unit: one feature step, one fix, one doc update. If you can describe it with "and", split it. Do not batch a milestone into one commit. Never leave working changes uncommitted at the end of a task.

## Procedure for each task

1. `git status` (clean at start).
2. Make the change.
3. Run what is relevant (`npm test`, run the app, run the mock server).
4. Update `docs/STATUS.md` and `docs/CHANGELOG.md` if behaviour or status changed.
5. `git add` only the files for this change (avoid `git add -A` when unrelated files are modified).
6. `git commit -m "<type>(<scope>): <summary>"`
7. `git log --oneline -5` and report it.

## Message format

`<type>(<scope>): <imperative summary, lowercase, no full stop, under 72 chars>`

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `style`.
Scopes: `firmware`, `desktop`, `character`, `tools`, `docs`.
Optional body: what and why, plus requirement IDs (for example `Refs: APP-2, APP-10`).

Good: `feat(desktop): walk across desktop by moving window`
Bad: `update stuff`, `final changes`, `done milestone 5`

## Branches

- `main` always runs. Small tasks can commit directly to `main`.
- Larger or risky work: `feat/<name>` then merge with `--no-ff` once verified.
- Tag `v0.1.0-mvp` after MVP acceptance.

## Never commit

`firmware/roomi_esp32/config.h`, credentials, `node_modules/`, build output, `.DS_Store`, personal paths. If a secret is committed by mistake, stop, tell the student, and rewrite history before any push.

## Pushing

Do not push or create remotes unless the student asks. When asked, push `main` and tags.
