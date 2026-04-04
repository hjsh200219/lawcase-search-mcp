/**
 * DART 전자공시 REST API 라우트 (/dart/*)
 */

import type { Router } from "express";
import { handle } from "./route-helpers.js";
import {
  resolveCorpCode,
  searchDisclosures,
  getCompanyInfo,
  getFinancialStatements,
  getKeyAccounts,
  getDisclosureDocument,
} from "../dart-api.js";

export function registerDartRoutes(router: Router, dartKey: string): void {
  router.get("/dart/corp-code", handle(async (req) =>
    resolveCorpCode(dartKey, String(req.query.corp_name || ""))
  ));

  router.get("/dart/disclosures", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return searchDisclosures(dartKey, {
      corp_code: q.corp_code as string | undefined,
      bgn_de: q.bgn_de as string | undefined,
      end_de: q.end_de as string | undefined,
      pblntf_ty: q.pblntf_ty as string | undefined,
      page_no: Number(q.page_no) || 1,
      page_count: Number(q.page_count) || 20,
    });
  }));

  router.get("/dart/company", handle(async (req) =>
    getCompanyInfo(dartKey, String(req.query.corp_code || ""))
  ));

  router.get("/dart/financials", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return getFinancialStatements(dartKey, {
      corp_code: String(q.corp_code || ""),
      bsns_year: String(q.bsns_year || ""),
      reprt_code: String(q.reprt_code || "11011"),
      fs_div: (q.fs_div as "OFS" | "CFS") || "CFS",
    });
  }));

  router.get("/dart/key-accounts", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return getKeyAccounts(dartKey, {
      corp_code: String(q.corp_code || ""),
      bsns_year: String(q.bsns_year || ""),
      reprt_code: String(q.reprt_code || "11011"),
    });
  }));

  router.get("/dart/document", handle(async (req) => {
    const rceptNo = String(req.query.rcept_no || "");
    if (!rceptNo) throw new Error("rcept_no 파라미터가 필요합니다.");
    return getDisclosureDocument(dartKey, rceptNo);
  }));
}
