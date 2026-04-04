/**
 * 농림축산식품부 REST API 라우트 (/mafra/*)
 */

import type { Router } from "express";
import { handle } from "./route-helpers.js";
import { fetchImportMeatTrace } from "../mafra-api.js";

export function registerMafraRoutes(router: Router, mafraKey: string): void {
  router.get("/mafra/import-meat", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    const importDate = String(q.import_date || "");
    if (!importDate) throw new Error("import_date 파라미터가 필요합니다 (YYYYMMDD).");

    const page = Number(q.page) || 1;
    const perPage = Number(q.per_page) || 100;
    const startIndex = (page - 1) * perPage + 1;
    const endIndex = startIndex + perPage - 1;

    return fetchImportMeatTrace(mafraKey, {
      importDate,
      productCode: q.product_code ? String(q.product_code) : undefined,
      blNo: q.bl_no ? String(q.bl_no) : undefined,
      originCountry: q.origin_country ? String(q.origin_country) : undefined,
      saleStatus: q.sale_status ? String(q.sale_status) : undefined,
      startIndex,
      endIndex,
    });
  }));
}
