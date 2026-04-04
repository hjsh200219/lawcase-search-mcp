/**
 * 공공데이터포털 (data.go.kr) MCP 도구 등록
 * 약국, 병원, 동물병원, 주식배당, 희귀의약품, 건강식품, 사업자등록
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  searchPharmacy,
  searchHospital,
  searchStockDividend,
  searchRareMedicine,
  searchHealthFood,
  searchBioEquivalence,
  searchMedicinePatent,
  verifyBusiness,
  checkBusinessStatus,
} from "../data20-api.js";
import { truncate, errorResponse } from "../shared.js";

export function registerData20Tools(server: McpServer, serviceKey: string): void {
  registerPharmacyTool(server, serviceKey);
  registerHospitalTool(server, serviceKey);
  registerAnimalHospitalTool(server, serviceKey);
  registerStockDividendTool(server, serviceKey);
  registerRareMedicineTool(server, serviceKey);
  registerHealthFoodTool(server, serviceKey);
  registerBioEquivalenceTool(server, serviceKey);
  registerMedicinePatentTool(server, serviceKey);
  registerBusinessVerifyTool(server, serviceKey);
  registerBusinessStatusTool(server, serviceKey);
}

// ========================================
// 1. 약국 검색
// ========================================

function registerPharmacyTool(server: McpServer, serviceKey: string): void {
  server.tool(
    "data20_search_pharmacy",
    "약국 검색 — 전국 약국 정보를 지역명·약국명으로 검색합니다.",
    {
      Q0: z.string().optional().describe("시도명 (예: 서울특별시, 경기도)"),
      Q1: z.string().optional().describe("시군구명 (예: 강남구, 수원시)"),
      QN: z.string().optional().describe("약국명"),
      pageNo: z.number().optional().describe("페이지 번호 (기본 1)"),
      numOfRows: z.number().optional().describe("페이지당 건수 (기본 10)"),
    },
    async (params) => {
      try {
        const result = await searchPharmacy(serviceKey, params);
        if (result.items.length === 0) {
          return { content: [{ type: "text", text: "검색 결과가 없습니다." }] };
        }

        const header = `약국 검색결과 — 총 ${result.totalCount}건 (${result.pageNo}페이지)\n`;
        const lines = result.items.map((p) =>
          `• ${s(p.yadmNm)}\n  주소: ${s(p.addr)}\n  전화: ${s(p.telno)}\n  지역: ${[p.sidoCdNm, p.sgguCdNm, p.emdongNm].filter(Boolean).join(" ")}`,
        );
        return { content: [{ type: "text", text: truncate(header + "\n" + lines.join("\n\n")) }] };
      } catch (error) {
        return errorResponse("약국 검색", error);
      }
    },
  );
}

// ========================================
// 2. 병원 검색
// ========================================

function registerHospitalTool(server: McpServer, serviceKey: string): void {
  server.tool(
    "data20_search_hospital",
    "병원 검색 — 전국 병원·의원 정보를 기관명·지역·종별·진료과목으로 검색합니다.",
    {
      yadmNm: z.string().optional().describe("기관명 (예: 서울대학교병원)"),
      sidoCd: z.string().optional().describe("시도코드"),
      sgguCd: z.string().optional().describe("시군구코드"),
      clCd: z.string().optional()
        .describe("종별코드 (01:상급종합, 11:종합, 21:병원, 28:요양, 31:의원, 41:치과병원, 51:치과의원)"),
      dgsbjtCd: z.string().optional().describe("진료과목코드"),
      pageNo: z.number().optional().describe("페이지 번호 (기본 1)"),
      numOfRows: z.number().optional().describe("페이지당 건수 (기본 10)"),
    },
    async (params) => {
      try {
        const result = await searchHospital(serviceKey, params);
        if (result.items.length === 0) {
          return { content: [{ type: "text", text: "검색 결과가 없습니다." }] };
        }

        const header = `병원 검색결과 — 총 ${result.totalCount}건 (${result.pageNo}페이지)\n`;
        const lines = result.items.map((h) =>
          `• ${s(h.yadmNm)} (${s(h.clCdNm)})\n  주소: ${s(h.addr)}\n  전화: ${s(h.telno)}\n  진료과목: ${s(h.dgsbjtCdNm)}\n  의사수: ${s(h.drTotCnt)}명`,
        );
        return { content: [{ type: "text", text: truncate(header + "\n" + lines.join("\n\n")) }] };
      } catch (error) {
        return errorResponse("병원 검색", error);
      }
    },
  );
}

// ========================================
// 3. 동물병원 검색
// ========================================

function registerAnimalHospitalTool(server: McpServer, serviceKey: string): void {
  server.tool(
    "data20_search_animal_hospital",
    "동물병원 검색 — 전국 동물병원 정보를 기관명·지역으로 검색합니다.",
    {
      yadmNm: z.string().optional().describe("기관명"),
      sidoCd: z.string().optional().describe("시도코드"),
      sgguCd: z.string().optional().describe("시군구코드"),
      pageNo: z.number().optional().describe("페이지 번호 (기본 1)"),
      numOfRows: z.number().optional().describe("페이지당 건수 (기본 10)"),
    },
    async (params) => {
      try {
        const result = await searchHospital(serviceKey, params);
        if (result.items.length === 0) {
          return { content: [{ type: "text", text: "검색 결과가 없습니다." }] };
        }

        const header = `동물병원 검색결과 — 총 ${result.totalCount}건 (${result.pageNo}페이지)\n`;
        const lines = result.items.map((h) =>
          `• ${s(h.yadmNm)} (${s(h.clCdNm)})\n  주소: ${s(h.addr)}\n  전화: ${s(h.telno)}`,
        );
        return { content: [{ type: "text", text: truncate(header + "\n" + lines.join("\n\n")) }] };
      } catch (error) {
        return errorResponse("동물병원 검색", error);
      }
    },
  );
}

// ========================================
// 4. 주식배당정보
// ========================================

function registerStockDividendTool(server: McpServer, serviceKey: string): void {
  server.tool(
    "data20_search_stock_dividend",
    "주식배당정보 조회 — 상장기업의 주식 배당금·배당률 정보를 조회합니다.",
    {
      stckIssuCmpyNm: z.string().optional().describe("회사명 (예: 삼성전자)"),
      basDt: z.string().optional().describe("기준일자 (YYYYMMDD)"),
      crno: z.string().optional().describe("법인등록번호"),
      pageNo: z.number().optional().describe("페이지 번호 (기본 1)"),
      numOfRows: z.number().optional().describe("페이지당 건수 (기본 10)"),
    },
    async (params) => {
      try {
        const result = await searchStockDividend(serviceKey, params);
        if (result.items.length === 0) {
          return { content: [{ type: "text", text: "검색 결과가 없습니다." }] };
        }

        const header = `주식배당정보 — 총 ${result.totalCount}건 (${result.pageNo}페이지)\n`;
        const lines = result.items.map((d) =>
          `• ${s(d.stckIssuCmpyNm)} (배당기준일: ${s(d.dvdnBasDt)})\n  배당종류: ${s(d.stckDvdnRcdNm)}\n  액면가: ${s(d.stckParPrc)}\n  보통주배당금: ${s(d.stckGenrDvdnAmt)}\n  현금배당률: ${s(d.stckGenrCashDvdnRt)}%\n  지급일: ${s(d.cashDvdnPayDt)}`,
        );
        return { content: [{ type: "text", text: truncate(header + "\n" + lines.join("\n\n")) }] };
      } catch (error) {
        return errorResponse("주식배당정보 조회", error);
      }
    },
  );
}

// ========================================
// 5. 희귀의약품 검색
// ========================================

function registerRareMedicineTool(server: McpServer, serviceKey: string): void {
  server.tool(
    "data20_search_rare_medicine",
    "희귀의약품 검색 — 희귀의약품의 품목명·업체명·효능효과 등을 검색합니다.",
    {
      item_name: z.string().optional().describe("품목명"),
      entp_name: z.string().optional().describe("업체명"),
      pageNo: z.number().optional().describe("페이지 번호 (기본 1)"),
      numOfRows: z.number().optional().describe("페이지당 건수 (기본 10)"),
    },
    async (params) => {
      try {
        const result = await searchRareMedicine(serviceKey, params);
        if (result.items.length === 0) {
          return { content: [{ type: "text", text: "검색 결과가 없습니다." }] };
        }

        const header = `희귀의약품 검색결과 — 총 ${result.totalCount}건 (${result.pageNo}페이지)\n`;
        const lines = result.items.map((m) =>
          `• ${s(m.PRODT_NAME)}${m.GOODS_NAME ? ` (${s(m.GOODS_NAME)})` : ""}\n  제조사: ${s(m.MANUF_NAME || m.MANUFPLACE_NAME)}\n  대상질환: ${truncate(s(m.TARGET_DISEASE), 200)}\n  지정일: ${s(m.APPOINT_DATE)}`,
        );
        return { content: [{ type: "text", text: truncate(header + "\n" + lines.join("\n\n")) }] };
      } catch (error) {
        return errorResponse("희귀의약품 검색", error);
      }
    },
  );
}

// ========================================
// 6. 건강식품 검색
// ========================================

function registerHealthFoodTool(server: McpServer, serviceKey: string): void {
  server.tool(
    "data20_search_health_food",
    "건강기능식품 검색 — 건강기능식품의 제품명·업체명·원재료 등을 검색합니다.",
    {
      prdlst_nm: z.string().optional().describe("제품명"),
      pageNo: z.number().optional().describe("페이지 번호 (기본 1)"),
      numOfRows: z.number().optional().describe("페이지당 건수 (기본 10)"),
    },
    async (params) => {
      try {
        const result = await searchHealthFood(serviceKey, params);
        if (result.items.length === 0) {
          return { content: [{ type: "text", text: "검색 결과가 없습니다." }] };
        }

        const header = `건강기능식품 검색결과 — 총 ${result.totalCount}건 (${result.pageNo}페이지)\n`;
        const lines = result.items.map((f) =>
          `• ${s(f.PRDUCT)}\n  업체: ${s(f.ENTRPS)}\n  기능성: ${truncate(s(f.MAIN_FNCTN), 200)}\n  유통기한: ${s(f.DISTB_PD)}\n  섭취방법: ${truncate(s(f.SRV_USE), 150)}`,
        );
        return { content: [{ type: "text", text: truncate(header + "\n" + lines.join("\n\n")) }] };
      } catch (error) {
        return errorResponse("건강식품 검색", error);
      }
    },
  );
}

// ========================================
// 7. 생동성인정품목 검색
// ========================================

function registerBioEquivalenceTool(server: McpServer, serviceKey: string): void {
  server.tool(
    "data20_search_bio_equivalence",
    "생동성인정품목 검색 — 생물학적 동등성이 인정된 의약품(제네릭)의 품목기준코드·성분명·제형 등을 검색합니다.",
    {
      item_name: z.string().optional().describe("제품명"),
      pageNo: z.number().optional().describe("페이지 번호 (기본 1)"),
      numOfRows: z.number().optional().describe("페이지당 건수 (기본 10)"),
    },
    async (params) => {
      try {
        const result = await searchBioEquivalence(serviceKey, params);
        if (result.items.length === 0) {
          return { content: [{ type: "text", text: "검색 결과가 없습니다." }] };
        }

        const header = `생동성인정품목 검색결과 — 총 ${result.totalCount}건 (${result.pageNo}페이지)\n`;
        const lines = result.items.map((b) =>
          `• ${s(b.ITEM_NAME)}\n  업체: ${s(b.ENTP_NAME)}\n  성분: ${s(b.INGR_KOR_NAME)}\n  함량: ${s(b.INGR_QTY)}\n  제형: ${s(b.SHAPE_CODE_NAME)}\n  공고일: ${s(b.BIOEQ_PRODT_NOTICE_DATE)}`,
        );
        return { content: [{ type: "text", text: truncate(header + "\n" + lines.join("\n\n")) }] };
      } catch (error) {
        return errorResponse("생동성인정품목 검색", error);
      }
    },
  );
}

// ========================================
// 8. 의약품 특허정보 검색
// ========================================

function registerMedicinePatentTool(server: McpServer, serviceKey: string): void {
  server.tool(
    "data20_search_medicine_patent",
    "의약품 특허정보 검색 — 의약품 국내 특허번호·특허일자·만료일·성분명 등을 검색합니다.",
    {
      item_name: z.string().optional().describe("제품명 (한글)"),
      item_eng_name: z.string().optional().describe("제품명 (영문)"),
      ingr_name: z.string().optional().describe("성분명 (한글)"),
      ingr_eng_name: z.string().optional().describe("성분명 (영문)"),
      pageNo: z.number().optional().describe("페이지 번호 (기본 1)"),
      numOfRows: z.number().optional().describe("페이지당 건수 (기본 10)"),
    },
    async (params) => {
      try {
        const result = await searchMedicinePatent(serviceKey, params);
        if (result.items.length === 0) {
          return { content: [{ type: "text", text: "검색 결과가 없습니다." }] };
        }

        const header = `의약품 특허정보 검색결과 — 총 ${result.totalCount}건 (${result.pageNo}페이지)\n`;
        const lines = result.items.map((p) =>
          `• ${s(p.ITEM_NAME)}${p.ITEM_ENG_NAME ? ` (${s(p.ITEM_ENG_NAME)})` : ""}\n  업체: ${s(p.ENTP_NAME)}\n  성분: ${s(p.INGR_KOR_NAME)}${p.INGR_ENG_NAME ? ` / ${s(p.INGR_ENG_NAME)}` : ""}\n  특허번호: ${s(p.PATENT_NO)}\n  특허일: ${s(p.PATENT_DATE)}\n  만료일: ${s(p.PATENT_EXPIRY_DATE)}\n  제형: ${s(p.DOSAGE_FORM)}`,
        );
        return { content: [{ type: "text", text: truncate(header + "\n" + lines.join("\n\n")) }] };
      } catch (error) {
        return errorResponse("의약품 특허정보 검색", error);
      }
    },
  );
}

// ========================================
// 9. 사업자등록 진위확인
// ========================================

function registerBusinessVerifyTool(server: McpServer, serviceKey: string): void {
  server.tool(
    "data20_verify_business",
    "사업자등록 진위확인 — 사업자등록번호·대표자명·개업일자로 사업자등록의 진위를 확인합니다.",
    {
      b_no: z.string().describe("사업자등록번호 (10자리, 하이픈 없이)"),
      start_dt: z.string().describe("개업일자 (YYYYMMDD)"),
      p_nm: z.string().describe("대표자명"),
      b_nm: z.string().optional().describe("상호명"),
    },
    async (params) => {
      try {
        const results = await verifyBusiness(serviceKey, [params]);
        if (results.length === 0) {
          return { content: [{ type: "text", text: "진위확인 결과를 받지 못했습니다." }] };
        }
        const r = results[0];
        return {
          content: [{
            type: "text",
            text: `사업자등록 진위확인 결과\n\n사업자번호: ${r.b_no}\n확인결과: ${r.valid_msg || r.valid}`,
          }],
        };
      } catch (error) {
        return errorResponse("사업자등록 진위확인", error);
      }
    },
  );
}

// ========================================
// 8. 사업자등록 상태조회
// ========================================

function registerBusinessStatusTool(server: McpServer, serviceKey: string): void {
  server.tool(
    "data20_check_business_status",
    "사업자등록 상태조회 — 사업자등록번호로 사업 상태(계속/휴업/폐업)를 조회합니다.",
    {
      b_no: z.string().describe("사업자등록번호 (10자리, 하이픈 없이). 여러 개는 쉼표로 구분"),
    },
    async ({ b_no }) => {
      try {
        const numbers = b_no.split(",").map((n) => n.trim()).filter(Boolean);
        const results = await checkBusinessStatus(serviceKey, numbers);
        if (results.length === 0) {
          return { content: [{ type: "text", text: "상태조회 결과를 받지 못했습니다." }] };
        }

        const STATUS_MAP: Record<string, string> = { "01": "계속사업자", "02": "휴업자", "03": "폐업자" };
        const lines = results.map((r) =>
          `• ${r.b_no}: ${STATUS_MAP[r.b_stt_cd] || r.b_stt || "확인불가"}\n  과세유형: ${s(r.tax_type)}${r.end_dt ? `\n  폐업일: ${r.end_dt}` : ""}`,
        );

        return {
          content: [{ type: "text", text: `사업자등록 상태조회 결과\n\n${lines.join("\n\n")}` }],
        };
      } catch (error) {
        return errorResponse("사업자등록 상태조회", error);
      }
    },
  );
}

// --- 안전 문자열 ---

function s(val: unknown): string {
  if (val === null || val === undefined) return "-";
  const str = String(val).trim();
  return str || "-";
}
