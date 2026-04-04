/**
 * 수출입은행 OpenAPI 경로 정의
 */

import { jsonResponse } from "./shared.js";
import type { OpenApiPaths } from "./shared.js";

export function getEximPaths(): OpenApiPaths {
  return {
    "/api/exim/exchange-rate": {
      get: {
        operationId: "eximGetExchangeRate",
        summary: "수출입은행 시장 환율 조회",
        description: "한국수출입은행 매매기준율, 전신환 매입/매도율을 조회합니다.",
        parameters: [
          { name: "date", in: "query", schema: { type: "string", pattern: "^\\d{8}$" }, description: "조회일 (YYYYMMDD, 미지정 시 당일)" },
        ],
        responses: jsonResponse("시장 환율 정보"),
      },
    },
  };
}
