/**
 * 농림축산식품부(MAFRA) 수입축산물 이력 MCP 도구 등록
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchImportMeatTrace } from "../mafra-api.js";
import { errorResponse, truncate } from "../shared.js";

export function registerMafraTools(
  server: McpServer,
  apiKey: string,
): void {
  // 1. 수입축산물 이력 검색
  server.tool(
    "mafra_search_import_meat",
    "수입축산물(쇠고기/돼지고기) 이력정보 조회 — 수입일자 기준으로 유통식별번호, 원산지, 도축장, 가공장, BL번호 등을 검색합니다. (농림축산식품부 공공데이터)",
    {
      import_date: z.string()
        .regex(/^\d{8}$/, "YYYYMMDD 형식")
        .describe("수입일자 (YYYYMMDD, 필수. 예: 20260401)"),
      product_code: z.string().optional()
        .describe("품목코드 (예: 2110111211)"),
      bl_no: z.string().optional()
        .describe("선하증권번호 (BL No.)"),
      origin_country: z.string().optional()
        .describe("원산지국가 (예: 호주, 미국)"),
      sale_status: z.enum(["Y", "N"]).optional()
        .describe("판매여부 (Y/N)"),
      page: z.number().int().positive().default(1).optional()
        .describe("페이지 번호 (기본: 1)"),
      per_page: z.number().int().positive().max(1000).default(100).optional()
        .describe("페이지당 건수 (기본: 100, 최대: 1000)"),
    },
    async (params) => {
      try {
        const page = params.page ?? 1;
        const perPage = params.per_page ?? 100;
        const startIndex = (page - 1) * perPage + 1;
        const endIndex = startIndex + perPage - 1;

        const result = await fetchImportMeatTrace(apiKey, {
          importDate: params.import_date,
          productCode: params.product_code,
          blNo: params.bl_no,
          originCountry: params.origin_country,
          saleStatus: params.sale_status,
          startIndex,
          endIndex,
        });

        if (result.error) {
          return {
            content: [{ type: "text", text: `수입축산물 이력 조회 오류: ${result.error}` }],
            isError: true,
          };
        }

        if (result.records.length === 0) {
          return {
            content: [{ type: "text", text: `수입일자 ${params.import_date}의 수입축산물 이력 정보가 없습니다.` }],
          };
        }

        const lines = result.records.map((r) =>
          `- **${r.distbIdntfcNo}** ${r.prdlstNm} | BL: ${r.blNo} | 원산지: ${r.orgplceNation}` +
          (r.importBsshNm ? ` | 수입사: ${r.importBsshNm}` : "") +
          (r.slauHseNm ? ` | 도축장: ${r.slauHseNm}` : "") +
          (r.prcssHseNm ? ` | 가공장: ${r.prcssHseNm}` : "")
        );

        const header = `## 수입축산물 이력 (${params.import_date})\n\n` +
          `총 ${result.totalCount}건 중 ${result.records.length}건 표시 (${page}페이지)\n\n`;

        return {
          content: [{ type: "text", text: truncate(header + lines.join("\n")) }],
        };
      } catch (error) {
        return errorResponse("수입축산물 이력 조회", error);
      }
    },
  );

  // 2. BL번호로 수입축산물 이력 조회
  server.tool(
    "mafra_lookup_meat_by_bl",
    "선하증권(BL) 번호로 수입축산물 이력 조회 — 특정 BL에 포함된 모든 수입축산물의 원산지, 도축장, 가공장 정보를 확인합니다.",
    {
      bl_no: z.string().describe("선하증권번호 (BL No.)"),
      import_date: z.string()
        .regex(/^\d{8}$/, "YYYYMMDD 형식")
        .describe("수입일자 (YYYYMMDD)"),
    },
    async ({ bl_no, import_date }) => {
      try {
        const result = await fetchImportMeatTrace(apiKey, {
          importDate: import_date,
          blNo: bl_no,
        });

        if (result.error) {
          return {
            content: [{ type: "text", text: `수입축산물 이력 조회 오류: ${result.error}` }],
            isError: true,
          };
        }

        if (result.records.length === 0) {
          return {
            content: [{ type: "text", text: `BL ${bl_no}의 수입축산물 이력 정보가 없습니다.` }],
          };
        }

        const lines = result.records.map((r) => [
          `### ${r.distbIdntfcNo} — ${r.prdlstNm}`,
          `- 원산지: ${r.orgplceNation}`,
          r.slauHseNm ? `- 도축장: ${r.slauHseNm} (${r.slauStartDe}~${r.slauEndDe})` : null,
          r.prcssHseNm ? `- 가공장: ${r.prcssHseNm} (${r.prcssStartDe}~${r.prcssEndDe})` : null,
          r.exportBsshNm ? `- 수출업체: ${r.exportBsshNm}` : null,
          r.importBsshNm ? `- 수입업체: ${r.importBsshNm}` : null,
          `- 판매여부: ${r.sleAt}`,
        ].filter(Boolean).join("\n"));

        const header = `## BL ${bl_no} 수입축산물 이력\n\n총 ${result.totalCount}건\n\n`;

        return {
          content: [{ type: "text", text: truncate(header + lines.join("\n\n")) }],
        };
      } catch (error) {
        return errorResponse("수입축산물 BL 이력 조회", error);
      }
    },
  );
}
