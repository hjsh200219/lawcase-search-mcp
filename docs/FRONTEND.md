# Frontend

> This project is a **backend-only** MCP/REST server. There is no frontend UI.

## Consumers

The server is consumed by:

1. **Claude Desktop** - via MCP stdio transport (`npm run start:stdio`)
2. **Claude Mobile/Web** - via Remote MCP Streamable HTTP transport (`/mcp` endpoint)
3. **ChatGPT / GPT Actions** - via REST API (`/api/*`) with OpenAPI 3.1 spec (`/openapi.json`)
4. **Any HTTP client** - via REST API endpoints

## If a Frontend Were Added

Considerations for a potential future UI:

- The REST API at `/api/*` is already available and returns JSON
- OpenAPI spec at `/openapi.json` can generate client SDKs
- CORS headers would need to be added to `remote.ts`
- Authentication/rate-limiting would be needed for public-facing UI
- Search results could be rendered with pagination using `totalCount` and `currentPage`
