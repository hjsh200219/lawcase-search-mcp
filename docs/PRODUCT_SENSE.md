# Product Sense

## What This Product Does

public-data-mcp는 한국 공공데이터 6개 도메인을 AI 어시스턴트에서 사용할 수 있게 하는 MCP 서버입니다. 법제처, DART, 공공데이터포털, 관세청 UNI-PASS, 수출입은행, 농림축산식품부의 XML/JSON API를 **10개 의도 기반 스킬 도구**로 통합하여 LLM 친화적으로 제공합니다 (v6.0.0).

## Users

| User Type | How They Use It | Transport |
|-----------|----------------|-----------|
| Claude Desktop users | 법률·통관·기업 분석 질문, Claude가 10개 스킬 호출 | stdio |
| Claude Mobile/Web users | 동일, Remote MCP 경유 | Streamable HTTP |
| ChatGPT users | GPT Actions with OpenAPI spec | REST |
| Developers | Direct HTTP API calls | REST |

## Value Proposition

- **10 Skills, 107 Actions**: 6개 도메인 API를 의도 기반 10개 스킬로 통합하여 LLM 도구 선택 정확도와 토큰 효율성 극대화
- **5 MCP Prompts**: 수입통관, 수출통관, 기업분석, 법령리서치, HS코드 워크플로 가이드 제공
- **AI-native**: 8000자 truncation, 한글 에러 메시지, 구조화된 응답
- **Dual access**: 동일 백엔드로 MCP 클라이언트와 REST 클라이언트 모두 지원
- **Korean-first**: 에러 메시지·도구 설명 모두 한글 제공

## Coverage: 6 Domains × 10 Skills

| Skill | Domain | Actions | Key Features |
|-------|--------|---------|-------------|
| `legal_research` | 법제처 | 17 | 법령 검색/상세/조문/용어/영문법령 등 |
| `case_research` | 법제처 | 10 | 판례/헌재결정/법령해석/행정심판 등 |
| `law_amendment` | 법제처 | 9 | 신구법비교/3단비교/체계도/별표서식 등 |
| `import_clearance` | UNI-PASS | 20 | 수입통관진행/B/L화물/수입신고/적하목록 등 |
| `export_clearance` | UNI-PASS | 6 | 수출통관진행/수출신고/환급 |
| `shipping_logistics` | UNI-PASS | 9 | 화물운송/하선장소/반출입 등 |
| `tariff_lookup` | UNI-PASS | 9 | HS코드/품목분류/관세율/과세환율 등 |
| `trade_entity` | UNI-PASS | 11 | 업체부호/통관업체/특송업체/검사대상 등 |
| `corporate_disclosure` | DART | 7 | 기업 공시/재무제표/사업보고서 |
| `public_data` | 공공데이터+수출입은행+농림축산식품부 | 9 | 기업정보/의약품/병원/환율/축산물가격 등 |

## Product Risks

| Risk | Mitigation |
|------|-----------|
| Upstream API downtime | 법제처: 3-retry with exponential backoff, DART: 2-retry |
| XML schema changes | Fragile; needs defensive parsing |
| Context overflow | 8000 char truncation |
| Rate limiting | 법제처 1 req/sec, DART 200ms interval throttle |
| API key 미설정 | 스킬 내 action별 조건부 에러 메시지 반환 |
