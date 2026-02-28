# lawcase-search-mcp

대한민국 대법원/하급법원 판례를 검색하는 MCP(Model Context Protocol) 서버입니다.
법제처 국가법령정보센터 API를 활용합니다.

## 제공 도구

### `search_cases` - 판례 검색

키워드로 판례를 검색합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `query` | string | O | 검색어 (2자 이상) |
| `page` | number | X | 페이지 번호 (기본 1) |
| `display` | number | X | 페이지당 결과 수 (1~100, 기본 20) |
| `search_type` | enum | X | `case_name`=사건명, `full_text`=전문 (기본) |
| `date_from` | string | X | 검색 시작일 (YYYYMMDD) |
| `date_to` | string | X | 검색 종료일 (YYYYMMDD) |
| `court` | enum | X | `supreme`=대법원, `lower`=하급법원, `all`=전체 (기본) |

### `get_case_detail` - 판례 상세 조회

판례 일련번호로 상세 내용을 조회합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `case_id` | number | O | 판례 일련번호 |
| `sections` | array | X | 조회 섹션 (기본 `all`): `holdings`, `summary`, `reference_laws`, `reference_cases`, `content` |

## 설치 및 설정

```bash
npm install
npm run build
```

### Cursor MCP 설정

`~/.cursor/mcp.json`에 추가:

```json
{
  "mcpServers": {
    "lawcase-search": {
      "command": "node",
      "args": ["/Users/hoshin/workspace/lawcase-search-mcp/dist/index.js"],
      "env": {
        "LAW_API_OC": "your_api_oc_here"
      }
    }
  }
}
```

## 환경변수

| 변수 | 설명 |
|------|------|
| `LAW_API_OC` | 법제처 API 인증코드 (필수) |
