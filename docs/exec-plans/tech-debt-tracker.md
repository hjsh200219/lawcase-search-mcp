# Tech Debt Tracker

## Active Debt

| ID | Category | Description | Impact | Effort | Priority |
|----|----------|-------------|--------|--------|----------|
| TD-001 | Monolith | `server.ts` (1527 lines): 42 MCP tools in one file | Hard to navigate, slow reviews | Medium | P2 |
| TD-002 | Monolith | `law-api.ts` (1549 lines): All 21 API targets in one file | Same as above | Medium | P2 |
| TD-004 | Error Handling | `unipass-api.ts` 55 swallowed catches (에러 삼킴) | 디버깅 불가, 장애 원인 추적 어려움 | Medium | P1 |
| TD-005 | DRY | `index.ts`/`remote.ts` 환경변수 수집 로직 중복 | 새 환경변수 추가 시 양쪽 수정 필요 | Low | P2 |
| TD-006 | Monolith | `api-routes.ts` (878 lines): 단일 파일에 모든 REST 라우트 | 가독성 저하, 도메인별 분리 필요 | Medium | P2 |
| TD-007 | Monolith | `openapi.ts` (1238 lines): 단일 파일에 전체 스펙 | 유지보수 부담, 도메인별 분리 필요 | Medium | P2 |
| TD-008 | Validation | REST routes (`api-routes.ts`) trust query params without validation | Potential runtime errors from bad input | Low | P3 |
| TD-009 | Logging | Only `console.error` used, no structured logging | Hard to debug in production | Medium | P2 |
| TD-010 | Sessions | No TTL on session Map in `remote.ts` | Memory leak for idle sessions | Low | P3 |
| TD-011 | Shutdown | No SIGTERM/SIGINT handler for graceful shutdown | Requests dropped during redeploy | Low | P3 |
| TD-012 | DRY | `openapi.ts` repeats the same pattern for each endpoint | Maintenance burden when adding targets | Low | P3 |
| TD-013 | Monitoring | No metrics, health check only returns static JSON | No visibility into error rates/latency | Medium | P2 |
| TD-014 | XML Fragility | Raw XML path navigation in `law-api.ts` | Breaks silently if upstream changes XML structure | Medium | P2 |

## Resolved Debt

| ID | Description | Resolution | Date |
|----|-------------|------------|------|
| TD-003 | Zero test files exist | 4 test files added: `data20-api.test.ts`, `exim-api.test.ts`, `mafra-api.test.ts`, `unipass-api.test.ts` | 2026-04 |

## Scoring

- **P1**: Blocks confidence in shipping changes
- **P2**: Slows development or operations
- **P3**: Annoyance, address opportunistically
