# Serra migration snapshot — July 2026

This commit is a deliberate backup of an unfinished architectural migration. It is published so the
work can be recovered, inspected and continued; it must not be represented as production-ready.

## Current verification

- Client production build: passes (`npm run build --workspace client`).
- Core and server entry-point imports: partially repaired; further systematic verification needed.
- Jest suite: failing.
- Production deployment: not attempted and not authorized by this snapshot.

## Known failures

- Formula elements do not yet implement the engine attachment contract expected by `ModelFactory`.
- Engine test isolation cascades after failed setup because the singleton remains active.
- Dashboard membership serialization differs from existing test expectations.
- Denbug internal/system traces and flag initialization differ from the new test contract.
- Remaining server and protocol imports require migration review.

## Intended replacement direction

The worktree replaces legacy client Engine services, socket modules, dashboard services and worker
managers with explicit core transports, service registration, gateway, job, active-state and server
abstractions. Deleted files and new files belong to that migration and should be reviewed together.

## Safe continuation

1. Restore green Engine and formula tests.
2. Reconcile denbug behavior with its tests.
3. Verify every ESM import from core and server entry points.
4. Run the complete Jest suite.
5. Rebuild the client.
6. Add a bounded server smoke test before any deployment claim.
