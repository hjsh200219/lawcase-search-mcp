/**
 * OpenAPI 3.1 스펙 생성 - GPT Actions용
 */

export function generateOpenApiSpec(baseUrl: string) {
  const searchParams = {
    query: { name: "query", in: "query", required: true, schema: { type: "string" }, description: "검색어" },
    page: { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "페이지 번호" },
    display: { name: "display", in: "query", schema: { type: "integer", default: 20 }, description: "페이지당 결과 수 (최대 100)" },
  };

  const searchTypeParam = (desc: string) => ({
    name: "search_type", in: "query", schema: { type: "string", enum: ["law_name", "full_text"], default: "law_name" }, description: desc,
  });

  const idParam = (desc: string) => ({
    name: "id", in: "path", required: true, schema: { type: "integer" }, description: desc,
  });

  const jsonResponse = (desc: string) => ({
    "200": { description: desc, content: { "application/json": { schema: { type: "object" } } } },
    "500": { description: "서버 오류", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } } },
  });

  return {
    openapi: "3.1.0",
    info: {
      title: "Public Data MCP - 대한민국 법령 검색 API",
      description: "대한민국 공공데이터 MCP 서버 - 법제처 국가법령정보센터 API를 활용한 법령, 판례, 헌재결정례 등 종합 법률정보 검색 서비스",
      version: "4.0.0",
    },
    servers: [{ url: baseUrl }],
    paths: {
      "/api/search/laws": {
        get: {
          operationId: "searchLaws",
          summary: "법령 검색",
          description: "대한민국 현행 법령(법률, 대통령령, 부령 등)을 키워드로 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display, searchTypeParam("검색 범위")],
          responses: jsonResponse("법령 검색 결과"),
        },
      },
      "/api/search/cases": {
        get: {
          operationId: "searchCases",
          summary: "판례 검색",
          description: "대법원/하급법원 판례를 키워드로 검색합니다.",
          parameters: [
            searchParams.query, searchParams.page, searchParams.display,
            { name: "search_type", in: "query", schema: { type: "string", enum: ["case_name", "full_text"], default: "full_text" }, description: "검색 범위" },
            { name: "date_from", in: "query", schema: { type: "string", pattern: "^\\d{8}$" }, description: "시작일 (YYYYMMDD)" },
            { name: "date_to", in: "query", schema: { type: "string", pattern: "^\\d{8}$" }, description: "종료일 (YYYYMMDD)" },
            { name: "court", in: "query", schema: { type: "string", enum: ["supreme", "lower", "all"], default: "all" }, description: "법원 유형" },
          ],
          responses: jsonResponse("판례 검색 결과"),
        },
      },
      "/api/search/constitutional": {
        get: {
          operationId: "searchConstitutional",
          summary: "헌재결정례 검색",
          description: "헌법재판소 결정례를 키워드로 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("헌재결정례 검색 결과"),
        },
      },
      "/api/search/interpretations": {
        get: {
          operationId: "searchInterpretations",
          summary: "법령해석례 검색",
          description: "법제처 법령해석례를 키워드로 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("법령해석례 검색 결과"),
        },
      },
      "/api/search/admin-rules": {
        get: {
          operationId: "searchAdminRules",
          summary: "행정규칙 검색",
          description: "훈령, 예규, 고시 등 행정규칙을 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display, searchTypeParam("검색 범위")],
          responses: jsonResponse("행정규칙 검색 결과"),
        },
      },
      "/api/search/ordinances": {
        get: {
          operationId: "searchOrdinances",
          summary: "자치법규 검색",
          description: "지방자치단체 조례 및 규칙을 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display, searchTypeParam("검색 범위")],
          responses: jsonResponse("자치법규 검색 결과"),
        },
      },
      "/api/search/treaties": {
        get: {
          operationId: "searchTreaties",
          summary: "조약 검색",
          description: "대한민국 체결 조약을 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("조약 검색 결과"),
        },
      },
      "/api/search/legal-terms": {
        get: {
          operationId: "searchLegalTerms",
          summary: "법령용어 검색",
          description: "법령에서 사용되는 용어 정의를 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("법령용어 검색 결과"),
        },
      },
      "/api/search/english-laws": {
        get: {
          operationId: "searchEnglishLaws",
          summary: "영문법령 검색",
          description: "한국 법령의 영문 번역본을 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display, searchTypeParam("검색 범위")],
          responses: jsonResponse("영문법령 검색 결과"),
        },
      },
      "/api/search/committee-decisions": {
        get: {
          operationId: "searchCommitteeDecisions",
          summary: "위원회 결정문 검색",
          description: "행정위원회 결정문을 검색합니다.",
          parameters: [
            searchParams.query, searchParams.page, searchParams.display,
            { name: "committee", in: "query", required: true, schema: { type: "string", enum: ["ftc", "acr", "fsc", "nlrc", "kcc", "oclt", "nhrck", "eiac", "ecc", "sfc", "iaciac"] }, description: "위원회 코드" },
          ],
          responses: jsonResponse("위원회 결정문 검색 결과"),
        },
      },
      "/api/search/admin-appeals": {
        get: {
          operationId: "searchAdminAppeals",
          summary: "행정심판례 검색",
          description: "행정심판 재결례를 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("행정심판례 검색 결과"),
        },
      },
      "/api/search/old-new-law": {
        get: {
          operationId: "searchOldNewLaw",
          summary: "신구법비교 검색",
          description: "법령 개정 전후 조문 비교 목록을 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("신구법비교 검색 결과"),
        },
      },
      "/api/search/law-system": {
        get: {
          operationId: "searchLawSystem",
          summary: "법령체계도 검색",
          description: "법령의 상위법-하위법 관계 체계도를 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("법령체계도 검색 결과"),
        },
      },
      "/api/search/three-way-comp": {
        get: {
          operationId: "searchThreeWayComp",
          summary: "3단비교 검색",
          description: "법률·시행령·시행규칙 3단비교 목록을 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("3단비교 검색 결과"),
        },
      },
      "/api/search/attached-forms": {
        get: {
          operationId: "searchAttachedForms",
          summary: "별표서식 검색",
          description: "법령의 별표·서식·별지를 검색합니다.",
          parameters: [
            searchParams.query, searchParams.page, searchParams.display,
            { name: "form_type", in: "query", schema: { type: "string", enum: ["all", "table", "form", "annex", "other", "unclassified"], default: "all" }, description: "별표 종류" },
          ],
          responses: jsonResponse("별표서식 검색 결과"),
        },
      },
      "/api/search/law-abbreviations": {
        get: {
          operationId: "searchLawAbbreviations",
          summary: "법령약칭 검색",
          description: "법령의 약칭 목록을 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("법령약칭 검색 결과"),
        },
      },
      "/api/search/law-change-history": {
        get: {
          operationId: "searchLawChangeHistory",
          summary: "법령 변경이력 조회",
          description: "특정 일자에 변경된 법령 목록을 조회합니다.",
          parameters: [
            { name: "date", in: "query", required: true, schema: { type: "string", pattern: "^\\d{8}$" }, description: "변경 일자 (YYYYMMDD)" },
            searchParams.page, searchParams.display,
          ],
          responses: jsonResponse("법령 변경이력 결과"),
        },
      },
      "/api/search/ai-legal-terms": {
        get: {
          operationId: "searchAILegalTerms",
          summary: "지식베이스 법령용어 검색",
          description: "법령정보 지식베이스에서 법령용어를 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("지식베이스 법령용어 검색 결과"),
        },
      },
      "/api/search/linked-ordinances": {
        get: {
          operationId: "searchLinkedOrdinances",
          summary: "연계조례 검색",
          description: "법령에 연계된 지방자치단체 조례 목록을 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("연계조례 검색 결과"),
        },
      },
      "/api/search/admin-rule-old-new": {
        get: {
          operationId: "searchAdminRuleOldNew",
          summary: "행정규칙 신구법비교 검색",
          description: "행정규칙의 개정 전후 비교 목록을 검색합니다.",
          parameters: [searchParams.query, searchParams.page, searchParams.display],
          responses: jsonResponse("행정규칙 신구법비교 검색 결과"),
        },
      },

      // --- 상세조회 ---
      "/api/detail/law/{id}": {
        get: {
          operationId: "getLawDetail", summary: "법령 상세조회",
          description: "법령 일련번호로 조문 내용을 조회합니다.",
          parameters: [idParam("법령 일련번호")],
          responses: jsonResponse("법령 상세 정보"),
        },
      },
      "/api/detail/case/{id}": {
        get: {
          operationId: "getCaseDetail", summary: "판례 상세조회",
          description: "판례 일련번호로 판시사항, 판결요지, 전문을 조회합니다.",
          parameters: [idParam("판례 일련번호")],
          responses: jsonResponse("판례 상세 정보"),
        },
      },
      "/api/detail/constitutional/{id}": {
        get: {
          operationId: "getConstitutionalDetail", summary: "헌재결정례 상세조회",
          parameters: [idParam("헌재결정례 일련번호")],
          responses: jsonResponse("헌재결정례 상세 정보"),
        },
      },
      "/api/detail/interpretation/{id}": {
        get: {
          operationId: "getInterpretationDetail", summary: "법령해석례 상세조회",
          parameters: [idParam("법령해석례 일련번호")],
          responses: jsonResponse("법령해석례 상세 정보"),
        },
      },
      "/api/detail/admin-rule/{id}": {
        get: {
          operationId: "getAdminRuleDetail", summary: "행정규칙 상세조회",
          parameters: [idParam("행정규칙 일련번호")],
          responses: jsonResponse("행정규칙 상세 정보"),
        },
      },
      "/api/detail/ordinance/{id}": {
        get: {
          operationId: "getOrdinanceDetail", summary: "자치법규 상세조회",
          parameters: [idParam("자치법규 일련번호")],
          responses: jsonResponse("자치법규 상세 정보"),
        },
      },
      "/api/detail/treaty/{id}": {
        get: {
          operationId: "getTreatyDetail", summary: "조약 상세조회",
          parameters: [idParam("조약 일련번호")],
          responses: jsonResponse("조약 상세 정보"),
        },
      },
      "/api/detail/legal-term/{id}": {
        get: {
          operationId: "getLegalTermDetail", summary: "법령용어 상세조회",
          parameters: [idParam("법령용어 일련번호")],
          responses: jsonResponse("법령용어 상세 정보"),
        },
      },
      "/api/detail/english-law/{id}": {
        get: {
          operationId: "getEnglishLawDetail", summary: "영문법령 상세조회",
          parameters: [idParam("영문법령 일련번호")],
          responses: jsonResponse("영문법령 상세 정보"),
        },
      },
      "/api/detail/committee-decision/{committee}/{id}": {
        get: {
          operationId: "getCommitteeDecisionDetail", summary: "위원회 결정문 상세조회",
          parameters: [
            { name: "committee", in: "path", required: true, schema: { type: "string" }, description: "위원회 코드" },
            idParam("결정문 일련번호"),
          ],
          responses: jsonResponse("위원회 결정문 상세 정보"),
        },
      },
      "/api/detail/admin-appeal/{id}": {
        get: {
          operationId: "getAdminAppealDetail", summary: "행정심판례 상세조회",
          parameters: [idParam("행정심판례 일련번호")],
          responses: jsonResponse("행정심판례 상세 정보"),
        },
      },
      "/api/detail/old-new-law/{id}": {
        get: {
          operationId: "getOldNewLawDetail", summary: "신구법비교 상세조회",
          parameters: [idParam("신구법비교 일련번호")],
          responses: jsonResponse("신구법비교 상세 정보"),
        },
      },
      "/api/detail/law-system/{id}": {
        get: {
          operationId: "getLawSystemDetail", summary: "법령체계도 상세조회",
          parameters: [idParam("법령체계도 일련번호")],
          responses: jsonResponse("법령체계도 상세 정보"),
        },
      },
      "/api/detail/three-way-comp/{id}": {
        get: {
          operationId: "getThreeWayCompDetail", summary: "3단비교 상세조회",
          parameters: [
            idParam("3단비교 일련번호"),
            { name: "comparison_type", in: "query", schema: { type: "string", enum: ["citation", "delegation"], default: "citation" }, description: "비교 유형" },
          ],
          responses: jsonResponse("3단비교 상세 정보"),
        },
      },
      "/api/detail/law-article-sub/{id}": {
        get: {
          operationId: "getLawArticleSub", summary: "조항호목 정밀조회",
          description: "법령의 특정 조·항·호·목을 정밀하게 조회합니다.",
          parameters: [
            idParam("법령 일련번호"),
            { name: "article", in: "query", required: true, schema: { type: "string" }, description: "조번호 (6자리, 예: 000100)" },
            { name: "paragraph", in: "query", schema: { type: "string" }, description: "항번호 (6자리)" },
            { name: "clause", in: "query", schema: { type: "string" }, description: "호번호 (6자리)" },
            { name: "subclause", in: "query", schema: { type: "string" }, description: "목번호 (한글 한 글자)" },
          ],
          responses: jsonResponse("조항호목 상세 정보"),
        },
      },
      "/api/detail/admin-rule-old-new/{id}": {
        get: {
          operationId: "getAdminRuleOldNewDetail", summary: "행정규칙 신구법비교 상세조회",
          parameters: [idParam("신구법비교 일련번호")],
          responses: jsonResponse("행정규칙 신구법비교 상세 정보"),
        },
      },
    },
  };
}
