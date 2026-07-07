---
title: "Serra CLI reference"
description: "Public CLI design reference for Serra dashboard and reactive-computation operations."
date: 2026-07-07
last_modified_at: 2026-07-07
license: MIT
document_role: "reference"
document_kind: "cli-reference"
visibility: "public"
lifecycle_state: "draft"
---

# Serra CLI reference

This document describes the intended CLI vocabulary for Serra. It is a design
reference, not a guarantee that every command is currently implemented.

## Boundary rule

The CLI is an operator surface. Commands that mutate dashboards, execute code or
connect to networked agents should be considered local/admin operations unless a
public read-only mode is explicitly implemented.

## Core concepts

| Concept | Description |
|---------|-------------|
| Element | A typed value holder or display unit |
| Formula | A relationship between elements |
| Dashboard | A named working surface |
| Stream | A flow of values or events |
| Adapter | Runtime-specific bridge to client, server or network services |

## Read-only commands

Read-only commands are safest for future public or agent-facing surfaces:

| Command | Purpose |
|---------|---------|
| `list-dashboards` | Show available dashboard names or examples |
| `describe-dashboard <name>` | Describe dashboard metadata |
| `list-elements <dashboard>` | Show element metadata |
| `describe-element <id>` | Describe one element |
| `explain-formula <id>` | Explain a formula relationship |
| `status` | Show safe service status |

## Local/admin commands

These commands can mutate state or execute behavior and should require a local
or admin boundary:

| Command | Purpose |
|---------|---------|
| `create-dashboard <name>` | Create a dashboard |
| `use <dashboard>` | Change current dashboard context |
| `add-element <id> <type>` | Create an element |
| `remove-element <id>` | Remove an element |
| `set <elementId> <value>` | Change an element value |
| `create-formula` | Create a formula relationship |
| `connect <sourceId> <targetId>` | Connect elements or streams |
| `disconnect <sourceId> <targetId>` | Disconnect elements or streams |

## High-risk commands

These should not be public defaults:

- arbitrary JavaScript injection;
- shell command execution;
- remote script execution;
- provider configuration changes;
- network agent enrollment;
- exporting private dashboard state.

If such commands exist, they should be explicit, auditable and policy-guarded.

## Example, read-only

```bash
serra status
serra list-dashboards
serra describe-dashboard greenhouse-demo
```

## Example, local/admin

```bash
serra create-dashboard greenhouse-demo
serra add-element temperature number
serra add-element target number
serra create-formula temperature-control
```

## Corpus note

Index this document as a CLI design reference. Do not treat command names as
implemented behavior until the CLI code is reviewed.
