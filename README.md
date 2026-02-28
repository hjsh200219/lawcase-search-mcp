# korea-law-search-mcp

대한민국 법령 종합 검색 MCP(Model Context Protocol) 서버입니다.
법제처 국가법령정보센터 API를 활용하여 법령, 판례, 헌재결정례, 법령해석례, 행정규칙, 자치법규, 조약, 법령용어, 영문법령, 위원회 결정문을 검색/조회합니다.

## 제공 도구 (20개)

| 검색 | 상세조회 | 대상 |
|------|----------|------|
| `search_laws` | `get_law_detail` | 법령 (법률, 대통령령, 부령 등) |
| `search_cases` | `get_case_detail` | 판례 (대법원/하급법원) |
| `search_constitutional` | `get_constitutional_detail` | 헌재결정례 |
| `search_interpretations` | `get_interpretation_detail` | 법령해석례 |
| `search_admin_rules` | `get_admin_rule_detail` | 행정규칙 (훈령, 예규, 고시) |
| `search_ordinances` | `get_ordinance_detail` | 자치법규 (조례/규칙) |
| `search_treaties` | `get_treaty_detail` | 조약 |
| `search_legal_terms` | `get_legal_term_detail` | 법령용어 |
| `search_english_laws` | `get_english_law_detail` | 영문법령 |
| `search_committee_decisions` | `get_committee_decision_detail` | 위원회 결정문 (11개 위원회) |

### 검색 도구 공통 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `query` | string | O | 검색어 |
| `page` | number | X | 페이지 번호 (기본 1) |
| `display` | number | X | 페이지당 결과 수 (1~100, 기본 20) |

### 추가 파라미터 (일부 도구)

- **search_cases**: `search_type` (case_name/full_text), `date_from`, `date_to`, `court` (supreme/lower/all)
- **search_laws**: `search_type` (law_name/full_text)
- **search_ordinances**: `search_type` (ordinance_name/full_text)
- **get_case_detail**: `sections` (holdings, summary, reference_laws, reference_cases, content, all)
- **get_constitutional_detail**: `sections` (holdings, decision_summary, full_text, reference_laws, reference_cases, all)
- **search_committee_decisions**: `committee` (필수, 아래 위원회 코드 참조)
- **get_committee_decision_detail**: `committee` (필수), `decision_id`

### 위원회 결정문 지원 위원회

| 코드 | 위원회명 |
|------|----------|
| `ftc` | 공정거래위원회 |
| `acr` | 국민권익위원회 |
| `fsc` | 금융위원회 |
| `nlrc` | 노동위원회 |
| `kcc` | 방송통신위원회 |
| `oclt` | 중앙토지수용위원회 |
| `nhrck` | 국가인권위원회 |
| `eiac` | 고용보험심사위원회 |
| `ecc` | 중앙환경분쟁조정위원회 |
| `sfc` | 증권선물위원회 |
| `iaciac` | 산재보험재심사위원회 |

## 설치 및 설정

```bash
npm install
npm run build
```

### MCP 설정

`~/.cursor/mcp.json` 또는 Claude Desktop 설정에 추가:

```json
{
  "mcpServers": {
    "korea-law-search": {
      "command": "node",
      "args": ["/path/to/korea-law-search-mcp/dist/index.js"],
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
| `LAW_API_OC` | 법제처 API 인증코드 (필수). [법제처 오픈API](https://open.law.go.kr/LSO/openApi/guideList.do)에서 발급 |

## 기술 스택

- TypeScript + Node.js
- `@modelcontextprotocol/sdk` - MCP 프로토콜
- `fast-xml-parser` - XML 응답 파싱
- `zod` - 입력 검증
