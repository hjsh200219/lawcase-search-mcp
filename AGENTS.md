---
description: Public Data MCP 프로젝트 규칙 - 한국 공공데이터 MCP 서버
globs:
alwaysApply: true
---

# public-data-mcp

Korean public data MCP server (법제처 + DART 전자공시 + 공공데이터포털).

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
  index.ts          # Stdio entrypoint (46 lines)
  remote.ts         # HTTP entrypoint - Express (130 lines)
  server.ts         # MCP tool registration - law-api tools (1509 lines)
  api-routes.ts     # REST API routes - GPT Actions (353 lines)
  openapi.ts        # OpenAPI 3.1 spec generator (561 lines)
  shared.ts         # Shared utilities - truncate, errorResponse (18 lines)
  law-api.ts        # 법제처 API client - XML fetch/parse (1555 lines)
  types.ts          # 법제처 TypeScript interfaces (598 lines)
  dart-api.ts       # DART 전자공시 API client (292 lines)
  dart-types.ts     # DART TypeScript interfaces (140 lines)
  data20-api.ts     # 공공데이터포털 API client (310 lines)
  data20-types.ts   # 공공데이터포털 TypeScript interfaces (116 lines)
  tools/
    dart-tools.ts   # DART MCP tool registration - 5 tools (237 lines)
    data20-tools.ts # 공공데이터포털 MCP tool registration - 8 tools (308 lines)
```

## Layer Rules

```
Entrypoint (index.ts, remote.ts)
    |
    v
Protocol (server.ts, tools/dart-tools.ts, tools/data20-tools.ts)
    +  HTTP Adapter (api-routes.ts, openapi.ts)
    |                          |
    +-----------+--------------+
                |
    Data Access (law-api.ts, dart-api.ts, data20-api.ts)
                |
    Shared (shared.ts)  +  Types (types.ts, dart-types.ts, data20-types.ts)
```

- Dependencies flow downward only
- Environment variables only in entrypoints
- Domain-specific types/API in separate files (`dart-*.ts`, `data20-*.ts`)
- New MCP tools for new domains go in `tools/` directory
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
| `DART_API_KEY` | No | DART 전자공시 API key (없으면 DART 도구 비활성화) |
| `DATA20_SERVICE_KEY` | No | 공공데이터포털 service key (없으면 공공데이터 도구 비활성화) |
| `PORT` | No | HTTP server port (default: 3000) |

## Conventions

- Korean comments for domain-specific logic
- MCP tool names: `snake_case` with domain prefix (`search_laws`, `dart_*`, `data20_*`)
- REST routes: `kebab-case` (e.g., `/api/search/admin-rules`, `/api/dart/*`, `/api/data20/*`)
- Error responses: `isError: true` with Korean messages
- Domain-specific types in `{domain}-types.ts`, API clients in `{domain}-api.ts`
- Content truncated at 8000 chars for MCP responses
