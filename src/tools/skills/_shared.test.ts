import { describe, it, expect } from "vitest";
import { createDispatcher, requireParam } from "./_shared.js";

describe("createDispatcher", () => {
  it("유효한action_해당핸들러호출", async () => {
    const dispatch = createDispatcher("test_skill", {
      ping: async () => ({ content: [{ type: "text", text: "pong" }] }),
    });

    const result = await dispatch({ action: "ping" });
    expect(result.content[0].text).toBe("pong");
    expect(result.isError).toBeUndefined();
  });

  it("알수없는action_isError반환", async () => {
    const dispatch = createDispatcher("test_skill", {
      ping: async () => ({ content: [{ type: "text", text: "pong" }] }),
    });

    const result = await dispatch({ action: "unknown" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("알 수 없는 action");
    expect(result.content[0].text).toContain("unknown");
  });

  it("사용가능action목록_에러메시지에포함", async () => {
    const dispatch = createDispatcher("test_skill", {
      a: async () => ({ content: [{ type: "text", text: "" }] }),
      b: async () => ({ content: [{ type: "text", text: "" }] }),
    });

    const result = await dispatch({ action: "x" });
    expect(result.content[0].text).toContain("a, b");
  });

  it("핸들러예외_그대로throw", async () => {
    const dispatch = createDispatcher("test_skill", {
      fail: async () => { throw new Error("boom"); },
    });

    await expect(dispatch({ action: "fail" })).rejects.toThrow("boom");
  });
});

describe("requireParam", () => {
  it("값존재_null반환", () => {
    const result = requireParam({ hs_code: "0201" }, "hs_code", "search_hs");
    expect(result).toBeNull();
  });

  it("undefined_에러반환", () => {
    const result = requireParam({}, "hs_code", "search_hs");
    expect(result).not.toBeNull();
    expect(result!.isError).toBe(true);
    expect(result!.content[0].text).toContain("hs_code");
  });

  it("빈문자열_에러반환", () => {
    const result = requireParam({ hs_code: "" }, "hs_code", "search_hs");
    expect(result).not.toBeNull();
    expect(result!.isError).toBe(true);
  });

  it("null값_에러반환", () => {
    const result = requireParam({ hs_code: null }, "hs_code", "search_hs");
    expect(result).not.toBeNull();
    expect(result!.isError).toBe(true);
  });

  it("0값_유효_null반환", () => {
    const result = requireParam({ count: 0 }, "count", "test");
    expect(result).toBeNull();
  });
});
