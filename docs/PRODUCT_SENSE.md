# Product Sense

## What This Product Does

lawcase-search-mcp makes the entire Korean National Law Information Center (법제처 국가법령정보센터) accessible to AI assistants. It transforms an XML-based government API into structured, LLM-friendly responses via MCP and REST.

## Users

| User Type | How They Use It | Transport |
|-----------|----------------|-----------|
| Claude Desktop users | Ask legal questions, Claude calls MCP tools | stdio |
| Claude Mobile/Web users | Same, via Remote MCP | Streamable HTTP |
| ChatGPT users | GPT Actions with OpenAPI spec | REST |
| Developers | Direct HTTP API calls | REST |

## Value Proposition

- **Completeness**: All 21 law.go.kr API targets supported (not just the popular ones)
- **AI-native**: Responses formatted for LLM context windows (truncation, structured errors)
- **Dual access**: Same backend serves MCP clients and REST clients
- **Korean-first**: Error messages and descriptions in Korean for the target market

## Coverage: 21 API Targets

1. Laws (법령) - statutes, presidential decrees, ministerial ordinances
2. Court Cases (판례) - Supreme Court and lower court precedents
3. Constitutional Decisions (헌재결정례)
4. Legal Interpretations (법령해석례)
5. Administrative Rules (행정규칙)
6. Local Ordinances (자치법규)
7. Treaties (조약)
8. Legal Terms (법령용어)
9. English Laws (영문법령)
10. Committee Decisions (위원회 결정문) - 11 committees
11. Administrative Appeals (행정심판례)
12. Old-New Law Comparison (신구법비교)
13. Law System Diagrams (법령 체계도)
14. Three-Way Comparison (3단비교)
15. Attached Forms (별표서식)
16. Law Abbreviations (법령 약칭)
17. Law Change History (법령 변경이력)
18. Article Drill-Down (조항호목)
19. AI Legal Terms (지식베이스 법령용어)
20. Linked Ordinances (연계 조례)
21. Admin Rule Old-New Comparison (행정규칙 신구법비교)

## Product Risks

| Risk | Mitigation |
|------|-----------|
| Upstream API downtime | 3-retry with exponential backoff |
| XML schema changes | Fragile; needs defensive parsing (see tech debt TD-010) |
| Context overflow | 8000 char truncation |
| Rate limiting by law.go.kr | 1 req/sec throttle |
