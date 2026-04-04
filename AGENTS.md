# lawcase-search-mcp

Korean legal information MCP server (법제처 국가법령정보센터 API).

## Quick Start

```bash
npm run build        # TypeScript -> dist/
npm run start:stdio  # MCP stdio mode (local)
npm start            # HTTP mode (Railway deploy)
npm run dev          # Dev with tsx (stdio)
npm run dev:remote   # Dev with tsx (HTTP)
```

## Source Map

```
src/
  index.ts        # Stdio entrypoint (30 lines)
  remote.ts       # HTTP entrypoint - Express (114 lines)
  server.ts       # MCP tool registration - 42 tools (1505 lines)
  api-routes.ts   # REST API routes - GPT Actions (220 lines)
  openapi.ts      # OpenAPI 3.1 spec generator (360 lines)
  law-api.ts      # API client - XML fetch/parse (1547 lines)
  types.ts        # TypeScript interfaces - 40+ types (598 lines)
```

## Layer Rules

```
Entrypoint (index.ts, remote.ts)
    |
    v
Protocol (server.ts)  +  HTTP Adapter (api-routes.ts, openapi.ts)
    |                          |
    +-----------+--------------+
                |
           Data Access (law-api.ts)
                |
           Types (types.ts)
```

- Dependencies flow downward only
- Environment variables only in entrypoints
- New types go in `types.ts`, new API functions in `law-api.ts`
- See [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md)

## Documentation Map

### Architecture & Design
| Document | What it tells you |
|----------|-------------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System diagram, layers, external deps |
| [docs/DESIGN.md](docs/DESIGN.md) | Design philosophy and key decisions |
| [docs/design-docs/core-beliefs.md](docs/design-docs/core-beliefs.md) | Foundational principles |
| [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md) | Import rules and boundaries |
| [docs/design-docs/index.md](docs/design-docs/index.md) | Design docs index |

### Quality & Reliability
| Document | What it tells you |
|----------|-------------------|
| [docs/QUALITY.md](docs/QUALITY.md) | Quality assessment, per-file grades, scoring |
| [docs/RELIABILITY.md](docs/RELIABILITY.md) | Resilience patterns and gaps |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, secrets, attack surface |

### Product & Planning
| Document | What it tells you |
|----------|-------------------|
| [docs/PRODUCT_SENSE.md](docs/PRODUCT_SENSE.md) | Users, value prop, 21 API targets |
| [docs/product-specs/index.md](docs/product-specs/index.md) | Product specifications |
| [docs/PLANS.md](docs/PLANS.md) | Active and planned improvements |
| [docs/exec-plans/tech-debt-tracker.md](docs/exec-plans/tech-debt-tracker.md) | Tech debt inventory |

### Data & Frontend
| Document | What it tells you |
|----------|-------------------|
| [docs/generated/db-schema.md](docs/generated/db-schema.md) | Data shapes (no DB - types only) |
| [docs/FRONTEND.md](docs/FRONTEND.md) | No frontend; consumer info |

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `LAW_API_OC` | Yes | law.go.kr API authentication code |
| `PORT` | No | HTTP server port (default: 3000) |

## Conventions

- Korean comments for domain-specific logic
- MCP tool names: `snake_case` (e.g., `search_laws`)
- REST routes: `kebab-case` (e.g., `/api/search/admin-rules`)
- Error responses: `isError: true` with Korean messages
- All types defined in `types.ts` only
- Content truncated at 8000 chars for MCP responses
