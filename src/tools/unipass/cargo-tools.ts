/**
 * 관세청 UNI-PASS 화물/컨테이너/운송 관련 MCP 도구
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getCargoTracking,
  getContainerInfo,
  getArrivalReport,
  getBondedAreaStorage,
  getShedInfo,
  getBondedTransportVehicle,
  getPortEntryExit,
  getUnloadingDeclarations,
  getSeaDeparturePermit,
  getAirDeparturePermit,
  getAirArrivalReport,
  getBondedRelease,
  getEcommerceExportLoad,
  getBondedTransportInfo,
} from "../../unipass-api.js";
import { errorResponse, truncate } from "../../shared.js";

export function registerCargoTools(
  server: McpServer,
  apiKeys: Record<string, string>,
): void {
  // 1. 화물통관진행 조회 (API001)
  server.tool(
    "unipass_track_cargo",
    "UNI-PASS 화물통관진행정보 조회 — B/L 번호로 통관 진행 상태를 확인합니다.",
    {
      bl_number: z.string().describe("B/L(선하증권) 번호"),
    },
    async ({ bl_number }) => {
      try {
        const items = await getCargoTracking(apiKeys, bl_number);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 B/L 번호의 통관 진행정보가 없습니다." }] };
        }
        const lines = items.map((i) =>
          `- [${i.prgsSttsCd}] ${i.prgsStts} | 화물번호: ${i.cargMtNo} | 일자: ${i.csclPrgsDate}`
        );
        return { content: [{ type: "text", text: `## 화물통관진행 (B/L: ${bl_number})\n\n${lines.join("\n")}` }] };
      } catch (error) {
        return errorResponse("UNI-PASS 화물통관 조회", error);
      }
    },
  );

  // 2. 컨테이너내역 조회 (API020)
  server.tool(
    "unipass_get_containers",
    "UNI-PASS 컨테이너 내역 조회 — B/L 번호로 컨테이너 정보를 조회합니다.",
    {
      bl_number: z.string().describe("B/L(선하증권) 번호"),
    },
    async ({ bl_number }) => {
      try {
        const items = await getContainerInfo(apiKeys, bl_number);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 B/L 번호의 컨테이너 정보가 없습니다." }] };
        }
        const lines = items.map((i) =>
          `- 컨테이너: ${i.cntrNo} | 크기: ${i.cntrSzCd} | 봉인: ${i.sealNo}`
        );
        return { content: [{ type: "text", text: `## 컨테이너내역 (B/L: ${bl_number})\n\n${lines.join("\n")}` }] };
      } catch (error) {
        return errorResponse("UNI-PASS 컨테이너 조회", error);
      }
    },
  );

  // 10. 입항보고내역 조회 (API021)
  server.tool(
    "unipass_get_arrival_report",
    "UNI-PASS 입항보고내역 조회 — B/L 번호로 해상 입항 보고 내역을 조회합니다.",
    {
      bl_number: z.string().describe("B/L(선하증권) 번호"),
    },
    async ({ bl_number }) => {
      try {
        const items = await getArrivalReport(apiKeys, bl_number);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 B/L 번호의 입항보고 내역이 없습니다." }] };
        }
        const lines = items.map((i) =>
          `- 선명: ${i.vydfNm} | 세관: ${i.etprCstm} | 입항일: ${i.etprDt} | Master B/L: ${i.msrm}`
        );
        return { content: [{ type: "text", text: `## 입항보고내역 (B/L: ${bl_number})\n\n${lines.join("\n")}` }] };
      } catch (error) {
        return errorResponse("UNI-PASS 입항보고 조회", error);
      }
    },
  );

  // 12. 보세구역 장치기간 조회 (API047)
  server.tool(
    "unipass_get_bonded_area",
    "UNI-PASS 보세구역 장치기간 조회 — 화물관리번호로 보세구역 장치 시작일·만료일을 조회합니다.",
    {
      cargo_no: z.string().describe("화물관리번호"),
    },
    async ({ cargo_no }) => {
      try {
        const items = await getBondedAreaStorage(apiKeys, cargo_no);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 화물번호의 보세구역 정보가 없습니다." }] };
        }
        const lines = items.map((i) =>
          `- 화물번호: ${i.cargMtNo} | 보세구역: ${i.bndAreaNm} | 장치기간: ${i.strgBgnDt} ~ ${i.strgPridExpnDt}`
        );
        return { content: [{ type: "text", text: `## 보세구역 장치기간 (${cargo_no})\n\n${lines.join("\n")}` }] };
      } catch (error) {
        return errorResponse("UNI-PASS 보세구역 조회", error);
      }
    },
  );

  // 16. 장치장 정보 조회 (API005)
  server.tool(
    "unipass_shed_info",
    "UNI-PASS 장치장 정보 조회 — 세관코드 또는 장치장코드로 장치장 정보를 조회합니다.",
    {
      customs_code: z.string().optional().describe("관할세관코드"),
      shed_code: z.string().optional().describe("장치장부호"),
    },
    async ({ customs_code, shed_code }) => {
      try {
        const items = await getShedInfo(apiKeys, { jrsdCstmCd: customs_code, snarSgn: shed_code });
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.snarSgn}: ${i.snarNm} | ${i.snarAddr}`);
        return { content: [{ type: "text", text: truncate(`## 장치장 정보\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 장치장 조회", error);
      }
    },
  );

  // 27. 보세운송차량 등록내역 조회 (API023)
  server.tool(
    "unipass_bonded_vehicle",
    "UNI-PASS 보세운송차량 등록내역 조회 — 보세운송업체부호 또는 차량번호로 조회합니다.",
    {
      btco_code: z.string().optional().describe("보세운송업체부호"),
      vehicle_no: z.string().optional().describe("차량번호"),
    },
    async ({ btco_code, vehicle_no }) => {
      try {
        const items = await getBondedTransportVehicle(apiKeys, { btcoSgn: btco_code, vhclNoSanm: vehicle_no });
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.vhclNoSanm} (${i.btcoSgn}) | ${i.bnbnTrnpEqipTpcdNm} | 사용: ${i.useYn}`);
        return { content: [{ type: "text", text: truncate(`## 보세운송차량\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 보세운송차량 조회", error);
      }
    },
  );

  // 28. 입출항보고내역 조회 (API024)
  server.tool(
    "unipass_port_entry_exit",
    "UNI-PASS 입출항보고내역 조회 — IMO번호와 입출항구분으로 입출항 내역을 조회합니다.",
    {
      imo_no: z.string().describe("선박 IMO 번호"),
      io_type: z.string().describe("입출항구분코드"),
      customs_code: z.string().optional().describe("세관부호"),
    },
    async ({ imo_no, io_type, customs_code }) => {
      try {
        const items = await getPortEntryExit(apiKeys, {
          shipCallImoNo: imo_no, seaFlghIoprTpcd: io_type, cstmSgn: customs_code,
        });
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.shipFlgtNm} | ${i.cstmNm} | 입항: ${i.etprDttm}`);
        return { content: [{ type: "text", text: truncate(`## 입출항보고내역 (IMO: ${imo_no})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 입출항보고 조회", error);
      }
    },
  );

  // 39. 하선신고 목록 조회 (API038)
  server.tool(
    "unipass_unloading_declarations",
    "UNI-PASS 하선신고 목록 조회 — 입항일자와 세관코드로 하선신고 내역을 조회합니다.",
    {
      entry_date: z.string().describe("입항일자 (YYYYMMDD)"),
      customs_code: z.string().describe("신고세관부호"),
    },
    async ({ entry_date, customs_code }) => {
      try {
        const items = await getUnloadingDeclarations(apiKeys, entry_date, customs_code);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.mrn}: ${i.shipNm} | ${i.ulvsUnairPrcsNm}`);
        return { content: [{ type: "text", text: truncate(`## 하선신고 (${entry_date})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 하선신고 조회", error);
      }
    },
  );

  // 40. 출항허가(해상) 조회 (API039)
  server.tool(
    "unipass_sea_departure",
    "UNI-PASS 출항허가(해상) 조회 — 제출번호 또는 출항허가번호로 해상 출항허가 정보를 조회합니다.",
    {
      submit_no: z.string().optional().describe("입출항제출번호"),
      permit_no: z.string().optional().describe("출항허가번호"),
    },
    async ({ submit_no, permit_no }) => {
      try {
        const item = await getSeaDeparturePermit(apiKeys, { ioprSbmtNo: submit_no, tkofPermNo: permit_no });
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 해상 출항허가`,
          "",
          `- 선명: ${item.shipFlgtNm}`,
          `- 출항일시: ${item.tkofDttm}`,
          `- 도착항: ${item.arvlCntyPortAirptCd}`,
          `- 적재중량: ${item.loadWght}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 해상 출항허가 조회", error);
      }
    },
  );

  // 41. 출항허가(항공) 조회 (API040)
  server.tool(
    "unipass_air_departure",
    "UNI-PASS 출항허가(항공) 조회 — 제출번호 또는 편명으로 항공 출항허가 정보를 조회합니다.",
    {
      submit_no: z.string().optional().describe("입출항제출번호"),
      flight: z.string().optional().describe("선기명"),
    },
    async ({ submit_no, flight }) => {
      try {
        const item = await getAirDeparturePermit(apiKeys, { ioprSbmtNo: submit_no, shipFlgtNm: flight });
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 항공 출항허가`,
          "",
          `- 편명: ${item.shipFlgtNm}`,
          `- 등록번호: ${item.airRgsrNo}`,
          `- 출항일시: ${item.tkofDttm}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 항공 출항허가 조회", error);
      }
    },
  );

  // 44. 입항보고내역(항공) 조회 (API044)
  server.tool(
    "unipass_air_arrival_report",
    "UNI-PASS 입항보고내역(항공) 조회 — 편명 또는 제출번호로 항공 입항보고 내역을 조회합니다.",
    {
      flight_name: z.string().optional().describe("항공편명"),
      submit_no: z.string().optional().describe("입출항제출번호"),
    },
    async ({ flight_name, submit_no }) => {
      try {
        const items = await getAirArrivalReport(apiKeys, { shipFlgtNm: flight_name, ioprSbmtNo: submit_no });
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.shipFlgtNm} | 세관: ${i.cstmSgn} | 입항: ${i.etprDttm}`);
        return { content: [{ type: "text", text: truncate(`## 항공 입항보고\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 항공 입항보고 조회", error);
      }
    },
  );

  // 47. 수입물품 보세구역 반출신고 조회 (API048)
  server.tool(
    "unipass_bonded_release",
    "UNI-PASS 수입물품 보세구역 반출신고 조회 — 사업자등록번호로 반출신고 여부를 확인합니다.",
    {
      business_no: z.string().describe("사업자등록번호"),
    },
    async ({ business_no }) => {
      try {
        const item = await getBondedRelease(apiKeys, business_no);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 보세구역 반출신고 (${business_no})`,
          "",
          `- 반출일자: ${item.rlbrDt}`,
          `- 반출여부: ${item.rlbrYn}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 보세구역 반출 조회", error);
      }
    },
  );

  // 49. 전자상거래수출 적재 이행 조회 (API051)
  server.tool(
    "unipass_ecommerce_export_load",
    "UNI-PASS 전자상거래수출 적재 이행 조회 — 전자상거래 수출신고번호로 적재 이행 여부를 확인합니다.",
    {
      ecommerce_decl_no: z.string().describe("전자상거래 수출신고번호"),
    },
    async ({ ecommerce_decl_no }) => {
      try {
        const item = await getEcommerceExportLoad(apiKeys, ecommerce_decl_no);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 전자상거래수출 적재이행 (${ecommerce_decl_no})`,
          "",
          `- 적재완료여부: ${item.loadCmplYn}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 전자상거래 적재 조회", error);
      }
    },
  );

  // 52. 보세운송 운송차량정보 조회 (API054)
  server.tool(
    "unipass_bonded_transport_info",
    "UNI-PASS 보세운송 운송차량정보 조회 — 조회기간과 업체부호로 배차 정보를 조회합니다.",
    {
      start_date: z.string().describe("조회시작일 (YYYYMMDD)"),
      end_date: z.string().describe("조회종료일 (YYYYMMDD)"),
      btco_code: z.string().optional().describe("보세운송업체부호"),
    },
    async ({ start_date, end_date, btco_code }) => {
      try {
        const items = await getBondedTransportInfo(apiKeys, {
          qryStrtDt: start_date, qryEndDt: end_date, btcoSgn: btco_code,
        });
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.alocPrngDclrNo}: ${i.cntrNo} | ${i.frarSnarSgnNm} → ${i.arlcSnarSgnNm}`);
        return { content: [{ type: "text", text: truncate(`## 보세운송 배차정보 (${start_date}~${end_date})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 보세운송 배차 조회", error);
      }
    },
  );
}
