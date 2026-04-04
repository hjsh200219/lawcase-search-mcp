/**
 * 농림축산식품부 OpenAPI 경로 정의
 */

import { jsonResponse } from "./shared.js";
import type { OpenApiPaths } from "./shared.js";

export function getMafraPaths(): OpenApiPaths {
  return {
    "/api/mafra/import-meat": {
      get: {
        operationId: "mafraSearchImportMeat",
        summary: "수입축산물 이력 조회",
        description: "수입일자 기준으로 수입축산물(쇠고기/돼지고기)의 유통식별번호, 원산지, 도축장, 가공장, BL번호 등을 조회합니다.",
        parameters: [
          { name: "import_date", in: "query", required: true, schema: { type: "string", pattern: "^\\d{8}$" }, description: "수입일자 (YYYYMMDD)" },
          { name: "product_code", in: "query", schema: { type: "string" }, description: "품목코드" },
          { name: "bl_no", in: "query", schema: { type: "string" }, description: "선하증권번호" },
          { name: "origin_country", in: "query", schema: { type: "string" }, description: "원산지국가 (예: 호주, 미국)" },
          { name: "sale_status", in: "query", schema: { type: "string", enum: ["Y", "N"] }, description: "판매여부" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "페이지 번호" },
          { name: "per_page", in: "query", schema: { type: "integer", default: 100 }, description: "페이지당 건수 (최대 1000)" },
        ],
        responses: jsonResponse("수입축산물 이력 정보"),
      },
    },
  };
}
