import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  searchLaws,
  getLawDetail,
  searchCases,
  getCaseDetail,
  searchConstitutional,
  searchInterpretations,
  searchAdminRules,
  searchLegalTerms,
  searchEnglishLaws,
  searchTreaties,
} from "./law-api.js";

const OC = "test_oc";

// 모듈 레벨 lastRequestTime이 테스트 간 유지되므로 항상 증가하는 값 사용
let fakeNow = 1_000_000_000;

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(Date, "now").mockImplementation(() => {
    fakeNow += 2000;
    return fakeNow;
  });
});

function mockFetchXml(xml: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(xml),
    }),
  );
}

function mockFetchHttpError(status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      text: () => Promise.resolve(""),
    }),
  );
}

// =========================================================
// searchLaws (법령 검색)
// =========================================================

describe("searchLaws", () => {
  it("searchLaws_정상XML_법령목록반환", async () => {
    mockFetchXml(`
      <LawSearch>
        <totalCnt>1</totalCnt>
        <page>1</page>
        <law>
          <법령일련번호>100000</법령일련번호>
          <법령명한글>민법</법령명한글>
          <법령약칭명>민법</법령약칭명>
          <법령ID>001234</법령ID>
          <공포일자>19580222</공포일자>
          <공포번호>471</공포번호>
          <제개정구분명>전부개정</제개정구분명>
          <소관부처명>법무부</소관부처명>
          <법령구분명>법률</법령구분명>
          <시행일자>19580222</시행일자>
          <현행연혁코드>현행</현행연혁코드>
          <법령상세링크>/lsInfoP.do?lsiSeq=100000</법령상세링크>
        </law>
      </LawSearch>
    `);

    const result = await searchLaws(OC, { query: "민법" });
    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(100000);
    expect(result.items[0].lawName).toBe("민법");
    expect(result.items[0].departmentName).toBe("법무부");
    expect(result.items[0].lawType).toBe("법률");
    expect(result.items[0].promulgationDate).toBe("19580222");
  });

  it("searchLaws_복수결과_전부파싱", async () => {
    mockFetchXml(`
      <LawSearch>
        <totalCnt>2</totalCnt>
        <page>1</page>
        <law>
          <법령일련번호>100001</법령일련번호>
          <법령명한글>민법</법령명한글>
          <법령약칭명></법령약칭명>
          <법령ID>001</법령ID>
          <공포일자>19580222</공포일자>
          <공포번호>471</공포번호>
          <제개정구분명>전부개정</제개정구분명>
          <소관부처명>법무부</소관부처명>
          <법령구분명>법률</법령구분명>
          <시행일자>19580222</시행일자>
          <현행연혁코드>현행</현행연혁코드>
          <법령상세링크></법령상세링크>
        </law>
        <law>
          <법령일련번호>100002</법령일련번호>
          <법령명한글>민법시행령</법령명한글>
          <법령약칭명></법령약칭명>
          <법령ID>002</법령ID>
          <공포일자>19600101</공포일자>
          <공포번호>1000</공포번호>
          <제개정구분명>제정</제개정구분명>
          <소관부처명>법무부</소관부처명>
          <법령구분명>대통령령</법령구분명>
          <시행일자>19600101</시행일자>
          <현행연혁코드>현행</현행연혁코드>
          <법령상세링크></법령상세링크>
        </law>
      </LawSearch>
    `);

    const result = await searchLaws(OC, { query: "민법" });
    expect(result.totalCount).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].lawName).toBe("민법");
    expect(result.items[1].lawName).toBe("민법시행령");
    expect(result.items[1].lawType).toBe("대통령령");
  });

  it("searchLaws_빈결과_빈배열반환", async () => {
    mockFetchXml("<LawSearch><totalCnt>0</totalCnt><page>1</page></LawSearch>");

    const result = await searchLaws(OC, { query: "존재하지않는법률xyz" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
    expect(result.currentPage).toBe(1);
  });

  it("searchLaws_루트엘리먼트없음_빈결과반환", async () => {
    mockFetchXml("<OtherRoot><data>test</data></OtherRoot>");

    const result = await searchLaws(OC, { query: "민법" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("searchLaws_URL파라미터_올바른구성", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<LawSearch><totalCnt>0</totalCnt></LawSearch>"),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchLaws(OC, { query: "민법", display: 10, page: 2, sort: "date" });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("OC=test_oc");
    expect(calledUrl).toContain("target=law");
    expect(calledUrl).toContain("type=XML");
    expect(calledUrl).toContain("display=10");
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("sort=date");
  });

  it("searchLaws_HTTP에러_예외발생", async () => {
    mockFetchHttpError(400);
    await expect(searchLaws(OC, { query: "민법" })).rejects.toThrow("HTTP 400");
  });
});

// =========================================================
// getLawDetail (법령 상세)
// =========================================================

describe("getLawDetail", () => {
  it("getLawDetail_정상XML_법령상세반환", async () => {
    mockFetchXml(`
      <법령>
        <기본정보>
          <법령ID>LAW1234</법령ID>
          <법령명_한글>민법</법령명_한글>
          <법종구분>법률</법종구분>
          <소관부처>법무부</소관부처>
          <시행일자>19580222</시행일자>
          <공포일자>19580222</공포일자>
          <공포번호>471</공포번호>
          <제개정구분>전부개정</제개정구분>
        </기본정보>
        <조문>
          <조문단위>
            <조문여부>조문</조문여부>
            <조문번호>1</조문번호>
            <조문제목>법원</조문제목>
            <조문내용>민사에 관하여 법률에 규정이 없으면 관습법에 의하고 관습법이 없으면 조리에 의한다.</조문내용>
          </조문단위>
          <조문단위>
            <조문여부>조문</조문여부>
            <조문번호>2</조문번호>
            <조문제목>신의성실</조문제목>
            <조문내용>권리의 행사와 의무의 이행은 신의에 좇아 성실히 하여야 한다.</조문내용>
          </조문단위>
        </조문>
      </법령>
    `);

    const result = await getLawDetail(OC, 100000);
    expect(result.lawId).toBe("LAW1234");
    expect(result.lawName).toBe("민법");
    expect(result.lawType).toBe("법률");
    expect(result.departmentName).toBe("법무부");
    expect(result.articles).toHaveLength(2);
    expect(result.articles[0].articleNumber).toBe("1");
    expect(result.articles[0].articleTitle).toBe("법원");
    expect(result.articles[0].articleContent).toContain("민사에 관하여");
    expect(result.articles[1].articleNumber).toBe("2");
  });

  it("getLawDetail_HTML태그포함_스트립처리", async () => {
    mockFetchXml(`
      <법령>
        <기본정보>
          <법령ID>001</법령ID>
          <법령명_한글>테스트법</법령명_한글>
          <법종구분>법률</법종구분>
          <소관부처>법무부</소관부처>
          <시행일자>20260101</시행일자>
          <공포일자>20260101</공포일자>
          <공포번호>1</공포번호>
          <제개정구분>제정</제개정구분>
        </기본정보>
        <조문>
          <조문단위>
            <조문여부>조문</조문여부>
            <조문번호>1</조문번호>
            <조문제목>목적</조문제목>
            <조문내용>&lt;b&gt;이 법은&lt;/b&gt; 테스트를 &lt;br/&gt;목적으로 한다.</조문내용>
          </조문단위>
        </조문>
      </법령>
    `);

    const result = await getLawDetail(OC, 1);
    expect(result.articles[0].articleContent).not.toContain("<b>");
    expect(result.articles[0].articleContent).not.toContain("<br");
    expect(result.articles[0].articleContent).toContain("이 법은");
    expect(result.articles[0].articleContent).toContain("목적으로 한다.");
  });

  it("getLawDetail_조문없음_빈배열반환", async () => {
    mockFetchXml(`
      <법령>
        <기본정보>
          <법령ID>002</법령ID>
          <법령명_한글>부칙법</법령명_한글>
          <법종구분>법률</법종구분>
          <소관부처>법무부</소관부처>
          <시행일자>20260101</시행일자>
          <공포일자>20260101</공포일자>
          <공포번호>2</공포번호>
          <제개정구분>제정</제개정구분>
        </기본정보>
      </법령>
    `);

    const result = await getLawDetail(OC, 2);
    expect(result.lawName).toBe("부칙법");
    expect(result.articles).toHaveLength(0);
  });

  it("getLawDetail_루트없음_예외발생", async () => {
    mockFetchXml("<OtherRoot></OtherRoot>");
    await expect(getLawDetail(OC, 99999)).rejects.toThrow("법령을 찾을 수 없습니다");
  });

  it("getLawDetail_URL에MST파라미터사용", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(
          "<법령><기본정보><법령ID>1</법령ID><법령명_한글>T</법령명_한글>" +
            "<법종구분></법종구분><소관부처></소관부처><시행일자></시행일자>" +
            "<공포일자></공포일자><공포번호></공포번호><제개정구분></제개정구분>" +
            "</기본정보></법령>",
        ),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getLawDetail(OC, 12345);

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("MST=12345");
    expect(calledUrl).toContain("target=law");
    expect(calledUrl).toContain("lawService.do");
  });
});

// =========================================================
// searchCases (판례 검색)
// =========================================================

describe("searchCases", () => {
  it("searchCases_정상XML_판례목록반환", async () => {
    mockFetchXml(`
      <PrecSearch>
        <totalCnt>1</totalCnt>
        <page>1</page>
        <prec>
          <판례일련번호>200000</판례일련번호>
          <사건명>손해배상(기)</사건명>
          <사건번호>2024다12345</사건번호>
          <선고일자>20260101</선고일자>
          <법원명>대법원</법원명>
          <사건종류명>민사</사건종류명>
          <판결유형>판결</판결유형>
          <선고>선고</선고>
          <판례상세링크>/precInfoP.do?precSeq=200000</판례상세링크>
        </prec>
      </PrecSearch>
    `);

    const result = await searchCases(OC, { query: "손해배상" });
    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(200000);
    expect(result.items[0].caseName).toBe("손해배상(기)");
    expect(result.items[0].caseNumber).toBe("2024다12345");
    expect(result.items[0].courtName).toBe("대법원");
    expect(result.items[0].caseType).toBe("민사");
  });

  it("searchCases_빈결과_빈배열반환", async () => {
    mockFetchXml("<PrecSearch><totalCnt>0</totalCnt><page>1</page></PrecSearch>");

    const result = await searchCases(OC, { query: "없는판례" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("searchCases_날짜범위및법원_URL포함", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<PrecSearch><totalCnt>0</totalCnt></PrecSearch>"),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchCases(OC, {
      query: "손해배상",
      dateFrom: "20250101",
      dateTo: "20260101",
      court: "대법원",
    });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("target=prec");
    const parsedUrl = new URL(calledUrl);
    expect(parsedUrl.searchParams.get("prncYd")).toBe("20250101~20260101");
  });

  it("searchCases_HTTP에러_예외발생", async () => {
    mockFetchHttpError(404);
    await expect(searchCases(OC, { query: "테스트" })).rejects.toThrow("HTTP 404");
  });
});

// =========================================================
// getCaseDetail (판례 상세)
// =========================================================

describe("getCaseDetail", () => {
  it("getCaseDetail_정상XML_판례상세반환", async () => {
    mockFetchXml(`
      <PrecService>
        <판례정보일련번호>200000</판례정보일련번호>
        <사건명>손해배상(기)</사건명>
        <사건번호>2024다12345</사건번호>
        <선고일자>20260101</선고일자>
        <선고>선고</선고>
        <법원명>대법원</법원명>
        <사건종류명>민사</사건종류명>
        <판결유형>판결</판결유형>
        <판시사항>채무불이행으로 인한 손해배상</판시사항>
        <판결요지>원고의 청구를 인용한다</판결요지>
        <참조조문>민법 제750조</참조조문>
        <참조판례>대법원 2020다12345</참조판례>
        <판례내용>주문: 원고 승소</판례내용>
      </PrecService>
    `);

    const result = await getCaseDetail(OC, 200000);
    expect(result.id).toBe(200000);
    expect(result.caseName).toBe("손해배상(기)");
    expect(result.caseNumber).toBe("2024다12345");
    expect(result.courtName).toBe("대법원");
    expect(result.holdings).toContain("채무불이행");
    expect(result.summary).toContain("원고의 청구");
    expect(result.referenceLaws).toContain("민법 제750조");
    expect(result.content).toContain("원고 승소");
  });

  it("getCaseDetail_HTML포함_태그제거", async () => {
    mockFetchXml(`
      <PrecService>
        <판례정보일련번호>1</판례정보일련번호>
        <사건명>테스트</사건명>
        <사건번호>2024다1</사건번호>
        <선고일자>20260101</선고일자>
        <선고>선고</선고>
        <법원명>대법원</법원명>
        <사건종류명>민사</사건종류명>
        <판결유형>판결</판결유형>
        <판시사항>&lt;p&gt;테스트 &lt;b&gt;판시사항&lt;/b&gt;&lt;/p&gt;</판시사항>
        <판결요지></판결요지>
        <참조조문></참조조문>
        <참조판례></참조판례>
        <판례내용></판례내용>
      </PrecService>
    `);

    const result = await getCaseDetail(OC, 1);
    expect(result.holdings).not.toContain("<p>");
    expect(result.holdings).not.toContain("<b>");
    expect(result.holdings).toContain("테스트 판시사항");
  });

  it("getCaseDetail_루트없음_예외발생", async () => {
    mockFetchXml("<OtherRoot></OtherRoot>");
    await expect(getCaseDetail(OC, 99999)).rejects.toThrow("판례를 찾을 수 없습니다");
  });
});

// =========================================================
// searchConstitutional (헌재결정례 검색)
// =========================================================

describe("searchConstitutional", () => {
  it("searchConstitutional_정상XML_헌재목록반환", async () => {
    mockFetchXml(`
      <DetcSearch>
        <totalCnt>1</totalCnt>
        <page>1</page>
        <Detc>
          <헌재결정례일련번호>300000</헌재결정례일련번호>
          <종국일자>20260101</종국일자>
          <사건번호>2024헌바1</사건번호>
          <사건명>민법 제750조 위헌소원</사건명>
          <헌재결정례상세링크>/detcInfoP.do?detcSeq=300000</헌재결정례상세링크>
        </Detc>
      </DetcSearch>
    `);

    const result = await searchConstitutional(OC, { query: "위헌" });
    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(300000);
    expect(result.items[0].caseName).toContain("위헌소원");
    expect(result.items[0].caseNumber).toBe("2024헌바1");
    expect(result.items[0].conclusionDate).toBe("20260101");
  });

  it("searchConstitutional_빈결과_빈배열반환", async () => {
    mockFetchXml("<DetcSearch><totalCnt>0</totalCnt><page>1</page></DetcSearch>");

    const result = await searchConstitutional(OC, { query: "없는결정례" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("searchConstitutional_루트없음_빈결과반환", async () => {
    mockFetchXml("<Other></Other>");

    const result = await searchConstitutional(OC, { query: "테스트" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("searchConstitutional_HTTP에러_예외발생", async () => {
    mockFetchHttpError(400);
    await expect(searchConstitutional(OC, { query: "테스트" })).rejects.toThrow("HTTP 400");
  });
});

// =========================================================
// searchInterpretations (법령해석례 검색)
// =========================================================

describe("searchInterpretations", () => {
  it("searchInterpretations_정상XML_해석례목록반환", async () => {
    mockFetchXml(`
      <Expc>
        <totalCnt>1</totalCnt>
        <page>1</page>
        <expc>
          <법령해석례일련번호>400000</법령해석례일련번호>
          <안건명>건축법 해석</안건명>
          <안건번호>법제처-2024-001</안건번호>
          <질의기관명>서울시</질의기관명>
          <회신기관명>법제처</회신기관명>
          <회신일자>20260101</회신일자>
          <법령해석례상세링크>/expcInfoP.do?expcSeq=400000</법령해석례상세링크>
        </expc>
      </Expc>
    `);

    const result = await searchInterpretations(OC, { query: "건축법" });
    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(400000);
    expect(result.items[0].title).toBe("건축법 해석");
    expect(result.items[0].caseNumber).toBe("법제처-2024-001");
    expect(result.items[0].inquiryOrg).toBe("서울시");
    expect(result.items[0].replyOrg).toBe("법제처");
    expect(result.items[0].replyDate).toBe("20260101");
  });

  it("searchInterpretations_빈결과_빈배열반환", async () => {
    mockFetchXml("<Expc><totalCnt>0</totalCnt><page>1</page></Expc>");

    const result = await searchInterpretations(OC, { query: "없는해석례" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("searchInterpretations_루트없음_빈결과반환", async () => {
    mockFetchXml("<Other></Other>");

    const result = await searchInterpretations(OC, { query: "테스트" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });
});

// =========================================================
// searchAdminRules (행정규칙 검색)
// =========================================================

describe("searchAdminRules", () => {
  it("searchAdminRules_정상XML_행정규칙목록반환", async () => {
    mockFetchXml(`
      <AdmRulSearch>
        <totalCnt>1</totalCnt>
        <page>1</page>
        <admrul>
          <행정규칙일련번호>500000</행정규칙일련번호>
          <행정규칙명>공무원 복무규정</행정규칙명>
          <행정규칙종류>훈령</행정규칙종류>
          <발령일자>20260101</발령일자>
          <발령번호>100</발령번호>
          <소관부처명>인사혁신처</소관부처명>
          <현행연혁구분>현행</현행연혁구분>
          <제개정구분명>일부개정</제개정구분명>
          <행정규칙ID>ADM001</행정규칙ID>
          <시행일자>20260201</시행일자>
          <행정규칙상세링크>/admRulInfoP.do?admRulSeq=500000</행정규칙상세링크>
        </admrul>
      </AdmRulSearch>
    `);

    const result = await searchAdminRules(OC, { query: "복무" });
    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(500000);
    expect(result.items[0].ruleName).toBe("공무원 복무규정");
    expect(result.items[0].ruleType).toBe("훈령");
    expect(result.items[0].departmentName).toBe("인사혁신처");
    expect(result.items[0].amendmentType).toBe("일부개정");
  });

  it("searchAdminRules_빈결과_빈배열반환", async () => {
    mockFetchXml("<AdmRulSearch><totalCnt>0</totalCnt><page>1</page></AdmRulSearch>");

    const result = await searchAdminRules(OC, { query: "없는규칙" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("searchAdminRules_URL파라미터_올바른target", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<AdmRulSearch><totalCnt>0</totalCnt></AdmRulSearch>"),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchAdminRules(OC, { query: "테스트", display: 5, page: 3 });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("target=admrul");
    expect(calledUrl).toContain("display=5");
    expect(calledUrl).toContain("page=3");
  });

  it("searchAdminRules_HTTP에러_예외발생", async () => {
    mockFetchHttpError(400);
    await expect(searchAdminRules(OC, { query: "테스트" })).rejects.toThrow("HTTP 400");
  });
});

// =========================================================
// searchLegalTerms (법령용어 검색)
// =========================================================

describe("searchLegalTerms", () => {
  it("searchLegalTerms_정상XML_용어목록반환", async () => {
    mockFetchXml(`
      <LsTrmSearch>
        <totalCnt>1</totalCnt>
        <page>1</page>
        <lstrm>
          <법령용어ID>TRM001</법령용어ID>
          <법령용어명>채무불이행</법령용어명>
          <법령용어상세링크>/lsTrmInfoP.do?trmSeq=TRM001</법령용어상세링크>
        </lstrm>
      </LsTrmSearch>
    `);

    const result = await searchLegalTerms(OC, { query: "채무" });
    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("TRM001");
    expect(result.items[0].termName).toBe("채무불이행");
  });

  it("searchLegalTerms_빈결과_빈배열반환", async () => {
    mockFetchXml("<LsTrmSearch><totalCnt>0</totalCnt><page>1</page></LsTrmSearch>");

    const result = await searchLegalTerms(OC, { query: "없는용어" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("searchLegalTerms_루트없음_빈결과반환", async () => {
    mockFetchXml("<Other></Other>");

    const result = await searchLegalTerms(OC, { query: "테스트" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("searchLegalTerms_HTTP에러_예외발생", async () => {
    mockFetchHttpError(403);
    await expect(searchLegalTerms(OC, { query: "테스트" })).rejects.toThrow("HTTP 403");
  });
});

// =========================================================
// searchEnglishLaws (영문법령 검색)
// =========================================================

describe("searchEnglishLaws", () => {
  it("searchEnglishLaws_정상XML_영문법령목록반환", async () => {
    mockFetchXml(`
      <LawSearch>
        <totalCnt>1</totalCnt>
        <page>1</page>
        <law>
          <법령일련번호>600000</법령일련번호>
          <법령명한글>민법</법령명한글>
          <법령명영문>Civil Act</법령명영문>
          <법령ID>EL001</법령ID>
          <공포일자>19580222</공포일자>
          <공포번호>471</공포번호>
          <제개정구분명>전부개정</제개정구분명>
          <소관부처명>법무부</소관부처명>
          <법령구분명>법률</법령구분명>
          <시행일자>19580222</시행일자>
          <현행연혁코드>현행</현행연혁코드>
          <법령상세링크>/engLsInfoP.do?lsiSeq=600000</법령상세링크>
        </law>
      </LawSearch>
    `);

    const result = await searchEnglishLaws(OC, { query: "Civil Act" });
    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(600000);
    expect(result.items[0].lawNameKo).toBe("민법");
    expect(result.items[0].lawNameEn).toBe("Civil Act");
    expect(result.items[0].lawType).toBe("법률");
  });

  it("searchEnglishLaws_빈결과_빈배열반환", async () => {
    mockFetchXml("<LawSearch><totalCnt>0</totalCnt><page>1</page></LawSearch>");

    const result = await searchEnglishLaws(OC, { query: "NonExistentLaw" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("searchEnglishLaws_URL에elaw타겟사용", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<LawSearch><totalCnt>0</totalCnt></LawSearch>"),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchEnglishLaws(OC, { query: "Civil Act" });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("target=elaw");
    expect(calledUrl).toContain("lawSearch.do");
  });

  it("searchEnglishLaws_HTTP에러_예외발생", async () => {
    mockFetchHttpError(400);
    await expect(searchEnglishLaws(OC, { query: "test" })).rejects.toThrow("HTTP 400");
  });
});

// =========================================================
// searchTreaties (조약 검색)
// =========================================================

describe("searchTreaties", () => {
  it("searchTreaties_정상XML_조약목록반환", async () => {
    mockFetchXml(`
      <TrtySearch>
        <totalCnt>1</totalCnt>
        <page>1</page>
        <Trty>
          <조약일련번호>700000</조약일련번호>
          <조약명>대한민국과 미합중국 간의 상호방위조약</조약명>
          <조약구분명>양자조약</조약구분명>
          <발효일자>19541117</발효일자>
          <서명일자>19531001</서명일자>
          <조약번호>34</조약번호>
          <조약상세링크>/trtyInfoP.do?trtySeq=700000</조약상세링크>
        </Trty>
      </TrtySearch>
    `);

    const result = await searchTreaties(OC, { query: "방위조약" });
    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(700000);
    expect(result.items[0].treatyName).toContain("상호방위조약");
    expect(result.items[0].treatyType).toBe("양자조약");
    expect(result.items[0].effectiveDate).toBe("19541117");
    expect(result.items[0].treatyNumber).toBe("34");
  });

  it("searchTreaties_빈결과_빈배열반환", async () => {
    mockFetchXml("<TrtySearch><totalCnt>0</totalCnt><page>1</page></TrtySearch>");

    const result = await searchTreaties(OC, { query: "없는조약" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("searchTreaties_루트없음_빈결과반환", async () => {
    mockFetchXml("<Other></Other>");

    const result = await searchTreaties(OC, { query: "테스트" });
    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("searchTreaties_네트워크에러_예외발생", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));
    await expect(searchTreaties(OC, { query: "테스트" })).rejects.toThrow("connection refused");
  });
});
