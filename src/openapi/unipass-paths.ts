/**
 * 관세청 UNI-PASS OpenAPI 경로 정의
 */

import { jsonResponse } from "./shared.js";
import type { OpenApiPaths } from "./shared.js";

export function getUnipassPaths(): OpenApiPaths {
  return {
    "/api/unipass/cargo": {
      get: {
        operationId: "unipassTrackCargo",
        summary: "UNI-PASS 화물통관진행 조회",
        description: "B/L 번호로 화물 통관 진행 상태를 조회합니다.",
        parameters: [
          { name: "bl_number", in: "query", required: true, schema: { type: "string" }, description: "B/L(선하증권) 번호" },
        ],
        responses: jsonResponse("화물통관진행 정보"),
      },
    },
    "/api/unipass/containers": {
      get: {
        operationId: "unipassGetContainers",
        summary: "UNI-PASS 컨테이너 조회",
        description: "B/L 번호로 컨테이너 내역을 조회합니다.",
        parameters: [
          { name: "bl_number", in: "query", required: true, schema: { type: "string" }, description: "B/L 번호" },
        ],
        responses: jsonResponse("컨테이너 정보"),
      },
    },
    "/api/unipass/declaration": {
      get: {
        operationId: "unipassVerifyDeclaration",
        summary: "UNI-PASS 수입신고 검증",
        description: "수입신고번호로 수입신고 내역을 검증합니다.",
        parameters: [
          { name: "declaration_no", in: "query", required: true, schema: { type: "string" }, description: "수입신고번호" },
        ],
        responses: jsonResponse("수입신고 정보"),
      },
    },
    "/api/unipass/hs-code": {
      get: {
        operationId: "unipassSearchHsCode",
        summary: "UNI-PASS HS코드 검색",
        description: "HS 부호로 품목 분류를 검색합니다.",
        parameters: [
          { name: "hs_code", in: "query", required: true, schema: { type: "string" }, description: "HS 부호 (예: 0201)" },
        ],
        responses: jsonResponse("HS코드 검색 결과"),
      },
    },
    "/api/unipass/tariff-rate": {
      get: {
        operationId: "unipassGetTariffRate",
        summary: "UNI-PASS 관세율 조회",
        description: "HS 부호(10자리)로 기본 관세율을 조회합니다.",
        parameters: [
          { name: "hs_code", in: "query", required: true, schema: { type: "string" }, description: "HS 부호 (10자리)" },
        ],
        responses: jsonResponse("관세율 정보"),
      },
    },
    "/api/unipass/customs-rate": {
      get: {
        operationId: "unipassGetCustomsRate",
        summary: "UNI-PASS 관세환율 조회",
        description: "현재 적용 중인 관세 환율을 조회합니다.",
        parameters: [
          { name: "currencies", in: "query", schema: { type: "string" }, description: "통화코드 (쉼표 구분, 예: USD,EUR,JPY)" },
        ],
        responses: jsonResponse("관세환율 정보"),
      },
    },
    "/api/unipass/company": {
      get: {
        operationId: "unipassSearchCompany",
        summary: "UNI-PASS 통관업체 조회",
        description: "업체명으로 통관고유부호 업체를 검색합니다.",
        parameters: [
          { name: "query", in: "query", required: true, schema: { type: "string" }, description: "검색할 업체명" },
        ],
        responses: jsonResponse("통관업체 정보"),
      },
    },
    "/api/unipass/broker": {
      get: {
        operationId: "unipassSearchBroker",
        summary: "UNI-PASS 관세사 조회",
        description: "관세사명으로 관세사 정보를 검색합니다.",
        parameters: [
          { name: "query", in: "query", required: true, schema: { type: "string" }, description: "검색할 관세사명" },
        ],
        responses: jsonResponse("관세사 정보"),
      },
    },
    "/api/unipass/inspection": {
      get: {
        operationId: "unipassGetInspection",
        summary: "UNI-PASS 검사검역내역 조회",
        description: "B/L 번호로 검사·검역 결과를 조회합니다.",
        parameters: [
          { name: "bl_number", in: "query", required: true, schema: { type: "string" }, description: "B/L 번호" },
        ],
        responses: jsonResponse("검사검역 정보"),
      },
    },
    "/api/unipass/arrival-report": {
      get: {
        operationId: "unipassGetArrivalReport",
        summary: "UNI-PASS 입항보고내역 조회",
        description: "B/L 번호로 해상 입항 보고 내역(선명, 입항세관, 입항일자)을 조회합니다.",
        parameters: [
          { name: "bl_number", in: "query", required: true, schema: { type: "string" }, description: "B/L 번호" },
        ],
        responses: jsonResponse("입항보고 정보"),
      },
    },
    "/api/unipass/animal-plant-company": {
      get: {
        operationId: "unipassSearchAnimalPlantCompany",
        summary: "UNI-PASS 농림축산검역 업체 조회",
        description: "업체명으로 농림축산검역본부 등록 업체를 검색합니다.",
        parameters: [
          { name: "company_name", in: "query", required: true, schema: { type: "string" }, description: "검색할 업체명" },
        ],
        responses: jsonResponse("농림축산검역 업체 정보"),
      },
    },
    "/api/unipass/bonded-area": {
      get: {
        operationId: "unipassGetBondedArea",
        summary: "UNI-PASS 보세구역 장치기간 조회",
        description: "화물관리번호로 보세구역 장치 시작일·만료일을 조회합니다.",
        parameters: [
          { name: "cargo_no", in: "query", required: true, schema: { type: "string" }, description: "화물관리번호" },
        ],
        responses: jsonResponse("보세구역 장치기간 정보"),
      },
    },
    "/api/unipass/tax-payment": {
      get: {
        operationId: "unipassGetTaxPayment",
        summary: "UNI-PASS 수입 제세 납부여부 조회",
        description: "수입신고번호로 관세·부가세 납부 여부를 조회합니다.",
        parameters: [
          { name: "declaration_no", in: "query", required: true, schema: { type: "string" }, description: "수입신고번호" },
        ],
        responses: jsonResponse("제세 납부 정보"),
      },
    },
    "/api/unipass/export-performance": {
      get: {
        operationId: "unipassExportPerformance",
        summary: "UNI-PASS 수출이행 내역 조회",
        description: "수출신고번호로 수출이행 내역을 조회합니다.",
        parameters: [
          { name: "export_declaration_no", in: "query", required: true, schema: { type: "string" }, description: "수출신고번호" },
        ],
        responses: jsonResponse("수출이행 내역 정보"),
      },
    },
    "/api/unipass/import-requirement": {
      get: {
        operationId: "unipassImportRequirement",
        summary: "UNI-PASS 수출입요건 승인 내역 조회",
        description: "요건승인번호와 수출입구분으로 수출입요건 승인 내역을 조회합니다.",
        parameters: [
          { name: "req_apre_no", in: "query", required: true, schema: { type: "string" }, description: "요건승인번호" },
          { name: "imex_tpcd", in: "query", required: true, schema: { type: "string" }, description: "수출입구분 (1=수입, 2=수출)" },
        ],
        responses: jsonResponse("수출입요건 승인 내역 정보"),
      },
    },
    "/api/unipass/shed-info": {
      get: {
        operationId: "unipassShedInfo",
        summary: "UNI-PASS 장치장 정보 조회",
        description: "관할세관코드 또는 장치장부호로 장치장 정보를 조회합니다.",
        parameters: [
          { name: "customs_code", in: "query", schema: { type: "string" }, description: "관할세관코드" },
          { name: "shed_code", in: "query", schema: { type: "string" }, description: "장치장부호" },
        ],
        responses: jsonResponse("장치장 정보"),
      },
    },
    "/api/unipass/forwarder-list": {
      get: {
        operationId: "unipassForwarderList",
        summary: "UNI-PASS 화물운송주선업자 목록 조회",
        description: "업체명으로 화물운송주선업자 목록을 조회합니다.",
        parameters: [
          { name: "name", in: "query", required: true, schema: { type: "string" }, description: "업체명" },
        ],
        responses: jsonResponse("화물운송주선업자 목록 정보"),
      },
    },
    "/api/unipass/forwarder-detail": {
      get: {
        operationId: "unipassForwarderDetail",
        summary: "UNI-PASS 화물운송주선업자 내역 조회",
        description: "주선업자부호로 화물운송주선업자 내역을 조회합니다.",
        parameters: [
          { name: "forwarder_code", in: "query", required: true, schema: { type: "string" }, description: "주선업자부호" },
        ],
        responses: jsonResponse("화물운송주선업자 내역 정보"),
      },
    },
    "/api/unipass/airline-list": {
      get: {
        operationId: "unipassAirlineList",
        summary: "UNI-PASS 항공사 목록 조회",
        description: "항공사명으로 항공사 목록을 조회합니다.",
        parameters: [
          { name: "name", in: "query", required: true, schema: { type: "string" }, description: "항공사명" },
        ],
        responses: jsonResponse("항공사 목록 정보"),
      },
    },
    "/api/unipass/airline-detail": {
      get: {
        operationId: "unipassAirlineDetail",
        summary: "UNI-PASS 항공사 내역 조회",
        description: "항공사부호로 항공사 내역을 조회합니다.",
        parameters: [
          { name: "airline_code", in: "query", required: true, schema: { type: "string" }, description: "항공사부호" },
        ],
        responses: jsonResponse("항공사 내역 정보"),
      },
    },
    "/api/unipass/overseas-supplier": {
      get: {
        operationId: "unipassOverseasSupplier",
        summary: "UNI-PASS 해외공급자부호 조회",
        description: "국가부호와 업체명으로 해외공급자부호를 조회합니다.",
        parameters: [
          { name: "country_code", in: "query", required: true, schema: { type: "string" }, description: "국가부호 (2자리, 예: US)" },
          { name: "company_name", in: "query", required: true, schema: { type: "string" }, description: "업체명" },
        ],
        responses: jsonResponse("해외공급자부호 정보"),
      },
    },
    "/api/unipass/broker-detail": {
      get: {
        operationId: "unipassBrokerDetail",
        summary: "UNI-PASS 관세사 내역 조회",
        description: "관세법인부호로 관세사 내역을 조회합니다.",
        parameters: [
          { name: "lca_code", in: "query", required: true, schema: { type: "string" }, description: "관세법인부호" },
        ],
        responses: jsonResponse("관세사 내역 정보"),
      },
    },
    "/api/unipass/simple-drawback": {
      get: {
        operationId: "unipassSimpleDrawback",
        summary: "UNI-PASS 간이정액 환급율표 조회",
        description: "기준일과 HS부호로 간이정액 환급율표를 조회합니다.",
        parameters: [
          { name: "base_date", in: "query", required: true, schema: { type: "string" }, description: "기준일 (YYYYMMDD)" },
          { name: "hs_code", in: "query", schema: { type: "string" }, description: "HS부호" },
        ],
        responses: jsonResponse("간이정액 환급율표 정보"),
      },
    },
    "/api/unipass/simple-drawback-company": {
      get: {
        operationId: "unipassSimpleDrawbackCompany",
        summary: "UNI-PASS 간이정액 적용/비적용 업체 조회",
        description: "사업자등록번호로 간이정액 적용/비적용 업체를 조회합니다.",
        parameters: [
          { name: "business_no", in: "query", required: true, schema: { type: "string" }, description: "사업자등록번호" },
        ],
        responses: jsonResponse("간이정액 적용/비적용 업체 정보"),
      },
    },
    "/api/unipass/export-period-short": {
      get: {
        operationId: "unipassExportPeriodShort",
        summary: "UNI-PASS 수출이행기간 단축대상 품목 조회",
        description: "HS부호로 수출이행기간 단축대상 품목을 조회합니다.",
        parameters: [
          { name: "hs_code", in: "query", required: true, schema: { type: "string" }, description: "HS부호" },
        ],
        responses: jsonResponse("수출이행기간 단축대상 품목 정보"),
      },
    },
    "/api/unipass/statistics-code": {
      get: {
        operationId: "unipassStatisticsCode",
        summary: "UNI-PASS 통계부호 조회",
        description: "부호유형과 부호값명으로 통계부호를 조회합니다.",
        parameters: [
          { name: "code_type", in: "query", required: true, schema: { type: "string" }, description: "부호유형" },
          { name: "value_name", in: "query", schema: { type: "string" }, description: "부호값명" },
        ],
        responses: jsonResponse("통계부호 정보"),
      },
    },
    "/api/unipass/bonded-vehicle": {
      get: {
        operationId: "unipassBondedVehicle",
        summary: "UNI-PASS 보세운송차량 등록내역 조회",
        description: "보세운송업자부호 또는 차량번호로 보세운송차량 등록내역을 조회합니다.",
        parameters: [
          { name: "btco_code", in: "query", schema: { type: "string" }, description: "보세운송업자부호" },
          { name: "vehicle_no", in: "query", schema: { type: "string" }, description: "차량번호" },
        ],
        responses: jsonResponse("보세운송차량 등록내역 정보"),
      },
    },
    "/api/unipass/port-entry-exit": {
      get: {
        operationId: "unipassPortEntryExit",
        summary: "UNI-PASS 입출항보고내역 조회",
        description: "IMO번호와 입출항구분코드로 입출항보고내역을 조회합니다.",
        parameters: [
          { name: "imo_no", in: "query", required: true, schema: { type: "string" }, description: "IMO번호" },
          { name: "io_type", in: "query", required: true, schema: { type: "string" }, description: "입출항구분코드" },
          { name: "customs_code", in: "query", schema: { type: "string" }, description: "세관코드" },
        ],
        responses: jsonResponse("입출항보고내역 정보"),
      },
    },
    "/api/unipass/single-window": {
      get: {
        operationId: "unipassSingleWindow",
        summary: "UNI-PASS 통관단일창구 처리이력 조회",
        description: "요청번호로 통관단일창구 처리이력을 조회합니다.",
        parameters: [
          { name: "request_no", in: "query", required: true, schema: { type: "string" }, description: "요청번호" },
        ],
        responses: jsonResponse("통관단일창구 처리이력 정보"),
      },
    },
    "/api/unipass/ship-company-list": {
      get: {
        operationId: "unipassShipCompanyList",
        summary: "UNI-PASS 선박회사 목록 조회",
        description: "선박회사명으로 선박회사 목록을 조회합니다.",
        parameters: [
          { name: "name", in: "query", required: true, schema: { type: "string" }, description: "선박회사명" },
        ],
        responses: jsonResponse("선박회사 목록 정보"),
      },
    },
    "/api/unipass/ship-company-detail": {
      get: {
        operationId: "unipassShipCompanyDetail",
        summary: "UNI-PASS 선박회사 내역 조회",
        description: "선박회사부호로 선박회사 내역을 조회합니다.",
        parameters: [
          { name: "ship_company_code", in: "query", required: true, schema: { type: "string" }, description: "선박회사부호" },
        ],
        responses: jsonResponse("선박회사 내역 정보"),
      },
    },
    "/api/unipass/customs-check": {
      get: {
        operationId: "unipassCustomsCheck",
        summary: "UNI-PASS 세관장확인대상 물품 조회",
        description: "HS부호와 수출입구분으로 세관장확인대상 물품을 조회합니다.",
        parameters: [
          { name: "hs_code", in: "query", required: true, schema: { type: "string" }, description: "HS부호" },
          { name: "imex_type", in: "query", required: true, schema: { type: "string" }, description: "수출입구분 (1=수입, 2=수출)" },
        ],
        responses: jsonResponse("세관장확인대상 물품 정보"),
      },
    },
    "/api/unipass/postal-customs": {
      get: {
        operationId: "unipassPostalCustoms",
        summary: "UNI-PASS 우편번호별 관할세관 조회",
        description: "우편번호로 관할세관을 조회합니다.",
        parameters: [
          { name: "postal_code", in: "query", required: true, schema: { type: "string" }, description: "우편번호" },
        ],
        responses: jsonResponse("우편번호별 관할세관 정보"),
      },
    },
    "/api/unipass/attachment-status": {
      get: {
        operationId: "unipassAttachmentStatus",
        summary: "UNI-PASS 전자첨부서류 제출 완료 유무 조회",
        description: "신고업무구분코드와 서류제출번호로 전자첨부서류 제출 완료 유무를 조회합니다.",
        parameters: [
          { name: "doc_type_code", in: "query", required: true, schema: { type: "string" }, description: "신고업무구분코드" },
          { name: "submit_no", in: "query", required: true, schema: { type: "string" }, description: "서류제출번호" },
        ],
        responses: jsonResponse("전자첨부서류 제출 완료 유무 정보"),
      },
    },
    "/api/unipass/reimport-balance": {
      get: {
        operationId: "unipassReimportBalance",
        summary: "UNI-PASS 재수입조건부 수출 잔량 조회",
        description: "수출신고번호와 란번호로 재수입조건부 수출 잔량을 조회합니다.",
        parameters: [
          { name: "export_decl_no", in: "query", required: true, schema: { type: "string" }, description: "수출신고번호" },
          { name: "line_no", in: "query", required: true, schema: { type: "string" }, description: "란번호" },
        ],
        responses: jsonResponse("재수입조건부 수출 잔량 정보"),
      },
    },
    "/api/unipass/verify-export": {
      get: {
        operationId: "unipassVerifyExport",
        summary: "UNI-PASS 수출신고필증 검증",
        description: "필증발급번호, 수출신고번호, 사업자등록번호 등으로 수출신고필증을 검증합니다.",
        parameters: [
          { name: "pubs_no", in: "query", required: true, schema: { type: "string" }, description: "필증발급번호" },
          { name: "decl_no", in: "query", required: true, schema: { type: "string" }, description: "수출신고번호" },
          { name: "brno", in: "query", required: true, schema: { type: "string" }, description: "사업자등록번호" },
          { name: "country", in: "query", required: true, schema: { type: "string" }, description: "상대국코드" },
          { name: "product", in: "query", required: true, schema: { type: "string" }, description: "품명" },
          { name: "weight", in: "query", required: true, schema: { type: "string" }, description: "순중량" },
        ],
        responses: jsonResponse("수출신고필증 검증 정보"),
      },
    },
    "/api/unipass/export-by-vehicle": {
      get: {
        operationId: "unipassExportByVehicle",
        summary: "UNI-PASS 수출이행내역(차대번호) 조회",
        description: "차대번호로 수출이행내역을 조회합니다.",
        parameters: [
          { name: "vehicle_no", in: "query", required: true, schema: { type: "string" }, description: "차대번호" },
        ],
        responses: jsonResponse("수출이행내역(차대번호) 정보"),
      },
    },
    "/api/unipass/postal-clearance": {
      get: {
        operationId: "unipassPostalClearance",
        summary: "UNI-PASS 우편물통관 진행정보 조회",
        description: "우편물종류코드와 우편물번호로 우편물통관 진행정보를 조회합니다.",
        parameters: [
          { name: "postal_type", in: "query", required: true, schema: { type: "string" }, description: "우편물종류코드" },
          { name: "postal_no", in: "query", required: true, schema: { type: "string" }, description: "우편물번호" },
        ],
        responses: jsonResponse("우편물통관 진행정보"),
      },
    },
    "/api/unipass/unloading-declarations": {
      get: {
        operationId: "unipassUnloadingDeclarations",
        summary: "UNI-PASS 하선신고 목록 조회",
        description: "입항일과 세관코드로 하선신고 목록을 조회합니다.",
        parameters: [
          { name: "entry_date", in: "query", required: true, schema: { type: "string" }, description: "입항일 (YYYYMMDD)" },
          { name: "customs_code", in: "query", required: true, schema: { type: "string" }, description: "세관코드" },
        ],
        responses: jsonResponse("하선신고 목록 정보"),
      },
    },
    "/api/unipass/sea-departure": {
      get: {
        operationId: "unipassSeaDeparture",
        summary: "UNI-PASS 출항허가(해상) 조회",
        description: "입출항제출번호 또는 출항허가번호로 출항허가(해상) 정보를 조회합니다.",
        parameters: [
          { name: "submit_no", in: "query", schema: { type: "string" }, description: "입출항제출번호" },
          { name: "permit_no", in: "query", schema: { type: "string" }, description: "출항허가번호" },
        ],
        responses: jsonResponse("출항허가(해상) 정보"),
      },
    },
    "/api/unipass/air-departure": {
      get: {
        operationId: "unipassAirDeparture",
        summary: "UNI-PASS 출항허가(항공) 조회",
        description: "입출항제출번호 또는 항공편명으로 출항허가(항공) 정보를 조회합니다.",
        parameters: [
          { name: "submit_no", in: "query", schema: { type: "string" }, description: "입출항제출번호" },
          { name: "flight", in: "query", schema: { type: "string" }, description: "항공편명" },
        ],
        responses: jsonResponse("출항허가(항공) 정보"),
      },
    },
    "/api/unipass/reexport-balance": {
      get: {
        operationId: "unipassReexportBalance",
        summary: "UNI-PASS 재수출면세 이행잔량 조회",
        description: "수입신고번호로 재수출면세 이행잔량을 조회합니다.",
        parameters: [
          { name: "import_decl_no", in: "query", required: true, schema: { type: "string" }, description: "수입신고번호" },
        ],
        responses: jsonResponse("재수출면세 이행잔량 정보"),
      },
    },
    "/api/unipass/hs-navigation": {
      get: {
        operationId: "unipassHsNavigation",
        summary: "UNI-PASS HS CODE 내비게이션 조회",
        description: "HS부호로 HS CODE 내비게이션 정보를 조회합니다.",
        parameters: [
          { name: "hs_code", in: "query", required: true, schema: { type: "string" }, description: "HS부호" },
        ],
        responses: jsonResponse("HS CODE 내비게이션 정보"),
      },
    },
    "/api/unipass/air-arrival-report": {
      get: {
        operationId: "unipassAirArrivalReport",
        summary: "UNI-PASS 입항보고내역(항공) 조회",
        description: "항공편명 또는 제출번호로 입항보고내역(항공)을 조회합니다.",
        parameters: [
          { name: "flight_name", in: "query", schema: { type: "string" }, description: "항공편명" },
          { name: "submit_no", in: "query", schema: { type: "string" }, description: "제출번호" },
        ],
        responses: jsonResponse("입항보고내역(항공) 정보"),
      },
    },
    "/api/unipass/reexport-deadline": {
      get: {
        operationId: "unipassReexportDeadline",
        summary: "UNI-PASS 재수출조건부 수입의 수출이행 기한 조회",
        description: "수입신고번호와 란번호로 재수출조건부 수입의 수출이행 기한을 조회합니다.",
        parameters: [
          { name: "import_decl_no", in: "query", required: true, schema: { type: "string" }, description: "수입신고번호" },
          { name: "line_no", in: "query", required: true, schema: { type: "string" }, description: "란번호" },
        ],
        responses: jsonResponse("재수출조건부 수입의 수출이행 기한 정보"),
      },
    },
    "/api/unipass/reexport-completion": {
      get: {
        operationId: "unipassReexportCompletion",
        summary: "UNI-PASS 재수출 이행 완료보고 처리정보 조회",
        description: "수입신고번호와 란번호로 재수출 이행 완료보고 처리정보를 조회합니다.",
        parameters: [
          { name: "import_decl_no", in: "query", required: true, schema: { type: "string" }, description: "수입신고번호" },
          { name: "line_no", in: "query", required: true, schema: { type: "string" }, description: "란번호" },
        ],
        responses: jsonResponse("재수출 이행 완료보고 처리정보"),
      },
    },
    "/api/unipass/bonded-release": {
      get: {
        operationId: "unipassBondedRelease",
        summary: "UNI-PASS 수입물품 보세구역 반출신고 조회",
        description: "사업자등록번호로 수입물품 보세구역 반출신고를 조회합니다.",
        parameters: [
          { name: "business_no", in: "query", required: true, schema: { type: "string" }, description: "사업자등록번호" },
        ],
        responses: jsonResponse("수입물품 보세구역 반출신고 정보"),
      },
    },
    "/api/unipass/collateral-release": {
      get: {
        operationId: "unipassCollateralRelease",
        summary: "UNI-PASS 담보해제 신청 처리현황 조회",
        description: "수입신고번호로 담보해제 신청 처리현황을 조회합니다.",
        parameters: [
          { name: "import_decl_no", in: "query", required: true, schema: { type: "string" }, description: "수입신고번호" },
        ],
        responses: jsonResponse("담보해제 신청 처리현황 정보"),
      },
    },
    "/api/unipass/ecommerce-export-load": {
      get: {
        operationId: "unipassEcommerceExportLoad",
        summary: "UNI-PASS 전자상거래수출 적재 이행 조회",
        description: "전자상거래 수출신고번호로 적재 이행 정보를 조회합니다.",
        parameters: [
          { name: "ecommerce_decl_no", in: "query", required: true, schema: { type: "string" }, description: "전자상거래 수출신고번호" },
        ],
        responses: jsonResponse("전자상거래수출 적재 이행 정보"),
      },
    },
    "/api/unipass/declaration-correction": {
      get: {
        operationId: "unipassDeclarationCorrection",
        summary: "UNI-PASS 수출입신고서 정정신청 처리상태 조회",
        description: "서류제출번호, 수출입구분, 정정차수로 수출입신고서 정정신청 처리상태를 조회합니다.",
        parameters: [
          { name: "submit_no", in: "query", required: true, schema: { type: "string" }, description: "서류제출번호" },
          { name: "imex_type", in: "query", required: true, schema: { type: "string" }, description: "수출입구분 (1=수입, 2=수출)" },
          { name: "request_count", in: "query", required: true, schema: { type: "string" }, description: "정정차수" },
        ],
        responses: jsonResponse("수출입신고서 정정신청 처리상태 정보"),
      },
    },
    "/api/unipass/loading-inspection": {
      get: {
        operationId: "unipassLoadingInspection",
        summary: "UNI-PASS 적재지 검사정보 조회",
        description: "수출신고번호로 적재지 검사정보를 조회합니다.",
        parameters: [
          { name: "export_decl_no", in: "query", required: true, schema: { type: "string" }, description: "수출신고번호" },
        ],
        responses: jsonResponse("적재지 검사정보"),
      },
    },
    "/api/unipass/bonded-transport-info": {
      get: {
        operationId: "unipassBondedTransportInfo",
        summary: "UNI-PASS 보세운송 운송차량정보 조회",
        description: "조회기간과 보세운송업자부호로 보세운송 운송차량정보를 조회합니다.",
        parameters: [
          { name: "start_date", in: "query", required: true, schema: { type: "string" }, description: "조회시작일 (YYYYMMDD)" },
          { name: "end_date", in: "query", required: true, schema: { type: "string" }, description: "조회종료일 (YYYYMMDD)" },
          { name: "btco_code", in: "query", schema: { type: "string" }, description: "보세운송업자부호" },
        ],
        responses: jsonResponse("보세운송 운송차량정보"),
      },
    },
  };
}
