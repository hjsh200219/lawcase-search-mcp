/**
 * 법제처 국가법령정보센터 판례 API 타입 정의
 */

// --- 검색 파라미터 ---

export interface CaseSearchParams {
  query: string;
  page?: number;
  display?: number;
  search?: 1 | 2; // 1=사건명, 2=전문
  sort?: string;
  dateFrom?: string; // YYYYMMDD
  dateTo?: string; // YYYYMMDD
  court?: string; // 400201=대법원, 400202=하급법원
}

// --- 법제처 API 원본 응답 ---

export interface LawApiCaseListItem {
  판례일련번호: number;
  사건명: string;
  사건번호: string;
  선고일자: string;
  법원명: string;
  사건종류명: string;
  판결유형: string;
  선고: string;
  판례상세링크: string;
}

export interface LawApiCaseListResponse {
  PrecSearch: {
    totalCnt: number;
    page: number;
    prec: LawApiCaseListItem[] | LawApiCaseListItem | null | undefined;
  };
}

export interface LawApiCaseDetail {
  판례정보일련번호: number;
  사건명: string;
  사건번호: string;
  선고일자: string;
  선고: string;
  법원명: string;
  사건종류명: string;
  판결유형: string;
  판시사항: string;
  판결요지: string;
  참조조문: string;
  참조판례: string;
  판례내용: string;
}

export interface LawApiCaseDetailResponse {
  PrecService: LawApiCaseDetail;
}

// --- 정규화된 타입 ---

export interface CaseListItem {
  id: number;
  caseName: string;
  caseNumber: string;
  decisionDate: string;
  courtName: string;
  caseType: string;
  verdictType: string;
  verdict: string;
  detailLink: string;
}

export interface CaseDetail {
  id: number;
  caseName: string;
  caseNumber: string;
  decisionDate: string;
  verdict: string;
  courtName: string;
  caseType: string;
  verdictType: string;
  holdings: string;
  summary: string;
  referenceLaws: string;
  referenceCases: string;
  content: string;
}

export interface CaseSearchResult {
  totalCount: number;
  currentPage: number;
  cases: CaseListItem[];
}
