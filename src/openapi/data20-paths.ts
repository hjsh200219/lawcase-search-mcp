/**
 * 공공데이터포털 OpenAPI 경로 정의
 */

import { paginationParams, jsonResponse } from "./shared.js";
import type { OpenApiPaths } from "./shared.js";

export function getData20Paths(): OpenApiPaths {
  return {
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
    "/api/data20/bio-equivalence": {
      get: {
        operationId: "data20SearchBioEquivalence",
        summary: "생동성인정품목 검색",
        description: "생물학적 동등성이 인정된 의약품(제네릭)의 품목기준코드·성분명·제형 등을 검색합니다.",
        parameters: [
          { name: "item_name", in: "query", schema: { type: "string" }, description: "제품명" },
          ...paginationParams,
        ],
        responses: jsonResponse("생동성인정품목 검색 결과"),
      },
    },
    "/api/data20/medicine-patent": {
      get: {
        operationId: "data20SearchMedicinePatent",
        summary: "의약품 특허정보 검색",
        description: "의약품 국내 특허번호·특허일자·만료일·성분명 등을 검색합니다.",
        parameters: [
          { name: "item_name", in: "query", schema: { type: "string" }, description: "제품명 (한글)" },
          { name: "item_eng_name", in: "query", schema: { type: "string" }, description: "제품명 (영문)" },
          { name: "ingr_name", in: "query", schema: { type: "string" }, description: "성분명 (한글)" },
          { name: "ingr_eng_name", in: "query", schema: { type: "string" }, description: "성분명 (영문)" },
          ...paginationParams,
        ],
        responses: jsonResponse("의약품 특허정보 검색 결과"),
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
  };
}
