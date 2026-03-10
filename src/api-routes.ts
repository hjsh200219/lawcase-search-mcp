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

export function createApiRouter(oc: string): Router {
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

  return router;
}
