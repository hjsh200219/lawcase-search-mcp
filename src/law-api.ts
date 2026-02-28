/**
 * 법제처 국가법령정보센터 판례 API 클라이언트
 * lawfirmtong 프로젝트의 cases.ts를 MCP용으로 독립 구현
 */

import type {
  CaseSearchParams,
  CaseSearchResult,
  CaseListItem,
  CaseDetail,
  LawApiCaseListItem,
  LawApiCaseListResponse,
  LawApiCaseDetail,
  LawApiCaseDetailResponse,
} from "./types.js";

const BASE_URL = "http://www.law.go.kr/DRF";
const TIMEOUT_MS = 15000;

function stripHtmlTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildSearchUrl(oc: string, params: CaseSearchParams): string {
  const url = new URL(`${BASE_URL}/lawSearch.do`);

  url.searchParams.set("OC", oc);
  url.searchParams.set("target", "prec");
  url.searchParams.set("type", "JSON");
  url.searchParams.set("query", params.query);
  url.searchParams.set("display", String(params.display || 20));
  url.searchParams.set("page", String(params.page || 1));

  if (params.search) {
    url.searchParams.set("search", String(params.search));
  }
  if (params.sort) {
    url.searchParams.set("sort", params.sort);
  }
  if (params.dateFrom || params.dateTo) {
    const from = params.dateFrom || "";
    const to = params.dateTo || "";
    url.searchParams.set("prncYd", `${from}~${to}`);
  }
  if (params.court) {
    url.searchParams.set("org", params.court);
  }

  return url.toString();
}

function buildDetailUrl(oc: string, id: number): string {
  const url = new URL(`${BASE_URL}/lawService.do`);

  url.searchParams.set("OC", oc);
  url.searchParams.set("target", "prec");
  url.searchParams.set("type", "JSON");
  url.searchParams.set("ID", String(id));

  return url.toString();
}

function normalizeCaseListItem(raw: LawApiCaseListItem): CaseListItem {
  return {
    id: Number(raw.판례일련번호),
    caseName: String(raw.사건명 || ""),
    caseNumber: String(raw.사건번호 || ""),
    decisionDate: String(raw.선고일자 || ""),
    courtName: String(raw.법원명 || ""),
    caseType: String(raw.사건종류명 || ""),
    verdictType: String(raw.판결유형 || ""),
    verdict: String(raw.선고 || ""),
    detailLink: String(raw.판례상세링크 || ""),
  };
}

function normalizeCaseDetail(raw: LawApiCaseDetail): CaseDetail {
  return {
    id: Number(raw.판례정보일련번호),
    caseName: String(raw.사건명 || ""),
    caseNumber: String(raw.사건번호 || ""),
    decisionDate: String(raw.선고일자 || ""),
    verdict: String(raw.선고 || ""),
    courtName: String(raw.법원명 || ""),
    caseType: String(raw.사건종류명 || ""),
    verdictType: String(raw.판결유형 || ""),
    holdings: stripHtmlTags(String(raw.판시사항 || "")),
    summary: stripHtmlTags(String(raw.판결요지 || "")),
    referenceLaws: stripHtmlTags(String(raw.참조조문 || "")),
    referenceCases: stripHtmlTags(String(raw.참조판례 || "")),
    content: stripHtmlTags(String(raw.판례내용 || "")),
  };
}

function normalizeListResponse(
  raw: LawApiCaseListResponse["PrecSearch"]["prec"]
): LawApiCaseListItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return [raw];
}

function assertJsonResponse(response: Response): void {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("json")) {
    throw new Error(
      `법제처 API가 JSON이 아닌 응답을 반환했습니다 (${contentType || "content-type 없음"}). API가 일시적으로 불가능할 수 있습니다.`
    );
  }
}

export async function searchCases(
  oc: string,
  params: CaseSearchParams
): Promise<CaseSearchResult> {
  const url = buildSearchUrl(oc, params);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`법제처 API 오류: HTTP ${response.status}`);
    }

    assertJsonResponse(response);

    const data: LawApiCaseListResponse = await response.json();
    const rawList = normalizeListResponse(data?.PrecSearch?.prec);

    return {
      totalCount: Number(data?.PrecSearch?.totalCnt || 0),
      currentPage: Number(data?.PrecSearch?.page || params.page || 1),
      cases: rawList.map(normalizeCaseListItem),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getCaseDetail(
  oc: string,
  id: number
): Promise<CaseDetail> {
  const url = buildDetailUrl(oc, id);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`법제처 API 오류: HTTP ${response.status}`);
    }

    assertJsonResponse(response);

    const data: LawApiCaseDetailResponse = await response.json();

    if (!data?.PrecService) {
      throw new Error("판례를 찾을 수 없습니다");
    }

    return normalizeCaseDetail(data.PrecService);
  } finally {
    clearTimeout(timeout);
  }
}
