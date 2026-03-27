# lawcase-search-mcp

Korean legal information MCP server (법제처 국가법령정보센터 API).

## Quick Reference

- **Language**: TypeScript (ES2022, Node16 modules)
- **Build**: `npm run build` (tsc)
- **Run local**: `npm run start:stdio` (MCP stdio)
- **Run remote**: `npm start` (Express HTTP, port 3000)
- **Dev**: `npm run dev` / `npm run dev:remote`
- **Deploy**: Railway (Procfile: `web: node dist/remote.js`)

## Project Structure

```
src/
  index.ts        Stdio entrypoint
  remote.ts       HTTP entrypoint (Express + MCP + REST + OpenAPI)
  server.ts       MCP tool registration (42 tools, zod schemas)
  api-routes.ts   REST API routes (GPT Actions)
  openapi.ts      OpenAPI 3.1 spec generator
  law-api.ts      API client (XML fetch/parse, retry, throttle)
  types.ts        TypeScript interfaces (40+ types)
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full architecture diagram.

**Layer flow**: Entrypoint -> Protocol/HTTP Adapter -> Data Access -> Types

Key rules:
- Dependencies flow downward only
- Environment variables only in entrypoints
- `law-api.ts` is transport-agnostic
- `types.ts` has zero runtime dependencies

## Knowledge Base

| Document | Purpose |
|----------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Domain map, layers, dependency diagram |
| [docs/QUALITY.md](docs/QUALITY.md) | Per-file/layer quality grades |
| [docs/RELIABILITY.md](docs/RELIABILITY.md) | Resilience patterns, gaps |
| [docs/design-docs/](docs/design-docs/) | Design decisions and layer rules |
| [docs/exec-plans/](docs/exec-plans/) | Execution plans (active/completed) |
| [docs/product-specs/](docs/product-specs/) | Product specifications |

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `LAW_API_OC` | Yes | 법제처 API authentication code |
| `PORT` | No | HTTP server port (default: 3000) |

## Conventions

- Korean comments for domain-specific logic
- All API response types defined in `types.ts`
- MCP tool names use `snake_case` (e.g., `search_laws`, `get_case_detail`)
- REST routes use `kebab-case` (e.g., `/api/search/admin-rules`)
- Error responses include `isError: true` with Korean error messages
