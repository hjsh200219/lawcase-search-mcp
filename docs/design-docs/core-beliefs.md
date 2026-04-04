# Core Beliefs

## 1. Transport Agnosticism

The data access layer (`law-api.ts`) must never know how it is being consumed. Whether the caller is an MCP stdio session, a Streamable HTTP session, or a REST API route, `law-api.ts` receives a plain API key string and returns typed objects. This allows adding new transports without touching business logic.

## 2. Downward-Only Dependencies

Every import must point toward `types.ts`. No file may import from a layer above it. This ensures each layer can be tested, replaced, or extended independently.

```
Entrypoint -> Protocol / HTTP Adapter -> Data Access -> Types
```

## 3. Single Source of Truth for Types

Each domain's TypeScript interfaces live in a single dedicated type file: `types.ts` (법제처), `dart-types.ts`, `data20-types.ts`, `unipass-types.ts`, `exim-types.ts`, `mafra-types.ts`. Domain objects are never re-declared elsewhere. This prevents drift between MCP tools, REST routes, and the API client.

## 4. Fail Loudly at the Edge, Gracefully Inside

- Entrypoints (`index.ts`, `remote.ts`) fail fast with `process.exit(1)` when required environment variables are missing.
- Inside the data layer, failures are retried (3x exponential backoff) and then returned as structured error objects rather than thrown exceptions.

## 5. Korean-First Domain Language

All domain comments, error messages, and API descriptions are in Korean. This matches the upstream law.go.kr API and the target user base. Tool names and REST paths remain in English for protocol compatibility.

## 6. Completeness over Convenience

All 21 API targets supported by law.go.kr are implemented, each with both search and detail endpoints. No target is partially implemented. This avoids the "almost works" trap where users discover gaps at runtime.

## 7. Content Safety via Truncation

MCP responses are truncated at 8000 characters. This prevents context window overflow in LLM consumers while still providing meaningful content. The truncation is explicit with a Korean message indicating content was cut.
