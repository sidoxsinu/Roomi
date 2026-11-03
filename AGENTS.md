# AGENTS.md (ROOMI)

This is the only doc file outside `docs/`. It exists because agent tools look for it in the repo root.

Read `docs/00-MASTER-PROMPT.md` first, then `docs/README.md`.

## Non-negotiable rules

1. All documentation lives in `docs/`. Never create doc files elsewhere (the root `README.md` may only link to `docs/`).
2. Commit after every change. One logical change = one commit. See `docs/09-GIT-WORKFLOW.md`.
3. After every task: update `docs/STATUS.md` and `docs/CHANGELOG.md`, then commit them in the same commit as the code.
4. Never fabricate readings, accuracy figures, screenshots, test results, or features. Unbuilt = "Planned" in `docs/STATUS.md`.
5. Never commit secrets (Wi-Fi SSID/password). Use `firmware/roomi_esp32/config.h` (gitignored) and `config.example.h` (committed).
6. Source of truth for scope: `docs/01-PRD.md`. If code and PRD disagree, stop and ask, or update the PRD in its own commit.
7. Keep v1 simple and reliable. No AI, cloud, or 3D in the MVP.
