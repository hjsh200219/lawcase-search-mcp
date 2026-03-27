# Security

## Authentication

| Component | Method | Notes |
|-----------|--------|-------|
| Upstream API (law.go.kr) | API key (`LAW_API_OC`) | Passed as query parameter `OC=` |
| MCP endpoint (`/mcp`) | None | Open; relies on transport-level auth |
| REST API (`/api/*`) | None | Open; intended for server-to-server |
| Health endpoint | None | Public by design |

## Secret Management

| Secret | Storage | Exposure Risk |
|--------|---------|--------------|
| `LAW_API_OC` | Environment variable | Low - only used in outbound API calls |
| Session IDs | In-memory Map | Medium - UUID v4, transmitted in headers |

## Attack Surface

### API Key Leakage
- `LAW_API_OC` is read only in entrypoint files and passed down as a string parameter
- Never logged or included in error responses
- `.env` is in `.gitignore`

### Session Hijacking
- Session IDs are UUID v4 (128-bit random) - guessing is infeasible
- Sessions stored in-memory only, no persistence across restarts
- No session TTL (see tech debt TD-006)

### Injection
- XML responses from upstream are parsed by `fast-xml-parser`, not evaluated
- MCP tool inputs validated by zod schemas
- REST inputs are **not validated** (tech debt TD-004)

### Denial of Service
- Rate-limited to 1 req/sec to upstream API
- No rate-limiting on inbound requests from clients
- No request size limits beyond Express defaults

## Recommendations

1. Add inbound rate-limiting (e.g., `express-rate-limit`) for public deployments
2. Add request size limits for POST body
3. Add REST input validation (zod) to prevent malformed queries
4. Consider adding API key auth for REST endpoints if exposed publicly
5. Add session TTL to prevent memory exhaustion
6. Never log the `LAW_API_OC` value
