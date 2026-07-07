---
title: "Serra MCP boundary"
description: "Public design note for MCP-style access to Serra without exposing raw runtime state."
date: 2026-07-07
last_modified_at: 2026-07-07
license: MIT
document_role: "operational"
document_kind: "boundary-note"
visibility: "public"
lifecycle_state: "draft"
---

# Serra MCP boundary

Serra may expose MCP-compatible tools in the future, but the public design rule
is narrow:

```text
MCP clients may ask Serra for governed context and actions.
MCP clients must not receive raw local runtime state, secrets or unrestricted
command execution.
```

This document is a Serra-specific boundary note. It is not a copy of the MCP SDK
documentation and it is not a deployment guide.

## Intended role

MCP is useful for Serra if it gives agents a stable, explicit interface to:

- inspect public dashboard metadata;
- request cited documentation snippets;
- ask for available safe actions;
- validate a proposed dashboard change before execution;
- explain why an action is allowed, refused or needs human review.

The MCP layer should be an adapter over Serra's governed API. It should not
read local files, inspect private runtime objects or bypass authentication.

## Public-safe tools

Possible future tools:

| Tool | Purpose | Public safety rule |
|------|---------|--------------------|
| `serra_describe` | Describe public project capabilities | Read-only, public docs only |
| `serra_search_docs` | Search reviewed Serra documentation | No private paths or local state |
| `serra_get_source` | Retrieve a cited public source interval | Only reviewed public Markdown |
| `serra_list_actions` | List safe proposed actions | No execution by default |
| `serra_validate_action` | Explain whether an action is allowed | Deterministic policy result |

Mutating tools, if added later, should require a separate local/admin mode and
explicit human or operator authorization.

## Not public MCP material

Do not expose through public MCP:

- raw environment variables;
- API keys, tokens or credential references;
- unrestricted SQL or filesystem access;
- arbitrary JavaScript execution;
- private dashboard state;
- host topology, private endpoints or deployment details;
- direct access to generated build artifacts;
- write operations that modify dashboards or runtime state without review.

## Relationship to Cogentia

For Cogentia corpus integration, this file is safe as a design boundary. It
should not be interpreted as proof that a production MCP server already exists.

If Serra later grows an MCP server, the implementation should follow the same
rule used by Cogentia:

```text
agents call explicit tools
tools call governed APIs
governed APIs enforce visibility and action policy
raw storage remains inaccessible
```

## Open decisions

- Which Serra data model is stable enough for public tools?
- Which actions are read-only, advisory or mutating?
- Which actions require local/admin mode?
- How should Serra cite documentation and dashboard sources?
- How should human approval be represented when an action is unsafe or
  ambiguous?
