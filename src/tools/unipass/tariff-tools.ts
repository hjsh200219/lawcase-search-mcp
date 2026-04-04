/**
 * 관세청 UNI-PASS 관세/품목/환율 관련 MCP 도구
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  searchHsCode,
  getTariffRate,
  getCustomsExchangeRates,
  getSimpleDrawbackRate,
  getSimpleDrawbackCompany,
  getExportPeriodShortTarget,
  getStatisticsCode,
  getHsCodeNavigation,
} from "../../unipass-api.js";
import { errorResponse, truncate } from "../../shared.js";

export function registerTariffTools(
  server: McpServer,
  apiKeys: Record<string, string>,
): void {
  // 4. HS코드 검색 (API018)
  server.tool(
    "unipass_search_hs_code",
    "UNI-PASS HS코드 검색 — HS 부호로 품목 분류를 검색합니다.",
    {
      hs_code: z.string().describe("HS 부호 (예: 0201, 8471)"),
    },
    async ({ hs_code }) => {
      try {
        const items = await searchHsCode(apiKeys, hs_code);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 HS 부호의 검색 결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.hsSgn}: ${i.korePrnm || i.englPrnm} (세율: ${i.txrt}%, 세율유형: ${i.txtpSgn})`);
        return { content: [{ type: "text", text: truncate(`## HS코드 검색 (${hs_code})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS HS코드 검색", error);
      }
    },
  );

  // 5. 관세율 조회 (API030)
  server.tool(
    "unipass_get_tariff_rate",
    "UNI-PASS 기본 관세율 조회 — HS 부호(10자리)로 관세율을 조회합니다.",
    {
      hs_code: z.string().describe("HS 부호 (10자리, 예: 0201100000)"),
    },
    async ({ hs_code }) => {
      try {
        const items = await getTariffRate(apiKeys, hs_code);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 HS 부호의 관세율 정보를 찾을 수 없습니다." }] };
        }
        const lines = items.map((i) =>
          `- ${i.trrtTpNm} (${i.trrtTpcd}): ${i.trrt}% (적용: ${i.aplyStrtDt}~${i.aplyEndDt})`
        );
        return {
          content: [{
            type: "text",
            text: truncate(`## 관세율 조회 (${hs_code})\n\n- HS부호: ${items[0].hsSgn}\n\n${lines.join("\n")}`),
          }],
        };
      } catch (error) {
        return errorResponse("UNI-PASS 관세율 조회", error);
      }
    },
  );

  // 6. 관세환율 조회 (API012)
  server.tool(
    "unipass_get_customs_rate",
    "UNI-PASS 관세환율 조회 — 현재 적용 중인 관세 환율을 조회합니다.",
    {
      currencies: z.array(z.string()).optional()
        .describe("조회할 통화 코드 배열 (기본: USD, EUR, JPY, CNY, GBP)"),
    },
    async ({ currencies }) => {
      try {
        const items = await getCustomsExchangeRates(apiKeys, currencies);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "관세 환율 정보를 조회할 수 없습니다." }] };
        }
        const lines = items.map((i) =>
          `- ${i.currSgn} (${i.mtryUtNm}): ${i.fxrt}원 (적용시작: ${i.aplyBgnDt})`
        );
        return { content: [{ type: "text", text: `## 관세 환율\n\n${lines.join("\n")}` }] };
      } catch (error) {
        return errorResponse("UNI-PASS 관세환율 조회", error);
      }
    },
  );

  // 23. 간이정액 환급율표 조회 (API015)
  server.tool(
    "unipass_simple_drawback",
    "UNI-PASS 간이정액 환급율표 조회 — 기준일자와 HS부호로 환급율을 조회합니다.",
    {
      base_date: z.string().describe("기준일자 (YYYYMMDD)"),
      hs_code: z.string().optional().describe("HS 부호"),
    },
    async ({ base_date, hs_code }) => {
      try {
        const items = await getSimpleDrawbackRate(apiKeys, { baseDt: base_date, hsSgn: hs_code });
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.hs10}: ${i.prutDrwbWncrAmt}원`);
        return { content: [{ type: "text", text: truncate(`## 간이정액 환급율 (${base_date})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 간이환급율 조회", error);
      }
    },
  );

  // 24. 간이정액 적용/비적용 업체 조회 (API016)
  server.tool(
    "unipass_simple_drawback_company",
    "UNI-PASS 간이정액 적용/비적용 업체 조회 — 사업자등록번호로 적용 여부를 확인합니다.",
    {
      business_no: z.string().describe("사업자등록번호"),
    },
    async ({ business_no }) => {
      try {
        const item = await getSimpleDrawbackCompany(apiKeys, business_no);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 간이정액 적용업체 (${business_no})`,
          "",
          `- 업체명: ${item.conm}`,
          `- 등록세관: ${item.rgsrCstmNm}`,
          `- 적용승인일: ${item.simlFxamtAplyApreDt}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 간이정액 업체 조회", error);
      }
    },
  );

  // 25. 수출이행기간 단축대상 품목 조회 (API017)
  server.tool(
    "unipass_export_period_short",
    "UNI-PASS 수출이행기간 단축대상 품목 조회 — HS부호로 단축대상 품목을 조회합니다.",
    {
      hs_code: z.string().describe("HS 부호"),
    },
    async ({ hs_code }) => {
      try {
        const items = await getExportPeriodShortTarget(apiKeys, hs_code);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.hsSgn}: ${i.prnm} | 기한: ${i.ffmnTmlmDt}`);
        return { content: [{ type: "text", text: truncate(`## 수출이행기간 단축대상 (${hs_code})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 수출이행기간 단축 조회", error);
      }
    },
  );

  // 26. 통계부호 조회 (API019)
  server.tool(
    "unipass_statistics_code",
    "UNI-PASS 통계부호 조회 — 통계부호 유형과 값명칭으로 통계부호를 검색합니다.",
    {
      code_type: z.string().describe("통계부호유형"),
      value_name: z.string().optional().describe("코드값명칭"),
    },
    async ({ code_type, value_name }) => {
      try {
        const items = await getStatisticsCode(apiKeys, { statsSgnTp: code_type, cdValtValNm: value_name });
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.statsSgn}: ${i.koreAbrt} (${i.englAbrt})`);
        return { content: [{ type: "text", text: truncate(`## 통계부호 (${code_type})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 통계부호 조회", error);
      }
    },
  );

  // 43. HS CODE 내비게이션 조회 (API043)
  server.tool(
    "unipass_hs_navigation",
    "UNI-PASS HS CODE 내비게이션 조회 — HS부호로 관련 품목을 내비게이션 형태로 조회합니다.",
    {
      hs_code: z.string().describe("HS 부호"),
    },
    async ({ hs_code }) => {
      try {
        const items = await getHsCodeNavigation(apiKeys, hs_code);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.hs10Sgn}: ${i.prlstNm} (조회순위: ${i.acrsTcntRnk})`);
        return { content: [{ type: "text", text: truncate(`## HS코드 내비게이션 (${hs_code})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS HS코드 내비게이션 조회", error);
      }
    },
  );
}
