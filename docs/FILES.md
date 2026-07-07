---
title: "Serra repository map"
description: "Public, sanitized map of the Serra repository structure."
date: 2026-07-07
last_modified_at: 2026-07-07
license: MIT
document_role: "reference"
document_kind: "repository-map"
visibility: "public"
lifecycle_state: "draft"
---

# Serra repository map

This is a public, sanitized repository map for Serra. It intentionally omits
local absolute paths, environment files, secrets, generated builds and transient
runtime data.

## Main areas

| Path | Role |
|------|------|
| `README.md` | Public project orientation |
| `knowledge.md` | Working-memory note, not canonical public entry |
| `docs/` | Public and candidate documentation |
| `core/` | Platform-agnostic engine, elements, services and utilities |
| `client/` | Browser/React dashboard interface |
| `server/` | Node.js server, API and runtime adapters |
| `shared/` | Shared helpers where present |
| `test/` | Automated tests |
| `utils/` | Development utilities |

## Documentation

Reviewed public corpus documents:

- `docs/public-corpus.md`
- `docs/ARCHITECTURE.md`
- `docs/MCP.md`
- `docs/NETWORK.md`
- `docs/FORMULA.md`
- `docs/ELEMENTS.md`
- `docs/API.md`
- `docs/CLI.md`
- `docs/ROADMAP.md`
- `docs/RULES.md`
- `docs/TODO.md`

Candidate or working documents should carry explicit frontmatter before being
treated as public corpus sources.

## Source structure

### `core/`

The core layer should remain as platform-agnostic as possible:

- engine and computation model;
- elements and factories;
- formula and propagation services;
- command and continuation utilities;
- protocol abstractions and service boundaries.

### `client/`

The client layer contains browser-specific code:

- React components;
- dashboard UI;
- hooks and contexts;
- browser transports;
- browser-specific service adapters.

### `server/`

The server layer contains Node.js-specific code:

- API routes;
- server gateways;
- job services;
- server-side provider adapters;
- runtime integration points.

## Not listed publicly

The public repository map must not list:

- local absolute paths;
- local environment files;
- private keys or certificates;
- generated `dist/` outputs;
- dependency trees;
- runtime logs;
- private deployment topology.
