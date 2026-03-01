/**
 * 법제처 국가법령정보센터 API 클라이언트
 * XML 기반 - 모든 target 지원
 */

import { XMLParser } from "fast-xml-parser";
import type {
  SearchParams,
  CaseSearchParams,
  LawSearchParams,
  OrdinSearchParams,
  SearchResult,
  LawListItem,
  LawArticle,
  LawDetail,
  CaseListItem,
  CaseDetail,
  ConstitutionalListItem,
  ConstitutionalDetail,
  InterpretationListItem,
  InterpretationDetail,
  AdminRuleListItem,
  AdminRuleDetail,
  OrdinanceListItem,
  OrdinanceArticle,
  OrdinanceDetail,
  TreatyListItem,
  TreatyDetail,
  LegalTermListItem,
  LegalTermDetail,
  ElawListItem,
  ElawArticle,
  ElawDetail,
  CommitteeDecisionListItem,
  CommitteeDecisionDetail,
} from "./types.js";

const BASE_URL = "http://www.law.go.kr/DRF";
const TIMEOUT_MS = 30000;
const REQUEST_INTERVAL_MS = 1000; // 요청 간 최소 1초 간격
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 3000; // 재시도 시 기본 대기 3초 (지수 백오프)

let lastRequestTime = 0;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (name) => {
    // 목록 응답에서 단일 결과일 때 배열로 강제
    const arrayTags = [
      "law", "prec", "Detc", "expc", "admrul", "Trty", "lstrm",
      "조문단위", "조", "Jo",
      "ftc", "acr", "fsc", "nlrc", "kcc", "oclt", "nhrck", "eiac", "ecc", "sfc", "iaciac",
    ];
    return arrayTags.includes(name);
  },
});

// --- 공통 유틸리티 ---

function stripHtmlTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&middot;/g, "·")
    .replace(/&hellip;/g, "…")
    .replace(/&#\d+;/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function num(v: unknown): number {
  return Number(v) || 0;
}

function ensureArray<T>(v: T | T[] | null | undefined): T[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v];
}

async function throttle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, REQUEST_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

async function fetchXml(url: string): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    await throttle();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });

      // rate limit 응답 시 재시도
      if (response.status === 429 || response.status === 503) {
        clearTimeout(timeout);
        if (attempt < MAX_RETRIES) {
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
          console.error(`법제처 API 요청 제한 (HTTP ${response.status}), ${delay / 1000}초 후 재시도... (${attempt + 1}/${MAX_RETRIES})`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`법제처 API 요청 제한: ${MAX_RETRIES}회 재시도 후에도 실패했습니다. 잠시 후 다시 시도해주세요.`);
      }

      if (!response.ok) {
        clearTimeout(timeout);
        // 서버 오류(5xx)도 재시도
        if (response.status >= 500 && attempt < MAX_RETRIES) {
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
          console.error(`법제처 API 서버 오류 (HTTP ${response.status}), ${delay / 1000}초 후 재시도... (${attempt + 1}/${MAX_RETRIES})`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`법제처 API 오류: HTTP ${response.status}`);
      }

      const text = await response.text();

      // 빈 응답도 rate limit일 수 있음
      if (!text || text.trim() === "") {
        clearTimeout(timeout);
        if (attempt < MAX_RETRIES) {
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
          console.error(`법제처 API 빈 응답, ${delay / 1000}초 후 재시도... (${attempt + 1}/${MAX_RETRIES})`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error("법제처 API가 빈 응답을 반환했습니다. 요청 제한일 수 있습니다. 잠시 후 다시 시도해주세요.");
      }

      return xmlParser.parse(text) as Record<string, unknown>;
    } catch (err) {
      clearTimeout(timeout);
      // AbortError(타임아웃)도 재시도
      if (err instanceof DOMException && err.name === "AbortError" && attempt < MAX_RETRIES) {
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
        console.error(`법제처 API 타임아웃, ${delay / 1000}초 후 재시도... (${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("법제처 API 요청 실패: 최대 재시도 횟수를 초과했습니다.");
}

function buildSearchUrl(
  oc: string,
  target: string,
  params: SearchParams
): string {
  const url = new URL(`${BASE_URL}/lawSearch.do`);
  url.searchParams.set("OC", oc);
  url.searchParams.set("target", target);
  url.searchParams.set("type", "XML");
  url.searchParams.set("query", params.query);
  url.searchParams.set("display", String(params.display || 20));
  url.searchParams.set("page", String(params.page || 1));
  if (params.sort) url.searchParams.set("sort", params.sort);
  return url.toString();
}

function buildDetailUrl(
  oc: string,
  target: string,
  idParam: string,
  idValue: string | number
): string {
  const url = new URL(`${BASE_URL}/lawService.do`);
  url.searchParams.set("OC", oc);
  url.searchParams.set("target", target);
  url.searchParams.set("type", "XML");
  url.searchParams.set(idParam, String(idValue));
  return url.toString();
}

// =========================================================
// 법령 (law)
// =========================================================

export async function searchLaws(
  oc: string,
  params: LawSearchParams
): Promise<SearchResult<LawListItem>> {
  const url = buildSearchUrl(oc, "law", params);
  if (params.search) {
    const u = new URL(url);
    u.searchParams.set("search", String(params.search));
    if (params.org) u.searchParams.set("org", params.org);
    const data = await fetchXml(u.toString());
    return normalizeLawList(data, params.page);
  }
  const data = await fetchXml(url);
  return normalizeLawList(data, params.page);
}

function normalizeLawList(
  data: Record<string, unknown>,
  page?: number
): SearchResult<LawListItem> {
  const root = data.LawSearch as Record<string, unknown> | undefined;
  if (!root) return { totalCount: 0, currentPage: page || 1, items: [] };

  const rawList = ensureArray(root.law as Record<string, unknown>[]);
  return {
    totalCount: num(root.totalCnt),
    currentPage: num(root.page) || page || 1,
    items: rawList.map((raw) => ({
      id: num(raw.법령일련번호),
      lawName: str(raw.법령명한글),
      lawAbbreviation: str(raw.법령약칭명),
      lawId: str(raw.법령ID),
      promulgationDate: str(raw.공포일자),
      promulgationNumber: str(raw.공포번호),
      amendmentType: str(raw.제개정구분명),
      departmentName: str(raw.소관부처명),
      lawType: str(raw.법령구분명),
      enforcementDate: str(raw.시행일자),
      currentHistoryCode: str(raw.현행연혁코드),
      detailLink: str(raw.법령상세링크),
    })),
  };
}

export async function getLawDetail(
  oc: string,
  id: number
): Promise<LawDetail> {
  const url = buildDetailUrl(oc, "law", "MST", id);
  const data = await fetchXml(url);

  const root = data["법령"] as Record<string, unknown> | undefined;
  if (!root) throw new Error("법령을 찾을 수 없습니다");

  const basic = root["기본정보"] as Record<string, unknown> || {};
  const articles = root["조문"] as Record<string, unknown> | undefined;

  const rawArticles = articles
    ? ensureArray(articles["조문단위"] as Record<string, unknown>[])
    : [];

  return {
    lawId: str(basic["법령ID"]),
    lawName: str(basic["법령명_한글"]),
    lawType: str(basic["법종구분"]),
    departmentName: str(basic["소관부처"]),
    enforcementDate: str(basic["시행일자"]),
    promulgationDate: str(basic["공포일자"]),
    promulgationNumber: str(basic["공포번호"]),
    amendmentType: str(basic["제개정구분"]),
    articles: rawArticles
      .filter((a) => str(a["조문여부"]) === "조문")
      .map((a) => ({
        articleNumber: str(a["조문번호"]),
        articleTitle: str(a["조문제목"]),
        articleContent: stripHtmlTags(str(a["조문내용"])),
      })),
  };
}

// =========================================================
// 판례 (prec)
// =========================================================

export async function searchCases(
  oc: string,
  params: CaseSearchParams
): Promise<SearchResult<CaseListItem>> {
  let url = buildSearchUrl(oc, "prec", params);
  const u = new URL(url);
  if (params.search) u.searchParams.set("search", String(params.search));
  if (params.dateFrom || params.dateTo) {
    u.searchParams.set("prncYd", `${params.dateFrom || ""}~${params.dateTo || ""}`);
  }
  if (params.court) u.searchParams.set("org", params.court);
  url = u.toString();

  const data = await fetchXml(url);
  const root = data.PrecSearch as Record<string, unknown> | undefined;
  if (!root) return { totalCount: 0, currentPage: params.page || 1, items: [] };

  const rawList = ensureArray(root.prec as Record<string, unknown>[]);
  return {
    totalCount: num(root.totalCnt),
    currentPage: num(root.page) || params.page || 1,
    items: rawList.map((raw) => ({
      id: num(raw.판례일련번호),
      caseName: str(raw.사건명),
      caseNumber: str(raw.사건번호),
      decisionDate: str(raw.선고일자),
      courtName: str(raw.법원명),
      caseType: str(raw.사건종류명),
      verdictType: str(raw.판결유형),
      verdict: str(raw.선고),
      detailLink: str(raw.판례상세링크),
    })),
  };
}

export async function getCaseDetail(
  oc: string,
  id: number
): Promise<CaseDetail> {
  const url = buildDetailUrl(oc, "prec", "ID", id);
  const data = await fetchXml(url);

  const root = data.PrecService as Record<string, unknown> | undefined;
  if (!root) throw new Error("판례를 찾을 수 없습니다");

  return {
    id: num(root.판례정보일련번호 || root.판례일련번호),
    caseName: str(root.사건명),
    caseNumber: str(root.사건번호),
    decisionDate: str(root.선고일자),
    verdict: str(root.선고),
    courtName: str(root.법원명),
    caseType: str(root.사건종류명),
    verdictType: str(root.판결유형),
    holdings: stripHtmlTags(str(root.판시사항)),
    summary: stripHtmlTags(str(root.판결요지)),
    referenceLaws: stripHtmlTags(str(root.참조조문)),
    referenceCases: stripHtmlTags(str(root.참조판례)),
    content: stripHtmlTags(str(root.판례내용)),
  };
}

// =========================================================
// 헌재결정례 (detc)
// =========================================================

export async function searchConstitutional(
  oc: string,
  params: SearchParams
): Promise<SearchResult<ConstitutionalListItem>> {
  const url = buildSearchUrl(oc, "detc", params);
  const data = await fetchXml(url);

  const root = data.DetcSearch as Record<string, unknown> | undefined;
  if (!root) return { totalCount: 0, currentPage: params.page || 1, items: [] };

  const rawList = ensureArray(root.Detc as Record<string, unknown>[]);
  return {
    totalCount: num(root.totalCnt),
    currentPage: num(root.page) || params.page || 1,
    items: rawList.map((raw) => ({
      id: num(raw.헌재결정례일련번호),
      conclusionDate: str(raw.종국일자),
      caseNumber: str(raw.사건번호),
      caseName: str(raw.사건명),
      detailLink: str(raw.헌재결정례상세링크),
    })),
  };
}

export async function getConstitutionalDetail(
  oc: string,
  id: number
): Promise<ConstitutionalDetail> {
  const url = buildDetailUrl(oc, "detc", "ID", id);
  const data = await fetchXml(url);

  const root = data.DetcService as Record<string, unknown> | undefined;
  if (!root) throw new Error("헌재결정례를 찾을 수 없습니다");

  return {
    id: num(root.헌재결정례일련번호),
    conclusionDate: str(root.종국일자),
    caseNumber: str(root.사건번호),
    caseName: str(root.사건명),
    caseType: str(root.사건종류명),
    holdings: stripHtmlTags(str(root.판시사항)),
    decisionSummary: stripHtmlTags(str(root.결정요지)),
    fullText: stripHtmlTags(str(root.전문)),
    referenceLaws: stripHtmlTags(str(root.참조조문)),
    referenceCases: stripHtmlTags(str(root.참조판례)),
  };
}

// =========================================================
// 법령해석례 (expc)
// =========================================================

export async function searchInterpretations(
  oc: string,
  params: SearchParams
): Promise<SearchResult<InterpretationListItem>> {
  const url = buildSearchUrl(oc, "expc", params);
  const data = await fetchXml(url);

  const root = data.Expc as Record<string, unknown> | undefined;
  if (!root) return { totalCount: 0, currentPage: params.page || 1, items: [] };

  const rawList = ensureArray(root.expc as Record<string, unknown>[]);
  return {
    totalCount: num(root.totalCnt),
    currentPage: num(root.page) || params.page || 1,
    items: rawList.map((raw) => ({
      id: num(raw.법령해석례일련번호),
      title: str(raw.안건명),
      caseNumber: str(raw.안건번호),
      inquiryOrg: str(raw.질의기관명),
      replyOrg: str(raw.회신기관명),
      replyDate: str(raw.회신일자),
      detailLink: str(raw.법령해석례상세링크),
    })),
  };
}

export async function getInterpretationDetail(
  oc: string,
  id: number
): Promise<InterpretationDetail> {
  const url = buildDetailUrl(oc, "expc", "ID", id);
  const data = await fetchXml(url);

  const root = data.ExpcService as Record<string, unknown> | undefined;
  if (!root) throw new Error("법령해석례를 찾을 수 없습니다");

  return {
    id: num(root.법령해석례일련번호),
    title: str(root.안건명),
    caseNumber: str(root.안건번호),
    interpretationDate: str(root.해석일자),
    interpretationOrg: str(root.해석기관명),
    inquiryOrg: str(root.질의기관명),
    inquirySummary: stripHtmlTags(str(root.질의요지)),
    reply: stripHtmlTags(str(root.회답)),
    reason: stripHtmlTags(str(root.이유)),
  };
}

// =========================================================
// 행정규칙 (admrul)
// =========================================================

export async function searchAdminRules(
  oc: string,
  params: SearchParams
): Promise<SearchResult<AdminRuleListItem>> {
  const url = buildSearchUrl(oc, "admrul", params);
  const data = await fetchXml(url);

  const root = data.AdmRulSearch as Record<string, unknown> | undefined;
  if (!root) return { totalCount: 0, currentPage: params.page || 1, items: [] };

  const rawList = ensureArray(root.admrul as Record<string, unknown>[]);
  return {
    totalCount: num(root.totalCnt),
    currentPage: num(root.page) || params.page || 1,
    items: rawList.map((raw) => ({
      id: num(raw.행정규칙일련번호),
      ruleName: str(raw.행정규칙명),
      ruleType: str(raw.행정규칙종류),
      issuanceDate: str(raw.발령일자),
      issuanceNumber: str(raw.발령번호),
      departmentName: str(raw.소관부처명),
      currentHistoryType: str(raw.현행연혁구분),
      amendmentType: str(raw.제개정구분명),
      ruleId: str(raw.행정규칙ID),
      enforcementDate: str(raw.시행일자),
      detailLink: str(raw.행정규칙상세링크),
    })),
  };
}

export async function getAdminRuleDetail(
  oc: string,
  id: number
): Promise<AdminRuleDetail> {
  const url = buildDetailUrl(oc, "admrul", "ID", id);
  const data = await fetchXml(url);

  const root = data.AdmRulService as Record<string, unknown> | undefined;
  if (!root) throw new Error("행정규칙을 찾을 수 없습니다");

  const basic = root["행정규칙기본정보"] as Record<string, unknown> || root;

  return {
    id: num(basic.행정규칙일련번호),
    ruleName: str(basic.행정규칙명),
    ruleType: str(basic.행정규칙종류),
    issuanceDate: str(basic.발령일자),
    issuanceNumber: str(basic.발령번호),
    departmentName: str(basic.소관부처명),
    amendmentType: str(basic.제개정구분명),
    content: stripHtmlTags(str(root.조문내용)),
  };
}

// =========================================================
// 자치법규 (ordin)
// =========================================================

export async function searchOrdinances(
  oc: string,
  params: OrdinSearchParams
): Promise<SearchResult<OrdinanceListItem>> {
  let url = buildSearchUrl(oc, "ordin", params);
  if (params.search) {
    const u = new URL(url);
    u.searchParams.set("search", String(params.search));
    url = u.toString();
  }
  const data = await fetchXml(url);

  const root = data.OrdinSearch as Record<string, unknown> | undefined;
  if (!root) return { totalCount: 0, currentPage: params.page || 1, items: [] };

  const rawList = ensureArray(root.law as Record<string, unknown>[]);
  return {
    totalCount: num(root.totalCnt),
    currentPage: num(root.page) || params.page || 1,
    items: rawList.map((raw) => ({
      id: num(raw.자치법규일련번호),
      ordinanceName: str(raw.자치법규명),
      ordinanceId: str(raw.자치법규ID),
      promulgationDate: str(raw.공포일자),
      promulgationNumber: str(raw.공포번호),
      amendmentType: str(raw.제개정구분명),
      localGovName: str(raw.지자체기관명),
      ordinanceType: str(raw.자치법규종류),
      enforcementDate: str(raw.시행일자),
      detailLink: str(raw.자치법규상세링크),
    })),
  };
}

export async function getOrdinanceDetail(
  oc: string,
  id: number
): Promise<OrdinanceDetail> {
  const url = buildDetailUrl(oc, "ordin", "MST", id);
  const data = await fetchXml(url);

  const root = data.LawService as Record<string, unknown> | undefined;
  if (!root) throw new Error("자치법규를 찾을 수 없습니다");

  const basic = root["자치법규기본정보"] as Record<string, unknown> || {};
  const articles = root["조문"] as Record<string, unknown> | undefined;

  const rawArticles = articles
    ? ensureArray(articles["조"] as Record<string, unknown>[])
    : [];

  return {
    ordinanceId: str(basic["자치법규ID"]),
    ordinanceName: str(basic["자치법규명"]),
    localGovName: str(basic["지자체기관명"]),
    promulgationDate: str(basic["공포일자"]),
    enforcementDate: str(basic["시행일자"]),
    articles: rawArticles.map((a) => ({
      articleNumber: str(a["조문번호"]),
      articleTitle: str(a["조제목"]),
      articleContent: stripHtmlTags(str(a["조내용"])),
    })),
  };
}

// =========================================================
// 조약 (trty)
// =========================================================

export async function searchTreaties(
  oc: string,
  params: SearchParams
): Promise<SearchResult<TreatyListItem>> {
  const url = buildSearchUrl(oc, "trty", params);
  const data = await fetchXml(url);

  const root = data.TrtySearch as Record<string, unknown> | undefined;
  if (!root) return { totalCount: 0, currentPage: params.page || 1, items: [] };

  const rawList = ensureArray(root.Trty as Record<string, unknown>[]);
  return {
    totalCount: num(root.totalCnt),
    currentPage: num(root.page) || params.page || 1,
    items: rawList.map((raw) => ({
      id: num(raw.조약일련번호),
      treatyName: str(raw.조약명),
      treatyType: str(raw.조약구분명),
      effectiveDate: str(raw.발효일자),
      signDate: str(raw.서명일자),
      treatyNumber: str(raw.조약번호),
      detailLink: str(raw.조약상세링크),
    })),
  };
}

export async function getTreatyDetail(
  oc: string,
  id: number
): Promise<TreatyDetail> {
  const url = buildDetailUrl(oc, "trty", "ID", id);
  const data = await fetchXml(url);

  const root = data.BothTrtyService as Record<string, unknown> | undefined;
  if (!root) throw new Error("조약을 찾을 수 없습니다");

  const basic = root["조약기본정보"] as Record<string, unknown> || {};
  const extra = root["추가정보"] as Record<string, unknown> || {};
  const contentWrapper = root["조약내용"] as Record<string, unknown> | undefined;
  const contentText = contentWrapper
    ? str((contentWrapper as Record<string, unknown>)["조약내용"])
    : "";

  return {
    id: num(basic.조약일련번호),
    treatyNameKo: str(basic["조약명_한글"]),
    treatyNameEn: str(basic["조약명_영문"]),
    effectiveDate: str(basic.발효일자),
    signDate: str(basic.서명일자),
    treatyNumber: str(basic.조약번호),
    counterpartyCountry: str(extra.체결대상국가한글 || extra.체결대상국가),
    treatyField: str(extra.양자조약분야명),
    content: stripHtmlTags(contentText),
  };
}

// =========================================================
// 법령용어 (lstrm)
// =========================================================

export async function searchLegalTerms(
  oc: string,
  params: SearchParams
): Promise<SearchResult<LegalTermListItem>> {
  const url = buildSearchUrl(oc, "lstrm", params);
  const data = await fetchXml(url);

  const root = data.LsTrmSearch as Record<string, unknown> | undefined;
  if (!root) return { totalCount: 0, currentPage: params.page || 1, items: [] };

  const rawList = ensureArray(root.lstrm as Record<string, unknown>[]);
  return {
    totalCount: num(root.totalCnt),
    currentPage: num(root.page) || params.page || 1,
    items: rawList.map((raw) => ({
      id: str(raw.법령용어ID),
      termName: str(raw.법령용어명),
      detailLink: str(raw.법령용어상세링크),
    })),
  };
}

export async function getLegalTermDetail(
  oc: string,
  id: string
): Promise<LegalTermDetail> {
  const url = buildDetailUrl(oc, "lstrm", "trmSeqs", id);
  const data = await fetchXml(url);

  const root = data.LsTrmService as Record<string, unknown> | undefined;
  if (!root) throw new Error("법령용어를 찾을 수 없습니다");

  return {
    id: str(root.법령용어일련번호 || root.법령용어ID),
    termName: str(root["법령용어명_한글"] || root.법령용어명),
    termNameHanja: str(root["법령용어명_한자"]),
    definition: stripHtmlTags(str(root.법령용어정의)),
    source: str(root.출처),
  };
}

// =========================================================
// 영문법령 (elaw)
// =========================================================

export async function searchEnglishLaws(
  oc: string,
  params: SearchParams
): Promise<SearchResult<ElawListItem>> {
  const url = buildSearchUrl(oc, "elaw", params);
  const data = await fetchXml(url);

  const root = data.LawSearch as Record<string, unknown> | undefined;
  if (!root) return { totalCount: 0, currentPage: params.page || 1, items: [] };

  const rawList = ensureArray(root.law as Record<string, unknown>[]);
  return {
    totalCount: num(root.totalCnt),
    currentPage: num(root.page) || params.page || 1,
    items: rawList.map((raw) => ({
      id: num(raw.법령일련번호),
      lawNameKo: str(raw.법령명한글),
      lawNameEn: str(raw.법령명영문),
      lawId: str(raw.법령ID),
      promulgationDate: str(raw.공포일자),
      promulgationNumber: str(raw.공포번호),
      amendmentType: str(raw.제개정구분명),
      departmentName: str(raw.소관부처명),
      lawType: str(raw.법령구분명),
      enforcementDate: str(raw.시행일자),
      currentHistoryCode: str(raw.현행연혁코드),
      detailLink: str(raw.법령상세링크),
    })),
  };
}

export async function getEnglishLawDetail(
  oc: string,
  id: number
): Promise<ElawDetail> {
  const url = buildDetailUrl(oc, "elaw", "MST", id);
  const data = await fetchXml(url);

  const root = data.Law as Record<string, unknown> | undefined;
  if (!root) throw new Error("영문법령을 찾을 수 없습니다");

  const infSection = root.InfSection as Record<string, unknown> || {};
  const joSection = root.JoSection as Record<string, unknown> | undefined;

  const rawArticles = joSection
    ? ensureArray(joSection.Jo as Record<string, unknown>[])
    : [];

  return {
    lawId: str(infSection.lsId),
    lawNameEn: str(infSection.lsNmEng),
    promulgationDate: str(infSection.ancYd),
    promulgationNumber: str(infSection.ancNo),
    articles: rawArticles
      .filter((a) => str(a.joYn) === "조문" || str(a.joCts))
      .map((a) => ({
        articleNumber: str(a.joNo),
        articleBranchNumber: str(a.joBrNo),
        articleTitle: str(a.joTtl),
        articleContent: stripHtmlTags(str(a.joCts)),
      })),
  };
}

// =========================================================
// 위원회 결정문 (11개 위원회 통합)
// =========================================================

interface CommitteeConfig {
  searchRoot: string;
  itemTag: string;
  detailRoot: string;
  name: string;
}

const COMMITTEE_CONFIG: Record<string, CommitteeConfig> = {
  ftc:    { searchRoot: "Ftc",    itemTag: "ftc",    detailRoot: "FtcService",    name: "공정거래위원회" },
  acr:    { searchRoot: "Acr",    itemTag: "acr",    detailRoot: "AcrService",    name: "국민권익위원회" },
  fsc:    { searchRoot: "Fsc",    itemTag: "fsc",    detailRoot: "FscService",    name: "금융위원회" },
  nlrc:   { searchRoot: "Nlrc",   itemTag: "nlrc",   detailRoot: "NlrcService",   name: "노동위원회" },
  kcc:    { searchRoot: "Kcc",    itemTag: "kcc",    detailRoot: "KccService",    name: "방송통신위원회" },
  oclt:   { searchRoot: "Oclt",   itemTag: "oclt",   detailRoot: "OcltService",   name: "중앙토지수용위원회" },
  nhrck:  { searchRoot: "Nhrck",  itemTag: "nhrck",  detailRoot: "NhrckService",  name: "국가인권위원회" },
  eiac:   { searchRoot: "Eiac",   itemTag: "eiac",   detailRoot: "EiacService",   name: "고용보험심사위원회" },
  ecc:    { searchRoot: "Ecc",    itemTag: "ecc",    detailRoot: "EccService",    name: "중앙환경분쟁조정위원회" },
  sfc:    { searchRoot: "Sfc",    itemTag: "sfc",    detailRoot: "SfcService",    name: "증권선물위원회" },
  iaciac: { searchRoot: "Iaciac", itemTag: "iaciac", detailRoot: "IaciacService", name: "산재보험재심사위원회" },
};

export const COMMITTEE_TYPES = Object.keys(COMMITTEE_CONFIG) as CommitteeType[];
export type CommitteeType = keyof typeof COMMITTEE_CONFIG;

export function getCommitteeName(committee: string): string {
  return COMMITTEE_CONFIG[committee]?.name || committee;
}

export async function searchCommitteeDecisions(
  oc: string,
  committee: string,
  params: SearchParams
): Promise<SearchResult<CommitteeDecisionListItem>> {
  const config = COMMITTEE_CONFIG[committee];
  if (!config) throw new Error(`지원하지 않는 위원회: ${committee}`);

  const url = buildSearchUrl(oc, committee, params);
  const data = await fetchXml(url);

  const root = data[config.searchRoot] as Record<string, unknown> | undefined;
  if (!root) return { totalCount: 0, currentPage: params.page || 1, items: [] };

  const rawList = ensureArray(root[config.itemTag] as Record<string, unknown>[]);
  return {
    totalCount: num(root.totalCnt),
    currentPage: num(root.page) || params.page || 1,
    items: rawList.map((raw) => ({
      id: num(raw.결정문일련번호),
      title: str(raw.사건명 || raw.안건명 || raw.제목),
      caseNumber: str(raw.사건번호 || raw.안건번호 || raw.의결번호 || raw.결정번호 || raw.의안번호),
      decisionDate: str(raw.결정일자 || raw.의결일자 || raw.의결일 || raw.등록일),
      agencyName: str(raw.기관명 || root.기관명 || config.name),
      detailLink: str(raw.결정문상세링크),
    })),
  };
}

export async function getCommitteeDecisionDetail(
  oc: string,
  committee: string,
  id: number
): Promise<CommitteeDecisionDetail> {
  const config = COMMITTEE_CONFIG[committee];
  if (!config) throw new Error(`지원하지 않는 위원회: ${committee}`);

  const url = buildDetailUrl(oc, committee, "ID", id);
  const data = await fetchXml(url);

  // 일부 위원회(acr)는 다른 루트 엘리먼트를 사용할 수 있음
  const root = (data[config.detailRoot] || data["의결서"]) as Record<string, unknown> | undefined;
  if (!root) throw new Error(`${config.name} 결정문을 찾을 수 없습니다`);

  const extras: Record<string, string> = {};

  // 위원회별 고유 필드 추출
  const extraFields: Record<string, string[]> = {
    ftc:    ["피심정보", "문서유형", "회의종류", "위원정보"],
    acr:    ["민원표시명", "결정구분", "회의종류"],
    fsc:    ["조치대상자"],
    nlrc:   ["자료구분", "판정사항"],
    kcc:    ["피심인", "의결서유형"],
    oclt:   [],
    nhrck:  ["위원회명"],
    eiac:   ["사건의분류", "의결서종류", "청구취지"],
    ecc:    ["신청인", "피신청인", "분쟁의경과", "당사자주장", "사실조사결과"],
    sfc:    ["조치대상자의인적사항"],
    iaciac: ["사건대분류", "사건중분류", "사건소분류", "쟁점", "청구취지"],
  };

  for (const field of extraFields[committee] || []) {
    const val = str(root[field]);
    if (val) extras[field] = stripHtmlTags(val);
  }

  return {
    id: num(root.결정문일련번호),
    title: str(root.사건명 || root.안건명 || root.제목),
    caseNumber: str(root.사건번호 || root.안건번호 || root.의결번호 || root.결정번호 || root.의안번호),
    agencyName: str(root.기관명 || config.name),
    decisionDate: str(root.결정일자 || root.의결일자 || root.의결일),
    ruling: stripHtmlTags(str(root.주문 || root.조치내용)),
    reason: stripHtmlTags(str(root.이유 || root.조치이유)),
    summary: stripHtmlTags(str(root.결정요지 || root.판정요지 || root.사건의개요 || root.개요 || root.내용)),
    extras,
  };
}
