# Plans

## Active Plans

*(No active execution plans at this time.)*

See [exec-plans/active/](exec-plans/active/) for work in progress.

## Planned Improvements

### Near-term (P1)

1. **Add test suite** - Integration tests with mock XML responses for all 21 API targets
2. **Structured logging** - Replace `console.error` with pino or similar

### Mid-term (P2)

3. **Split monoliths** - Break `server.ts` and `law-api.ts` into domain modules (law, case, constitutional, etc.)
4. **Monitoring** - Add request metrics (count, latency, error rate)
5. **XML resilience** - Add defensive parsing with fallback paths for upstream schema changes

### Long-term (P3)

6. **Session TTL** - Add expiration for idle sessions in `remote.ts`
7. **Graceful shutdown** - Handle SIGTERM for zero-downtime deploys on Railway
8. **REST input validation** - Add zod validation to `api-routes.ts` (matching MCP tool schemas)
9. **OpenAPI DRY refactor** - Builder pattern for `openapi.ts`

## Completed Plans

See [exec-plans/completed/](exec-plans/completed/) for finished work.

## Tech Debt

See [exec-plans/tech-debt-tracker.md](exec-plans/tech-debt-tracker.md) for the full debt inventory.
