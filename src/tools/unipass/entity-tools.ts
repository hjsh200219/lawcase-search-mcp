/**
 * 관세청 UNI-PASS 업체/인력 관련 MCP 도구
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  searchCompany,
  searchBroker,
  searchAnimalPlantCompany,
  getForwarderList,
  getForwarderDetail,
  getAirlineList,
  getAirlineDetail,
  getOverseasSupplier,
  getBrokerDetail,
  getShipCompanyList,
  getShipCompanyDetail,
} from "../../unipass-api.js";
import { errorResponse, truncate } from "../../shared.js";

export function registerEntityTools(
  server: McpServer,
  apiKeys: Record<string, string>,
): void {
  // 7. 통관업체 조회 (API010)
  server.tool(
    "unipass_search_company",
    "UNI-PASS 통관업체 조회 — 업체명으로 통관고유부호 업체를 검색합니다.",
    {
      query: z.string().describe("검색할 업체명"),
    },
    async ({ query }) => {
      try {
        const items = await searchCompany(apiKeys, query);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 업체명의 검색 결과가 없습니다." }] };
        }
        const lines = items.map((i) =>
          `- ${i.conmNm} (${i.ecm}) | 사업자번호: ${i.bsnsNo} | ${i.bslcBscsAddr} | 사용여부: ${i.useYn}`
        );
        return { content: [{ type: "text", text: truncate(`## 통관업체 검색 (${query})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 통관업체 조회", error);
      }
    },
  );

  // 8. 관세사 조회 (API013)
  server.tool(
    "unipass_search_broker",
    "UNI-PASS 관세사 조회 — 관세사명으로 관세사 정보를 검색합니다.",
    {
      query: z.string().describe("검색할 관세사명"),
    },
    async ({ query }) => {
      try {
        const items = await searchBroker(apiKeys, query);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 관세사의 검색 결과가 없습니다." }] };
        }
        const lines = items.map((i) =>
          `- ${i.lcaNm} (${i.lcaSgn}) | 세관: ${i.cstmNm} (${i.cstmSgn})`
        );
        return { content: [{ type: "text", text: truncate(`## 관세사 검색 (${query})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 관세사 조회", error);
      }
    },
  );

  // 11. 농림축산검역 업체코드 조회 (API033)
  server.tool(
    "unipass_search_animal_plant_company",
    "UNI-PASS 농림축산검역 업체 조회 — 업체명으로 농림축산검역본부 등록 업체를 검색합니다.",
    {
      company_name: z.string().describe("검색할 업체명"),
    },
    async ({ company_name }) => {
      try {
        const items = await searchAnimalPlantCompany(apiKeys, company_name);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "해당 업체명의 검색 결과가 없습니다." }] };
        }
        const lines = items.map((i) =>
          `- ${i.bsntNm} (${i.bsntCd}) | ${i.bsntAddr}`
        );
        return { content: [{ type: "text", text: truncate(`## 농림축산검역 업체 (${company_name})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 농림축산업체 조회", error);
      }
    },
  );

  // 17. 화물운송주선업자 목록 조회 (API006)
  server.tool(
    "unipass_forwarder_list",
    "UNI-PASS 화물운송주선업자 목록 조회 — 업체명으로 포워더를 검색합니다.",
    {
      name: z.string().describe("포워더 업체명"),
    },
    async ({ name }) => {
      try {
        const items = await getForwarderList(apiKeys, name);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.frwrSgn}: ${i.frwrKoreNm} (${i.frwrEnglNm})`);
        return { content: [{ type: "text", text: truncate(`## 포워더 목록 (${name})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 포워더 목록 조회", error);
      }
    },
  );

  // 18. 화물운송주선업자 내역 조회 (API007)
  server.tool(
    "unipass_forwarder_detail",
    "UNI-PASS 화물운송주선업자 내역 조회 — 포워더 부호로 상세 내역을 조회합니다.",
    {
      forwarder_code: z.string().describe("포워더 부호"),
    },
    async ({ forwarder_code }) => {
      try {
        const item = await getForwarderDetail(apiKeys, forwarder_code);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 포워더 내역 (${forwarder_code})`,
          "",
          `- 부호: ${item.frwrSgn}`,
          `- 한글상호: ${item.koreConmNm}`,
          `- 영문상호: ${item.englConmNm}`,
          `- 본점주소: ${item.hdofAddr}`,
          `- 전화번호: ${item.telNo}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 포워더 내역 조회", error);
      }
    },
  );

  // 19. 항공사 목록 조회 (API008)
  server.tool(
    "unipass_airline_list",
    "UNI-PASS 항공사 목록 조회 — 항공사명으로 항공사를 검색합니다.",
    {
      name: z.string().describe("항공사명"),
    },
    async ({ name }) => {
      try {
        const items = await getAirlineList(apiKeys, name);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.flcoSgn}: ${i.flcoKoreNm} (${i.flcoEnglNm})`);
        return { content: [{ type: "text", text: truncate(`## 항공사 목록 (${name})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 항공사 목록 조회", error);
      }
    },
  );

  // 20. 항공사 내역 조회 (API009)
  server.tool(
    "unipass_airline_detail",
    "UNI-PASS 항공사 내역 조회 — 항공사 부호로 상세 내역을 조회합니다.",
    {
      airline_code: z.string().describe("항공사 부호"),
    },
    async ({ airline_code }) => {
      try {
        const item = await getAirlineDetail(apiKeys, airline_code);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 항공사 내역 (${airline_code})`,
          "",
          `- 영문부호: ${item.flcoEnglSgn}`,
          `- 한글상호: ${item.flcoKoreConm}`,
          `- 영문상호: ${item.flcoEnglConm}`,
          `- 국가명: ${item.cntyNm}`,
          `- 전화번호: ${item.telno}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 항공사 내역 조회", error);
      }
    },
  );

  // 21. 해외공급자부호 조회 (API011)
  server.tool(
    "unipass_overseas_supplier",
    "UNI-PASS 해외공급자부호 조회 — 국가코드와 업체명으로 해외공급자를 검색합니다.",
    {
      country_code: z.string().describe("국가부호 (예: US, CN, JP)"),
      company_name: z.string().describe("해외 업체명"),
    },
    async ({ country_code, company_name }) => {
      try {
        const items = await getOverseasSupplier(apiKeys, country_code, company_name);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.ovrsSplrSgn}: ${i.splrConm} (${i.englCntyNm})`);
        return { content: [{ type: "text", text: truncate(`## 해외공급자 (${country_code}, ${company_name})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 해외공급자 조회", error);
      }
    },
  );

  // 22. 관세사 내역 조회 (API014)
  server.tool(
    "unipass_broker_detail",
    "UNI-PASS 관세사 내역 조회 — 관세사 부호로 상세 내역을 조회합니다.",
    {
      lca_code: z.string().describe("관세사 부호"),
    },
    async ({ lca_code }) => {
      try {
        const item = await getBrokerDetail(apiKeys, lca_code);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 관세사 내역 (${lca_code})`,
          "",
          `- 관세사부호: ${item.lcaSgn}`,
          `- 상호: ${item.lcaConm}`,
          `- 관할세관: ${item.jrsdCstmNm}`,
          `- 주소: ${item.addr}`,
          `- 전화번호: ${item.telNo}`,
          `- 대표자: ${item.rppnNm}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 관세사 내역 조회", error);
      }
    },
  );

  // 30. 선박회사 목록 조회 (API026)
  server.tool(
    "unipass_ship_company_list",
    "UNI-PASS 선박회사 목록 조회 — 선사명으로 선박회사를 검색합니다.",
    {
      name: z.string().describe("선박회사명"),
    },
    async ({ name }) => {
      try {
        const items = await getShipCompanyList(apiKeys, name);
        if (items.length === 0) {
          return { content: [{ type: "text", text: "결과가 없습니다." }] };
        }
        const lines = items.map((i) => `- ${i.shipCoSgn}: ${i.shipCoKoreNm} (${i.shipCoEnglNm})`);
        return { content: [{ type: "text", text: truncate(`## 선박회사 목록 (${name})\n\n${lines.join("\n")}`) }] };
      } catch (error) {
        return errorResponse("UNI-PASS 선박회사 목록 조회", error);
      }
    },
  );

  // 31. 선박회사 내역 조회 (API027)
  server.tool(
    "unipass_ship_company_detail",
    "UNI-PASS 선박회사 내역 조회 — 선사 부호로 상세 내역을 조회합니다.",
    {
      ship_company_code: z.string().describe("선사 부호"),
    },
    async ({ ship_company_code }) => {
      try {
        const item = await getShipCompanyDetail(apiKeys, ship_company_code);
        if (!item) {
          return { content: [{ type: "text", text: "결과를 찾을 수 없습니다." }] };
        }
        const text = [
          `## 선박회사 내역 (${ship_company_code})`,
          "",
          `- 대리점명: ${item.shipAgncNm}`,
          `- 국가명: ${item.cntyNm}`,
          `- 사업자번호: ${item.brno}`,
          `- 본점주소: ${item.hdofAddr}`,
          `- 전화번호: ${item.telno}`,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return errorResponse("UNI-PASS 선박회사 내역 조회", error);
      }
    },
  );
}
