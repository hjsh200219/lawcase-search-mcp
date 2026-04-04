/**
 * 한국수출입은행 환율 MCP 도구 등록
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getMarketExchangeRates } from "../exim-api.js";
import { errorResponse } from "../shared.js";

export function registerEximTools(
  server: McpServer,
  apiKey: string,
): void {
  server.tool(
    "exim_get_exchange_rate",
    "한국수출입은행 시장 환율 조회 — 매매기준율, 전신환(송금) 매입/매도율 등을 조회합니다. 날짜를 지정하지 않으면 당일(KST) 환율을 조회합니다.",
    {
      date: z.string().optional()
        .describe("조회 날짜 (YYYYMMDD 형식, 예: 20260404). 미지정 시 당일."),
    },
    async ({ date }) => {
      try {
        const items = await getMarketExchangeRates(apiKey, date);
        if (items.length === 0) {
          return {
            content: [{
              type: "text",
              text: "환율 정보를 조회할 수 없습니다. 영업일이 아니거나 11시 이전일 수 있습니다.",
            }],
          };
        }

        const lines = items.map((i) =>
          `- **${i.currency}** (${i.currencyName}): 매매기준율 ${i.dealBaseRate.toLocaleString()}원` +
          (i.ttBuy ? ` | 매입 ${i.ttBuy}` : "") +
          (i.ttSell ? ` | 매도 ${i.ttSell}` : "")
        );

        const header = date
          ? `## 시장 환율 (${date})`
          : "## 시장 환율 (당일)";

        return { content: [{ type: "text", text: `${header}\n\n${lines.join("\n")}` }] };
      } catch (error) {
        return errorResponse("수출입은행 환율 조회", error);
      }
    },
  );
}
