/**
 * OpenAPI 3.1 스펙 생성 - GPT Actions용
 */

export function generateOpenApiSpec(baseUrl: string, hasDart = false, hasData20 = false) {
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

  const dartPaths = hasDart ? {
    "/api/dart/corp-code": {
      get: {
        operationId: "dartResolveCorpCode",
        summary: "DART 기업 고유번호 검색",
        description: "회사명으로 DART 기업 고유번호를 조회합니다.",
        parameters: [
          { name: "corp_name", in: "query", required: true, schema: { type: "string" }, description: "검색할 회사명" },
        ],
        responses: jsonResponse("기업 고유번호 검색 결과"),
      },
    },
    "/api/dart/disclosures": {
      get: {
        operationId: "dartSearchDisclosures",
        summary: "DART 공시보고서 검색",
        description: "기업 공시보고서 목록을 조회합니다.",
        parameters: [
          { name: "corp_code", in: "query", schema: { type: "string" }, description: "DART 고유번호 (8자리)" },
          { name: "bgn_de", in: "query", schema: { type: "string", pattern: "^\\d{8}$" }, description: "시작일 (YYYYMMDD)" },
          { name: "end_de", in: "query", schema: { type: "string", pattern: "^\\d{8}$" }, description: "종료일 (YYYYMMDD)" },
          { name: "pblntf_ty", in: "query", schema: { type: "string", enum: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] }, description: "공시유형" },
          { name: "page_no", in: "query", schema: { type: "integer", default: 1 }, description: "페이지 번호" },
          { name: "page_count", in: "query", schema: { type: "integer", default: 20 }, description: "페이지당 건수" },
        ],
        responses: jsonResponse("공시보고서 검색 결과"),
      },
    },
    "/api/dart/company": {
      get: {
        operationId: "dartGetCompanyInfo",
        summary: "DART 기업개황 조회",
        description: "기업 기본정보(대표자, 주소, 업종 등)를 조회합니다.",
        parameters: [
          { name: "corp_code", in: "query", required: true, schema: { type: "string" }, description: "DART 고유번호 (8자리)" },
        ],
        responses: jsonResponse("기업개황 정보"),
      },
    },
    "/api/dart/financials": {
      get: {
        operationId: "dartGetFinancials",
        summary: "DART 전체 재무제표 조회",
        description: "기업의 전체 재무제표(재무상태표, 손익계산서 등)를 조회합니다.",
        parameters: [
          { name: "corp_code", in: "query", required: true, schema: { type: "string" }, description: "DART 고유번호" },
          { name: "bsns_year", in: "query", required: true, schema: { type: "string" }, description: "사업연도 (YYYY)" },
          { name: "reprt_code", in: "query", required: true, schema: { type: "string", enum: ["11013", "11012", "11014", "11011"] }, description: "보고서코드 (11013:1분기, 11012:반기, 11014:3분기, 11011:사업보고서)" },
          { name: "fs_div", in: "query", schema: { type: "string", enum: ["OFS", "CFS"], default: "CFS" }, description: "재무제표구분" },
        ],
        responses: jsonResponse("전체 재무제표"),
      },
    },
    "/api/dart/key-accounts": {
      get: {
        operationId: "dartGetKeyAccounts",
        summary: "DART 주요계정 조회",
        description: "매출액, 영업이익, 당기순이익 등 핵심 재무지표를 조회합니다.",
        parameters: [
          { name: "corp_code", in: "query", required: true, schema: { type: "string" }, description: "DART 고유번호" },
          { name: "bsns_year", in: "query", required: true, schema: { type: "string" }, description: "사업연도 (YYYY)" },
          { name: "reprt_code", in: "query", required: true, schema: { type: "string", enum: ["11013", "11012", "11014", "11011"] }, description: "보고서코드" },
        ],
        responses: jsonResponse("주요계정 정보"),
      },
    },
    "/api/dart/document": {
      get: {
        operationId: "dartGetDocument",
        summary: "DART 공시서류 본문 조회",
        description: "접수번호로 공시서류의 원문(본문 텍스트)을 조회합니다.",
        parameters: [
          { name: "rcept_no", in: "query", required: true, schema: { type: "string" }, description: "접수번호 (14자리)" },
        ],
        responses: jsonResponse("공시서류 본문"),
      },
    },
  } : {};

  const paginationParams = [
    { name: "pageNo", in: "query", schema: { type: "integer", default: 1 }, description: "페이지 번호" },
    { name: "numOfRows", in: "query", schema: { type: "integer", default: 10 }, description: "페이지당 건수" },
  ];

  const data20Paths = hasData20 ? {
    "/api/data20/pharmacy": {
      get: {
        operationId: "data20SearchPharmacy",
        summary: "약국 검색",
        description: "전국 약국 정보를 지역명·약국명으로 검색합니다.",
        parameters: [
          { name: "Q0", in: "query", schema: { type: "string" }, description: "시도명" },
          { name: "Q1", in: "query", schema: { type: "string" }, description: "시군구명" },
          { name: "QN", in: "query", schema: { type: "string" }, description: "약국명" },
          ...paginationParams,
        ],
        responses: jsonResponse("약국 검색 결과"),
      },
    },
    "/api/data20/hospital": {
      get: {
        operationId: "data20SearchHospital",
        summary: "병원 검색",
        description: "전국 병원·의원 정보를 기관명·지역·종별·진료과목으로 검색합니다.",
        parameters: [
          { name: "yadmNm", in: "query", schema: { type: "string" }, description: "기관명" },
          { name: "sidoCd", in: "query", schema: { type: "string" }, description: "시도코드" },
          { name: "sgguCd", in: "query", schema: { type: "string" }, description: "시군구코드" },
          { name: "clCd", in: "query", schema: { type: "string" }, description: "종별코드" },
          { name: "dgsbjtCd", in: "query", schema: { type: "string" }, description: "진료과목코드" },
          ...paginationParams,
        ],
        responses: jsonResponse("병원 검색 결과"),
      },
    },
    "/api/data20/stock-dividend": {
      get: {
        operationId: "data20SearchStockDividend",
        summary: "주식배당정보 조회",
        description: "상장기업의 주식 배당금·배당률 정보를 조회합니다.",
        parameters: [
          { name: "stckIssuCmpyNm", in: "query", schema: { type: "string" }, description: "회사명" },
          { name: "basDt", in: "query", schema: { type: "string", pattern: "^\\d{8}$" }, description: "기준일자 (YYYYMMDD)" },
          { name: "crno", in: "query", schema: { type: "string" }, description: "법인등록번호" },
          ...paginationParams,
        ],
        responses: jsonResponse("주식배당정보"),
      },
    },
    "/api/data20/rare-medicine": {
      get: {
        operationId: "data20SearchRareMedicine",
        summary: "희귀의약품 검색",
        description: "희귀의약품의 품목명·업체명·효능효과 등을 검색합니다.",
        parameters: [
          { name: "item_name", in: "query", schema: { type: "string" }, description: "품목명" },
          { name: "entp_name", in: "query", schema: { type: "string" }, description: "업체명" },
          ...paginationParams,
        ],
        responses: jsonResponse("희귀의약품 검색 결과"),
      },
    },
    "/api/data20/health-food": {
      get: {
        operationId: "data20SearchHealthFood",
        summary: "건강기능식품 검색",
        description: "건강기능식품의 제품명·업체명·원재료 등을 검색합니다.",
        parameters: [
          { name: "prdlst_nm", in: "query", schema: { type: "string" }, description: "제품명" },
          ...paginationParams,
        ],
        responses: jsonResponse("건강기능식품 검색 결과"),
      },
    },
    "/api/data20/business-verify": {
      post: {
        operationId: "data20VerifyBusiness",
        summary: "사업자등록 진위확인",
        description: "사업자등록번호·대표자명·개업일자로 진위를 확인합니다.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  businesses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        b_no: { type: "string", description: "사업자등록번호 (10자리)" },
                        start_dt: { type: "string", description: "개업일자 (YYYYMMDD)" },
                        p_nm: { type: "string", description: "대표자명" },
                        b_nm: { type: "string", description: "상호명" },
                      },
                      required: ["b_no", "start_dt", "p_nm"],
                    },
                  },
                },
              },
            },
          },
        },
        responses: jsonResponse("사업자등록 진위확인 결과"),
      },
    },
    "/api/data20/business-status": {
      post: {
        operationId: "data20CheckBusinessStatus",
        summary: "사업자등록 상태조회",
        description: "사업자등록번호로 사업 상태(계속/휴업/폐업)를 조회합니다.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  b_no: { type: "array", items: { type: "string" }, description: "사업자등록번호 배열" },
                },
              },
            },
          },
        },
        responses: jsonResponse("사업자등록 상태조회 결과"),
      },
    },
  } : {};

  return {
    openapi: "3.1.0",
    info: {
      title: "Korean Public Data MCP - 대한민국 공공데이터 API",
      description: "대한민국 공공데이터 MCP 서버 - 법제처 국가법령정보센터 및 DART 전자공시시스템 API를 활용한 종합 공공데이터 검색 서비스",
      version: "5.0.0",
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
      ...dartPaths,
      ...data20Paths,
    },
  };
}
