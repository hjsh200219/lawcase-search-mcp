---
description: Korean Public Data MCP 프로젝트 규칙 - 한국 공공데이터 MCP 서버
globs:
alwaysApply: true
---

# public-data-mcp

Korean public data MCP server (법제처 + DART 전자공시 + 공공데이터포털 + 관세청 UNI-PASS + 수출입은행 + 농림축산식품부).

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
  index.ts            # Stdio entrypoint (23 lines)
  remote.ts           # HTTP entrypoint - Express (115 lines)
  config.ts           # 환경변수 수집, ServerConfig 로드 (60 lines)
  server.ts           # MCP 서버 오케스트레이터 (52 lines)
  api-routes.ts       # REST 라우트 오케스트레이터 (40 lines)
  openapi.ts          # OpenAPI 스펙 오케스트레이터 (42 lines)
  http-client.ts      # 공통 HTTP fetch/retry/throttle (125 lines)
  shared.ts           # Shared utilities - truncate, errorResponse (18 lines)
  law-api.ts          # 법제처 API client (1549 lines)
  law-types.ts        # 법제처 TypeScript interfaces (598 lines)
  dart-api.ts         # DART 전자공시 API client (375 lines)
  dart-types.ts       # DART TypeScript interfaces (153 lines)
  data20-api.ts       # 공공데이터포털 API client (355 lines)
  data20-types.ts     # 공공데이터포털 TypeScript interfaces (143 lines)
  unipass-api.ts      # 관세청 UNI-PASS API client (1501 lines)
  unipass-types.ts    # 관세청 UNI-PASS TypeScript interfaces (574 lines)
  exim-api.ts         # 수출입은행 API client (82 lines)
  exim-types.ts       # 수출입은행 TypeScript interfaces (27 lines)
  mafra-api.ts        # 농림축산식품부 API client (103 lines)
  mafra-types.ts      # 농림축산식품부 TypeScript interfaces (38 lines)
  routes/             # 도메인별 REST 라우트 (6 files, 890 lines)
  openapi/            # 도메인별 OpenAPI path 생성기 (7 files, 1279 lines)
  tools/
    law-tools.ts      # 법제처 MCP tools - 21 tools (1484 lines)
    dart-tools.ts     # DART MCP tools - 5 tools (264 lines)
    data20-tools.ts   # 공공데이터포털 MCP tools - 8 tools (379 lines)
    unipass-tools.ts  # UNI-PASS 오케스트레이터 (25 lines)
    unipass/          # UNI-PASS MCP tools - 52 tools (4 files, 1390 lines)
    exim-tools.ts     # 수출입은행 MCP tools - 1 tool (49 lines)
    mafra-tools.ts    # 농림축산식품부 MCP tools - 2 tools (134 lines)
```

## Layer Rules

```
Entrypoint (index.ts, remote.ts)
    |
    v
Protocol (server.ts, tools/law-tools.ts, tools/dart-tools.ts,
          tools/data20-tools.ts, tools/unipass-tools.ts,
          tools/exim-tools.ts, tools/mafra-tools.ts)
    +  HTTP Adapter (api-routes.ts, openapi.ts)
    |                          |
    +-----------+--------------+
                |
    Data Access (law-api.ts, dart-api.ts, data20-api.ts,
                 unipass-api.ts, exim-api.ts, mafra-api.ts)
                |
    Shared (shared.ts)
    +  Types (law-types.ts, dart-types.ts, data20-types.ts,
             unipass-types.ts, exim-types.ts, mafra-types.ts)
```

- Dependencies flow downward only
- Environment variables only in entrypoints
- Domain-specific types/API in separate files (`{domain}-api.ts`, `{domain}-types.ts`)
- New MCP tools for new domains go in `tools/` directory
- See [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md)

## Documentation Map

### Architecture & Design
| Document | What it tells you |
|----------|-------------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System diagram, layers, external deps |
| [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md) | Import rules and boundaries |
| [docs/design-docs/core-beliefs.md](docs/design-docs/core-beliefs.md) | Foundational principles |

### Quality & Planning
| Document | What it tells you |
|----------|-------------------|
| [docs/QUALITY.md](docs/QUALITY.md) | Quality assessment, per-file grades |
| [docs/PRODUCT_SENSE.md](docs/PRODUCT_SENSE.md) | Users, value prop, API targets |
| [docs/exec-plans/tech-debt-tracker.md](docs/exec-plans/tech-debt-tracker.md) | Tech debt inventory |

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `LAW_API_OC` | Yes | law.go.kr API authentication code |
| `DART_API_KEY` | No | DART 전자공시 API key (없으면 DART 도구 비활성화) |
| `DATA20_SERVICE_KEY` | No | 공공데이터포털 service key (없으면 공공데이터 도구 비활성화) |
| `UNIPASS_KEY_API*` | No | 관세청 UNI-PASS API 인증키 (API번호별 개별 키, 없으면 UNI-PASS 도구 비활성화) |
| `MAFRA_API_KEY` | No | 농림축산식품부 API key (없으면 농림축산식품부 도구 비활성화) |
| `EXCHANGE_RATE_API_KEY` | No | 수출입은행 환율 API key (없으면 환율 도구 비활성화) |
| `PORT` | No | HTTP server port (default: 3000) |

## Conventions

- Korean comments for domain-specific logic
- MCP tool names: `snake_case` with domain prefix (`search_laws`, `dart_*`, `data20_*`, `unipass_*`, `exim_*`, `mafra_*`)
- REST routes: `kebab-case` (e.g., `/api/search/admin-rules`, `/api/dart/*`, `/api/data20/*`, `/api/unipass/*`, `/api/exim/*`, `/api/mafra/*`)
- Error responses: `isError: true` with Korean messages
- Domain-specific types in `{domain}-types.ts`, API clients in `{domain}-api.ts`
- Content truncated at 8000 chars for MCP responses
