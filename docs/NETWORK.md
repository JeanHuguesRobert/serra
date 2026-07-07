---
title: "Serra network boundary"
description: "Public design note for networked Serra agents, gateways and operational safety."
date: 2026-07-07
last_modified_at: 2026-07-07
license: MIT
document_role: "operational"
document_kind: "boundary-note"
visibility: "public"
lifecycle_state: "draft"
---

# Serra network boundary

Serra can become a networked dashboard and agent-control surface, but the public
corpus should describe the boundary, not expose an operational deployment.

The design goal is:

```text
visible capability without public operational control
```

## Public model

Public Serra documentation may describe:

- high-level dashboard and agent concepts;
- generic connection states;
- generic health and monitoring patterns;
- why network adapters are separated from the core engine;
- which classes of action require local/admin authorization.

Public documentation should not disclose live topology, credentials, private
endpoints, exact deployment state or exploitable operational details.

## Agent states

A public model can use generic states:

| State | Meaning |
|-------|---------|
| `available` | The node or agent can receive eligible work |
| `busy` | It is executing work or unavailable for new work |
| `degraded` | It can answer partially or with reduced capability |
| `offline` | It should not be selected for work |
| `blocked` | A policy, credential or human-review boundary prevents action |

These states are descriptive. They do not grant authority to execute remote
actions.

## Safe public API shape

Public network-facing APIs should be read-only by default:

- status summaries;
- public capability descriptions;
- cited documentation;
- safe health checks;
- explanations of why an action is refused or requires review.

Mutating operations, remote execution and provider switching belong behind a
local/admin boundary.

## Remote execution boundary

Remote script execution is a high-risk capability. If Serra implements it, the
default public rule should be:

```text
public view: describe capability only
local/admin view: submit or execute work only under explicit policy
```

Any implementation should include:

- allow-listed actions;
- bounded runtime and memory;
- input validation;
- audit logs;
- no secret values in logs;
- human or operator review when policy is ambiguous.

## AI provider boundary

Provider configuration is operationally sensitive. Public docs may describe that
Serra can use provider adapters, but should not expose:

- provider keys;
- raw environment variables;
- quota details tied to a real account;
- private model-routing policy;
- logs that reveal private prompts or dashboard state.

## Corpus integration rule

This document may be indexed as a public boundary note. It should be treated as
design guidance, not as evidence of a deployed network service.

Before indexing more detailed network documents, review them for:

- private endpoints;
- credential names or values;
- host topology;
- writable API examples;
- operational incidents;
- unreviewed agent execution semantics.
