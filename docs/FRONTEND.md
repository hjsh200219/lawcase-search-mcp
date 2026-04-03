# Frontend

## 공통 금지 사항

- **이모지를 UI 아이콘으로 사용 금지.** OS/브라우저마다 렌더링이 다르고, 텍스트와 간격이 맞지 않음. SVG 아이콘 또는 Remixicon 사용.
- **미구현 페이지로 링크 금지.** 페이지가 없으면 disabled 처리 + "준비 중" 태그 표시.
- **E2E 테스트는 로그인/비로그인 두 상태 모두 검증.**
- **디자인 리뷰 시 모든 상태의 스크린샷 확인 필수.**


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
