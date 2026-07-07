---
title: "Serra TODO"
description: "Public working TODO for Serra stabilization and corpus integration."
date: 2026-07-07
last_modified_at: 2026-07-07
license: MIT
document_role: "operational"
document_kind: "todo"
visibility: "public_candidate"
lifecycle_state: "draft"
---

# Serra TODO

This TODO is public working memory. It helps orient future work, but it is not a
canonical source of implemented behavior.

## Corpus preparation

- [x] Ignore local secrets and generated build outputs.
- [x] Stop tracking generated `client/dist` output.
- [x] Add a public corpus guide.
- [x] Clarify architecture documentation for public indexing.
- [x] Replace MCP and network drafts with public boundary notes.
- [ ] Review API and CLI docs for freshness.
- [ ] Decide whether `knowledge.md` should remain public candidate or become a
  reviewed source document.
- [ ] Add Serra to the canonical Cogentia corpus registry.
- [ ] Run corpus verification and index update after registry integration.

## Implementation stabilization

- [ ] Split the large client/core/server WIP into reviewable PRs.
- [ ] Align the codebase consistently on ES modules.
- [ ] Review transport and gateway abstractions.
- [ ] Review MCP-related code against `docs/MCP.md`.
- [ ] Review network/agent execution code against `docs/NETWORK.md`.
- [ ] Add or refresh tests after package and dependency changes.

## Documentation

- [ ] Refresh `docs/API.md`.
- [ ] Refresh `docs/CLI.md`.
- [ ] Add examples that do not expose secrets or deployment-specific details.
- [ ] Keep generated structure maps sanitized.
