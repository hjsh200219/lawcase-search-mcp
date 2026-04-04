/**
 * 공공데이터포털 REST API 라우트 (/data20/*)
 */

import type { Router } from "express";
import { handle } from "./route-helpers.js";
import {
  searchPharmacy,
  searchHospital,
  searchStockDividend,
  searchRareMedicine,
  searchHealthFood,
  searchBioEquivalence,
  searchMedicinePatent,
  verifyBusiness,
  checkBusinessStatus,
} from "../data20-api.js";

export function registerData20Routes(router: Router, d20: string): void {
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

  router.get("/data20/bio-equivalence", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return searchBioEquivalence(d20, {
      item_name: q.item_name as string | undefined,
      pageNo: Number(q.pageNo) || 1,
      numOfRows: Number(q.numOfRows) || 10,
    });
  }));

  router.get("/data20/medicine-patent", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return searchMedicinePatent(d20, {
      item_name: q.item_name as string | undefined,
      item_eng_name: q.item_eng_name as string | undefined,
      ingr_name: q.ingr_name as string | undefined,
      ingr_eng_name: q.ingr_eng_name as string | undefined,
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
