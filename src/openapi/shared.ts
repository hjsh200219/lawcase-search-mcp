/**
 * OpenAPI 스펙 공유 헬퍼 - 파라미터/응답 빌더
 */

export type OpenApiParam = Record<string, unknown>;
export type OpenApiResponse = Record<string, unknown>;
export type OpenApiPaths = Record<string, Record<string, unknown>>;

export const searchParams = {
  query: { name: "query", in: "query", required: true, schema: { type: "string" }, description: "검색어" },
  page: { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "페이지 번호" },
  display: { name: "display", in: "query", schema: { type: "integer", default: 20 }, description: "페이지당 결과 수 (최대 100)" },
};

export const paginationParams: OpenApiParam[] = [
  { name: "pageNo", in: "query", schema: { type: "integer", default: 1 }, description: "페이지 번호" },
  { name: "numOfRows", in: "query", schema: { type: "integer", default: 10 }, description: "페이지당 건수" },
];

export function searchTypeParam(desc: string): OpenApiParam {
  return {
    name: "search_type", in: "query",
    schema: { type: "string", enum: ["law_name", "full_text"], default: "law_name" },
    description: desc,
  };
}

export function idParam(desc: string): OpenApiParam {
  return { name: "id", in: "path", required: true, schema: { type: "integer" }, description: desc };
}

export function jsonResponse(desc: string): OpenApiResponse {
  return {
    "200": { description: desc, content: { "application/json": { schema: { type: "object" } } } },
    "500": { description: "서버 오류", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } } },
  };
}
