/**
 * 한국수출입은행 환율 API 클라이언트
 * https://www.koreaexim.go.kr/site/program/financial/exchangeJSON
 *
 * 수출입은행 API는 쿠키 기반 보안 검증 사용:
 * 첫 요청 → 302 + Set-Cookie → 쿠키 포함 재요청 → JSON 응답
 */

import type { EximExchangeRateRaw, EximExchangeRate } from "./exim-types.js";

const KOREAEXIM_API_URL =
  "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON";
const TIMEOUT_MS = 15000;

function getKSTDateYYYYMMDD(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function parseExchangeRateResponse(
  items: EximExchangeRateRaw[],
): EximExchangeRate[] {
  return items
    .filter((item) => item.result === 1)
    .map((item) => ({
      currency: item.cur_unit.replace(/\(.*\)/, "").trim(),
      currencyName: item.cur_nm,
      dealBaseRate: parseFloat(item.deal_bas_r.replace(/,/g, "")),
      ttBuy: item.ttb,
      ttSell: item.tts,
      baseRate: item.bkpr,
    }))
    .filter((item) => !isNaN(item.dealBaseRate));
}

export async function getMarketExchangeRates(
  apiKey: string,
  dateStr?: string,
): Promise<EximExchangeRate[]> {
  const searchDate = dateStr ?? getKSTDateYYYYMMDD();
  const url = `${KOREAEXIM_API_URL}?authkey=${apiKey}&searchdate=${searchDate}&data=AP01`;
  const fetchOptions: RequestInit = {
    method: "GET",
    headers: { "User-Agent": "Mozilla/5.0 (KoreanPublicDataMCP)" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  };

  try {
    const first = await fetch(url, { ...fetchOptions, redirect: "manual" });

    let response: Response;
    if (first.status === 302) {
      const cookie = first.headers.get("set-cookie")?.split(";")[0] ?? "";
      const location = first.headers.get("location") ?? "";
      const redirectUrl = location.startsWith("http")
        ? location
        : `https://www.koreaexim.go.kr${location}`;
      response = await fetch(redirectUrl, {
        ...fetchOptions,
        headers: {
          "User-Agent": "Mozilla/5.0 (KoreanPublicDataMCP)",
          Cookie: cookie,
        },
      });
    } else {
      response = first;
    }

    if (!response.ok) return [];

    const json = await response.json();
    if (!Array.isArray(json) || json.length === 0) return [];

    return parseExchangeRateResponse(json as EximExchangeRateRaw[]);
  } catch (e) {
    console.error("수출입은행 API error:", e);
    return [];
  }
}
