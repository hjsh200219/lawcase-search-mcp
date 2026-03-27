# Architecture

## System Overview

lawcase-search-mcp is a Model Context Protocol (MCP) server providing comprehensive Korean legal information search through the National Law Information Center (법제처 국가법령정보센터) API. It supports 21 search/detail targets across laws, cases, constitutional decisions, administrative rules, treaties, and more.

## High-Level Diagram

```
┌──────────────────────────────────────────────────────────┐
│                      Consumers                            │
│  Claude Desktop  |  Claude Mobile/Web  |  ChatGPT/HTTP   │
└────────┬─────────────────┬─────────────────┬─────────────┘
         │ stdio           │ Streamable HTTP │ REST
         │                 │                 │
┌────────▼─────┐  ┌───────▼──────────────────▼─────────────┐
│  index.ts    │  │  remote.ts                              │
│  (stdio)     │  │  (Express HTTP server)                  │
│              │  │  - /mcp    (MCP Streamable HTTP)        │
│              │  │  - /api/*  (REST endpoints)             │
│              │  │  - /openapi.json                        │
│              │  │  - /health                              │
└──────┬───────┘  └──┬──────────────┬───────────┬──────────┘
       │             │              │           │
       ▼             ▼              ▼           ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐
│  server.ts   │ │api-routes│ │ openapi  │
│  42 MCP tools│ │ REST API │ │ spec gen │
│  zod schemas │ │          │ │          │
└──────┬───────┘ └────┬─────┘ └──────────┘
       │              │
       └──────┬───────┘
              ▼
┌─────────────────────────────────────────┐
│  law-api.ts                              │
│  - XML fetch with AbortController (30s)  │
│  - fast-xml-parser conversion            │
│  - Rate limit: 1 req/sec throttle        │
│  - Retry: 3x exponential backoff         │
│  - 21 search + 18 detail functions       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  types.ts                                │
│  ~600 lines, 40+ TypeScript interfaces   │
│  Zero runtime dependencies               │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  law.go.kr XML API (external)            │
│  http://www.law.go.kr/DRF               │
└─────────────────────────────────────────┘
```

## Layer Structure

| Layer | File(s) | Lines | Responsibility |
|-------|---------|-------|---------------|
| **Entrypoint** | `index.ts`, `remote.ts` | 30 + 115 | Process bootstrap, transport init, env validation |
| **Protocol** | `server.ts` | 1505 | MCP tool registration (42 tools), zod validation, response formatting |
| **HTTP Adapter** | `api-routes.ts`, `openapi.ts` | 220 + 360 | REST routes for GPT Actions, OpenAPI 3.1 spec |
| **Data Access** | `law-api.ts` | 1547 | API client: XML fetch, parse, rate-limit, retry, type mapping |
| **Types** | `types.ts` | 600 | Shared TypeScript interfaces |

## Dependency Rules

```
Entrypoint --> Protocol --> Data Access --> Types
Entrypoint --> HTTP Adapter --> Data Access --> Types
```

1. All imports flow downward only
2. No circular dependencies
3. Protocol and HTTP Adapter are peers (no cross-imports)
4. Environment variables only in Entrypoint layer
5. Types layer has zero runtime dependencies

See [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md) for full rules.

## External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | ^1.27.1 | MCP protocol (stdio + Streamable HTTP) |
| `express` | ^5.2.1 | HTTP server for remote mode |
| `fast-xml-parser` | ^5.4.1 | XML response parsing |
| `zod` | ^4.3.6 | MCP tool input schema validation |

Dev dependencies: `typescript`, `tsx`, `@types/node`, `@types/express`

## Key Patterns

### Rate Limiting & Retry
- 1 request/second throttle to upstream API
- 3 retries with exponential backoff (3s, 6s, 12s)
- 30-second timeout per request via AbortController
- Retries on: HTTP 429, 5xx, empty responses, timeouts

### Session Management (HTTP mode)
- Per-session `StreamableHTTPServerTransport` + `McpServer` instances
- Sessions stored in `Map<string, StreamableHTTPServerTransport>`
- Cleanup on transport close event
- DELETE `/mcp` for explicit teardown

### Content Truncation
- MCP responses truncated at 8000 characters
- Korean message appended when content is cut

## Deployment

| Target | Command | Transport |
|--------|---------|-----------|
| Local dev (stdio) | `npm run dev` | stdio |
| Local dev (HTTP) | `npm run dev:remote` | HTTP |
| Production (Railway) | `npm start` | HTTP (port from `$PORT`) |
| Build | `npm run build` | N/A (TypeScript -> `dist/`) |

## Endpoints (HTTP mode)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| POST | `/mcp` | MCP client -> server messages |
| GET | `/mcp` | MCP server -> client SSE stream |
| DELETE | `/mcp` | Session teardown |
| GET | `/api/search/*` | REST search endpoints |
| GET | `/api/detail/*` | REST detail endpoints |
| GET | `/openapi.json` | OpenAPI 3.1 spec |
