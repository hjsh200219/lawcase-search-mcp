/**
 * data20-api 테스트 - 생동성인정품목 + 의약품특허 API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchBioEquivalence, searchMedicinePatent } from "./data20-api.js";

const SERVICE_KEY = "test-service-key-123";

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockClear();
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- 생동성인정품목 ---

describe("searchBioEquivalence", () => {
  it("정상응답_제품목록반환", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        header: { resultCode: "00", resultMsg: "NORMAL SERVICE" },
        body: {
          totalCount: 2,
          pageNo: 1,
          numOfRows: 10,
          items: [
            {
              ITEM_SEQ: "200000001",
              ITEM_NAME: "테스트정",
              ENTP_NAME: "테스트제약",
              INGR_KOR_NAME: "테스트성분",
              INGR_QTY: "100mg",
              SHAPE_CODE_NAME: "정제",
              BIOEQ_PRODT_NOTICE_DATE: "20240101",
            },
            {
              ITEM_SEQ: "200000002",
              ITEM_NAME: "샘플캡슐",
              ENTP_NAME: "샘플제약",
              INGR_KOR_NAME: "샘플성분",
              INGR_QTY: "50mg",
              SHAPE_CODE_NAME: "캡슐",
              BIOEQ_PRODT_NOTICE_DATE: "20240201",
            },
          ],
        },
      }),
    });

    const result = await searchBioEquivalence(SERVICE_KEY, { item_name: "테스트" });

    expect(result.totalCount).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].ITEM_NAME).toBe("테스트정");
    expect(result.items[0].ENTP_NAME).toBe("테스트제약");
  });

  it("데이터없음_빈배열반환", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        header: { resultCode: "00", resultMsg: "NORMAL SERVICE" },
        body: { totalCount: 0, pageNo: 1, numOfRows: 10, items: [] },
      }),
    });

    const result = await searchBioEquivalence(SERVICE_KEY, {});
    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });

  it("API오류_에러throw", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        header: { resultCode: "30", resultMsg: "등록되지 않은 서비스 키" },
        body: null,
      }),
    });

    await expect(searchBioEquivalence(SERVICE_KEY, {})).rejects.toThrow("등록되지 않은 서비스 키");
  });

  it("HTTP오류_에러throw", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(searchBioEquivalence(SERVICE_KEY, {})).rejects.toThrow("HTTP 500");
  });

  it("URL에_serviceKey_포함", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        header: { resultCode: "00" },
        body: { totalCount: 0, pageNo: 1, numOfRows: 10, items: [] },
      }),
    });

    await searchBioEquivalence(SERVICE_KEY, { item_name: "발사르탄" });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("serviceKey=test-service-key-123");
    expect(calledUrl).toContain("MdcBioEqInfoService01");
    expect(calledUrl).toContain("item_name=%EB%B0%9C%EC%82%AC%EB%A5%B4%ED%83%84");
  });
});

// --- 의약품 특허정보 ---

describe("searchMedicinePatent", () => {
  it("정상응답_특허목록반환", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        header: { resultCode: "00", resultMsg: "NORMAL SERVICE" },
        body: {
          totalCount: 1,
          pageNo: 1,
          numOfRows: 10,
          items: [
            {
              ITEM_SEQ: "300000001",
              ITEM_NAME: "오로살탄정",
              ITEM_ENG_NAME: "Orosartan tablet",
              ENTP_NAME: "동아제약",
              INGR_KOR_NAME: "발사르탄",
              INGR_ENG_NAME: "Valsartan",
              PATENT_NO: "10-1234567",
              PATENT_DATE: "20150101",
              PATENT_EXPIRY_DATE: "20350101",
              DOSAGE_FORM: "정제",
            },
          ],
        },
      }),
    });

    const result = await searchMedicinePatent(SERVICE_KEY, {
      item_name: "오로살탄",
      ingr_name: "발사르탄",
    });

    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].ITEM_NAME).toBe("오로살탄정");
    expect(result.items[0].PATENT_NO).toBe("10-1234567");
    expect(result.items[0].INGR_ENG_NAME).toBe("Valsartan");
  });

  it("여러검색조건_URL파라미터포함", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        header: { resultCode: "00" },
        body: { totalCount: 0, pageNo: 1, numOfRows: 10, items: [] },
      }),
    });

    await searchMedicinePatent(SERVICE_KEY, {
      ingr_eng_name: "Valsartan",
      item_eng_name: "Orosartan",
      pageNo: 2,
      numOfRows: 20,
    });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("MdcinPatentInfoService2");
    expect(calledUrl).toContain("ingr_eng_name=Valsartan");
    expect(calledUrl).toContain("item_eng_name=Orosartan");
    expect(calledUrl).toContain("pageNo=2");
    expect(calledUrl).toContain("numOfRows=20");
  });

  it("데이터없음_빈배열반환", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        header: { resultCode: "00" },
        body: { totalCount: 0, pageNo: 1, numOfRows: 10, items: [] },
      }),
    });

    const result = await searchMedicinePatent(SERVICE_KEY, {});
    expect(result.items).toHaveLength(0);
  });

  it("API오류_에러throw", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        header: { resultCode: "22", resultMsg: "일일 요청 한도 초과" },
        body: null,
      }),
    });

    await expect(searchMedicinePatent(SERVICE_KEY, {})).rejects.toThrow("일일 요청 한도 초과");
  });
});
