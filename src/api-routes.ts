/**
 * REST API 라우터 - GPT Actions 등 일반 HTTP 클라이언트용
 */

import { Router, Request, Response } from "express";
import {
  searchLaws, getLawDetail,
  searchCases, getCaseDetail,
  searchConstitutional, getConstitutionalDetail,
  searchInterpretations, getInterpretationDetail,
  searchAdminRules, getAdminRuleDetail,
  searchOrdinances, getOrdinanceDetail,
  searchTreaties, getTreatyDetail,
  searchLegalTerms, getLegalTermDetail,
  searchEnglishLaws, getEnglishLawDetail,
  searchCommitteeDecisions, getCommitteeDecisionDetail,
  searchAdminAppeals, getAdminAppealDetail,
  searchOldNewLaw, getOldNewLawDetail,
  searchLawSystem, getLawSystemDetail,
  searchThreeWayComp, getThreeWayCompDetail,
  searchAttachedForms,
  searchLawAbbreviations,
  searchLawChangeHistory,
  getLawArticleSub,
  searchAILegalTerms,
  searchLinkedOrdinances,
  searchAdminRuleOldNew, getAdminRuleOldNewDetail,
} from "./law-api.js";
import {
  resolveCorpCode,
  searchDisclosures,
  getCompanyInfo,
  getFinancialStatements,
  getKeyAccounts,
} from "./dart-api.js";
import {
  searchPharmacy,
  searchHospital,
  searchStockDividend,
  searchRareMedicine,
  searchHealthFood,
  verifyBusiness,
  checkBusinessStatus,
} from "./data20-api.js";
import type { ServerConfig } from "./server.js";

export function createApiRouter(config: ServerConfig): Router {
  const oc = config.lawApiOc;
  const router = Router();

  function sp(q: Record<string, unknown>) {
    return {
      query: String(q.query || ""),
      page: Number(q.page) || 1,
      display: Number(q.display) || 20,
    };
  }

  function handle(fn: (req: Request) => Promise<unknown>) {
    return async (req: Request, res: Response) => {
      try {
        res.json(await fn(req));
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "오류" });
      }
    };
  }

  // --- 검색 ---

  router.get("/search/laws", handle(async (req) =>
    searchLaws(oc, { ...sp(req.query as Record<string, unknown>), search: req.query.search_type === "full_text" ? 2 : 1 })
  ));

  router.get("/search/cases", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return searchCases(oc, {
      ...sp(q),
      search: q.search_type === "case_name" ? 1 : 2,
      dateFrom: q.date_from as string | undefined,
      dateTo: q.date_to as string | undefined,
      court: q.court as string | undefined,
    });
  }));

  router.get("/search/constitutional", handle(async (req) =>
    searchConstitutional(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/interpretations", handle(async (req) =>
    searchInterpretations(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/admin-rules", handle(async (req) =>
    searchAdminRules(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/ordinances", handle(async (req) =>
    searchOrdinances(oc, { ...sp(req.query as Record<string, unknown>), search: req.query.search_type === "full_text" ? 2 : 1 })
  ));

  router.get("/search/treaties", handle(async (req) =>
    searchTreaties(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/legal-terms", handle(async (req) =>
    searchLegalTerms(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/english-laws", handle(async (req) =>
    searchEnglishLaws(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/committee-decisions", handle(async (req) =>
    searchCommitteeDecisions(oc, String(req.query.committee || ""), sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/admin-appeals", handle(async (req) =>
    searchAdminAppeals(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/old-new-law", handle(async (req) =>
    searchOldNewLaw(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/law-system", handle(async (req) =>
    searchLawSystem(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/three-way-comp", handle(async (req) =>
    searchThreeWayComp(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/attached-forms", handle(async (req) => {
    const kndMap: Record<string, number> = { table: 1, form: 2, annex: 3, other: 4, unclassified: 5 };
    const knd = kndMap[String(req.query.form_type || "")] as 1 | 2 | 3 | 4 | 5 | undefined;
    return searchAttachedForms(oc, { ...sp(req.query as Record<string, unknown>), knd });
  }));

  router.get("/search/law-abbreviations", handle(async (req) =>
    searchLawAbbreviations(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/law-change-history", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return searchLawChangeHistory(oc, {
      regDt: String(q.date || ""),
      page: Number(q.page) || 1,
      display: Number(q.display) || 20,
    });
  }));

  router.get("/search/ai-legal-terms", handle(async (req) =>
    searchAILegalTerms(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/linked-ordinances", handle(async (req) =>
    searchLinkedOrdinances(oc, sp(req.query as Record<string, unknown>))
  ));

  router.get("/search/admin-rule-old-new", handle(async (req) =>
    searchAdminRuleOldNew(oc, sp(req.query as Record<string, unknown>))
  ));

  // --- 상세조회 ---

  router.get("/detail/law/:id", handle(async (req) =>
    getLawDetail(oc, Number(req.params.id))
  ));

  router.get("/detail/case/:id", handle(async (req) =>
    getCaseDetail(oc, Number(req.params.id))
  ));

  router.get("/detail/constitutional/:id", handle(async (req) =>
    getConstitutionalDetail(oc, Number(req.params.id))
  ));

  router.get("/detail/interpretation/:id", handle(async (req) =>
    getInterpretationDetail(oc, Number(req.params.id))
  ));

  router.get("/detail/admin-rule/:id", handle(async (req) =>
    getAdminRuleDetail(oc, Number(req.params.id))
  ));

  router.get("/detail/ordinance/:id", handle(async (req) =>
    getOrdinanceDetail(oc, Number(req.params.id))
  ));

  router.get("/detail/treaty/:id", handle(async (req) =>
    getTreatyDetail(oc, Number(req.params.id))
  ));

  router.get("/detail/legal-term/:id", handle(async (req) =>
    getLegalTermDetail(oc, String(req.params.id))
  ));

  router.get("/detail/english-law/:id", handle(async (req) =>
    getEnglishLawDetail(oc, Number(req.params.id))
  ));

  router.get("/detail/committee-decision/:committee/:id", handle(async (req) =>
    getCommitteeDecisionDetail(oc, String(req.params.committee), Number(req.params.id))
  ));

  router.get("/detail/admin-appeal/:id", handle(async (req) =>
    getAdminAppealDetail(oc, Number(req.params.id))
  ));

  router.get("/detail/old-new-law/:id", handle(async (req) =>
    getOldNewLawDetail(oc, Number(req.params.id))
  ));

  router.get("/detail/law-system/:id", handle(async (req) =>
    getLawSystemDetail(oc, Number(req.params.id))
  ));

  router.get("/detail/three-way-comp/:id", handle(async (req) =>
    getThreeWayCompDetail(oc, Number(req.params.id), req.query.comparison_type === "delegation" ? 2 : 1)
  ));

  router.get("/detail/law-article-sub/:id", handle(async (req) =>
    getLawArticleSub(oc, {
      lawId: Number(req.params.id),
      jo: String(req.query.article || ""),
      hang: req.query.paragraph as string | undefined,
      ho: req.query.clause as string | undefined,
      mok: req.query.subclause as string | undefined,
    })
  ));

  router.get("/detail/admin-rule-old-new/:id", handle(async (req) =>
    getAdminRuleOldNewDetail(oc, Number(req.params.id))
  ));

  // --- DART 전자공시 (DART_API_KEY 존재 시에만 활성화) ---

  if (config.dartApiKey) {
    const dartKey = config.dartApiKey;

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
  }

  // --- 공공데이터포털 (DATA20_SERVICE_KEY 존재 시에만 활성화) ---

  if (config.data20ServiceKey) {
    const d20 = config.data20ServiceKey;

    router.get("/data20/pharmacy", handle(async (req) => {
      const q = req.query as Record<string, unknown>;
      return searchPharmacy(d20, {
        Q0: q.Q0 as string | undefined,
        Q1: q.Q1 as string | undefined,
        QN: q.QN as string | undefined,
        pageNo: Number(q.pageNo) || 1,
        numOfRows: Number(q.numOfRows) || 10,
      });
    }));

    router.get("/data20/hospital", handle(async (req) => {
      const q = req.query as Record<string, unknown>;
      return searchHospital(d20, {
        yadmNm: q.yadmNm as string | undefined,
        sidoCd: q.sidoCd as string | undefined,
        sgguCd: q.sgguCd as string | undefined,
        clCd: q.clCd as string | undefined,
        dgsbjtCd: q.dgsbjtCd as string | undefined,
        pageNo: Number(q.pageNo) || 1,
        numOfRows: Number(q.numOfRows) || 10,
      });
    }));

    router.get("/data20/stock-dividend", handle(async (req) => {
      const q = req.query as Record<string, unknown>;
      return searchStockDividend(d20, {
        stckIssuCmpyNm: q.stckIssuCmpyNm as string | undefined,
        basDt: q.basDt as string | undefined,
        crno: q.crno as string | undefined,
        pageNo: Number(q.pageNo) || 1,
        numOfRows: Number(q.numOfRows) || 10,
      });
    }));

    router.get("/data20/rare-medicine", handle(async (req) => {
      const q = req.query as Record<string, unknown>;
      return searchRareMedicine(d20, {
        item_name: q.item_name as string | undefined,
        entp_name: q.entp_name as string | undefined,
        pageNo: Number(q.pageNo) || 1,
        numOfRows: Number(q.numOfRows) || 10,
      });
    }));

    router.get("/data20/health-food", handle(async (req) => {
      const q = req.query as Record<string, unknown>;
      return searchHealthFood(d20, {
        prdlst_nm: q.prdlst_nm as string | undefined,
        pageNo: Number(q.pageNo) || 1,
        numOfRows: Number(q.numOfRows) || 10,
      });
    }));

    router.post("/data20/business-verify", handle(async (req) => {
      const body = req.body as { businesses?: Array<{ b_no: string; start_dt: string; p_nm: string; b_nm?: string }> };
      return verifyBusiness(d20, body.businesses || []);
    }));

    router.post("/data20/business-status", handle(async (req) => {
      const body = req.body as { b_no?: string[] };
      return checkBusinessStatus(d20, body.b_no || []);
    }));
  }

  return router;
}
