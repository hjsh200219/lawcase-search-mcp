# Architecture

## System Overview

public-data-mcp is a Model Context Protocol (MCP) server providing Korean public data search through multiple APIs: 법제처 국가법령정보센터 (21 targets), DART 전자공시시스템 (5 targets), and 공공데이터포털 (8 targets). Total 34 tools across law, corporate disclosure, and public data domains.

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
│  law tools   │ │ REST API │ │ spec gen │
│  zod schemas │ │          │ │          │
└──────┬───────┘ └────┬─────┘ └──────────┘
       │              │
       │  ┌───────────────────────┐
       │  │  tools/               │
       │  │  dart-tools.ts (5)    │
       │  │  data20-tools.ts (8)  │
       │  └───────────┬───────────┘
       │              │
       └──────┬───────┘
              ▼
┌─────────────────────────────────────────┐
│  Data Access Layer                       │
│  law-api.ts    — 법제처 XML API (21 fn)  │
│  dart-api.ts   — DART JSON API (5 fn)   │
│  data20-api.ts — 공공데이터 XML/JSON (8) │
│  shared.ts     — truncate, errorResponse│
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Types Layer                             │
│  types.ts       — 법제처 interfaces      │
│  dart-types.ts  — DART interfaces       │
│  data20-types.ts — 공공데이터 interfaces  │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  External APIs                           │
│  law.go.kr  |  opendart.fss.or.kr       │
│  apis.data.go.kr  |  api.odcloud.kr     │
└─────────────────────────────────────────┘
```

## Layer Structure

| Layer | File(s) | Lines | Responsibility |
|-------|---------|-------|---------------|
| **Entrypoint** | `index.ts`, `remote.ts` | 46 + 130 | Process bootstrap, transport init, env validation |
| **Protocol** | `server.ts`, `tools/dart-tools.ts`, `tools/data20-tools.ts` | 1509 + 237 + 308 | MCP tool registration, zod validation, response formatting |
| **HTTP Adapter** | `api-routes.ts`, `openapi.ts` | 353 + 561 | REST routes for GPT Actions, OpenAPI 3.1 spec |
| **Data Access** | `law-api.ts`, `dart-api.ts`, `data20-api.ts` | 1555 + 292 + 310 | API clients: fetch, parse, rate-limit, retry |
| **Shared** | `shared.ts` | 18 | Cross-cutting utilities (truncate, errorResponse) |
| **Types** | `types.ts`, `dart-types.ts`, `data20-types.ts` | 598 + 140 + 116 | TypeScript interfaces per domain |

## Dependency Rules

```
Entrypoint --> Protocol --> Data Access --> Shared / Types
Entrypoint --> HTTP Adapter --> Data Access --> Shared / Types
```

1. All imports flow downward only
2. No circular dependencies
3. Protocol and HTTP Adapter are peers (no cross-imports)
4. Environment variables only in Entrypoint layer
5. Types layer has zero runtime dependencies
6. Domain-specific files (`dart-*`, `data20-*`) follow the same layer rules

See [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md) for full rules.

## External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | ^1.27.1 | MCP protocol (stdio + Streamable HTTP) |
| `express` | ^5.2.1 | HTTP server for remote mode |
| `fast-xml-parser` | ^5.4.1 | XML response parsing (법제처, 공공데이터) |
| `jszip` | ^3.10.1 | DART corpCode ZIP parsing |
| `zod` | ^4.3.6 | MCP tool input schema validation |

Dev dependencies: `typescript`, `tsx`, `@types/node`, `@types/express`

## Key Patterns

### Rate Limiting & Retry
- 법제처: 1 req/sec throttle, 3 retries with exponential backoff (3s, 6s, 12s)
- DART: 200ms interval throttle, 2 retries, daily quota tracking (20,000/day)
- 공공데이터포털: timeout only (retry 미구현 — 개선 예정)
- 30-second timeout per request via AbortController

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
| GET | `/api/search/*` | REST search endpoints (법제처) |
| GET | `/api/detail/*` | REST detail endpoints (법제처) |
| GET | `/api/dart/*` | DART 전자공시 endpoints |
| GET/POST | `/api/data20/*` | 공공데이터포털 endpoints |
| GET | `/openapi.json` | OpenAPI 3.1 spec |
