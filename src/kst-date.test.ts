import { describe, it, expect } from "vitest";
import {
  toKSTDate,
  formatYYYYMMDD,
  subtractDays,
  isWeekend,
  skipWeekends,
} from "./kst-date.js";

describe("formatYYYYMMDD", () => {
  it("formatYYYYMMDD_Date객체_YYYYMMDD문자열반환", () => {
    const date = new Date(Date.UTC(2026, 3, 3));
    expect(formatYYYYMMDD(date)).toBe("20260403");
  });

  it("formatYYYYMMDD_1월1일_제로패딩", () => {
    const date = new Date(Date.UTC(2026, 0, 1));
    expect(formatYYYYMMDD(date)).toBe("20260101");
  });
});

describe("subtractDays", () => {
  it("subtractDays_1일감산_정상", () => {
    expect(subtractDays("20260403", 1)).toBe("20260402");
  });

  it("subtractDays_월경계_3월에서2월", () => {
    expect(subtractDays("20260301", 1)).toBe("20260228");
  });

  it("subtractDays_7일감산_주단위", () => {
    expect(subtractDays("20260405", 7)).toBe("20260329");
  });
});

describe("isWeekend", () => {
  it("isWeekend_일요일_true", () => {
    expect(isWeekend("20260405")).toBe(true);
  });

  it("isWeekend_토요일_true", () => {
    expect(isWeekend("20260404")).toBe(true);
  });

  it("isWeekend_금요일_false", () => {
    expect(isWeekend("20260403")).toBe(false);
  });

  it("isWeekend_월요일_false", () => {
    expect(isWeekend("20260406")).toBe(false);
  });
});

describe("skipWeekends", () => {
  it("skipWeekends_평일_변경없음", () => {
    expect(skipWeekends("20260403")).toBe("20260403");
  });

  it("skipWeekends_토요일_직전금요일반환", () => {
    expect(skipWeekends("20260404")).toBe("20260403");
  });

  it("skipWeekends_일요일_직전금요일반환", () => {
    expect(skipWeekends("20260405")).toBe("20260403");
  });
});

describe("toKSTDate", () => {
  it("toKSTDate_Date객체반환", () => {
    const result = toKSTDate();
    expect(result).toBeInstanceOf(Date);
  });
});
