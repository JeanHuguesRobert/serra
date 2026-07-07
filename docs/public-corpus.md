---
title: "Serra public corpus guide"
description: "Public reading path and corpus-integration guidance for Serra."
date: 2026-07-07
last_modified_at: 2026-07-07
license: MIT
document_role: "operational"
document_kind: "public-corpus-guide"
visibility: "public"
lifecycle_state: "active"
---

# Serra public corpus guide

This document defines the public reading path for Serra before it is added to
the Cogentia corpus registry.

Serra is a public repository about AI-mediated interfaces, adaptive dashboards,
reactive computation and operational control surfaces. Git and reviewed
Markdown remain canonical; generated builds, local secrets and unreviewed
runtime state are not corpus sources.

## Public reading path

Use this order when indexing or reviewing Serra:

1. [README](../README.md) - high-level project orientation.
2. [Architecture](ARCHITECTURE.md) - system architecture and core concepts.
3. [Formula system](FORMULA.md) - reactive computation model.
4. [Elements](ELEMENTS.md) - dashboard element model.
5. [MCP boundary](MCP.md) - public rules for future MCP-style access.
6. [Network boundary](NETWORK.md) - public network and agent-control boundary.
7. [Roadmap](ROADMAP.md) - planning context, not implementation evidence.
8. [Project rules](RULES.md) - working rules for development and documentation.
9. [Repository map](FILES.md) - sanitized public structure map.
10. [API](API.md) - public API boundary and candidate route shapes.
11. [CLI](CLI.md) - public CLI vocabulary and local/admin boundary.

`knowledge.md` may be useful for local orientation, but it should be reviewed
before being treated as a public source document. It reads like accumulated
project memory and may mix stable facts with implementation notes.

## Documents needing review before public indexing

These documents should not be treated as stable public corpus sources until they
have been reviewed:

- `docs/INSTRUCTIONS.md` - may contain operational or agent-facing instructions
  that need classification.
- `docs/TODO.md` - useful as public candidate working memory, but not canonical
  implementation evidence.
- `docs/INSTRUCTIONS.md` - public candidate agent guidance, not blanket
  authorization.

`docs/MCP.md` and `docs/NETWORK.md` are now reviewed as public boundary notes.
They should be indexed as design guidance, not as evidence of deployed runtime
services.

`docs/FILES.md`, `docs/RULES.md` and `docs/ROADMAP.md` are now reviewed as
public documentation. They should be interpreted according to their frontmatter
roles.

## Do not index as source

The following are not public corpus source material:

- local environment files;
- private keys, certificates, tokens or credential references;
- generated client builds such as `client/dist`;
- dependency directories;
- transient runtime data;
- local uncommitted experiments unless explicitly reviewed.

## Corpus integration status

Serra is not yet in the canonical Cogentia corpus registry. The current
preparation sequence is tracked in:

- [JeanHuguesRobert/cogentia#47](https://github.com/JeanHuguesRobert/cogentia/issues/47)
- [JeanHuguesRobert/serra#8](https://github.com/JeanHuguesRobert/serra/issues/8)

Before registry integration, Serra should have:

- a stable README;
- a reviewed public documentation map;
- no tracked generated build output;
- no secret-like local files in Git;
- explicit visibility guidance for network, MCP and operational documents.
