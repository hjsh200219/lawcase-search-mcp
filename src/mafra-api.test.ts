import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchImportMeatTrace, parseMeatTraceXml } from "./mafra-api.js";

beforeEach(() => {
  vi.restoreAllMocks();
});

// --- parseMeatTraceXml ---

describe("parseMeatTraceXml", () => {
  it("parseMeatTraceXml_정상XML_레코드배열반환", () => {
    const xml = `
      <Grid_20141226000000000174_1>
        <totalCnt>1</totalCnt>
        <row>
          <DISTB_IDNTFC_NO>1234567890</DISTB_IDNTFC_NO>
          <PRDLST_NM>쇠고기(갈비)</PRDLST_NM>
          <BL_NO>BL2026001</BL_NO>
          <ORGPLCE_NATION>호주</ORGPLCE_NATION>
          <EXCOURY_SLAU_START_DE>20260301</EXCOURY_SLAU_START_DE>
          <EXCOURY_SLAU_END_DE>20260302</EXCOURY_SLAU_END_DE>
          <EXCOURY_SLAU_HSE_NM>AUS Meat Co</EXCOURY_SLAU_HSE_NM>
          <EXCOURY_PRCSS_START_DE>20260303</EXCOURY_PRCSS_START_DE>
          <EXCOURY_PRCSS_END_DE>20260304</EXCOURY_PRCSS_END_DE>
          <EXCOURY_PRCSS_HSE_NM>AUS Pack Ltd</EXCOURY_PRCSS_HSE_NM>
          <EXPORT_BSSH_NM>AUS Export</EXPORT_BSSH_NM>
          <IMPORT_BSSH_NM>한국수입사</IMPORT_BSSH_NM>
          <IMPORT_DE>20260401</IMPORT_DE>
          <PRDLST_CD>2110111211</PRDLST_CD>
          <SLE_AT>Y</SLE_AT>
        </row>
      </Grid_20141226000000000174_1>
    `;

    const result = parseMeatTraceXml(xml);
    expect(result.totalCount).toBe(1);
    expect(result.records).toHaveLength(1);
    expect(result.records[0].distbIdntfcNo).toBe("1234567890");
    expect(result.records[0].prdlstNm).toBe("쇠고기(갈비)");
    expect(result.records[0].blNo).toBe("BL2026001");
    expect(result.records[0].orgplceNation).toBe("호주");
    expect(result.records[0].importBsshNm).toBe("한국수입사");
    expect(result.records[0].sleAt).toBe("Y");
  });

  it("parseMeatTraceXml_복수레코드_전부파싱", () => {
    const xml = `
      <Grid_20141226000000000174_1>
        <totalCnt>2</totalCnt>
        <row>
          <DISTB_IDNTFC_NO>AAA</DISTB_IDNTFC_NO>
          <PRDLST_NM>쇠고기</PRDLST_NM>
          <BL_NO>BL1</BL_NO>
          <ORGPLCE_NATION>미국</ORGPLCE_NATION>
          <EXCOURY_SLAU_START_DE></EXCOURY_SLAU_START_DE>
          <EXCOURY_SLAU_END_DE></EXCOURY_SLAU_END_DE>
          <EXCOURY_SLAU_HSE_NM></EXCOURY_SLAU_HSE_NM>
          <EXCOURY_PRCSS_START_DE></EXCOURY_PRCSS_START_DE>
          <EXCOURY_PRCSS_END_DE></EXCOURY_PRCSS_END_DE>
          <EXCOURY_PRCSS_HSE_NM></EXCOURY_PRCSS_HSE_NM>
          <EXPORT_BSSH_NM></EXPORT_BSSH_NM>
          <IMPORT_BSSH_NM></IMPORT_BSSH_NM>
          <IMPORT_DE>20260401</IMPORT_DE>
          <PRDLST_CD>2110</PRDLST_CD>
          <SLE_AT>N</SLE_AT>
        </row>
        <row>
          <DISTB_IDNTFC_NO>BBB</DISTB_IDNTFC_NO>
          <PRDLST_NM>돼지고기</PRDLST_NM>
          <BL_NO>BL2</BL_NO>
          <ORGPLCE_NATION>캐나다</ORGPLCE_NATION>
          <EXCOURY_SLAU_START_DE></EXCOURY_SLAU_START_DE>
          <EXCOURY_SLAU_END_DE></EXCOURY_SLAU_END_DE>
          <EXCOURY_SLAU_HSE_NM></EXCOURY_SLAU_HSE_NM>
          <EXCOURY_PRCSS_START_DE></EXCOURY_PRCSS_START_DE>
          <EXCOURY_PRCSS_END_DE></EXCOURY_PRCSS_END_DE>
          <EXCOURY_PRCSS_HSE_NM></EXCOURY_PRCSS_HSE_NM>
          <EXPORT_BSSH_NM></EXPORT_BSSH_NM>
          <IMPORT_BSSH_NM></IMPORT_BSSH_NM>
          <IMPORT_DE>20260401</IMPORT_DE>
          <PRDLST_CD>2120</PRDLST_CD>
          <SLE_AT>Y</SLE_AT>
        </row>
      </Grid_20141226000000000174_1>
    `;

    const result = parseMeatTraceXml(xml);
    expect(result.totalCount).toBe(2);
    expect(result.records).toHaveLength(2);
    expect(result.records[0].distbIdntfcNo).toBe("AAA");
    expect(result.records[1].distbIdntfcNo).toBe("BBB");
  });

  it("parseMeatTraceXml_API에러코드_에러반환", () => {
    const xml = `
      <OpenAPI_ServiceResponse>
        <cmmMsgHeader>
          <errMsg>SERVICE ERROR</errMsg>
          <returnAuthMsg>NORMAL SERVICE</returnAuthMsg>
          <returnReasonCode>00</returnReasonCode>
        </cmmMsgHeader>
        <code>INFO-200</code>
        <message>해당하는 데이터가 없습니다.</message>
      </OpenAPI_ServiceResponse>
    `;

    const result = parseMeatTraceXml(xml);
    expect(result.totalCount).toBe(0);
    expect(result.records).toHaveLength(0);
    expect(result.error).toContain("INFO-200");
  });

  it("parseMeatTraceXml_빈응답_빈결과", () => {
    const xml = `
      <Grid_20141226000000000174_1>
        <totalCnt>0</totalCnt>
      </Grid_20141226000000000174_1>
    `;

    const result = parseMeatTraceXml(xml);
    expect(result.totalCount).toBe(0);
    expect(result.records).toHaveLength(0);
  });
});

// --- fetchImportMeatTrace ---

describe("fetchImportMeatTrace", () => {
  it("fetchImportMeatTrace_정상응답_결과반환", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(`
            <Grid_20141226000000000174_1>
              <totalCnt>1</totalCnt>
              <row>
                <DISTB_IDNTFC_NO>T001</DISTB_IDNTFC_NO>
                <PRDLST_NM>쇠고기</PRDLST_NM>
                <BL_NO>BL999</BL_NO>
                <ORGPLCE_NATION>호주</ORGPLCE_NATION>
                <EXCOURY_SLAU_START_DE>20260301</EXCOURY_SLAU_START_DE>
                <EXCOURY_SLAU_END_DE>20260301</EXCOURY_SLAU_END_DE>
                <EXCOURY_SLAU_HSE_NM>Slaughter Co</EXCOURY_SLAU_HSE_NM>
                <EXCOURY_PRCSS_START_DE>20260302</EXCOURY_PRCSS_START_DE>
                <EXCOURY_PRCSS_END_DE>20260302</EXCOURY_PRCSS_END_DE>
                <EXCOURY_PRCSS_HSE_NM>Process Co</EXCOURY_PRCSS_HSE_NM>
                <EXPORT_BSSH_NM>Export Co</EXPORT_BSSH_NM>
                <IMPORT_BSSH_NM>Import Co</IMPORT_BSSH_NM>
                <IMPORT_DE>20260401</IMPORT_DE>
                <PRDLST_CD>2110</PRDLST_CD>
                <SLE_AT>Y</SLE_AT>
              </row>
            </Grid_20141226000000000174_1>
          `),
      }),
    );

    const result = await fetchImportMeatTrace("testkey", { importDate: "20260401" });
    expect(result.totalCount).toBe(1);
    expect(result.records[0].blNo).toBe("BL999");
  });

  it("fetchImportMeatTrace_네트워크에러_에러throw", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));

    await expect(
      fetchImportMeatTrace("testkey", { importDate: "20260401" }),
    ).rejects.toThrow("수입축산물 이력 API 연결 실패");
  });

  it("fetchImportMeatTrace_HTTP에러_에러throw", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve("") }),
    );

    await expect(
      fetchImportMeatTrace("testkey", { importDate: "20260401" }),
    ).rejects.toThrow("HTTP 오류: 500");
  });

  it("fetchImportMeatTrace_검색파라미터_URL에포함", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<Grid_20141226000000000174_1><totalCnt>0</totalCnt></Grid_20141226000000000174_1>"),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchImportMeatTrace("mykey", {
      importDate: "20260401",
      blNo: "BL999",
      originCountry: "호주",
    });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("mykey");
    expect(calledUrl).toContain("IMPORT_DE=20260401");
    expect(calledUrl).toContain("BL_NO=BL999");
    expect(calledUrl).toContain("ORGPLCE_NATION=");
  });
});
