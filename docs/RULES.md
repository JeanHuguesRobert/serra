---
title: "Serra project rules"
description: "Public working rules for Serra development and documentation."
date: 2026-07-07
last_modified_at: 2026-07-07
license: MIT
document_role: "operational"
document_kind: "project-rules"
visibility: "public"
lifecycle_state: "draft"
---

# Serra project rules

These rules guide Serra development. They are project working rules, not a
general mandate for every external agent.

## Development philosophy

- Build in small, testable increments.
- Prefer simple designs that preserve the core/client/server separation.
- Keep unrelated changes out of the current task.
- Update documentation when architecture changes.
- Treat generated files, local secrets and runtime data as non-source material.

## AI-human collaboration

AI agents may help inspect, implement, test and document Serra. They should:

- explain material decisions;
- ask for human input when governance, safety or scope is ambiguous;
- avoid destructive changes without explicit approval;
- avoid committing secrets, local paths or generated outputs;
- prefer small reviewable PRs.

Humans provide project intent, domain judgment and authorization for sensitive
changes.

## Code structure

- Use ES modules.
- Keep the core layer platform-agnostic.
- Isolate browser code in `client/`.
- Isolate Node.js runtime code in `server/`.
- Keep network, MCP and remote-execution surfaces behind explicit boundaries.

## Documentation

- Public docs should distinguish implemented behavior from planned behavior.
- Boundary docs should say what must not be exposed.
- Working-memory notes should be marked as such.
- Public corpus documents should avoid local paths, credentials and deployment
  topology.

## Security

- Never commit environment files, private keys, tokens or certificates.
- Do not expose writable network operations as public documentation examples
  unless they are clearly marked as non-public/admin.
- Treat remote execution and provider configuration as high-risk capabilities.
