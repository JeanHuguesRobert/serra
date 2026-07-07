---
title: "Serra agent instructions"
description: "Public working instructions for agents contributing to Serra."
date: 2026-07-07
last_modified_at: 2026-07-07
license: MIT
document_role: "operational"
document_kind: "agent-instructions"
visibility: "public_candidate"
lifecycle_state: "draft"
---

# Serra agent instructions

These instructions are for agents helping with Serra. They are public working
guidance, not a blanket authorization to modify the repository.

## Start here

1. Read `README.md`.
2. Read `docs/public-corpus.md`.
3. Read `docs/ARCHITECTURE.md`.
4. Check `git status`.
5. Keep changes small and reviewable.

## Operating rules

- Do not commit secrets, local paths, generated builds or dependency trees.
- Do not overwrite manual work without explicit approval.
- Do not mix source refactors with documentation cleanup unless required.
- Do not expose writable network or MCP operations as public endpoints without
  an explicit local/admin boundary.
- When a semantic or safety decision is unclear, stop and ask.

## Preferred workflow

- Create one focused branch or PR per concern.
- Use documentation-only PRs for corpus preparation.
- Keep source refactors separate from generated-output cleanup.
- Run available tests before merging source changes.
- Update `docs/TODO.md` and tracking issues when a phase is completed.

## Documentation expectations

- Mark working-memory files explicitly.
- Distinguish plans from implemented behavior.
- Redact or omit operational details that would help attack a deployment.
- Keep public corpus documents useful to humans and agents.
