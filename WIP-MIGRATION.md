---
title: "Serra migration snapshot — July 2026"
document_role: operational
document_kind: migration-status
status: active-wip
visibility: public
---

# Serra migration snapshot — July 2026

This commit is a deliberate backup of an unfinished architectural migration. It is published so the
work can be recovered, inspected and continued; it must not be represented as production-ready.

## Current verification

- Client production build: passes (`npm run build --workspace client`).
- Core and server-gateway entry-point imports: pass.
- Jest suite: passes (44 tests).
- Production deployment: not attempted and not authorized by this snapshot.

## Remaining limits

- The passing unit suite and client build do not constitute end-to-end server validation.
- Production deployment, persistence, authentication and external-service integration remain unverified.
- The migration still needs bounded server smoke tests before any operational claim.

## Intended replacement direction

The worktree replaces legacy client Engine services, socket modules, dashboard services and worker
managers with explicit core transports, service registration, gateway, job, active-state and server
abstractions. Deleted files and new files belong to that migration and should be reviewed together.

## Safe continuation

1. Add a bounded server smoke test.
2. Verify persistence, authentication and external-service boundaries.
3. Exercise an end-to-end dashboard workflow.
4. Define deployment and rollback procedures before any production trial.
