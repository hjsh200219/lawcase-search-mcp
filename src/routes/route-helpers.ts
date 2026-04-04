/**
 * REST API 라우트 공통 헬퍼
 */

import type { Request, Response } from "express";

/** 검색 파라미터 추출 (query, page, display) */
export function sp(q: Record<string, unknown>) {
  return {
    query: String(q.query || ""),
    page: Number(q.page) || 1,
    display: Number(q.display) || 20,
  };
}

/** 비동기 핸들러 래퍼 — 에러를 500 JSON으로 변환 */
export function handle(fn: (req: Request) => Promise<unknown>) {
  return async (req: Request, res: Response) => {
    try {
      res.json(await fn(req));
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "오류" });
    }
  };
}
