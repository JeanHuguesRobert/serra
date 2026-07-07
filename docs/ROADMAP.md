---
title: "Serra roadmap"
description: "Public roadmap for Serra as an AI-mediated dashboard and reactive computation system."
date: 2026-07-07
last_modified_at: 2026-07-07
license: MIT
document_role: "operational"
document_kind: "roadmap"
visibility: "public"
lifecycle_state: "draft"
---

# Serra roadmap

This roadmap is a public orientation document. It is not a deployment promise
and should be updated as the implementation stabilizes.

## Current direction

Serra is converging toward:

- an AI-mediated dashboard interface;
- a platform-agnostic reactive computation core;
- browser and server adapters over the same core model;
- safe boundaries for MCP-style access and networked agents;
- documentation that can be indexed by Cogentia without exposing local state.

## Phases

### Phase 1 - Foundation

- Project structure.
- Core engine.
- Basic element model.
- Dashboard lifecycle.

### Phase 2 - Reactive computation

- Formula model.
- Element relationships.
- State propagation.
- Bidirectional data flow.

### Phase 3 - API and services

- REST/API surface.
- Authentication boundary.
- Server-side services.
- Data persistence decisions.

### Phase 4 - Client experience

- Web dashboard interface.
- Dashboard builder.
- Real-time updates.
- Visualization components.

### Phase 5 - Agent and network boundaries

- Safe MCP-style interface.
- Network state model.
- Explicit public/local/admin split.
- Human-review boundary for mutating operations.

### Phase 6 - Testing and documentation

- Unit tests.
- Integration tests.
- Public corpus documentation.
- Fresh examples and guides.

### Phase 7 - Production readiness

- Security review.
- Load and failure testing.
- Monitoring model.
- Deployment documentation with public/private separation.

## Corpus note

Roadmap items should be indexed as planning context, not as evidence that a
feature is implemented or deployed.
