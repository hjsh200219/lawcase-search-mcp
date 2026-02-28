#!/usr/bin/env node

/**
 * 대법원 판례 조회 MCP 서버
 * 법제처 국가법령정보센터 API를 활용한 판례 검색 및 상세 조회
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchCases, getCaseDetail } from "./law-api.js";

const LAW_API_OC = process.env.LAW_API_OC || "";

if (!LAW_API_OC) {
  console.error(
    "LAW_API_OC 환경변수가 설정되지 않았습니다. 법제처 API 인증코드를 설정하세요."
  );
  process.exit(1);
}

const server = new McpServer({
  name: "lawcase-search",
  version: "1.0.0",
});

// --- Tool 1: 판례 검색 ---

server.tool(
  "search_cases",
  "대한민국 대법원/하급법원 판례를 키워드로 검색합니다. 법제처 국가법령정보센터 API를 사용합니다.",
  {
    query: z.string().min(2).max(100).describe("검색어 (2자 이상)"),
    page: z.number().int().min(1).default(1).optional().describe("페이지 번호"),
    display: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20)
      .optional()
      .describe("페이지당 결과 수 (1~100)"),
    search_type: z
      .enum(["case_name", "full_text"])
      .default("full_text")
      .optional()
      .describe("검색 범위: case_name=사건명 검색, full_text=전문 검색"),
    date_from: z
      .string()
      .regex(/^\d{8}$/)
      .optional()
      .describe("검색 시작일 (YYYYMMDD)"),
    date_to: z
      .string()
      .regex(/^\d{8}$/)
      .optional()
      .describe("검색 종료일 (YYYYMMDD)"),
    court: z
      .enum(["supreme", "lower", "all"])
      .default("all")
      .optional()
      .describe("법원 유형: supreme=대법원, lower=하급법원, all=전체"),
  },
  async (params) => {
    try {
      const courtMap: Record<string, string> = {
        supreme: "400201",
        lower: "400202",
        all: "",
      };

      const searchTypeMap: Record<string, 1 | 2> = {
        case_name: 1,
        full_text: 2,
      };

      const result = await searchCases(LAW_API_OC, {
        query: params.query,
        page: params.page ?? 1,
        display: params.display ?? 20,
        search: searchTypeMap[params.search_type ?? "full_text"],
        dateFrom: params.date_from,
        dateTo: params.date_to,
        court: courtMap[params.court ?? "all"],
      });

      if (result.cases.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `"${params.query}" 검색 결과가 없습니다.`,
            },
          ],
        };
      }

      const casesText = result.cases
        .map(
          (c, i) =>
            `${i + 1}. [${c.id}] ${c.caseName}\n   사건번호: ${c.caseNumber}\n   법원: ${c.courtName} | 선고일: ${c.decisionDate} | 선고: ${c.verdict}\n   사건종류: ${c.caseType} | 판결유형: ${c.verdictType}`
        )
        .join("\n\n");

      const text = `## 판례 검색 결과\n\n검색어: "${params.query}"\n총 ${result.totalCount}건 (${result.currentPage}페이지)\n\n${casesText}\n\n---\n상세 조회하려면 get_case_detail 도구에 판례 ID([ ] 안의 숫자)를 전달하세요.`;

      return { content: [{ type: "text", text }] };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "알 수 없는 오류";
      return {
        content: [{ type: "text", text: `판례 검색 오류: ${message}` }],
        isError: true,
      };
    }
  }
);

// --- Tool 2: 판례 상세 조회 ---

server.tool(
  "get_case_detail",
  "판례 일련번호로 판례의 상세 내용(판시사항, 판결요지, 참조조문, 참조판례, 판례내용)을 조회합니다.",
  {
    case_id: z
      .number()
      .int()
      .positive()
      .describe("판례 일련번호 (search_cases 결과의 ID)"),
    sections: z
      .array(
        z.enum([
          "holdings",
          "summary",
          "reference_laws",
          "reference_cases",
          "content",
          "all",
        ])
      )
      .default(["all"])
      .optional()
      .describe(
        "조회할 섹션: holdings=판시사항, summary=판결요지, reference_laws=참조조문, reference_cases=참조판례, content=판례내용, all=전체"
      ),
  },
  async (params) => {
    try {
      const detail = await getCaseDetail(LAW_API_OC, params.case_id);
      const sections = params.sections ?? ["all"];
      const showAll = sections.includes("all");

      const parts: string[] = [
        `## ${detail.caseName}`,
        "",
        `- **사건번호**: ${detail.caseNumber}`,
        `- **법원**: ${detail.courtName}`,
        `- **선고일**: ${detail.decisionDate}`,
        `- **선고**: ${detail.verdict}`,
        `- **사건종류**: ${detail.caseType}`,
        `- **판결유형**: ${detail.verdictType}`,
      ];

      if ((showAll || sections.includes("holdings")) && detail.holdings) {
        parts.push("", "### 판시사항", "", detail.holdings);
      }

      if ((showAll || sections.includes("summary")) && detail.summary) {
        parts.push("", "### 판결요지", "", detail.summary);
      }

      if (
        (showAll || sections.includes("reference_laws")) &&
        detail.referenceLaws
      ) {
        parts.push("", "### 참조조문", "", detail.referenceLaws);
      }

      if (
        (showAll || sections.includes("reference_cases")) &&
        detail.referenceCases
      ) {
        parts.push("", "### 참조판례", "", detail.referenceCases);
      }

      if ((showAll || sections.includes("content")) && detail.content) {
        const truncated =
          detail.content.length > 8000
            ? detail.content.substring(0, 8000) + "\n\n... (내용이 길어 일부만 표시)"
            : detail.content;
        parts.push("", "### 판례내용", "", truncated);
      }

      return { content: [{ type: "text", text: parts.join("\n") }] };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "알 수 없는 오류";
      return {
        content: [{ type: "text", text: `판례 상세 조회 오류: ${message}` }],
        isError: true,
      };
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
