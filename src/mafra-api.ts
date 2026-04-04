/**
 * 농림축산식품부(MAFRA) 수입축산물 이력 API 클라이언트
 * http://211.237.50.150:7080/openapi
 */

import type {
  MeatTraceRecord,
  MeatTraceSearchParams,
  MeatTraceResult,
} from "./mafra-types.js";

const MAFRA_BASE_URL = "http://211.237.50.150:7080/openapi";
const GRID_ID = "Grid_20141226000000000174_1";
const TIMEOUT_MS = 30000;

// --- XML 파싱 ---

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  const match = re.exec(xml);
  return match ? match[1].trim() : "";
}

function extractAllBlocks(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g");
  const results: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    results.push(match[1]);
  }
  return results;
}

function parseRecord(rowXml: string): MeatTraceRecord {
  return {
    distbIdntfcNo: extractTag(rowXml, "DISTB_IDNTFC_NO"),
    prdlstNm: extractTag(rowXml, "PRDLST_NM"),
    blNo: extractTag(rowXml, "BL_NO"),
    orgplceNation: extractTag(rowXml, "ORGPLCE_NATION"),
    slauStartDe: extractTag(rowXml, "EXCOURY_SLAU_START_DE"),
    slauEndDe: extractTag(rowXml, "EXCOURY_SLAU_END_DE"),
    slauHseNm: extractTag(rowXml, "EXCOURY_SLAU_HSE_NM"),
    prcssStartDe: extractTag(rowXml, "EXCOURY_PRCSS_START_DE"),
    prcssEndDe: extractTag(rowXml, "EXCOURY_PRCSS_END_DE"),
    prcssHseNm: extractTag(rowXml, "EXCOURY_PRCSS_HSE_NM"),
    exportBsshNm: extractTag(rowXml, "EXPORT_BSSH_NM"),
    importBsshNm: extractTag(rowXml, "IMPORT_BSSH_NM"),
    importDe: extractTag(rowXml, "IMPORT_DE"),
    prdlstCd: extractTag(rowXml, "PRDLST_CD"),
    sleAt: extractTag(rowXml, "SLE_AT"),
  };
}

export function parseMeatTraceXml(xml: string): MeatTraceResult {
  const resultCode = extractTag(xml, "code");
  if (resultCode && resultCode !== "INFO-000") {
    const resultMessage = extractTag(xml, "message");
    return {
      totalCount: 0,
      records: [],
      error: `${resultCode}: ${resultMessage}`,
    };
  }

  const totalCount = parseInt(extractTag(xml, "totalCnt"), 10) || 0;
  const rows = extractAllBlocks(xml, "row");
  const records = rows.map(parseRecord);

  return { totalCount, records };
}

// --- API 호출 ---

export async function fetchImportMeatTrace(
  apiKey: string,
  params: MeatTraceSearchParams,
): Promise<MeatTraceResult> {
  const startIdx = params.startIndex ?? 1;
  const endIdx = params.endIndex ?? 100;

  const qp = new URLSearchParams();
  qp.set("IMPORT_DE", params.importDate);
  if (params.productCode) qp.set("PRDLST_CD", params.productCode);
  if (params.blNo) qp.set("BL_NO", params.blNo);
  if (params.originCountry) qp.set("ORGPLCE_NATION", params.originCountry);
  if (params.saleStatus) qp.set("SLE_AT", params.saleStatus);

  const url = `${MAFRA_BASE_URL}/${apiKey}/xml/${GRID_ID}/${startIdx}/${endIdx}?${qp.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new Error("수입축산물 이력 API 연결 실패: 네트워크 연결 오류");
  }

  if (!response.ok) {
    throw new Error(`수입축산물 이력 API HTTP 오류: ${response.status}`);
  }

  const xml = await response.text();
  return parseMeatTraceXml(xml);
}
