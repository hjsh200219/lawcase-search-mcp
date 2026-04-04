/**
 * 관세청 UNI-PASS REST API 라우트 (/unipass/*)
 */

import type { Router } from "express";
import { handle } from "./route-helpers.js";
import {
  getCargoTracking,
  getContainerInfo,
  verifyImportDeclaration,
  searchHsCode,
  getTariffRate,
  getCustomsExchangeRates,
  searchCompany,
  searchBroker,
  getInspectionInfo,
  getArrivalReport,
  searchAnimalPlantCompany,
  getBondedAreaStorage,
  getTaxPaymentInfo,
  getExportPerformance,
  getImportRequirement,
  getShedInfo,
  getForwarderList,
  getForwarderDetail,
  getAirlineList,
  getAirlineDetail,
  getOverseasSupplier,
  getBrokerDetail,
  getSimpleDrawbackRate,
  getSimpleDrawbackCompany,
  getExportPeriodShortTarget,
  getStatisticsCode,
  getBondedTransportVehicle,
  getPortEntryExit,
  getSingleWindowHistory,
  getShipCompanyList,
  getShipCompanyDetail,
  getCustomsCheckItems,
  getPostalCustoms,
  getAttachmentSubmitStatus,
  getReimportExportBalance,
  verifyExportDeclaration,
  getExportByVehicle,
  getPostalClearance,
  getUnloadingDeclarations,
  getSeaDeparturePermit,
  getAirDeparturePermit,
  getReexportDutyFreeBalance,
  getHsCodeNavigation,
  getAirArrivalReport,
  getReexportDeadline,
  getReexportCompletion,
  getBondedRelease,
  getCollateralRelease,
  getEcommerceExportLoad,
  getDeclarationCorrection,
  getLoadingInspection,
  getBondedTransportInfo,
} from "../unipass-api.js";

export function registerUnipassRoutes(router: Router, keys: Record<string, string>): void {
  router.get("/unipass/cargo", handle(async (req) => {
    const bl = String(req.query.bl_number || "");
    if (!bl) throw new Error("bl_number 파라미터가 필요합니다.");
    return getCargoTracking(keys, bl);
  }));

  router.get("/unipass/containers", handle(async (req) => {
    const bl = String(req.query.bl_number || "");
    if (!bl) throw new Error("bl_number 파라미터가 필요합니다.");
    return getContainerInfo(keys, bl);
  }));

  router.get("/unipass/declaration", handle(async (req) => {
    const no = String(req.query.declaration_no || "");
    if (!no) throw new Error("declaration_no 파라미터가 필요합니다.");
    return verifyImportDeclaration(keys, no);
  }));

  router.get("/unipass/hs-code", handle(async (req) => {
    const code = String(req.query.hs_code || "");
    if (!code) throw new Error("hs_code 파라미터가 필요합니다.");
    return searchHsCode(keys, code);
  }));

  router.get("/unipass/tariff-rate", handle(async (req) => {
    const code = String(req.query.hs_code || "");
    if (!code) throw new Error("hs_code 파라미터가 필요합니다.");
    return getTariffRate(keys, code);
  }));

  router.get("/unipass/customs-rate", handle(async (req) => {
    const curr = req.query.currencies;
    const currencies = typeof curr === "string" ? curr.split(",") : undefined;
    return getCustomsExchangeRates(keys, currencies);
  }));

  router.get("/unipass/company", handle(async (req) => {
    const q = String(req.query.query || "");
    if (!q) throw new Error("query 파라미터가 필요합니다.");
    return searchCompany(keys, q);
  }));

  router.get("/unipass/broker", handle(async (req) => {
    const q = String(req.query.query || "");
    if (!q) throw new Error("query 파라미터가 필요합니다.");
    return searchBroker(keys, q);
  }));

  router.get("/unipass/inspection", handle(async (req) => {
    const bl = String(req.query.bl_number || "");
    if (!bl) throw new Error("bl_number 파라미터가 필요합니다.");
    return getInspectionInfo(keys, bl);
  }));

  router.get("/unipass/arrival-report", handle(async (req) => {
    const bl = String(req.query.bl_number || "");
    if (!bl) throw new Error("bl_number 파라미터가 필요합니다.");
    return getArrivalReport(keys, bl);
  }));

  router.get("/unipass/animal-plant-company", handle(async (req) => {
    const name = String(req.query.company_name || "");
    if (!name) throw new Error("company_name 파라미터가 필요합니다.");
    return searchAnimalPlantCompany(keys, name);
  }));

  router.get("/unipass/bonded-area", handle(async (req) => {
    const no = String(req.query.cargo_no || "");
    if (!no) throw new Error("cargo_no 파라미터가 필요합니다.");
    return getBondedAreaStorage(keys, no);
  }));

  router.get("/unipass/tax-payment", handle(async (req) => {
    const no = String(req.query.declaration_no || "");
    if (!no) throw new Error("declaration_no 파라미터가 필요합니다.");
    return getTaxPaymentInfo(keys, no);
  }));

  router.get("/unipass/export-performance", handle(async (req) => {
    const no = String(req.query.export_declaration_no || "");
    if (!no) throw new Error("export_declaration_no 파라미터가 필요합니다.");
    return getExportPerformance(keys, no);
  }));

  router.get("/unipass/import-requirement", handle(async (req) => {
    const reqApreNo = String(req.query.req_apre_no || "");
    const imexTpcd = String(req.query.imex_tpcd || "");
    if (!reqApreNo) throw new Error("req_apre_no 파라미터가 필요합니다.");
    if (!imexTpcd) throw new Error("imex_tpcd 파라미터가 필요합니다.");
    return getImportRequirement(keys, reqApreNo, imexTpcd);
  }));

  router.get("/unipass/shed-info", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return getShedInfo(keys, {
      jrsdCstmCd: q.customs_code ? String(q.customs_code) : undefined,
      snarSgn: q.shed_code ? String(q.shed_code) : undefined,
    });
  }));

  router.get("/unipass/forwarder-list", handle(async (req) => {
    const name = String(req.query.name || "");
    if (!name) throw new Error("name 파라미터가 필요합니다.");
    return getForwarderList(keys, name);
  }));

  router.get("/unipass/forwarder-detail", handle(async (req) => {
    const code = String(req.query.forwarder_code || "");
    if (!code) throw new Error("forwarder_code 파라미터가 필요합니다.");
    return getForwarderDetail(keys, code);
  }));

  router.get("/unipass/airline-list", handle(async (req) => {
    const name = String(req.query.name || "");
    if (!name) throw new Error("name 파라미터가 필요합니다.");
    return getAirlineList(keys, name);
  }));

  router.get("/unipass/airline-detail", handle(async (req) => {
    const code = String(req.query.airline_code || "");
    if (!code) throw new Error("airline_code 파라미터가 필요합니다.");
    return getAirlineDetail(keys, code);
  }));

  router.get("/unipass/overseas-supplier", handle(async (req) => {
    const cntySgn = String(req.query.country_code || "");
    const conm = String(req.query.company_name || "");
    if (!cntySgn) throw new Error("country_code 파라미터가 필요합니다.");
    if (!conm) throw new Error("company_name 파라미터가 필요합니다.");
    return getOverseasSupplier(keys, cntySgn, conm);
  }));

  router.get("/unipass/broker-detail", handle(async (req) => {
    const code = String(req.query.lca_code || "");
    if (!code) throw new Error("lca_code 파라미터가 필요합니다.");
    return getBrokerDetail(keys, code);
  }));

  router.get("/unipass/simple-drawback", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    const baseDt = String(q.base_date || "");
    if (!baseDt) throw new Error("base_date 파라미터가 필요합니다.");
    return getSimpleDrawbackRate(keys, {
      baseDt,
      hsSgn: q.hs_code ? String(q.hs_code) : undefined,
    });
  }));

  router.get("/unipass/simple-drawback-company", handle(async (req) => {
    const ecm = String(req.query.business_no || "");
    if (!ecm) throw new Error("business_no 파라미터가 필요합니다.");
    return getSimpleDrawbackCompany(keys, ecm);
  }));

  router.get("/unipass/export-period-short", handle(async (req) => {
    const code = String(req.query.hs_code || "");
    if (!code) throw new Error("hs_code 파라미터가 필요합니다.");
    return getExportPeriodShortTarget(keys, code);
  }));

  router.get("/unipass/statistics-code", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    const statsSgnTp = String(q.code_type || "");
    if (!statsSgnTp) throw new Error("code_type 파라미터가 필요합니다.");
    return getStatisticsCode(keys, {
      statsSgnTp,
      cdValtValNm: q.value_name ? String(q.value_name) : undefined,
    });
  }));

  router.get("/unipass/bonded-vehicle", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return getBondedTransportVehicle(keys, {
      btcoSgn: q.btco_code ? String(q.btco_code) : undefined,
      vhclNoSanm: q.vehicle_no ? String(q.vehicle_no) : undefined,
    });
  }));

  router.get("/unipass/port-entry-exit", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    const shipCallImoNo = String(q.imo_no || "");
    const seaFlghIoprTpcd = String(q.io_type || "");
    if (!shipCallImoNo) throw new Error("imo_no 파라미터가 필요합니다.");
    if (!seaFlghIoprTpcd) throw new Error("io_type 파라미터가 필요합니다.");
    return getPortEntryExit(keys, {
      shipCallImoNo,
      seaFlghIoprTpcd,
      cstmSgn: q.customs_code ? String(q.customs_code) : undefined,
    });
  }));

  router.get("/unipass/single-window", handle(async (req) => {
    const reqNo = String(req.query.request_no || "");
    if (!reqNo) throw new Error("request_no 파라미터가 필요합니다.");
    return getSingleWindowHistory(keys, reqNo);
  }));

  router.get("/unipass/ship-company-list", handle(async (req) => {
    const name = String(req.query.name || "");
    if (!name) throw new Error("name 파라미터가 필요합니다.");
    return getShipCompanyList(keys, name);
  }));

  router.get("/unipass/ship-company-detail", handle(async (req) => {
    const code = String(req.query.ship_company_code || "");
    if (!code) throw new Error("ship_company_code 파라미터가 필요합니다.");
    return getShipCompanyDetail(keys, code);
  }));

  router.get("/unipass/customs-check", handle(async (req) => {
    const hsSgn = String(req.query.hs_code || "");
    const imexTp = String(req.query.imex_type || "");
    if (!hsSgn) throw new Error("hs_code 파라미터가 필요합니다.");
    if (!imexTp) throw new Error("imex_type 파라미터가 필요합니다.");
    return getCustomsCheckItems(keys, hsSgn, imexTp);
  }));

  router.get("/unipass/postal-customs", handle(async (req) => {
    const code = String(req.query.postal_code || "");
    if (!code) throw new Error("postal_code 파라미터가 필요합니다.");
    return getPostalCustoms(keys, code);
  }));

  router.get("/unipass/attachment-status", handle(async (req) => {
    const docType = String(req.query.doc_type_code || "");
    const submitNo = String(req.query.submit_no || "");
    if (!docType) throw new Error("doc_type_code 파라미터가 필요합니다.");
    if (!submitNo) throw new Error("submit_no 파라미터가 필요합니다.");
    return getAttachmentSubmitStatus(keys, docType, submitNo);
  }));

  router.get("/unipass/reimport-balance", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    const expDclrNo = String(q.export_decl_no || "");
    const expDclrLnNo = String(q.line_no || "");
    if (!expDclrNo) throw new Error("export_decl_no 파라미터가 필요합니다.");
    if (!expDclrLnNo) throw new Error("line_no 파라미터가 필요합니다.");
    return getReimportExportBalance(keys, {
      expDclrNo,
      expDclrLnNo,
      expDclrStszSrno: q.stsz_srno ? String(q.stsz_srno) : undefined,
    });
  }));

  router.get("/unipass/verify-export", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    const pubsNo = String(q.pubs_no || "");
    const dclrNo = String(q.decl_no || "");
    const brno = String(q.brno || "");
    const country = String(q.country || "");
    const product = String(q.product || "");
    const weight = String(q.weight || "");
    if (!pubsNo) throw new Error("pubs_no 파라미터가 필요합니다.");
    if (!dclrNo) throw new Error("decl_no 파라미터가 필요합니다.");
    if (!brno) throw new Error("brno 파라미터가 필요합니다.");
    if (!country) throw new Error("country 파라미터가 필요합니다.");
    if (!product) throw new Error("product 파라미터가 필요합니다.");
    if (!weight) throw new Error("weight 파라미터가 필요합니다.");
    return verifyExportDeclaration(keys, {
      expDclrCrfnPblsNo: pubsNo,
      expDclrNo: dclrNo,
      txprBrno: brno,
      orcyCntyCd: country,
      prnm: product,
      ntwg: weight,
    });
  }));

  router.get("/unipass/export-by-vehicle", handle(async (req) => {
    const cbno = String(req.query.vehicle_no || "");
    if (!cbno) throw new Error("vehicle_no 파라미터가 필요합니다.");
    return getExportByVehicle(keys, { cbno });
  }));

  router.get("/unipass/postal-clearance", handle(async (req) => {
    const psmtKcd = String(req.query.postal_type || "");
    const psmtNo = String(req.query.postal_no || "");
    if (!psmtKcd) throw new Error("postal_type 파라미터가 필요합니다.");
    if (!psmtNo) throw new Error("postal_no 파라미터가 필요합니다.");
    return getPostalClearance(keys, psmtKcd, psmtNo);
  }));

  router.get("/unipass/unloading-declarations", handle(async (req) => {
    const etprDt = String(req.query.entry_date || "");
    const dclrCstmSgn = String(req.query.customs_code || "");
    if (!etprDt) throw new Error("entry_date 파라미터가 필요합니다.");
    if (!dclrCstmSgn) throw new Error("customs_code 파라미터가 필요합니다.");
    return getUnloadingDeclarations(keys, etprDt, dclrCstmSgn);
  }));

  router.get("/unipass/sea-departure", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return getSeaDeparturePermit(keys, {
      ioprSbmtNo: q.submit_no ? String(q.submit_no) : undefined,
      tkofPermNo: q.permit_no ? String(q.permit_no) : undefined,
    });
  }));

  router.get("/unipass/air-departure", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return getAirDeparturePermit(keys, {
      ioprSbmtNo: q.submit_no ? String(q.submit_no) : undefined,
      shipFlgtNm: q.flight ? String(q.flight) : undefined,
    });
  }));

  router.get("/unipass/reexport-balance", handle(async (req) => {
    const no = String(req.query.import_decl_no || "");
    if (!no) throw new Error("import_decl_no 파라미터가 필요합니다.");
    return getReexportDutyFreeBalance(keys, no);
  }));

  router.get("/unipass/hs-navigation", handle(async (req) => {
    const code = String(req.query.hs_code || "");
    if (!code) throw new Error("hs_code 파라미터가 필요합니다.");
    return getHsCodeNavigation(keys, code);
  }));

  router.get("/unipass/air-arrival-report", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    return getAirArrivalReport(keys, {
      shipFlgtNm: q.flight_name ? String(q.flight_name) : undefined,
      ioprSbmtNo: q.submit_no ? String(q.submit_no) : undefined,
    });
  }));

  router.get("/unipass/reexport-deadline", handle(async (req) => {
    const impDclrNo = String(req.query.import_decl_no || "");
    const lnNo = String(req.query.line_no || "");
    if (!impDclrNo) throw new Error("import_decl_no 파라미터가 필요합니다.");
    if (!lnNo) throw new Error("line_no 파라미터가 필요합니다.");
    return getReexportDeadline(keys, impDclrNo, lnNo);
  }));

  router.get("/unipass/reexport-completion", handle(async (req) => {
    const impDclrNo = String(req.query.import_decl_no || "");
    const lnNo = String(req.query.line_no || "");
    if (!impDclrNo) throw new Error("import_decl_no 파라미터가 필요합니다.");
    if (!lnNo) throw new Error("line_no 파라미터가 필요합니다.");
    return getReexportCompletion(keys, impDclrNo, lnNo);
  }));

  router.get("/unipass/bonded-release", handle(async (req) => {
    const no = String(req.query.business_no || "");
    if (!no) throw new Error("business_no 파라미터가 필요합니다.");
    return getBondedRelease(keys, no);
  }));

  router.get("/unipass/collateral-release", handle(async (req) => {
    const no = String(req.query.import_decl_no || "");
    if (!no) throw new Error("import_decl_no 파라미터가 필요합니다.");
    return getCollateralRelease(keys, no);
  }));

  router.get("/unipass/ecommerce-export-load", handle(async (req) => {
    const no = String(req.query.ecommerce_decl_no || "");
    if (!no) throw new Error("ecommerce_decl_no 파라미터가 필요합니다.");
    return getEcommerceExportLoad(keys, no);
  }));

  router.get("/unipass/declaration-correction", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    const dcshSbmtNo = String(q.submit_no || "");
    const imexTpcd = String(q.imex_type || "");
    const mdfyRqstDgcnt = String(q.request_count || "");
    if (!dcshSbmtNo) throw new Error("submit_no 파라미터가 필요합니다.");
    if (!imexTpcd) throw new Error("imex_type 파라미터가 필요합니다.");
    if (!mdfyRqstDgcnt) throw new Error("request_count 파라미터가 필요합니다.");
    return getDeclarationCorrection(keys, {
      dcshSbmtNo,
      imexTpcd,
      mdfyRqstDgcnt,
      mdfyRqstDt: q.request_date ? String(q.request_date) : undefined,
    });
  }));

  router.get("/unipass/loading-inspection", handle(async (req) => {
    const no = String(req.query.export_decl_no || "");
    if (!no) throw new Error("export_decl_no 파라미터가 필요합니다.");
    return getLoadingInspection(keys, no);
  }));

  router.get("/unipass/bonded-transport-info", handle(async (req) => {
    const q = req.query as Record<string, unknown>;
    const qryStrtDt = String(q.start_date || "");
    const qryEndDt = String(q.end_date || "");
    if (!qryStrtDt) throw new Error("start_date 파라미터가 필요합니다.");
    if (!qryEndDt) throw new Error("end_date 파라미터가 필요합니다.");
    return getBondedTransportInfo(keys, {
      qryStrtDt,
      qryEndDt,
      btcoSgn: q.btco_code ? String(q.btco_code) : undefined,
    });
  }));
}
