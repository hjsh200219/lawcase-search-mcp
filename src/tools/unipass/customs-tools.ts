/**
 * 관세청 UNI-PASS 통관/신고 관련 MCP 도구
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  verifyImportDeclaration,
  getInspectionInfo,
  getTaxPaymentInfo,
  getExportPerformance,
  getImportRequirement,
  getSingleWindowHistory,
  getPostalCustoms,
  getAttachmentSubmitStatus,
  getReimportExportBalance,
  verifyExportDeclaration,
  getExportByVehicle,
  getPostalClearance,
  getReexportDutyFreeBalance,
  getReexportDeadline,
  getReexportCompletion,
  getCollateralRelease,
  getDeclarationCorrection,
  getLoadingInspection,
  getCustomsCheckItems,
} from "../../unipass-api.js";
import { errorResponse, truncate } from "../../shared.js";

export function registerCustomsTools(
  server: McpServer,
  apiKeys: Record<string, string>,
): void {
  // 3. 수입신고 검증 (API022)
  server.tool(
    "unipass_verify_declaration",
    "UNI-PASS 수입신고 검증 — 신고번호로 수입신고 내역을 확인합니다.",
    {
      declaration_no: z.string().describe("수입신고번호"),
    },
    async ({ declaration_no }) => {
      try {
        const item = await verifyImportDeclaration(apiKeys, declaration_no);
        if (!item) {
          return { content: [{ type: "text", text: "해당 신고번호의 수입신고 정보를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 수입신고 검증 (${declaration_no})`,
          "",
          `- 신고번호: ${item.dclrNo}`,
          `- 신고일자: ${item.dclrDt}`,
          `- 상태: ${item.dclrSttsNm} (${item.dclrSttsCd})`,
          `- B/L: ${item.blNo}`,
          `- 업체명: ${item.trdnNm}`,
          `- HS부호: ${item.hsSgn}`,
          `- 중량: ${item.wght}`,
          `- 건수: ${item.gcnt}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 수입신고 검증", error);
      }
    },
  );

  // 9. 검사검역내역 조회 (API004)
  server.tool(
    "unipass_get_inspection",
    "UNI-PASS 검사검역내역 조회 — B/L 번호로 검사·검역 결과를 확인합니다.",
    {
      bl_number: z.string().describe("B/L(선하증권) 번호"),
    },
    async ({ bl_number }) => {
      try {
        const items = await getInspectionInfo(apiKeys, bl_number);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 B/L 번호의 검사검역 정보가 없습니다." }] };
        }
        const lines = items.map((i) =>
          `- [${i.inqrRsltCd}] ${i.inqrRsltNm} | 검사일: ${i.inqrDt}`
        );
        return { content: [{ type: "text", text: `## 검사검역내역 (B/L: ${bl_number})\n\n${lines.join("\n")}` }] };
      } catch (error) {
        return errorResponse("UNI-PASS 검사검역 조회", error);
      }
    },
  );

  // 13. 수입 제세 납부여부 조회 (API049)
  server.tool(
    "unipass_get_tax_payment",
    "UNI-PASS 수입 제세 납부여부 조회 — 신고번호로 수입 관세·부가세 납부 여부를 확인합니다.",
    {
      declaration_no: z.string().describe("수입신고번호"),
    },
    async ({ declaration_no }) => {
      try {
        const items = await getTaxPaymentInfo(apiKeys, declaration_no);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 신고번호의 제세 납부 정보가 없습니다." }] };
        }
        const lines = items.map((i) =>
          `- 신고번호: ${i.dclrNo} | 납부여부: ${i.txpymYn === "Y" ? "납부완료" : "미납"} | 납부일: ${i.txpymDt} | 금액: ${i.txpymAmt}원`
        );
        return { content: [{ type: "text", text: `## 수입 제세 납부여부 (${declaration_no})\n\n${lines.join("\n")}` }] };
      } catch (error) {
        return errorResponse("UNI-PASS 제세 납부 조회", error);
      }
    },
  );

  // 14. 수출이행내역 조회 (API002)
  server.tool(
    "unipass_export_performance",
    "UNI-PASS 수출이행내역 조회 — 수출신고번호별 수출이행 내역을 조회합니다.",
    {
      export_declaration_no: z.string().describe("수출신고번호"),
    },
    async ({ export_declaration_no }) => {
      try {
        const item = await getExportPerformance(apiKeys, export_declaration_no);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 수출이행내역 (${export_declaration_no})`,
          "",
          `- 수출신고번호: ${item.expDclrNo}`,
          `- 선적완료여부: ${item.shpmCmplYn}`,
          `- 선명: ${item.sanm}`,
          `- 선적중량: ${item.shpmWght}`,
          `- 통관중량: ${item.csclWght}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 수출이행 조회", error);
      }
    },
  );

  // 15. 요건확인내역 조회 (API003)
  server.tool(
    "unipass_import_requirement",
    "UNI-PASS 수출입요건 승인 내역 조회 — 요건승인번호로 승인 내역을 확인합니다.",
    {
      req_apre_no: z.string().describe("요건승인번호"),
      imex_tpcd: z.string().describe("수출입구분코드 (1=수입, 2=수출)"),
    },
    async ({ req_apre_no, imex_tpcd }) => {
      try {
        const item = await getImportRequirement(apiKeys, req_apre_no, imex_tpcd);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 요건확인내역 (${req_apre_no})`,
          "",
          `- 요건승인번호: ${item.reqApreNo}`,
          `- 관련법령명: ${item.relaFrmlNm}`,
          `- 승인조건: ${item.apreCond}`,
          `- 유효기간: ${item.valtPrid}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 요건확인 조회", error);
      }
    },
  );

  // 29. 통관단일창구 처리이력 조회 (API025)
  server.tool(
    "unipass_single_window",
    "UNI-PASS 통관단일창구 처리이력 조회 — 요청번호로 처리이력을 조회합니다.",
    {
      request_no: z.string().describe("요청번호"),
    },
    async ({ request_no }) => {
      try {
        const items = await getSingleWindowHistory(apiKeys, request_no);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.reqRqstNo}: ${i.elctDocNm} | ${i.reqRqstPrcsSttsNm}`);
        return { content: [{ type: "text", text: truncate(`## 통관단일창구 (${request_no})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 단일창구 조회", error);
      }
    },
  );

  // 32. 세관장확인대상 물품 조회 (API029)
  server.tool(
    "unipass_customs_check",
    "UNI-PASS 세관장확인대상 물품 조회 — HS부호와 수출입구분으로 확인대상 물품을 조회합니다.",
    {
      hs_code: z.string().describe("HS 부호"),
      imex_type: z.string().describe("수출입구분"),
    },
    async ({ hs_code, imex_type }) => {
      try {
        const items = await getCustomsCheckItems(apiKeys, hs_code, imex_type);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.hsSgn}: ${i.dcerCfrmLworNm} | 기관: ${i.reqCfrmIstmNm}`);
        return { content: [{ type: "text", text: truncate(`## 세관장확인대상 (${hs_code})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 세관장확인 조회", error);
      }
    },
  );

  // 33. 우편번호별 관할세관 조회 (API031)
  server.tool(
    "unipass_postal_customs",
    "UNI-PASS 우편번호별 관할세관 조회 — 우편번호로 관할세관을 조회합니다.",
    {
      postal_code: z.string().describe("우편번호"),
    },
    async ({ postal_code }) => {
      try {
        const items = await getPostalCustoms(apiKeys, postal_code);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.jrsdCstmSgn}: ${i.jrsdCstmSgnNm}`);
        return { content: [{ type: "text", text: `## 관할세관 (우편번호: ${postal_code})\n\n${lines.join("\n")}` }] };
      } catch (error) {
        return errorResponse("UNI-PASS 관할세관 조회", error);
      }
    },
  );

  // 34. 전자첨부서류 제출 완료 유무 조회 (API032)
  server.tool(
    "unipass_attachment_status",
    "UNI-PASS 전자첨부서류 제출 완료 유무 조회 — 신고서류구분과 제출번호로 제출 여부를 확인합니다.",
    {
      doc_type_code: z.string().describe("신고업무상세유형코드"),
      submit_no: z.string().describe("전자서류제출번호"),
    },
    async ({ doc_type_code, submit_no }) => {
      try {
        const items = await getAttachmentSubmitStatus(apiKeys, doc_type_code, submit_no);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.dcshSbmtNo}: ${i.elctDocNm} | 제출: ${i.attchSbmtYn}`);
        return { content: [{ type: "text", text: truncate(`## 첨부서류 제출현황 (${submit_no})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 첨부서류 조회", error);
      }
    },
  );

  // 35. 재수입조건부 수출 잔량 조회 (API034)
  server.tool(
    "unipass_reimport_balance",
    "UNI-PASS 재수입조건부 수출 잔량 조회 — 수출신고번호와 란번호로 잔량을 조회합니다.",
    {
      export_decl_no: z.string().describe("수출신고번호"),
      line_no: z.string().describe("란번호"),
    },
    async ({ export_decl_no, line_no }) => {
      try {
        const items = await getReimportExportBalance(apiKeys, { expDclrNo: export_decl_no, expDclrLnNo: line_no });
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- 규격: ${i.stsz} | 잔량: ${i.rsqty}${i.rsqtyUt}`);
        return { content: [{ type: "text", text: truncate(`## 재수입 수출잔량 (${export_decl_no})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 재수입 잔량 조회", error);
      }
    },
  );

  // 36. 수출신고필증 검증 (API035)
  server.tool(
    "unipass_verify_export",
    "UNI-PASS 수출신고필증 검증 — 수출신고확인서 정보를 검증합니다.",
    {
      pubs_no: z.string().describe("수출신고확인서발급번호"),
      decl_no: z.string().describe("수출신고번호"),
      brno: z.string().describe("납세자사업자등록번호"),
      country: z.string().describe("원산지국가코드"),
      product: z.string().describe("품명"),
      weight: z.string().describe("순중량"),
    },
    async ({ pubs_no, decl_no, brno, country, product, weight }) => {
      try {
        const item = await verifyExportDeclaration(apiKeys, {
          expDclrCrfnPblsNo: pubs_no, expDclrNo: decl_no,
          txprBrno: brno, orcyCntyCd: country, prnm: product, ntwg: weight,
        });
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 수출신고필증 검증`,
          "",
          `- 건수: ${item.tCnt}`,
          `- 검증결과: ${item.vrfcRsltCn}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 수출신고필증 검증", error);
      }
    },
  );

  // 37. 수출이행내역(차대번호) 조회 (API036)
  server.tool(
    "unipass_export_by_vehicle",
    "UNI-PASS 수출이행내역(차대번호) 조회 — 차대번호로 수출이행 내역을 조회합니다.",
    {
      vehicle_no: z.string().describe("차대번호"),
    },
    async ({ vehicle_no }) => {
      try {
        const items = await getExportByVehicle(apiKeys, { cbno: vehicle_no });
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.cbno}: ${i.expDclrNo} | ${i.vhclPrgsStts}`);
        return { content: [{ type: "text", text: truncate(`## 차대번호별 수출이행 (${vehicle_no})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 차대번호 수출이행 조회", error);
      }
    },
  );

  // 38. 우편물통관 진행정보 조회 (API037)
  server.tool(
    "unipass_postal_clearance",
    "UNI-PASS 우편물통관 진행정보 조회 — 우편물구분과 우편물번호로 통관 진행정보를 조회합니다.",
    {
      postal_type: z.string().describe("우편물구분코드"),
      postal_no: z.string().describe("우편물번호"),
    },
    async ({ postal_type, postal_no }) => {
      try {
        const item = await getPostalClearance(apiKeys, postal_type, postal_no);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 우편물통관 (${postal_no})`,
          "",
          `- 우편물번호: ${item.psmtNo}`,
          `- 우편물구분: ${item.psmtKcd}`,
          `- 발송국가: ${item.sendCntyCdNm}`,
          `- 총중량: ${item.ttwg}`,
          `- 처리상태: ${item.psmtPrcsStcd}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 우편물통관 조회", error);
      }
    },
  );

  // 42. 재수출면세 이행잔량 조회 (API042)
  server.tool(
    "unipass_reexport_balance",
    "UNI-PASS 재수출면세 이행잔량 조회 — 수입신고번호로 재수출 면세 이행잔량을 조회합니다.",
    {
      import_decl_no: z.string().describe("수입신고번호"),
    },
    async ({ import_decl_no }) => {
      try {
        const items = await getReexportDutyFreeBalance(apiKeys, import_decl_no);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.impDclrNo}-${i.lnNo}: 잔량 수량 ${i.qtyRsqty} / 중량 ${i.wghtRsqty}`);
        return { content: [{ type: "text", text: truncate(`## 재수출면세 이행잔량 (${import_decl_no})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 재수출면세 잔량 조회", error);
      }
    },
  );

  // 45. 재수출조건부 수입의 수출이행 기한 조회 (API045)
  server.tool(
    "unipass_reexport_deadline",
    "UNI-PASS 재수출조건부 수입의 수출이행 기한 조회 — 수입신고번호와 란번호로 기한을 확인합니다.",
    {
      import_decl_no: z.string().describe("수입신고번호"),
      line_no: z.string().describe("란번호"),
    },
    async ({ import_decl_no, line_no }) => {
      try {
        const item = await getReexportDeadline(apiKeys, import_decl_no, line_no);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 재수출 이행기한 (${import_decl_no})`,
          "",
          `- 연장일자: ${item.xtnsDt}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 재수출 기한 조회", error);
      }
    },
  );

  // 46. 재수출 이행 완료보고 처리정보 조회 (API046)
  server.tool(
    "unipass_reexport_completion",
    "UNI-PASS 재수출 이행 완료보고 처리정보 조회 — 수입신고번호와 란번호로 이행완료 정보를 조회합니다.",
    {
      import_decl_no: z.string().describe("수입신고번호"),
      line_no: z.string().describe("란번호"),
    },
    async ({ import_decl_no, line_no }) => {
      try {
        const item = await getReexportCompletion(apiKeys, import_decl_no, line_no);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 재수출 이행완료 (${import_decl_no})`,
          "",
          `- 처리상태: ${item.reexpFffmnPrcsStcd}`,
          `- 최종이행일: ${item.reexpFfmnLastEnfrDt}`,
          `- 최종이행의무면제기록: ${item.lastReexpFfmnDtyConcRcd}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 재수출 이행완료 조회", error);
      }
    },
  );

  // 48. 담보해제 신청 처리현황 조회 (API050)
  server.tool(
    "unipass_collateral_release",
    "UNI-PASS 담보해제 신청 처리현황 조회 — 수입신고번호로 담보해제 신청 처리현황을 조회합니다.",
    {
      import_decl_no: z.string().describe("수입신고번호"),
    },
    async ({ import_decl_no }) => {
      try {
        const item = await getCollateralRelease(apiKeys, import_decl_no);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 담보해제 처리현황 (${import_decl_no})`,
          "",
          `- 처리상태: ${item.mgPrcsStcdNm}`,
          `- 승인일자: ${item.mgAprvDt}`,
          `- 신청일자: ${item.mgRqstDt}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 담보해제 조회", error);
      }
    },
  );

  // 50. 수출입신고서 정정신청 처리상태 조회 (API052)
  server.tool(
    "unipass_declaration_correction",
    "UNI-PASS 수출입신고서 정정신청 처리상태 조회 — 제출번호, 수출입구분, 정정차수로 처리상태를 조회합니다.",
    {
      submit_no: z.string().describe("전자서류제출번호"),
      imex_type: z.string().describe("수출입구분코드"),
      request_count: z.string().describe("정정요청차수"),
    },
    async ({ submit_no, imex_type, request_count }) => {
      try {
        const item = await getDeclarationCorrection(apiKeys, {
          dcshSbmtNo: submit_no, imexTpcd: imex_type, mdfyRqstDgcnt: request_count,
        });
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 정정신청 처리상태 (${submit_no})`,
          "",
          `- 처리상태코드: ${item.mdfyRqstPrcsStcd}`,
          `- 처리상태명: ${item.mdfyRqstPrcsStcdNm}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 정정신청 조회", error);
      }
    },
  );

  // 51. 적재지 검사정보 조회 (API053)
  server.tool(
    "unipass_loading_inspection",
    "UNI-PASS 적재지 검사정보 조회 — 수출신고번호로 적재지 검사 대상 여부와 완료 여부를 조회합니다.",
    {
      export_decl_no: z.string().describe("수출신고번호"),
    },
    async ({ export_decl_no }) => {
      try {
        const item = await getLoadingInspection(apiKeys, export_decl_no);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 적재지 검사정보 (${export_decl_no})`,
          "",
          `- 검사대상여부: ${item.expInscTrgtYn}`,
          `- 검사완료여부: ${item.expInscCmplYn}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 적재지 검사 조회", error);
      }
    },
  );
}
