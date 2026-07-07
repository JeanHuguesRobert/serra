---
title: "Serra API reference"
description: "Public API design reference for Serra dashboard and agent-facing services."
date: 2026-07-07
last_modified_at: 2026-07-07
license: MIT
document_role: "reference"
document_kind: "api-reference"
visibility: "public"
lifecycle_state: "draft"
---

# Serra API reference

This document is a public API design reference. It describes intended API
surfaces and safety boundaries; it is not proof that every endpoint is currently
implemented or deployed.

## Boundary rule

```text
public API documentation may describe capability
public deployment must not expose mutating control by default
```

Read-only routes are suitable for public documentation. Mutating routes,
command-processing routes and response-injection routes require a local/admin
boundary.

## Public-safe API classes

| Class | Purpose | Public mode |
|-------|---------|-------------|
| Health | Service availability | allowed |
| Documentation | Reviewed public docs and citations | allowed |
| Dashboard metadata | Public dashboard descriptions | allowed if no private state |
| Capability listing | Available safe actions | allowed as description only |
| Action validation | Explain whether a proposed action is allowed | allowed if read-only |

## Local/admin API classes

These classes should not be exposed as public writable endpoints:

| Class | Reason |
|-------|--------|
| Command processing | Can mutate dashboard or runtime state |
| Response injection | Can steer agent or continuation behavior |
| Remote script execution | High-risk execution surface |
| Provider configuration | May expose operational policy or credentials |
| Dashboard mutation | Writes project/runtime state |

## Candidate route shapes

### Health

```http
GET /api/health
```

Returns public service health without local paths, process details, secrets or
private topology.

### Documentation search

```http
GET /api/docs/search?q=...
```

Searches reviewed public documentation. It should return cited source
references, not raw filesystem paths.

### Documentation source interval

```http
GET /api/docs/source?ref=...&start=...&end=...
```

Returns a bounded interval from reviewed public Markdown.

### Dashboard metadata

```http
GET /api/dashboards
GET /api/dashboards/{id}
```

Public mode may describe example dashboards or public metadata. Local/admin mode
may expose real dashboard state according to policy.

### Action validation

```http
POST /api/actions/validate
```

Accepts a proposed action and returns whether it is public-safe, local/admin
only, blocked or requires human review. This should be deterministic and should
not execute the action.

## Response discipline

Public responses should avoid:

- local absolute paths;
- environment variable values;
- credential names that reveal operational structure;
- private dashboard contents;
- stack traces;
- raw provider configuration;
- unrestricted command or code execution details.

## Corpus note

Index this document as a reference for Serra's API boundary. Do not treat route
shapes as confirmed deployed endpoints until the implementation is reviewed.
