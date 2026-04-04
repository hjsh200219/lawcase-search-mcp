# Tech Debt Tracker

## Active Debt

| ID | Category | Description | Impact | Effort | Priority |
|----|----------|-------------|--------|--------|----------|
| TD-001 | Monolith | `server.ts` (1505 lines): 42 MCP tools in one file | Hard to navigate, slow reviews | Medium | P2 |
| TD-002 | Monolith | `law-api.ts` (1547 lines): All 21 API targets in one file | Same as above | Medium | P2 |
| TD-003 | Testing | Zero test files exist | No regression safety net | High | P1 |
| TD-004 | Validation | REST routes (`api-routes.ts`) trust query params without validation | Potential runtime errors from bad input | Low | P3 |
| TD-005 | Logging | Only `console.error` used, no structured logging | Hard to debug in production | Medium | P2 |
| TD-006 | Sessions | No TTL on session Map in `remote.ts` | Memory leak for idle sessions | Low | P3 |
| TD-007 | Shutdown | No SIGTERM/SIGINT handler for graceful shutdown | Requests dropped during redeploy | Low | P3 |
| TD-008 | DRY | `openapi.ts` repeats the same pattern for each endpoint | Maintenance burden when adding targets | Low | P3 |
| TD-009 | Monitoring | No metrics, health check only returns static JSON | No visibility into error rates/latency | Medium | P2 |
| TD-010 | XML Fragility | Raw XML path navigation in `law-api.ts` | Breaks silently if upstream changes XML structure | Medium | P2 |

## Resolved Debt

| ID | Description | Resolution | Date |
|----|-------------|------------|------|
| *(none yet)* | | | |

## Scoring

- **P1**: Blocks confidence in shipping changes
- **P2**: Slows development or operations
- **P3**: Annoyance, address opportunistically
