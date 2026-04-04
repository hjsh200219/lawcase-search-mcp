import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMarketExchangeRates, parseExchangeRateResponse } from "./exim-api.js";

beforeEach(() => {
  vi.restoreAllMocks();
});

// --- parseExchangeRateResponse ---

describe("parseExchangeRateResponse", () => {
  it("parseExchangeRateResponse_유효한JSON_환율배열반환", () => {
    const raw = [
      {
        result: 1,
        cur_unit: "USD",
        ttb: "1,348.5",
        tts: "1,375.5",
        deal_bas_r: "1,362",
        bkpr: "1,362",
        yy_efee_r: "0",
        ten_dd_efee_r: "0",
        kftc_bkpr: "1,362",
        kftc_deal_bas_r: "1,362",
        cur_nm: "미국 달러",
      },
    ];

    const result = parseExchangeRateResponse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].currency).toBe("USD");
    expect(result[0].dealBaseRate).toBe(1362);
    expect(result[0].currencyName).toBe("미국 달러");
  });

  it("parseExchangeRateResponse_result가1아닌항목_필터링", () => {
    const raw = [
      { result: 1, cur_unit: "USD", deal_bas_r: "1,362", cur_nm: "미국 달러", ttb: "", tts: "", bkpr: "", yy_efee_r: "", ten_dd_efee_r: "", kftc_bkpr: "", kftc_deal_bas_r: "" },
      { result: 4, cur_unit: "KRW", deal_bas_r: "0", cur_nm: "한국 원", ttb: "", tts: "", bkpr: "", yy_efee_r: "", ten_dd_efee_r: "", kftc_bkpr: "", kftc_deal_bas_r: "" },
    ];

    const result = parseExchangeRateResponse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].currency).toBe("USD");
  });

  it("parseExchangeRateResponse_빈배열_빈배열반환", () => {
    const result = parseExchangeRateResponse([]);
    expect(result).toEqual([]);
  });

  it("parseExchangeRateResponse_JPY100엔단위_괄호제거", () => {
    const raw = [
      { result: 1, cur_unit: "JPY(100)", deal_bas_r: "910.5", cur_nm: "일본 엔", ttb: "900", tts: "920", bkpr: "910", yy_efee_r: "", ten_dd_efee_r: "", kftc_bkpr: "", kftc_deal_bas_r: "" },
    ];

    const result = parseExchangeRateResponse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].currency).toBe("JPY");
  });
});

// --- getMarketExchangeRates (fetch mock) ---

describe("getMarketExchangeRates", () => {
  it("getMarketExchangeRates_정상응답_환율반환", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve([
            {
              result: 1,
              cur_unit: "USD",
              deal_bas_r: "1,362",
              cur_nm: "미국 달러",
              ttb: "1,348.5",
              tts: "1,375.5",
              bkpr: "1,362",
              yy_efee_r: "0",
              ten_dd_efee_r: "0",
              kftc_bkpr: "1,362",
              kftc_deal_bas_r: "1,362",
            },
          ]),
      })
    );

    const result = await getMarketExchangeRates("testkey");
    expect(result).toHaveLength(1);
    expect(result[0].currency).toBe("USD");
  });

  it("getMarketExchangeRates_302리다이렉트_쿠키포함재요청", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 302,
        headers: new Map([
          ["set-cookie", "JSESSIONID=abc123; Path=/"],
          ["location", "/site/program/financial/exchangeJSON?authkey=testkey&searchdate=20260404&data=AP01"],
        ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve([
            { result: 1, cur_unit: "EUR", deal_bas_r: "1,500", cur_nm: "유로", ttb: "", tts: "", bkpr: "", yy_efee_r: "", ten_dd_efee_r: "", kftc_bkpr: "", kftc_deal_bas_r: "" },
          ]),
      });

    vi.stubGlobal("fetch", fetchMock);

    const result = await getMarketExchangeRates("testkey");
    expect(result).toHaveLength(1);
    expect(result[0].currency).toBe("EUR");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("getMarketExchangeRates_네트워크에러_빈배열반환", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    const result = await getMarketExchangeRates("testkey");
    expect(result).toEqual([]);
  });
});
