/**
 * DART 전자공시 OpenAPI 경로 정의
 */

import { jsonResponse } from "./shared.js";
import type { OpenApiPaths } from "./shared.js";

export function getDartPaths(): OpenApiPaths {
  return {
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
  };
}
