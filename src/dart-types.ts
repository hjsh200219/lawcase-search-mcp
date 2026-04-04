/**
 * DART 전자공시시스템 OpenAPI 타입 정의
 * https://opendart.fss.or.kr
 */

// --- 공시검색 ---

export interface DartDisclosureItem {
  corp_cls: string;
  corp_name: string;
  corp_code: string;
  stock_code: string;
  report_nm: string;
  rcept_no: string;
  flr_nm: string;
  rcept_dt: string;
  rm: string;
}

export interface DartDisclosureSearchResult {
  status: string;
  message: string;
  page_no: number;
  page_count: number;
  total_count: number;
  total_page: number;
  list: DartDisclosureItem[];
}

export interface DartDisclosureSearchParams {
  corp_code?: string;
  bgn_de?: string;
  end_de?: string;
  last_reprt_at?: "Y" | "N";
  pblntf_ty?: string;
  pblntf_detail_ty?: string;
  corp_cls?: string;
  sort?: "date" | "crp" | "rpt";
  sort_mth?: "asc" | "desc";
  page_no?: number;
  page_count?: number;
}

// --- 기업개황 ---

export interface DartCompanyInfo {
  status: string;
  message: string;
  corp_code: string;
  corp_name: string;
  corp_name_eng: string;
  stock_name: string;
  stock_code: string;
  ceo_nm: string;
  corp_cls: string;
  jurir_no: string;
  bizr_no: string;
  adres: string;
  hm_url: string;
  ir_url: string;
  phn_no: string;
  fax_no: string;
  induty_code: string;
  est_dt: string;
  acc_mt: string;
}

// --- 재무제표 ---

export interface DartFinancialItem {
  rcept_no: string;
  reprt_code: string;
  bsns_year: string;
  corp_code: string;
  sj_div: string;
  sj_nm: string;
  account_id: string;
  account_nm: string;
  account_detail: string;
  thstrm_nm: string;
  thstrm_amount: string;
  thstrm_add_amount: string;
  frmtrm_nm: string;
  frmtrm_amount: string;
  frmtrm_q_nm: string;
  frmtrm_q_amount: string;
  frmtrm_add_amount: string;
  bfefrmtrm_nm: string;
  bfefrmtrm_amount: string;
  ord: string;
  currency: string;
}

export interface DartFinancialResult {
  status: string;
  message: string;
  list: DartFinancialItem[];
}

export interface DartFinancialParams {
  corp_code: string;
  bsns_year: string;
  reprt_code: string;
  fs_div?: "OFS" | "CFS";
}

// --- 주요계정 ---

export interface DartKeyAccountItem {
  rcept_no: string;
  reprt_code: string;
  bsns_year: string;
  corp_code: string;
  sj_div: string;
  sj_nm: string;
  account_nm: string;
  thstrm_nm: string;
  thstrm_amount: string;
  frmtrm_nm: string;
  frmtrm_amount: string;
  bfefrmtrm_nm: string;
  bfefrmtrm_amount: string;
  ord: string;
  currency: string;
}

export interface DartKeyAccountResult {
  status: string;
  message: string;
  list: DartKeyAccountItem[];
}

// --- 고유번호 ---

export interface CorpCodeEntry {
  corpCode: string;
  corpName: string;
  stockCode: string;
  modifyDate: string;
}
