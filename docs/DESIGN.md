# Design Overview

## Philosophy

lawcase-search-mcp provides complete access to Korea's National Law Information Center API through both MCP (for AI assistants) and REST (for GPT Actions and HTTP clients). The design prioritizes **completeness** (all 21 API targets), **transport independence**, and **graceful degradation**.

## Architecture Pattern

```
                  ┌─ stdio (index.ts)
Entrypoints ──────┤
                  └─ HTTP  (remote.ts) ── Express
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   server.ts     api-routes.ts   openapi.ts
   (MCP tools)   (REST routes)   (spec gen)
        │              │
        └──────┬───────┘
               │
          law-api.ts
          (API client)
               │
          types.ts
          (interfaces)
```

## Key Design Decisions

See [design-docs/](design-docs/) for detailed records.

### Why dual transport?

MCP stdio is the primary interface for AI assistants (Claude Desktop). HTTP was added for Claude mobile/web (Remote MCP over Streamable HTTP) and GPT Actions (REST + OpenAPI). Both share the same data layer.

### Why XML parsing?

The upstream law.go.kr API only returns XML. The project uses `fast-xml-parser` to convert XML into typed TypeScript objects. An `isArray` configuration ensures single-result responses are normalized to arrays.

### Why per-session server instances?

Each HTTP session gets its own `McpServer` + `StreamableHTTPServerTransport` pair. This avoids cross-session state leaks and allows independent lifecycle management (POST/GET/DELETE).

### Why 8000 char truncation?

LLM context windows are finite. Full legal document texts can be 50,000+ characters. Truncating at 8000 chars balances usability with context budget.

## Conventions

| Aspect | Convention |
|--------|-----------|
| Tool names | `snake_case` (e.g., `search_laws`) |
| REST paths | `kebab-case` (e.g., `/api/search/admin-rules`) |
| Comments | Korean for domain logic |
| Error messages | Korean, structured with `isError: true` |
| Environment vars | Only read in entrypoint files |
| New types | Must go in `types.ts` |

## Documents

| Doc | Purpose |
|-----|---------|
| [core-beliefs.md](design-docs/core-beliefs.md) | Foundational principles |
| [layer-rules.md](design-docs/layer-rules.md) | Dependency rules and boundaries |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Full architecture diagram and layers |
