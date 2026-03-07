#!/usr/bin/env node

/**
 * 법제처 국가법령정보센터 MCP 서버
 * 법령, 판례, 헌재결정례, 법령해석례, 행정규칙, 자치법규, 조약, 법령용어 검색/조회
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  searchLaws,
  getLawDetail,
  searchCases,
  getCaseDetail,
  searchConstitutional,
  getConstitutionalDetail,
  searchInterpretations,
  getInterpretationDetail,
  searchAdminRules,
  getAdminRuleDetail,
  searchOrdinances,
  getOrdinanceDetail,
  searchTreaties,
  getTreatyDetail,
  searchLegalTerms,
  getLegalTermDetail,
  searchEnglishLaws,
  getEnglishLawDetail,
  searchCommitteeDecisions,
  getCommitteeDecisionDetail,
  getCommitteeName,
} from "./law-api.js";

const LAW_API_OC = process.env.LAW_API_OC || "";

if (!LAW_API_OC) {
  console.error(
    "LAW_API_OC 환경변수가 설정되지 않았습니다. 법제처 API 인증코드를 설정하세요."
  );
  process.exit(1);
}

const server = new McpServer({
  name: "law-search",
  version: "3.0.0",
});

const MAX_CONTENT_LENGTH = 8000;

function truncate(text: string, max = MAX_CONTENT_LENGTH): string {
  if (text.length <= max) return text;
  return text.substring(0, max) + "\n\n... (내용이 길어 일부만 표시)";
}

function errorResponse(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : "알 수 없는 오류";
  return {
    content: [{ type: "text" as const, text: `${label} 오류: ${message}` }],
    isError: true,
  };
}

// =========================================================
// 1. 법령 검색 (law)
// =========================================================

server.tool(
  "search_laws",
  "대한민국 현행 법령(법률, 대통령령, 부령 등)을 키워드로 검색합니다.",
  {
    query: z.string().min(1).max(100).describe("검색어"),
    page: z.number().int().min(1).default(1).optional().describe("페이지 번호"),
    display: z.number().int().min(1).max(100).default(20).optional().describe("페이지당 결과 수"),
    search_type: z.enum(["law_name", "full_text"]).default("law_name").optional()
      .describe("검색 범위: law_name=법령명, full_text=본문"),
  },
  async (params) => {
    try {
      const result = await searchLaws(LAW_API_OC, {
        query: params.query,
        page: params.page ?? 1,
        display: params.display ?? 20,
        search: params.search_type === "full_text" ? 2 : 1,
      });

      if (result.items.length === 0) {
        return { content: [{ type: "text", text: `"${params.query}" 법령 검색 결과가 없습니다.` }] };
      }

      const listText = result.items
        .map((l, i) =>
          `${i + 1}. [${l.id}] ${l.lawName}${l.lawAbbreviation ? ` (${l.lawAbbreviation})` : ""}\n   ${l.lawType} | 소관: ${l.departmentName} | 시행: ${l.enforcementDate} | ${l.amendmentType}`
        )
        .join("\n\n");

      return {
        content: [{
          type: "text",
          text: `## 법령 검색 결과\n\n검색어: "${params.query}"\n총 ${result.totalCount}건 (${result.currentPage}페이지)\n\n${listText}\n\n---\n상세 조회: get_law_detail에 법령일련번호([ ] 안의 숫자)를 전달하세요.`,
        }],
      };
    } catch (error) {
      return errorResponse("법령 검색", error);
    }
  }
);

server.tool(
  "get_law_detail",
  "법령 일련번호로 법령의 조문 내용을 조회합니다.",
  {
    law_id: z.number().int().positive().describe("법령 일련번호 (search_laws 결과의 ID)"),
  },
  async (params) => {
    try {
      const d = await getLawDetail(LAW_API_OC, params.law_id);

      const parts: string[] = [
        `## ${d.lawName}`,
        "",
        `- **법령ID**: ${d.lawId}`,
        `- **법종구분**: ${d.lawType}`,
        `- **소관부처**: ${d.departmentName}`,
        `- **공포일자**: ${d.promulgationDate}`,
        `- **시행일자**: ${d.enforcementDate}`,
        `- **제개정구분**: ${d.amendmentType}`,
      ];

      if (d.articles.length > 0) {
        parts.push("", "### 조문");
        for (const a of d.articles) {
          const title = a.articleTitle ? ` (${a.articleTitle})` : "";
          parts.push("", `**제${a.articleNumber}조${title}**`, "", a.articleContent);
        }
      }

      return { content: [{ type: "text", text: truncate(parts.join("\n")) }] };
    } catch (error) {
      return errorResponse("법령 상세 조회", error);
    }
  }
);

// =========================================================
// 2. 판례 검색 (prec)
// =========================================================

server.tool(
  "search_cases",
  "대한민국 대법원/하급법원 판례를 키워드로 검색합니다.",
  {
    query: z.string().min(2).max(100).describe("검색어 (2자 이상)"),
    page: z.number().int().min(1).default(1).optional().describe("페이지 번호"),
    display: z.number().int().min(1).max(100).default(20).optional().describe("페이지당 결과 수"),
    search_type: z.enum(["case_name", "full_text"]).default("full_text").optional()
      .describe("검색 범위: case_name=사건명, full_text=전문"),
    date_from: z.string().regex(/^\d{8}$/).optional().describe("검색 시작일 (YYYYMMDD)"),
    date_to: z.string().regex(/^\d{8}$/).optional().describe("검색 종료일 (YYYYMMDD)"),
    court: z.enum(["supreme", "lower", "all"]).default("all").optional()
      .describe("법원 유형: supreme=대법원, lower=하급법원, all=전체"),
  },
  async (params) => {
    try {
      const courtMap: Record<string, string> = { supreme: "400201", lower: "400202", all: "" };
      const result = await searchCases(LAW_API_OC, {
        query: params.query,
        page: params.page ?? 1,
        display: params.display ?? 20,
        search: params.search_type === "case_name" ? 1 : 2,
        dateFrom: params.date_from,
        dateTo: params.date_to,
        court: courtMap[params.court ?? "all"],
      });

      if (result.items.length === 0) {
        return { content: [{ type: "text", text: `"${params.query}" 판례 검색 결과가 없습니다.` }] };
      }

      const listText = result.items
        .map((c, i) =>
          `${i + 1}. [${c.id}] ${c.caseName}\n   사건번호: ${c.caseNumber}\n   법원: ${c.courtName} | 선고일: ${c.decisionDate} | 선고: ${c.verdict}\n   사건종류: ${c.caseType} | 판결유형: ${c.verdictType}`
        )
        .join("\n\n");

      return {
        content: [{
          type: "text",
          text: `## 판례 검색 결과\n\n검색어: "${params.query}"\n총 ${result.totalCount}건 (${result.currentPage}페이지)\n\n${listText}\n\n---\n상세 조회: get_case_detail에 판례 ID([ ] 안의 숫자)를 전달하세요.`,
        }],
      };
    } catch (error) {
      return errorResponse("판례 검색", error);
    }
  }
);

server.tool(
  "get_case_detail",
  "판례 일련번호로 판시사항, 판결요지, 참조조문, 참조판례, 판례내용을 조회합니다.",
  {
    case_id: z.number().int().positive().describe("판례 일련번호"),
    sections: z
      .array(z.enum(["holdings", "summary", "reference_laws", "reference_cases", "content", "all"]))
      .default(["all"]).optional()
      .describe("조회할 섹션"),
  },
  async (params) => {
    try {
      const d = await getCaseDetail(LAW_API_OC, params.case_id);
      const sections = params.sections ?? ["all"];
      const showAll = sections.includes("all");

      const parts: string[] = [
        `## ${d.caseName}`,
        "",
        `- **사건번호**: ${d.caseNumber}`,
        `- **법원**: ${d.courtName}`,
        `- **선고일**: ${d.decisionDate}`,
        `- **선고**: ${d.verdict}`,
        `- **사건종류**: ${d.caseType}`,
        `- **판결유형**: ${d.verdictType}`,
      ];

      if ((showAll || sections.includes("holdings")) && d.holdings)
        parts.push("", "### 판시사항", "", d.holdings);
      if ((showAll || sections.includes("summary")) && d.summary)
        parts.push("", "### 판결요지", "", d.summary);
      if ((showAll || sections.includes("reference_laws")) && d.referenceLaws)
        parts.push("", "### 참조조문", "", d.referenceLaws);
      if ((showAll || sections.includes("reference_cases")) && d.referenceCases)
        parts.push("", "### 참조판례", "", d.referenceCases);
      if ((showAll || sections.includes("content")) && d.content)
        parts.push("", "### 판례내용", "", truncate(d.content));

      return { content: [{ type: "text", text: parts.join("\n") }] };
    } catch (error) {
      return errorResponse("판례 상세 조회", error);
    }
  }
);

// =========================================================
// 3. 헌재결정례 검색 (detc)
// =========================================================

server.tool(
  "search_constitutional",
  "헌법재판소 결정례를 키워드로 검색합니다.",
  {
    query: z.string().min(1).max(100).describe("검색어"),
    page: z.number().int().min(1).default(1).optional().describe("페이지 번호"),
    display: z.number().int().min(1).max(100).default(20).optional().describe("페이지당 결과 수"),
  },
  async (params) => {
    try {
      const result = await searchConstitutional(LAW_API_OC, {
        query: params.query,
        page: params.page ?? 1,
        display: params.display ?? 20,
      });

      if (result.items.length === 0) {
        return { content: [{ type: "text", text: `"${params.query}" 헌재결정례 검색 결과가 없습니다.` }] };
      }

      const listText = result.items
        .map((c, i) =>
          `${i + 1}. [${c.id}] ${c.caseName}\n   사건번호: ${c.caseNumber} | 종국일: ${c.conclusionDate}`
        )
        .join("\n\n");

      return {
        content: [{
          type: "text",
          text: `## 헌재결정례 검색 결과\n\n검색어: "${params.query}"\n총 ${result.totalCount}건 (${result.currentPage}페이지)\n\n${listText}\n\n---\n상세 조회: get_constitutional_detail에 일련번호([ ] 안의 숫자)를 전달하세요.`,
        }],
      };
    } catch (error) {
      return errorResponse("헌재결정례 검색", error);
    }
  }
);

server.tool(
  "get_constitutional_detail",
  "헌재결정례 일련번호로 판시사항, 결정요지, 전문 등을 조회합니다.",
  {
    detc_id: z.number().int().positive().describe("헌재결정례 일련번호"),
    sections: z
      .array(z.enum(["holdings", "decision_summary", "full_text", "reference_laws", "reference_cases", "all"]))
      .default(["holdings", "decision_summary"]).optional()
      .describe("조회할 섹션"),
  },
  async (params) => {
    try {
      const d = await getConstitutionalDetail(LAW_API_OC, params.detc_id);
      const sections = params.sections ?? ["holdings", "decision_summary"];
      const showAll = sections.includes("all");

      const parts: string[] = [
        `## ${d.caseName}`,
        "",
        `- **사건번호**: ${d.caseNumber}`,
        `- **종국일**: ${d.conclusionDate}`,
        `- **사건종류**: ${d.caseType}`,
      ];

      if ((showAll || sections.includes("holdings")) && d.holdings)
        parts.push("", "### 판시사항", "", d.holdings);
      if ((showAll || sections.includes("decision_summary")) && d.decisionSummary)
        parts.push("", "### 결정요지", "", d.decisionSummary);
      if ((showAll || sections.includes("full_text")) && d.fullText)
        parts.push("", "### 전문", "", truncate(d.fullText));
      if ((showAll || sections.includes("reference_laws")) && d.referenceLaws)
        parts.push("", "### 참조조문", "", d.referenceLaws);
      if ((showAll || sections.includes("reference_cases")) && d.referenceCases)
        parts.push("", "### 참조판례", "", d.referenceCases);

      return { content: [{ type: "text", text: parts.join("\n") }] };
    } catch (error) {
      return errorResponse("헌재결정례 상세 조회", error);
    }
  }
);

// =========================================================
// 4. 법령해석례 검색 (expc)
// =========================================================

server.tool(
  "search_interpretations",
  "법제처 법령해석례를 키워드로 검색합니다.",
  {
    query: z.string().min(1).max(100).describe("검색어"),
    page: z.number().int().min(1).default(1).optional().describe("페이지 번호"),
    display: z.number().int().min(1).max(100).default(20).optional().describe("페이지당 결과 수"),
  },
  async (params) => {
    try {
      const result = await searchInterpretations(LAW_API_OC, {
        query: params.query,
        page: params.page ?? 1,
        display: params.display ?? 20,
      });

      if (result.items.length === 0) {
        return { content: [{ type: "text", text: `"${params.query}" 법령해석례 검색 결과가 없습니다.` }] };
      }

      const listText = result.items
        .map((e, i) =>
          `${i + 1}. [${e.id}] ${e.title}\n   안건번호: ${e.caseNumber} | 질의: ${e.inquiryOrg} | 회신: ${e.replyOrg} (${e.replyDate})`
        )
        .join("\n\n");

      return {
        content: [{
          type: "text",
          text: `## 법령해석례 검색 결과\n\n검색어: "${params.query}"\n총 ${result.totalCount}건 (${result.currentPage}페이지)\n\n${listText}\n\n---\n상세 조회: get_interpretation_detail에 일련번호([ ] 안의 숫자)를 전달하세요.`,
        }],
      };
    } catch (error) {
      return errorResponse("법령해석례 검색", error);
    }
  }
);

server.tool(
  "get_interpretation_detail",
  "법령해석례 일련번호로 질의요지, 회답, 이유를 조회합니다.",
  {
    expc_id: z.number().int().positive().describe("법령해석례 일련번호"),
  },
  async (params) => {
    try {
      const d = await getInterpretationDetail(LAW_API_OC, params.expc_id);

      const parts: string[] = [
        `## ${d.title}`,
        "",
        `- **안건번호**: ${d.caseNumber}`,
        `- **해석일자**: ${d.interpretationDate}`,
        `- **해석기관**: ${d.interpretationOrg}`,
        `- **질의기관**: ${d.inquiryOrg}`,
      ];

      if (d.inquirySummary) parts.push("", "### 질의요지", "", d.inquirySummary);
      if (d.reply) parts.push("", "### 회답", "", d.reply);
      if (d.reason) parts.push("", "### 이유", "", truncate(d.reason));

      return { content: [{ type: "text", text: parts.join("\n") }] };
    } catch (error) {
      return errorResponse("법령해석례 상세 조회", error);
    }
  }
);

// =========================================================
// 5. 행정규칙 검색 (admrul)
// =========================================================

server.tool(
  "search_admin_rules",
  "행정규칙(훈령, 예규, 고시 등)을 키워드로 검색합니다.",
  {
    query: z.string().min(1).max(100).describe("검색어"),
    page: z.number().int().min(1).default(1).optional().describe("페이지 번호"),
    display: z.number().int().min(1).max(100).default(20).optional().describe("페이지당 결과 수"),
  },
  async (params) => {
    try {
      const result = await searchAdminRules(LAW_API_OC, {
        query: params.query,
        page: params.page ?? 1,
        display: params.display ?? 20,
      });

      if (result.items.length === 0) {
        return { content: [{ type: "text", text: `"${params.query}" 행정규칙 검색 결과가 없습니다.` }] };
      }

      const listText = result.items
        .map((r, i) =>
          `${i + 1}. [${r.id}] ${r.ruleName}\n   종류: ${r.ruleType} | 발령: ${r.issuanceDate} | ${r.amendmentType} | ${r.currentHistoryType}`
        )
        .join("\n\n");

      return {
        content: [{
          type: "text",
          text: `## 행정규칙 검색 결과\n\n검색어: "${params.query}"\n총 ${result.totalCount}건 (${result.currentPage}페이지)\n\n${listText}\n\n---\n상세 조회: get_admin_rule_detail에 일련번호([ ] 안의 숫자)를 전달하세요.`,
        }],
      };
    } catch (error) {
      return errorResponse("행정규칙 검색", error);
    }
  }
);

server.tool(
  "get_admin_rule_detail",
  "행정규칙 일련번호로 규칙 내용을 조회합니다.",
  {
    admrul_id: z.number().int().positive().describe("행정규칙 일련번호"),
  },
  async (params) => {
    try {
      const d = await getAdminRuleDetail(LAW_API_OC, params.admrul_id);

      const parts: string[] = [
        `## ${d.ruleName}`,
        "",
        `- **종류**: ${d.ruleType}`,
        `- **발령일자**: ${d.issuanceDate}`,
        `- **발령번호**: ${d.issuanceNumber}`,
        `- **소관부처**: ${d.departmentName}`,
        `- **제개정구분**: ${d.amendmentType}`,
      ];

      if (d.content) parts.push("", "### 내용", "", truncate(d.content));

      return { content: [{ type: "text", text: parts.join("\n") }] };
    } catch (error) {
      return errorResponse("행정규칙 상세 조회", error);
    }
  }
);

// =========================================================
// 6. 자치법규 검색 (ordin)
// =========================================================

server.tool(
  "search_ordinances",
  "지방자치단체 조례/규칙(자치법규)을 키워드로 검색합니다.",
  {
    query: z.string().min(1).max(100).describe("검색어"),
    page: z.number().int().min(1).default(1).optional().describe("페이지 번호"),
    display: z.number().int().min(1).max(100).default(20).optional().describe("페이지당 결과 수"),
    search_type: z.enum(["ordinance_name", "full_text"]).default("ordinance_name").optional()
      .describe("검색 범위: ordinance_name=자치법규명, full_text=본문"),
  },
  async (params) => {
    try {
      const result = await searchOrdinances(LAW_API_OC, {
        query: params.query,
        page: params.page ?? 1,
        display: params.display ?? 20,
        search: params.search_type === "full_text" ? 2 : 1,
      });

      if (result.items.length === 0) {
        return { content: [{ type: "text", text: `"${params.query}" 자치법규 검색 결과가 없습니다.` }] };
      }

      const listText = result.items
        .map((o, i) =>
          `${i + 1}. [${o.id}] ${o.ordinanceName}\n   ${o.ordinanceType} | ${o.localGovName} | 시행: ${o.enforcementDate} | ${o.amendmentType}`
        )
        .join("\n\n");

      return {
        content: [{
          type: "text",
          text: `## 자치법규 검색 결과\n\n검색어: "${params.query}"\n총 ${result.totalCount}건 (${result.currentPage}페이지)\n\n${listText}\n\n---\n상세 조회: get_ordinance_detail에 일련번호([ ] 안의 숫자)를 전달하세요.`,
        }],
      };
    } catch (error) {
      return errorResponse("자치법규 검색", error);
    }
  }
);

server.tool(
  "get_ordinance_detail",
  "자치법규 일련번호로 조문 내용을 조회합니다.",
  {
    ordin_id: z.number().int().positive().describe("자치법규 일련번호"),
  },
  async (params) => {
    try {
      const d = await getOrdinanceDetail(LAW_API_OC, params.ordin_id);

      const parts: string[] = [
        `## ${d.ordinanceName}`,
        "",
        `- **자치법규ID**: ${d.ordinanceId}`,
        `- **지자체**: ${d.localGovName}`,
        `- **공포일자**: ${d.promulgationDate}`,
        `- **시행일자**: ${d.enforcementDate}`,
      ];

      if (d.articles.length > 0) {
        parts.push("", "### 조문");
        for (const a of d.articles) {
          const title = a.articleTitle ? ` (${a.articleTitle})` : "";
          parts.push("", `**제${a.articleNumber}조${title}**`, "", a.articleContent);
        }
      }

      return { content: [{ type: "text", text: truncate(parts.join("\n")) }] };
    } catch (error) {
      return errorResponse("자치법규 상세 조회", error);
    }
  }
);

// =========================================================
// 7. 조약 검색 (trty)
// =========================================================

server.tool(
  "search_treaties",
  "대한민국이 체결한 조약을 키워드로 검색합니다.",
  {
    query: z.string().min(1).max(100).describe("검색어"),
    page: z.number().int().min(1).default(1).optional().describe("페이지 번호"),
    display: z.number().int().min(1).max(100).default(20).optional().describe("페이지당 결과 수"),
  },
  async (params) => {
    try {
      const result = await searchTreaties(LAW_API_OC, {
        query: params.query,
        page: params.page ?? 1,
        display: params.display ?? 20,
      });

      if (result.items.length === 0) {
        return { content: [{ type: "text", text: `"${params.query}" 조약 검색 결과가 없습니다.` }] };
      }

      const listText = result.items
        .map((t, i) =>
          `${i + 1}. [${t.id}] ${t.treatyName}\n   ${t.treatyType} | 발효: ${t.effectiveDate} | 서명: ${t.signDate} | 조약번호: ${t.treatyNumber}`
        )
        .join("\n\n");

      return {
        content: [{
          type: "text",
          text: `## 조약 검색 결과\n\n검색어: "${params.query}"\n총 ${result.totalCount}건 (${result.currentPage}페이지)\n\n${listText}\n\n---\n상세 조회: get_treaty_detail에 조약일련번호([ ] 안의 숫자)를 전달하세요.`,
        }],
      };
    } catch (error) {
      return errorResponse("조약 검색", error);
    }
  }
);

server.tool(
  "get_treaty_detail",
  "조약 일련번호로 조약 내용을 조회합니다.",
  {
    treaty_id: z.number().int().positive().describe("조약 일련번호"),
  },
  async (params) => {
    try {
      const d = await getTreatyDetail(LAW_API_OC, params.treaty_id);

      const parts: string[] = [
        `## ${d.treatyNameKo}`,
        "",
        `- **영문명**: ${d.treatyNameEn}`,
        `- **조약번호**: ${d.treatyNumber}`,
        `- **발효일**: ${d.effectiveDate}`,
        `- **서명일**: ${d.signDate}`,
        `- **체결국**: ${d.counterpartyCountry}`,
        `- **분야**: ${d.treatyField}`,
      ];

      if (d.content) parts.push("", "### 조약내용", "", truncate(d.content));

      return { content: [{ type: "text", text: parts.join("\n") }] };
    } catch (error) {
      return errorResponse("조약 상세 조회", error);
    }
  }
);

// =========================================================
// 8. 법령용어 검색 (lstrm)
// =========================================================

server.tool(
  "search_legal_terms",
  "법령에서 사용되는 용어의 정의를 검색합니다.",
  {
    query: z.string().min(1).max(100).describe("검색어"),
    page: z.number().int().min(1).default(1).optional().describe("페이지 번호"),
    display: z.number().int().min(1).max(100).default(20).optional().describe("페이지당 결과 수"),
  },
  async (params) => {
    try {
      const result = await searchLegalTerms(LAW_API_OC, {
        query: params.query,
        page: params.page ?? 1,
        display: params.display ?? 20,
      });

      if (result.items.length === 0) {
        return { content: [{ type: "text", text: `"${params.query}" 법령용어 검색 결과가 없습니다.` }] };
      }

      const listText = result.items
        .map((t, i) => `${i + 1}. [${t.id}] ${t.termName}`)
        .join("\n");

      return {
        content: [{
          type: "text",
          text: `## 법령용어 검색 결과\n\n검색어: "${params.query}"\n총 ${result.totalCount}건 (${result.currentPage}페이지)\n\n${listText}\n\n---\n상세 조회: get_legal_term_detail에 법령용어ID([ ] 안의 숫자)를 전달하세요.`,
        }],
      };
    } catch (error) {
      return errorResponse("법령용어 검색", error);
    }
  }
);

server.tool(
  "get_legal_term_detail",
  "법령용어ID로 용어의 정의와 출처를 조회합니다.",
  {
    term_id: z.string().min(1).describe("법령용어 ID"),
  },
  async (params) => {
    try {
      const d = await getLegalTermDetail(LAW_API_OC, params.term_id);

      const parts: string[] = [
        `## ${d.termName}`,
        "",
      ];

      if (d.termNameHanja && d.termNameHanja !== d.termName)
        parts.push(`- **한자**: ${d.termNameHanja}`);
      if (d.source) parts.push(`- **출처**: ${d.source}`);
      if (d.definition) parts.push("", "### 정의", "", d.definition);

      return { content: [{ type: "text", text: parts.join("\n") }] };
    } catch (error) {
      return errorResponse("법령용어 상세 조회", error);
    }
  }
);

// =========================================================
// 9. 영문법령 검색 (elaw)
// =========================================================

server.tool(
  "search_english_laws",
  "대한민국 법령의 영문 번역본을 키워드로 검색합니다.",
  {
    query: z.string().min(1).max(100).describe("검색어 (영문 또는 한글)"),
    page: z.number().int().min(1).default(1).optional().describe("페이지 번호"),
    display: z.number().int().min(1).max(100).default(20).optional().describe("페이지당 결과 수"),
  },
  async (params) => {
    try {
      const result = await searchEnglishLaws(LAW_API_OC, {
        query: params.query,
        page: params.page ?? 1,
        display: params.display ?? 20,
      });

      if (result.items.length === 0) {
        return { content: [{ type: "text", text: `"${params.query}" 영문법령 검색 결과가 없습니다.` }] };
      }

      const listText = result.items
        .map((l, i) =>
          `${i + 1}. [${l.id}] ${l.lawNameKo}\n   EN: ${l.lawNameEn}\n   ${l.lawType} | 소관: ${l.departmentName} | 시행: ${l.enforcementDate}`
        )
        .join("\n\n");

      return {
        content: [{
          type: "text",
          text: `## 영문법령 검색 결과\n\n검색어: "${params.query}"\n총 ${result.totalCount}건 (${result.currentPage}페이지)\n\n${listText}\n\n---\n상세 조회: get_english_law_detail에 법령일련번호([ ] 안의 숫자)를 전달하세요.`,
        }],
      };
    } catch (error) {
      return errorResponse("영문법령 검색", error);
    }
  }
);

server.tool(
  "get_english_law_detail",
  "영문법령 일련번호로 영문 조문 내용을 조회합니다.",
  {
    law_id: z.number().int().positive().describe("법령 일련번호 (search_english_laws 결과의 ID)"),
  },
  async (params) => {
    try {
      const d = await getEnglishLawDetail(LAW_API_OC, params.law_id);

      const parts: string[] = [
        `## ${d.lawNameEn}`,
        "",
        `- **Law ID**: ${d.lawId}`,
        `- **Promulgation Date**: ${d.promulgationDate}`,
        `- **Promulgation Number**: ${d.promulgationNumber}`,
      ];

      if (d.articles.length > 0) {
        parts.push("", "### Articles");
        for (const a of d.articles) {
          const title = a.articleTitle ? ` (${a.articleTitle})` : "";
          parts.push("", `**Article ${a.articleNumber}${title}**`, "", a.articleContent);
        }
      }

      return { content: [{ type: "text", text: truncate(parts.join("\n")) }] };
    } catch (error) {
      return errorResponse("영문법령 상세 조회", error);
    }
  }
);

// =========================================================
// 10. 위원회 결정문 (11개 위원회 통합)
// =========================================================

const COMMITTEE_ENUM = z.enum([
  "ftc", "acr", "fsc", "nlrc", "kcc", "oclt", "nhrck", "eiac", "ecc", "sfc", "iaciac",
]);

server.tool(
  "search_committee_decisions",
  "위원회 결정문을 검색합니다. 공정거래위(ftc), 국민권익위(acr), 금융위(fsc), 노동위(nlrc), 방송통신위(kcc), 토지수용위(oclt), 인권위(nhrck), 고용보험심사위(eiac), 환경분쟁조정위(ecc), 증권선물위(sfc), 산재보험재심사위(iaciac)를 지원합니다.",
  {
    committee: COMMITTEE_ENUM.describe("위원회 코드"),
    query: z.string().max(100).default("").optional()
      .describe("검색어 (일부 위원회는 빈 값으로도 조회 가능)"),
    page: z.number().int().min(1).default(1).optional().describe("페이지 번호"),
    display: z.number().int().min(1).max(100).default(20).optional().describe("페이지당 결과 수"),
  },
  async (params) => {
    try {
      const committeeName = getCommitteeName(params.committee);
      const result = await searchCommitteeDecisions(LAW_API_OC, params.committee, {
        query: params.query || "",
        page: params.page ?? 1,
        display: params.display ?? 20,
      });

      if (result.items.length === 0) {
        return { content: [{ type: "text", text: `${committeeName} 결정문 검색 결과가 없습니다.` }] };
      }

      const listText = result.items
        .map((d, i) =>
          `${i + 1}. [${d.id}] ${d.title}\n   ${d.caseNumber ? `번호: ${d.caseNumber} | ` : ""}${d.decisionDate ? `일자: ${d.decisionDate}` : ""}`
        )
        .join("\n\n");

      return {
        content: [{
          type: "text",
          text: `## ${committeeName} 결정문 검색 결과\n\n${params.query ? `검색어: "${params.query}"\n` : ""}총 ${result.totalCount}건 (${result.currentPage}페이지)\n\n${listText}\n\n---\n상세 조회: get_committee_decision_detail에 committee="${params.committee}"와 결정문일련번호([ ] 안의 숫자)를 전달하세요.`,
        }],
      };
    } catch (error) {
      return errorResponse("위원회 결정문 검색", error);
    }
  }
);

server.tool(
  "get_committee_decision_detail",
  "위원회 결정문의 상세 내용(주문, 이유 등)을 조회합니다.",
  {
    committee: COMMITTEE_ENUM.describe("위원회 코드"),
    decision_id: z.number().int().positive().describe("결정문 일련번호"),
  },
  async (params) => {
    try {
      const committeeName = getCommitteeName(params.committee);
      const d = await getCommitteeDecisionDetail(LAW_API_OC, params.committee, params.decision_id);

      const parts: string[] = [
        `## ${d.title || `${committeeName} 결정문`}`,
        "",
        `- **위원회**: ${d.agencyName || committeeName}`,
      ];

      if (d.caseNumber) parts.push(`- **사건/안건번호**: ${d.caseNumber}`);
      if (d.decisionDate) parts.push(`- **결정/의결일**: ${d.decisionDate}`);

      // 위원회별 추가 필드
      for (const [key, val] of Object.entries(d.extras)) {
        parts.push(`- **${key}**: ${val}`);
      }

      if (d.summary) parts.push("", "### 요지/개요", "", d.summary);
      if (d.ruling) parts.push("", "### 주문/조치내용", "", d.ruling);
      if (d.reason) parts.push("", "### 이유", "", truncate(d.reason));

      return { content: [{ type: "text", text: parts.join("\n") }] };
    } catch (error) {
      return errorResponse("위원회 결정문 상세 조회", error);
    }
  }
);

// --- 서버 시작 ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("MCP 서버 시작 실패:", error);
  process.exit(1);
});
