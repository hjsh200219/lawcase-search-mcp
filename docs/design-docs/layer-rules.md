# Layer Dependency Rules

## Layers (top to bottom)

```
1. Entrypoint      index.ts, remote.ts
2. Protocol         server.ts
3. HTTP Adapter     api-routes.ts, openapi.ts
4. Data Access      law-api.ts
5. Types            types.ts
```

## Rules

### R1: Dependencies flow downward only
A file may import from its own layer or any layer below. Never import upward.

```
Allowed:    server.ts → law-api.ts → types.ts
Forbidden:  law-api.ts → server.ts
```

### R2: Entrypoints own bootstrap
Only `index.ts` and `remote.ts` may read environment variables and initialize transports. Lower layers receive configuration as function parameters.

### R3: Types layer has zero runtime dependencies
`types.ts` contains only TypeScript interfaces and type definitions. No functions, no imports from other project files.

### R4: Data Access is transport-agnostic
`law-api.ts` must not import MCP SDK, Express, or any transport library. It receives an API key string and returns typed objects.

### R5: Protocol and HTTP Adapter are peers
`server.ts` (MCP tools) and `api-routes.ts` (REST) both depend on `law-api.ts` but must not depend on each other.

```
server.ts ──┐
            ├──→ law-api.ts → types.ts
api-routes.ts ─┘
```

### R6: OpenAPI spec is self-contained
`openapi.ts` generates a static spec object. It must not import from `law-api.ts` or `server.ts`.

## Violation Checklist

When adding new code, verify:
- [ ] No upward imports
- [ ] Environment variables only in entrypoints
- [ ] New types go in `types.ts`
- [ ] New API functions go in `law-api.ts`
- [ ] New MCP tools go in `server.ts`
- [ ] New REST endpoints go in `api-routes.ts`
