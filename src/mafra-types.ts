/**
 * 농림축산식품부(MAFRA) 수입축산물 이력 API 타입 정의
 * http://211.237.50.150:7080/openapi
 */

export interface MeatTraceRecord {
  distbIdntfcNo: string;
  prdlstNm: string;
  blNo: string;
  orgplceNation: string;
  slauStartDe: string;
  slauEndDe: string;
  slauHseNm: string;
  prcssStartDe: string;
  prcssEndDe: string;
  prcssHseNm: string;
  exportBsshNm: string;
  importBsshNm: string;
  importDe: string;
  prdlstCd: string;
  sleAt: string;
}

export interface MeatTraceSearchParams {
  importDate: string;
  productCode?: string;
  blNo?: string;
  originCountry?: string;
  saleStatus?: string;
  startIndex?: number;
  endIndex?: number;
}

export interface MeatTraceResult {
  totalCount: number;
  records: MeatTraceRecord[];
  error?: string;
}
