# Architecture

## Overview

lawcase-search-mcp is a Model Context Protocol (MCP) server that provides comprehensive Korean legal information search through the National Law Information Center (법제처 국가법령정보센터) API. It supports 21 search/detail targets across laws, cases, constitutional decisions, and more.

## Domain Map

```
┌─────────────────────────────────────────────────────┐
│                    Entrypoints                       │
│  index.ts (stdio)         remote.ts (HTTP/Express)   │
└────────────┬───────────────────────┬────────────────┘
             │                       │
             ▼                       ▼
┌────────────────────┐  ┌───────────────────────────┐
│   MCP Transport     │  │   HTTP Transport           │
│   (stdio via SDK)   │  │   StreamableHTTP + REST    │
└────────┬───────────┘  │   + OpenAPI spec            │
         │               └─────┬──────────┬──────────┘
         │                     │          │
         ▼                     ▼          ▼
┌──────────────────┐  ┌────────────┐  ┌──────────┐
│   server.ts       │  │ api-routes │  │ openapi  │
│   (MCP tools)     │  │ (REST API) │  │ (spec)   │
└────────┬─────────┘  └─────┬──────┘  └──────────┘
         │                   │
         ▼                   ▼
┌──────────────────────────────────────┐
│            law-api.ts                 │
│   API Client (XML fetch + parse)      │
│   21 search + 18 detail functions     │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│            types.ts                   │
│   TypeScript interfaces for all       │
│   request params & response types     │
└──────────────────────────────────────┘
```

## Layer Structure

| Layer | File(s) | Responsibility |
|-------|---------|---------------|
| **Entrypoint** | `index.ts`, `remote.ts` | Process bootstrap, transport init, env validation |
| **Protocol** | `server.ts` | MCP tool registration (42 tools), input validation (zod), response formatting |
| **HTTP Adapter** | `api-routes.ts`, `openapi.ts` | REST API routes for GPT Actions, OpenAPI 3.1 spec generation |
| **Data Access** | `law-api.ts` | API client: XML fetch, parse, rate-limiting, retry, type mapping |
| **Types** | `types.ts` | Shared TypeScript interfaces (~600 lines, 40+ types) |

## Dependency Direction

```
Entrypoint → Protocol → Data Access → Types
Entrypoint → HTTP Adapter → Data Access → Types
```

All dependencies flow downward. No circular dependencies exist.

## Key Design Decisions

1. **Dual transport**: stdio for local MCP clients (Claude Desktop), HTTP for remote (Claude mobile/web) and REST (GPT Actions)
2. **XML-based API**: The upstream law.go.kr API returns XML; `fast-xml-parser` handles conversion
3. **Rate limiting**: Built-in throttle (1 req/sec) + exponential backoff retry (3 attempts)
4. **Session management**: Remote transport uses per-session `StreamableHTTPServerTransport` instances stored in a Map
5. **Content truncation**: MCP responses truncated at 8000 chars to fit context windows

## External Dependencies

| Package | Purpose |
|---------|---------|
| `@modelcontextprotocol/sdk` | MCP protocol (stdio + Streamable HTTP) |
| `express` | HTTP server for remote mode |
| `fast-xml-parser` | XML response parsing |
| `zod` | MCP tool input schema validation |

## Deployment

- **Local**: `npm run start:stdio` (stdio MCP)
- **Remote**: `npm start` (Express HTTP server, deployed on Railway)
- **Build**: TypeScript compiled to `dist/` via `tsc`
