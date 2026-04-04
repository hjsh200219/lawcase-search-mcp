# Quality Assessment

## Overall: C+ (65/100)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Type Safety | 95 | 20% | 19.0 |
| Error Handling | 78 | 15% | 11.7 |
| Code Organization | 48 | 15% | 7.2 |
| Test Coverage | 35 | 20% | 7.0 |
| Documentation | 75 | 10% | 7.5 |
| API Completeness | 100 | 10% | 10.0 |
| Reliability Patterns | 50 | 10% | 5.0 |

## Per-File Grades

| File | Lines | Grade | Notes |
|------|-------|-------|-------|
| `mafra-api.ts` | 103 | **A** | 모범 사례: 작은 파일, 명시적 에러 처리 |
| `mafra-types.ts` | 38 | **A** | 깔끔한 타입 정의 |
| `mafra-api.test.ts` | 203 | **A** | 포괄적 테스트 (파싱 + API 8개) |
| `tools/mafra-tools.ts` | 134 | **A** | 깔끔한 2개 도구 |
| `exim-api.ts` | 82 | **A-** | 302 리다이렉트 처리, 테스트 있음 |
| `exim-types.ts` | 27 | **A** | Raw/Clean 타입 분리 |
| `exim-api.test.ts` | 127 | **A** | 302 케이스 포함 7개 테스트 |
| `tools/exim-tools.ts` | 49 | **A** | 단일 도구, 깔끔 |
| `types.ts` | 598 | **A** | 법제처 인터페이스. `any` 제로 |
| `unipass-types.ts` | 574 | **A** | 42개 인터페이스. `any` 제로 |
| `dart-types.ts` | 153 | **A** | DART interfaces |
| `data20-types.ts` | 143 | **A** | 공공데이터포털 interfaces |
| `config.ts` | 60 | **A** | 환경변수 수집 (DRY 추출) |
| `index.ts` | 23 | **A** | Stdio entrypoint |
| `remote.ts` | 115 | **A-** | Express HTTP 서버, 세션 관리 |
| `unipass-api.test.ts` | 1304 | **A-** | 42개 API 전수 테스트 |
| `shared.ts` | 18 | **B** | 공유 유틸. 테스트 없음 |
| `data20-api.ts` | 355 | **B** | 일부 API만 테스트 |
| `data20-api.test.ts` | 205 | **B+** | 2개 API만 커버 |
| `tools/data20-tools.ts` | 379 | **B** | tools/ 패턴 준수 |
| `dart-api.ts` | 375 | **B-** | 캐시/quota 좋으나 테스트 없음 |
| `tools/dart-tools.ts` | 264 | **B-** | 테스트 없음 |
| `unipass-api.ts` | 1501 | **B-** | 포괄적 테스트, 대형 파일, catch 로깅 추가됨 |
| `tools/unipass-tools.ts` | 1348 | **C+** | 52개 도구. 대형 단일 파일 |
| `tools/law-tools.ts` | 1484 | **C+** | server.ts에서 추출. 대형이나 패턴 일관 |
| `law-api.ts` | 1549 | **C+** | 재시도 로직 좋으나 모놀리식. 테스트 없음 |
| `api-routes.ts` | 878 | **C** | 입력 검증 없음. 크기 증가 |
| `openapi.ts` | 1238 | **C-** | 대형 스펙 생성. 반복 패턴 |
| `server.ts` | 52 | **A** | law-tools 추출 후 깔끔한 오케스트레이터 |

## Layer Grades

| Layer | Grade | Rationale |
|-------|-------|-----------|
| **Entrypoint** | **A** | config.ts 추출로 DRY 준수. 깔끔한 진입점 |
| **Protocol** | **B** | 모든 도메인 tools/ 분리 완료. law-tools 추출됨. 일부 대형 파일 존재 |
| **HTTP Adapter** | **C+** | 기능 작동. 입력 검증 미비. 대형 파일 |
| **Data Access** | **B** | 법제처/DART 재시도 좋음. 도메인별 분리 잘 됨 |
| **Shared** | **B** | 최소한, 깔끔. 테스트 없음 |
| **Types** | **A** | 6개 도메인 전부 `any` 제로 |

## Blockers to Grade A

1. **테스트 커버리지** — 법제처, DART, shared 테스트 없음 (전체 ~35%)
2. **대형 파일** — `law-api.ts` (1549), `unipass-tools.ts` (1348), `law-tools.ts` (1484)
3. **REST 입력 검증 없음** — `api-routes.ts`에서 raw query params 직접 사용
4. **HTTP Adapter 비대** — `api-routes.ts` (878), `openapi.ts` (1238) 도메인 분리 필요

## Strengths

- `any` 제로 — 전체 코드베이스 타입 안전성 95점
- 4개 도메인 테스트 보유 (data20, unipass, exim, mafra) — 89개 테스트 케이스
- 모든 도메인 tools/ 패턴 통일 (law-tools 추출 완료)
- DART corpCode 캐시 (24hr TTL, Promise dedup)
- config.ts 추출로 DRY 준수
- 에러 로깅 개선 (unipass 53개 catch, exim 1개 catch → console.error 추가)

## Historical Scores

| Date | Score | Change | Notes |
|------|-------|--------|-------|
| 2025-03-27 | B (73) | — | 최초 평가 |
| 2026-04-03 | B (73) | — | GC 감사: 문서 정리, 코드 무변경 |
| 2026-04-04 | C+ (68) | ↓5 | DART/공공데이터 통합. 테스트/분리 미진 |
| 2026-04-05 | C+ (65) | ↓3 | 6개 도메인, 코드 2배. 신규 테스트 1,839줄. 기존 부채 일부 해소 |
| 2026-04-05 | **C+ (67)** | **↑2** | **GC 수정: server.ts 추출(1527→52), config.ts DRY, 에러 로깅 추가, 미사용 export 제거, 버전 통일, 문서 전면 갱신** |
