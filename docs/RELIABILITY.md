# Reliability Standards

## Current State

### Built-in Resilience
- **Rate limiting**: 1 request/second throttle to upstream API
- **Retry with backoff**: 3 retries with exponential backoff (3s, 6s, 12s) for:
  - HTTP 429 (rate limit)
  - HTTP 5xx (server errors)
  - Empty responses
  - Timeouts (AbortError)
- **Timeout**: 30-second per-request timeout via AbortController
- **Graceful degradation**: MCP responses include `isError: true` on failure with Korean error messages
- **Content truncation**: Long responses capped at 8000 chars to prevent context overflow

### Session Management
- Per-session transport instances with cleanup on close
- DELETE endpoint for explicit session teardown

## Standards

### API Reliability
| Metric | Target | Current |
|--------|--------|---------|
| Upstream timeout | 30s | 30s |
| Max retries | 3 | 3 |
| Min request interval | 1s | 1s |
| Error response format | Structured JSON/text | Yes |

### Deployment
| Aspect | Status |
|--------|--------|
| Health endpoint | `/health` returns `{ status: "ok" }` |
| Process management | Procfile for Railway (`web: node dist/remote.js`) |
| Environment validation | Fails fast if `LAW_API_OC` is missing |

## Gaps & Recommendations

1. **No automated tests**: Add integration tests against mock XML responses
2. **No structured logging**: Replace `console.error` with a logger (e.g., pino)
3. **No metrics/monitoring**: Add request count, latency, error rate tracking
4. **Session memory leak potential**: No TTL on sessions Map; long-lived idle sessions never cleaned up
5. **No graceful shutdown**: Process does not handle SIGTERM for draining connections
6. **Single-process**: No clustering or horizontal scaling configuration
