/**
 * Skill: tariff_lookup — 관세율·HS코드·환율 통합 조회
 * 기존 도구: unipass_search_hs_code, unipass_get_tariff_rate,
 *   unipass_get_customs_rate, unipass_simple_drawback,
 *   unipass_simple_drawback_company, unipass_export_period_short,
 *   unipass_statistics_code, unipass_hs_navigation, exim_get_exchange_rate
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
import { getMarketExchangeRates } from "../../exim-api.js";
import { errorResponse, truncate } from "../../shared.js";
import { createDispatcher, requireParam, type SkillResult } from "./_shared.js";

const ACTIONS = [
  "search_hs",
  "tariff_rate",
  "customs_rate",
  "simple_drawback",
  "simple_drawback_company",
  "export_period_short",
  "statistics_code",
  "hs_navigation",
  "market_exchange",
] as const;

type TariffParams = {
  action: string;
  hs_code?: string;
  currencies?: string[];
  base_date?: string;
  business_no?: string;
  code_type?: string;
  value_name?: string;
  date?: string;
};

export function createTariffLookupHandler(
  apiKeys: Record<string, string>,
  eximApiKey?: string,
) {
  return createDispatcher<TariffParams>("tariff_lookup", {
    search_hs: async (p) => {
      const err = requireParam(p as Record<string, unknown>, "hs_code", "search_hs");
      if (err) return err;
      try {
        const items = await searchHsCode(apiKeys, p.hs_code!);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 HS 부호의 검색 결과가 없습니다." }] };
        }
        const lines = items.map(
          (i) => `- ${i.hsSgn}: ${i.korePrnm || i.englPrnm} (세율: ${i.txrt}%, 세율유형: ${i.txtpSgn})`,
        );
        return { content: [{ type: "text", text: truncate(`## HS코드 검색 (${p.hs_code})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("HS코드 검색", error);
      }
    },

    tariff_rate: async (p) => {
      const err = requireParam(p as Record<string, unknown>, "hs_code", "tariff_rate");
      if (err) return err;
      try {
        const items = await getTariffRate(apiKeys, p.hs_code!);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 HS 부호의 관세율 정보를 찾을 수 없습니다." }] };
        }
        const lines = items.map(
          (i) => `- ${i.trrtTpNm} (${i.trrtTpcd}): ${i.trrt}% (적용: ${i.aplyStrtDt}~${i.aplyEndDt})`,
        );
        return {
          content: [{
            type: "text",
            text: truncate(`## 관세율 조회 (${p.hs_code})\n\n- HS부호: ${items[0].hsSgn}\n\n${lines.join("\n")}`),
          }],
        };
      } catch (error) {
        return errorResponse("관세율 조회", error);
      }
    },

    customs_rate: async (p) => {
      try {
        const items = await getCustomsExchangeRates(apiKeys, p.currencies);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "관세 환율 정보를 조회할 수 없습니다." }] };
        }
        const lines = items.map(
          (i) => `- ${i.currSgn} (${i.mtryUtNm}): ${i.fxrt}원 (적용시작: ${i.aplyBgnDt})`,
        );
        return { content: [{ type: "text", text: `## 관세 환율\n\n${lines.join("\n")}` }] };
      } catch (error) {
        return errorResponse("관세환율 조회", error);
      }
    },

    simple_drawback: async (p) => {
      const err = requireParam(p as Record<string, unknown>, "base_date", "simple_drawback");
      if (err) return err;
      try {
        const items = await getSimpleDrawbackRate(apiKeys, { baseDt: p.base_date!, hsSgn: p.hs_code });
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.hs10}: ${i.prutDrwbWncrAmt}원`);
        return { content: [{ type: "text", text: truncate(`## 간이정액 환급율 (${p.base_date})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("간이환급율 조회", error);
      }
    },

    simple_drawback_company: async (p) => {
      const err = requireParam(p as Record<string, unknown>, "business_no", "simple_drawback_company");
      if (err) return err;
      try {
        const item = await getSimpleDrawbackCompany(apiKeys, p.business_no!);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 간이정액 적용업체 (${p.business_no})`,
          "",
          `- 업체명: ${item.conm}`,
          `- 등록세관: ${item.rgsrCstmNm}`,
          `- 적용승인일: ${item.simlFxamtAplyApreDt}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("간이정액 업체 조회", error);
      }
    },

    export_period_short: async (p) => {
      const err = requireParam(p as Record<string, unknown>, "hs_code", "export_period_short");
      if (err) return err;
      try {
        const items = await getExportPeriodShortTarget(apiKeys, p.hs_code!);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.hsSgn}: ${i.prnm} | 기한: ${i.ffmnTmlmDt}`);
        return { content: [{ type: "text", text: truncate(`## 수출이행기간 단축대상 (${p.hs_code})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("수출이행기간 단축 조회", error);
      }
    },

    statistics_code: async (p) => {
      const err = requireParam(p as Record<string, unknown>, "code_type", "statistics_code");
      if (err) return err;
      try {
        const items = await getStatisticsCode(apiKeys, { statsSgnTp: p.code_type!, cdValtValNm: p.value_name });
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.statsSgn}: ${i.koreAbrt} (${i.englAbrt})`);
        return { content: [{ type: "text", text: truncate(`## 통계부호 (${p.code_type})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("통계부호 조회", error);
      }
    },

    hs_navigation: async (p) => {
      const err = requireParam(p as Record<string, unknown>, "hs_code", "hs_navigation");
      if (err) return err;
      try {
        const items = await getHsCodeNavigation(apiKeys, p.hs_code!);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.hs10Sgn}: ${i.prlstNm} (조회순위: ${i.acrsTcntRnk})`);
        return { content: [{ type: "text", text: truncate(`## HS코드 내비게이션 (${p.hs_code})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("HS코드 내비게이션 조회", error);
      }
    },

    market_exchange: async (p) => {
      if (!eximApiKey) {
        return {
          content: [{ type: "text", text: "EXCHANGE_RATE_API_KEY가 설정되지 않아 시장 환율을 조회할 수 없습니다." }],
          isError: true,
        };
      }
      try {
        const items = await getMarketExchangeRates(eximApiKey, p.date);
        if (items.length === 0) {
          return {
            content: [{
              type: "text",
              text: "환율 정보를 조회할 수 없습니다. 영업일이 아니거나 11시 이전일 수 있습니다.",
            }],
          };
        }
        const lines = items.map(
          (i) =>
            `- **${i.currency}** (${i.currencyName}): 매매기준율 ${i.dealBaseRate.toLocaleString()}원` +
            (i.ttBuy ? ` | 매입 ${i.ttBuy}` : "") +
            (i.ttSell ? ` | 매도 ${i.ttSell}` : ""),
        );
        const header = p.date ? `## 시장 환율 (${p.date})` : "## 시장 환율 (당일)";
        return { content: [{ type: "text", text: `${header}\n\n${lines.join("\n")}` }] };
      } catch (error) {
        return errorResponse("시장 환율 조회", error);
      }
    },
  });
}

export function registerTariffLookup(
  server: McpServer,
  apiKeys: Record<string, string>,
  eximApiKey?: string,
): void {
  const handler = createTariffLookupHandler(apiKeys, eximApiKey);

  server.tool(
    "tariff_lookup",
    "관세율·HS코드·환율 통합 조회 — HS코드 검색, 관세율 조회, 관세환율, 시장환율, 간이환급율, 통계부호, HS 내비게이션 등을 하나의 도구로 제공합니다.",
    {
      action: z.enum(ACTIONS).describe("수행할 조회 유형"),
      hs_code: z.string().optional().describe("HS 부호 (search_hs, tariff_rate, simple_drawback, export_period_short, hs_navigation에서 사용)"),
      currencies: z.array(z.string()).optional().describe("통화 코드 배열 (customs_rate에서 사용, 예: [\"USD\", \"EUR\"])"),
      base_date: z.string().optional().describe("기준일자 YYYYMMDD (simple_drawback에서 사용)"),
      business_no: z.string().optional().describe("사업자등록번호 (simple_drawback_company에서 사용)"),
      code_type: z.string().optional().describe("통계부호유형 (statistics_code에서 사용)"),
      value_name: z.string().optional().describe("코드값명칭 (statistics_code에서 사용)"),
      date: z.string().optional().describe("환율 조회 날짜 YYYYMMDD (market_exchange에서 사용)"),
    },
    async (params) => handler(params as TariffParams),
  );
}
