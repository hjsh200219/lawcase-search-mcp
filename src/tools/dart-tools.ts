/**
 * DART 전자공시시스템 MCP 도구 등록
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  resolveCorpCode,
  searchDisclosures,
  getCompanyInfo,
  getFinancialStatements,
  getKeyAccounts,
  getDisclosureDocument,
} from "../dart-api.js";
import { errorResponse, truncate } from "../shared.js";

export function registerDartTools(server: McpServer, apiKey: string): void {
  // ========================================
  // 1. 기업 고유번호 검색
  // ========================================
  server.tool(
    "dart_resolve_corp_code",
    "DART 기업 고유번호 검색 — 회사명(부분 일치)으로 DART 고유번호를 조회합니다. 다른 DART 도구 호출 전 고유번호 확인에 사용하세요.",
    { corp_name: z.string().describe("검색할 회사명 (예: 삼성전자, LG)") },
    async ({ corp_name }) => {
      try {
        const results = await resolveCorpCode(apiKey, corp_name);
        if (results.length === 0) {
          return {
            content: [{
              type: "text",
              text: `"${corp_name}"에 대한 검색 결과가 없습니다. 정확한 기업명을 확인해주세요.`,
            }],
          };
        }

        const lines = results.map((r) =>
          `• ${r.corpName} — 고유번호: ${r.corpCode}${r.stockCode ? ` (종목코드: ${r.stockCode})` : ""}`,
        );

        return {
          content: [{
            type: "text",
            text: `"${corp_name}" 검색 결과 (${results.length}건):\n\n${lines.join("\n")}`,
          }],
        };
      } catch (error) {
        return errorResponse("DART 기업코드 검색", error);
      }
    },
  );

  // ========================================
  // 2. 공시보고서 검색
  // ========================================
  server.tool(
    "dart_search_disclosures",
    "DART 공시보고서 검색 — 기업의 공시보고서 목록을 조회합니다.",
    {
      corp_code: z.string().optional().describe("DART 고유번호 (8자리). dart_resolve_corp_code로 먼저 조회하세요."),
      bgn_de: z.string().optional().describe("검색 시작일 (YYYYMMDD)"),
      end_de: z.string().optional().describe("검색 종료일 (YYYYMMDD)"),
      pblntf_ty: z.enum(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]).optional()
        .describe("공시유형 (A:정기공시, B:주요사항, C:발행공시, D:지분공시, E:기타공시, F:외부감사, G:펀드공시, H:자산유동화, I:거래소공시, J:공정위공시)"),
      page_no: z.number().optional().describe("페이지 번호 (기본 1)"),
      page_count: z.number().optional().describe("페이지당 건수 (기본 20, 최대 100)"),
    },
    async (params) => {
      try {
        const result = await searchDisclosures(apiKey, params);

        if (!result.list || result.list.length === 0) {
          return {
            content: [{ type: "text", text: "해당 조건의 공시보고서가 없습니다." }],
          };
        }

        const header = `공시보고서 검색결과 — 총 ${result.total_count}건 (${result.page_no}/${result.total_page} 페이지)\n`;

        const items = result.list.map((d) =>
          `• [${d.rcept_dt}] ${d.corp_name} — ${d.report_nm}\n  접수번호: ${d.rcept_no} | 제출인: ${d.flr_nm}${d.rm ? ` | 비고: ${d.rm}` : ""}`,
        );

        return {
          content: [{ type: "text", text: header + "\n" + items.join("\n\n") }],
        };
      } catch (error) {
        return errorResponse("DART 공시검색", error);
      }
    },
  );

  // ========================================
  // 3. 기업개황 조회
  // ========================================
  server.tool(
    "dart_get_company_info",
    "DART 기업개황 조회 — 기업의 기본정보(대표자, 주소, 업종 등)를 조회합니다.",
    {
      corp_code: z.string().describe("DART 고유번호 (8자리). dart_resolve_corp_code로 먼저 조회하세요."),
    },
    async ({ corp_code }) => {
      try {
        const info = await getCompanyInfo(apiKey, corp_code);

        const lines = [
          `기업명: ${info.corp_name} (${info.corp_name_eng})`,
          `종목명: ${info.stock_name || "-"}`,
          `종목코드: ${info.stock_code || "-"}`,
          `대표자: ${info.ceo_nm}`,
          `법인구분: ${formatCorpCls(info.corp_cls)}`,
          `법인등록번호: ${info.jurir_no}`,
          `사업자등록번호: ${info.bizr_no}`,
          `주소: ${info.adres}`,
          `홈페이지: ${info.hm_url || "-"}`,
          `전화번호: ${info.phn_no || "-"}`,
          `업종코드: ${info.induty_code}`,
          `설립일: ${info.est_dt}`,
          `결산월: ${info.acc_mt}월`,
        ];

        return {
          content: [{ type: "text", text: lines.join("\n") }],
        };
      } catch (error) {
        return errorResponse("DART 기업개황", error);
      }
    },
  );

  // ========================================
  // 4. 전체 재무제표 조회
  // ========================================
  server.tool(
    "dart_get_financial_statements",
    "DART 전체 재무제표 조회 — 특정 기업의 전체 재무제표(재무상태표, 손익계산서 등)를 조회합니다.",
    {
      corp_code: z.string().describe("DART 고유번호 (8자리)"),
      bsns_year: z.string().describe("사업연도 (YYYY)"),
      reprt_code: z.enum(["11013", "11012", "11014", "11011"])
        .describe("보고서코드 (11013:1분기, 11012:반기, 11014:3분기, 11011:사업보고서)"),
      fs_div: z.enum(["OFS", "CFS"]).optional()
        .describe("재무제표구분 (OFS:개별, CFS:연결, 기본:CFS)"),
    },
    async (params) => {
      try {
        const result = await getFinancialStatements(apiKey, params);

        if (!result.list || result.list.length === 0) {
          return {
            content: [{ type: "text", text: "해당 조건의 재무제표 데이터가 없습니다." }],
          };
        }

        const grouped = groupBySjNm(result.list.map((item) => ({
          sjNm: item.sj_nm,
          line: formatFinancialLine(item),
        })));

        return {
          content: [{ type: "text", text: `${params.bsns_year}년 재무제표 (${params.fs_div || "CFS"})\n\n${grouped}` }],
        };
      } catch (error) {
        return errorResponse("DART 재무제표", error);
      }
    },
  );

  // ========================================
  // 5. 공시서류 본문 조회
  // ========================================
  server.tool(
    "dart_get_document",
    "DART 공시서류 본문 조회 — 접수번호로 공시서류의 전문(본문)을 조회합니다. dart_search_disclosures로 접수번호를 먼저 확인하세요.",
    {
      rcept_no: z.string().describe("접수번호 (14자리). dart_search_disclosures 결과의 접수번호를 사용하세요."),
    },
    async ({ rcept_no }) => {
      try {
        const result = await getDisclosureDocument(apiKey, rcept_no);

        const header = `## 공시서류 본문 (접수번호: ${rcept_no})\n\n` +
          `포함 파일: ${result.files.map((f) => f.filename).join(", ")}\n` +
          `---\n\n`;

        return {
          content: [{ type: "text", text: truncate(header + result.summary) }],
        };
      } catch (error) {
        return errorResponse("DART 공시서류 조회", error);
      }
    },
  );

  // ========================================
  // 6. 주요계정 조회
  // ========================================
  server.tool(
    "dart_get_key_accounts",
    "DART 주요계정 조회 — 매출액, 영업이익, 당기순이익 등 핵심 재무지표를 간략히 조회합니다.",
    {
      corp_code: z.string().describe("DART 고유번호 (8자리)"),
      bsns_year: z.string().describe("사업연도 (YYYY)"),
      reprt_code: z.enum(["11013", "11012", "11014", "11011"])
        .describe("보고서코드 (11013:1분기, 11012:반기, 11014:3분기, 11011:사업보고서)"),
    },
    async (params) => {
      try {
        const result = await getKeyAccounts(apiKey, params);

        if (!result.list || result.list.length === 0) {
          return {
            content: [{ type: "text", text: "해당 조건의 주요계정 데이터가 없습니다." }],
          };
        }

        const grouped = groupBySjNm(result.list.map((item) => ({
          sjNm: item.sj_nm,
          line: `  ${item.account_nm}: ${formatAmount(item.thstrm_amount)} (전기: ${formatAmount(item.frmtrm_amount)}, 전전기: ${formatAmount(item.bfefrmtrm_amount)})`,
        })));

        return {
          content: [{ type: "text", text: `${params.bsns_year}년 주요계정\n\n${grouped}` }],
        };
      } catch (error) {
        return errorResponse("DART 주요계정", error);
      }
    },
  );
}

// --- 포맷 헬퍼 ---

function formatCorpCls(cls: string): string {
  const map: Record<string, string> = { Y: "유가증권", K: "코스닥", N: "코넥스", E: "기타" };
  return map[cls] || cls;
}

function formatAmount(val: string): string {
  if (!val || val === "-" || val.trim() === "") return "-";
  const num = Number(val.replace(/,/g, ""));
  if (isNaN(num)) return val;
  return num.toLocaleString("ko-KR") + "원";
}

function formatFinancialLine(item: { account_nm: string; thstrm_amount: string; frmtrm_amount: string; bfefrmtrm_amount: string; account_detail: string }): string {
  const detail = item.account_detail && item.account_detail !== "-" ? ` (${item.account_detail})` : "";
  return `  ${item.account_nm}${detail}: ${formatAmount(item.thstrm_amount)} (전기: ${formatAmount(item.frmtrm_amount)}, 전전기: ${formatAmount(item.bfefrmtrm_amount)})`;
}

function groupBySjNm(items: Array<{ sjNm: string; line: string }>): string {
  const sections = new Map<string, string[]>();
  for (const { sjNm, line } of items) {
    const arr = sections.get(sjNm) || [];
    arr.push(line);
    sections.set(sjNm, arr);
  }

  const parts: string[] = [];
  for (const [name, lines] of sections) {
    parts.push(`[${name}]\n${lines.join("\n")}`);
  }
  return parts.join("\n\n");
}
